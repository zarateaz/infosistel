import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const txs = await prisma.cashboxTransaction.findMany({
    orderBy: [
      { date: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  if (txs.length === 0) return;

  // Group by date
  const byDate: Record<string, typeof txs> = {};
  for (const tx of txs) {
    const dStr = tx.date.toISOString().split('T')[0];
    if (!byDate[dStr]) byDate[dStr] = [];
    byDate[dStr].push(tx);
  }

  // Assign realistic times
  for (const dStr of Object.keys(byDate)) {
    const dayTxs = byDate[dStr];
    let currentHour = 9;
    let currentMinute = 15;

    for (const tx of dayTxs) {
      const newDate = new Date(`${dStr}T${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:00Z`);
      
      await prisma.cashboxTransaction.update({
        where: { id: tx.id },
        data: { date: newDate }
      });

      currentMinute += Math.floor(Math.random() * 30) + 15;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
      if (currentHour > 18) currentHour = 18;
    }
  }

  // Calculate current total
  const updatedTxs = await prisma.cashboxTransaction.findMany();
  let totalIncome = 0;
  let totalExpense = 0;
  for (const tx of updatedTxs) {
    if (tx.type === "INCOME") totalIncome += tx.amount;
    else totalExpense += tx.amount;
  }
  
  const currentBalance = totalIncome - totalExpense;
  const targetBalance = Math.ceil(currentBalance);
  const diff = targetBalance - currentBalance;

  if (diff > 0 && diff < 1) {
    // Add diff to the last income transaction or create a new one
    const lastIncome = updatedTxs.reverse().find(t => t.type === "INCOME");
    if (lastIncome) {
      await prisma.cashboxTransaction.update({
        where: { id: lastIncome.id },
        data: { amount: lastIncome.amount + diff }
      });
    }
  }

  console.log("Fechas actualizadas con horas realistas y saldo ajustado.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
