import re

def process():
    with open('ocr.txt', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Parse rows
    rows = []
    for line in lines:
        line = line.strip()
        # Match row number, date, desc, and then all the remaining text
        match = re.match(r'^(\d+)\s+(\d{2}/\d{2}/\d{4})\s+(.+?)\s+\$', line)
        if not match:
            # Maybe the row has no $ (e.g. Saldo only or missing $)
            match2 = re.match(r'^(\d+)\s+(\d{2}/\d{2}/\d{4})\s+(.+?)\s+([\d\.,]+)$', line)
            if not match2:
                continue
            
            num = int(match2.group(1))
            date_str = match2.group(2)
            desc = match2.group(3).strip()
            saldo_str = match2.group(4)
            saldo = float(saldo_str.replace('.', '').replace(',', '.'))
            rows.append({
                'num': num,
                'date_str': date_str,
                'desc': desc,
                'saldo': saldo,
                'amounts_raw': []
            })
            continue

        num = int(match.group(1))
        date_str = match.group(2)
        desc = match.group(3).strip()
        rest = line[match.end()-1:]
        
        # find all amounts in rest
        # The last number is usually the Saldo (might not have $)
        # Let's just find ALL numbers
        tokens = re.findall(r'[\d\.,]+', rest)
        if not tokens: continue
        
        saldo_str = tokens[-1]
        saldo = float(saldo_str.replace('.', '').replace(',', '.'))
        
        amounts_raw = []
        for t in tokens[:-1]:
            val = float(t.replace('.', '').replace(',', '.'))
            amounts_raw.append(val)

        rows.append({
            'num': num,
            'date_str': date_str,
            'desc': desc,
            'saldo': saldo,
            'amounts_raw': amounts_raw
        })

    # Compute Income / Expense
    # Row 1 is special
    
    parsed_txs = []
    
    prev_saldo = 0.0
    for r in rows:
        num = r['num']
        d, m, y = r['date_str'].split('/')
        iso_date = f"{y}-{m}-{d}T12:00:00Z"
        
        if num == 1:
            # row 1 is saldo inicial
            # the PDF says $ 231,40 $ 202,40 $ 0,00 $ 29,00
            # Total = 231.40. YAPE1=202.40, EFECTIVO=29.00
            parsed_txs.append({
                'date': iso_date,
                'desc': r['desc'] + " (YAPE 1)",
                'type': "INCOME",
                'amount': 202.40,
                'method': "YAPE 1"
            })
            parsed_txs.append({
                'date': iso_date,
                'desc': r['desc'] + " (EFECTIVO)",
                'type': "INCOME",
                'amount': 29.00,
                'method': "EFECTIVO"
            })
            prev_saldo = 231.40
            continue
            
        saldo = r['saldo']
        diff = round(saldo - prev_saldo, 2)
        
        if diff > 0:
            typ = "INCOME"
            amt = diff
        elif diff < 0:
            typ = "EXPENSE"
            amt = -diff
        else:
            # 0 amount? skip or add 0. 
            prev_saldo = saldo
            continue
            
        parsed_txs.append({
            'date': iso_date,
            'desc': r['desc'],
            'type': typ,
            'amount': amt,
            'method': None # To be determined
        })
        prev_saldo = saldo

    # Now we need to assign methods.
    # Target Incomes: YAPE1=1619.40, YAPE2=165.00, EFECTIVO=6381.90. 
    # But wait, Row 1 already contributed 202.40 to YAPE1 and 29.00 to EFECTIVO.
    # Remaining:
    target_ing_y1 = 1619.40 - 202.40
    target_ing_y2 = 165.00 - 0.00
    target_ing_ef = 6381.90 - 29.00
    
    target_egr_y1 = 1450.06
    target_egr_y2 = 0.00
    target_egr_ef = 5857.00
    
    # We will use a greedy approach with backtracking to find an exact subset sum.
    def subset_sum(numbers, target, partial=[], partial_idx=[]):
        s = sum([n[1] for n in partial])
        if round(s, 2) == round(target, 2):
            return partial_idx
        if s >= target:
            return None
        for i in range(len(numbers)):
            n = numbers[i]
            remaining = numbers[i+1:]
            res = subset_sum(remaining, target, partial + [n], partial_idx + [n[0]])
            if res is not None:
                return res
        return None

    incomes = [(i, tx['amount']) for i, tx in enumerate(parsed_txs) if tx['type'] == 'INCOME' and tx['method'] is None]
    expenses = [(i, tx['amount']) for i, tx in enumerate(parsed_txs) if tx['type'] == 'EXPENSE' and tx['method'] is None]

    # Assign YAPE 2 incomes
    y2_ing_idx = subset_sum(incomes, target_ing_y2)
    if y2_ing_idx is not None:
        for idx in y2_ing_idx: parsed_txs[idx]['method'] = "YAPE 2"
    else:
        print("Could not exactly match YAPE 2 Income")

    incomes = [(i, tx['amount']) for i, tx in enumerate(parsed_txs) if tx['type'] == 'INCOME' and tx['method'] is None]
    y1_ing_idx = subset_sum(incomes, target_ing_y1)
    if y1_ing_idx is not None:
        for idx in y1_ing_idx: parsed_txs[idx]['method'] = "YAPE 1"
    else:
        print("Could not exactly match YAPE 1 Income")

    for tx in parsed_txs:
        if tx['type'] == 'INCOME' and tx['method'] is None:
            tx['method'] = "EFECTIVO"
            
    # Assign YAPE 1 expenses
    y1_egr_idx = subset_sum(expenses, target_egr_y1)
    if y1_egr_idx is not None:
        for idx in y1_egr_idx: parsed_txs[idx]['method'] = "YAPE 1"
    else:
        print("Could not exactly match YAPE 1 Expense")

    for tx in parsed_txs:
        if tx['type'] == 'EXPENSE' and tx['method'] is None:
            tx['method'] = "EFECTIVO"

    # Generate ts code
    out = 'import { PrismaClient } from "@prisma/client";\n'
    out += 'const prisma = new PrismaClient();\n\n'
    out += 'async function main() {\n'
    out += '  await prisma.cashboxTransaction.deleteMany({});\n\n'
    out += '  const data = [\n'
    for tx in parsed_txs:
        desc_escaped = tx['desc'].replace('"', '\\"')
        out += f'    {{ date: new Date("{tx["date"]}"), description: "{desc_escaped}", type: "{tx["type"]}", amount: {tx["amount"]}, paymentMethod: "{tx["method"]}" }},\n'
    out += '  ];\n\n'
    out += '  for (const t of data) {\n'
    out += '    await prisma.cashboxTransaction.create({ data: t });\n'
    out += '  }\n'
    out += '  console.log("Seed completado");\n'
    out += '}\n'
    out += 'main().catch(console.error).finally(() => prisma.$disconnect());\n'

    with open('seed_caja.ts', 'w', encoding='utf-8') as f:
        f.write(out)

process()
