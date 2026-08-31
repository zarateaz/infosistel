import re

with open('app/admin/page.tsx', 'r') as f:
    text = f.read()

# Add import
if 'import CajaPro' not in text:
    text = text.replace('import {', 'import CajaPro from "@/components/CajaPro";\nimport {', 1)

# Replace the block
# Find start
start_marker = '{activeTab === "caja" && ('
end_marker = '{/* ══════════════════ INVENTARIO TAB ══════════════════ */}'

start_idx = text.find(start_marker)
end_idx = text.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_block = start_marker + '\n          <CajaPro dbTransactions={cashboxTransactions} />\n        )}\n\n        ' + end_marker
    text = text[:start_idx] + new_block + text[end_idx + len(end_marker):]
else:
    print("Could not find markers")

with open('app/admin/page.tsx', 'w') as f:
    f.write(text)

