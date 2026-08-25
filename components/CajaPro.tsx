"use client";
import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { Plus, Trash2, Search, Loader2, Calendar } from 'lucide-react';
import { addCashboxTransaction, updateCashboxTransaction, deleteCashboxTransaction } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';

const METHOD_META = {
  'EFECTIVO': { label: 'Efectivo', color: '#3b82f6' },
  'YAPE 1':   { label: 'Yape 1',   color: '#0ea5e9' },
  'YAPE 2':   { label: 'Yape 2',   color: '#6366f1' },
};

const fmt = (n: any) => `S/ ${Number(n || 0).toFixed(2)}`;

const TableCellInput = React.memo(function TableCellInput({
  value,
  onSave,
  type = 'text',
  step,
  style,
  list,
  placeholder,
  title,
  className
}: {
  value: any;
  onSave: (val: any) => void;
  type?: string;
  step?: string;
  style?: React.CSSProperties;
  list?: string;
  placeholder?: string;
  title?: string;
  className?: string;
}) {
  const [localVal, setLocalVal] = useState(value ?? '');

  useEffect(() => {
    setLocalVal(value ?? '');
  }, [value]);

  return (
    <input
      type={type}
      step={step}
      list={list}
      title={title || String(localVal || '')}
      placeholder={placeholder}
      className={className}
      style={style}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={() => {
        if (localVal !== (value ?? '')) {
          onSave(localVal);
        }
      }}
    />
  );
});

export default function CajaPro({ dbTransactions = [] }: { dbTransactions?: any[] }) {
  const router = useRouter();
  
  const initialTransactions = useMemo(() => {
    return dbTransactions.map(t => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const d = new Date(t.date);
      const fecha = `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
      const hora = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
      
      return {
        id: t.id,
        fecha,
        hora,
        desc: t.description,
        tipo: t.type === 'INCOME' ? 'ingreso' : 'egreso',
        metodo: t.paymentMethod || 'EFECTIVO',
        razon: t.notes || '',
        monto: t.amount
      };
    });
  }, [dbTransactions]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    initialTransactions.forEach(t => {
      months.add(t.fecha.substring(0, 7)); // YYYY-MM
    });
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const currentMonth = `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}`;
    months.add(currentMonth);
    return Array.from(months).sort().reverse();
  }, [initialTransactions]);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0]);

  useEffect(() => {
    if (dbTransactions) {
      const sorted = [...initialTransactions].reverse();
      setTransactions(sorted);
    }
  }, [initialTransactions]);

  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [metodoFilter, setMetodoFilter] = useState('todos');

  const handleLocalUpdate = (id: string, field: string, value: any) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleDbUpdate = async (id: string, field: string, value: any) => {
    let dbField = '';
    let dbValue = value;
    if (field === 'desc') dbField = 'description';
    if (field === 'tipo') { dbField = 'type'; dbValue = value === 'ingreso' ? 'INCOME' : 'EXPENSE'; }
    if (field === 'metodo') dbField = 'paymentMethod';
    if (field === 'monto') dbField = 'amount';
    if (field === 'razon') dbField = 'notes';

    if (field === 'fecha' || field === 'hora') {
      const tx = transactions.find(t => t.id === id);
      if (tx) {
        dbField = 'date';
        const dateStr = field === 'fecha' ? value : tx.fecha;
        const timeStr = field === 'hora' ? value : tx.hora;
        dbValue = new Date(`${dateStr}T${timeStr}:00.000Z`);
      }
    }

    if (dbField) {
      setIsSaving(true);
      try {
        await updateCashboxTransaction(id, { [dbField]: dbValue });
        router.refresh();
      } catch (e) {
        console.error(e);
        alert("Error al guardar en DB");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleRemove = async (id: string) => {
    if (confirm('¿Eliminar transacción?')) {
      setIsSaving(true);
      try {
        await deleteCashboxTransaction(id);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        router.refresh();
      } catch (e) {
        console.error(e);
        alert("Error al eliminar");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleAddRow = async () => {
    setIsSaving(true);
    try {
      const newTx = await addCashboxTransaction({
        description: "Nueva transacción",
        type: "INCOME",
        amount: 0,
        paymentMethod: "EFECTIVO"
      });
      
      const pad = (n: number) => n.toString().padStart(2, '0');
      const d = new Date(newTx.date);
      const fecha = `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
      const hora = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
      
      setTransactions((prev) => [
        {
          id: newTx.id,
          fecha,
          hora,
          desc: newTx.description,
          tipo: 'ingreso',
          metodo: newTx.paymentMethod,
          razon: '',
          monto: newTx.amount
        },
        ...prev
      ]);
      // Si se agrega un movimiento y no estamos en el mes actual, cambiamos al mes de la transacción
      if (!fecha.startsWith(selectedMonth)) {
        setSelectedMonth(fecha.substring(0, 7));
      }
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Error al crear transacción");
    } finally {
      setIsSaving(false);
    }
  };

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => t.fecha.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const previousBalance = useMemo(() => {
    let balance = 0;
    let prevEfectivo = 0, prevYape1 = 0, prevYape2 = 0;
    
    transactions.forEach(t => {
      if (t.fecha < selectedMonth) {
        const amt = t.tipo === 'ingreso' ? Number(t.monto || 0) : -Number(t.monto || 0);
        balance += amt;
        if (t.metodo === 'EFECTIVO') prevEfectivo += amt;
        if (t.metodo === 'YAPE 1') prevYape1 += amt;
        if (t.metodo === 'YAPE 2') prevYape2 += amt;
      }
    });
    return { balance, efectivo: prevEfectivo, yape1: prevYape1, yape2: prevYape2 };
  }, [transactions, selectedMonth]);

  const withRunningBalance = useMemo(() => {
    let saldo = previousBalance.balance;
    const arr = [...currentMonthTransactions].reverse();
    return arr.map((t) => {
      saldo += t.tipo === 'ingreso' ? Number(t.monto || 0) : -Number(t.monto || 0);
      return { ...t, saldo };
    }).reverse();
  }, [currentMonthTransactions, previousBalance]);

  const totals = useMemo(() => {
    let ingresos = 0, egresos = 0;
    for (const t of currentMonthTransactions) {
      if (t.tipo === 'ingreso') ingresos += Number(t.monto || 0);
      else egresos += Number(t.monto || 0);
    }
    return { ingresos, egresos, saldo: previousBalance.balance + ingresos - egresos };
  }, [currentMonthTransactions, previousBalance]);

  const methodStats = useMemo(() => {
    return Object.keys(METHOD_META).map((m) => {
      const ing = currentMonthTransactions.filter((t) => t.metodo === m && t.tipo === 'ingreso')
        .reduce((s, t) => s + Number(t.monto || 0), 0);
      const egr = currentMonthTransactions.filter((t) => t.metodo === m && t.tipo === 'egreso')
        .reduce((s, t) => s + Number(t.monto || 0), 0);
      
      let prev = 0;
      if (m === 'EFECTIVO') prev = previousBalance.efectivo;
      if (m === 'YAPE 1') prev = previousBalance.yape1;
      if (m === 'YAPE 2') prev = previousBalance.yape2;

      // @ts-ignore
      return { metodo: m, name: METHOD_META[m].label, Ingresos: ing, Egresos: egr, neto: prev + ing - egr };
    });
  }, [currentMonthTransactions, previousBalance]);

  const yape1 = methodStats.find(m => m.metodo === 'YAPE 1') || { neto: 0, Ingresos: 0 };
  const yape2 = methodStats.find(m => m.metodo === 'YAPE 2') || { neto: 0, Ingresos: 0 };
  const efectivo = methodStats.find(m => m.metodo === 'EFECTIVO') || { neto: 0, Ingresos: 0 };

  const sparkIngresos = useMemo(() => currentMonthTransactions.filter(t => t.tipo === 'ingreso').slice(-15).map((t, i) => ({ i, v: t.monto })), [currentMonthTransactions]);
  const sparkEgresos = useMemo(() => currentMonthTransactions.filter(t => t.tipo === 'egreso').slice(-15).map((t, i) => ({ i, v: t.monto })), [currentMonthTransactions]);
  const sparkYape1 = useMemo(() => currentMonthTransactions.filter(t => t.metodo === 'YAPE 1').slice(-15).map((t, i) => ({ i, v: t.monto })), [currentMonthTransactions]);
  const sparkYape2 = useMemo(() => currentMonthTransactions.filter(t => t.metodo === 'YAPE 2').slice(-15).map((t, i) => ({ i, v: t.monto })), [currentMonthTransactions]);
  const sparkEfectivo = useMemo(() => currentMonthTransactions.filter(t => t.metodo === 'EFECTIVO').slice(-15).map((t, i) => ({ i, v: t.monto })), [currentMonthTransactions]);

  const uniqueDescriptions = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => { if (t.desc && t.desc.trim()) set.add(t.desc.trim()); });
    return Array.from(set).sort();
  }, [transactions]);

  const uniqueRazones = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => { if (t.razon && t.razon.trim()) set.add(t.razon.trim()); });
    return Array.from(set).sort();
  }, [transactions]);

  const filteredRows = useMemo(() => {
    return withRunningBalance.filter((t) => {
      if (tipoFilter !== 'todos' && t.tipo !== tipoFilter) return false;
      if (metodoFilter !== 'todos' && t.metodo !== metodoFilter) return false;
      if (search) {
        const q = search.toLowerCase().trim();
        const matchDesc = (t.desc || '').toLowerCase().includes(q);
        const matchRazon = (t.razon || '').toLowerCase().includes(q);
        const matchMonto = (t.monto || '').toString().includes(q);
        const matchFecha = (t.fecha || '').includes(q);
        if (!matchDesc && !matchRazon && !matchMonto && !matchFecha) return false;
      }
      return true;
    });
  }, [withRunningBalance, tipoFilter, metodoFilter, search]);

  const formatMonth = (m: string) => {
    const [year, month] = m.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const handlePrint = () => {
    const monthLabel = formatMonth(selectedMonth);
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    // Build all transactions for the month (unfiltered)
    let runBalance = previousBalance.balance;
    const allRows = [...currentMonthTransactions].reverse().map(t => {
      runBalance += t.tipo === 'ingreso' ? Number(t.monto || 0) : -Number(t.monto || 0);
      return { ...t, saldo: runBalance };
    }).reverse();

    const effectivo_neto = methodStats.find(m => m.metodo === 'EFECTIVO')?.neto || 0;
    const yape1_neto = methodStats.find(m => m.metodo === 'YAPE 1')?.neto || 0;
    const yape2_neto = methodStats.find(m => m.metodo === 'YAPE 2')?.neto || 0;

    const rowsHtml = allRows.map((t, i) => `
      <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'}; border-bottom:1px solid #e2e8f0;">
        <td style="padding:7px 10px; font-size:12px; color:#374151;">${t.fecha}</td>
        <td style="padding:7px 10px; font-size:12px; color:#374151;">${t.hora}</td>
        <td style="padding:7px 10px; font-size:12px; color:#1f2937; font-weight:600;">${t.desc}</td>
        <td style="padding:7px 10px; font-size:12px; font-weight:700; color:${t.tipo === 'ingreso' ? '#16a34a' : '#dc2626'}; text-align:center;">${t.tipo.toUpperCase()}</td>
        <td style="padding:7px 10px; font-size:11px; color:#6b7280; text-align:center;">${t.metodo}</td>
        <td style="padding:7px 10px; font-size:12px; font-weight:700; color:${t.tipo === 'ingreso' ? '#16a34a' : '#dc2626'}; text-align:right; font-family:monospace;">S/ ${Number(t.monto).toFixed(2)}</td>
        <td style="padding:7px 10px; font-size:11px; color:#6b7280;">${t.razon || '-'}</td>
        <td style="padding:7px 10px; font-size:12px; font-weight:700; color:#1433C9; text-align:right; font-family:monospace;">S/ ${t.saldo.toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Reporte Mensual - ${monthLabel} | INFOSISTEL</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=IBM+Plex+Mono:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #1f2937; }
    @page { size: A4; margin: 18mm 15mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-before: always; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      thead { display: table-header-group; }
    }

    /* ── HEADER ── */
    .header { display:flex; justify-content:space-between; align-items:center; padding-bottom:18px; border-bottom:3px solid #1433C9; margin-bottom:24px; }
    .logo-block h1 { font-family:'IBM Plex Mono', monospace; font-size:28px; font-weight:900; color:#1433C9; letter-spacing:2px; }
    .logo-block p { font-size:11px; color:#6b7280; margin-top:2px; letter-spacing:1px; text-transform:uppercase; }
    .report-meta { text-align:right; }
    .report-meta .badge { background:#1433C9; color:#fff; font-size:10px; font-weight:700; letter-spacing:1.5px; padding:4px 12px; border-radius:99px; text-transform:uppercase; margin-bottom:6px; display:inline-block; }
    .report-meta h2 { font-size:20px; font-weight:900; color:#111827; }
    .report-meta p { font-size:11px; color:#9ca3af; margin-top:2px; }

    /* ── SUMMARY GRID ── */
    .summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
    .summary-card { border-radius:12px; padding:14px 16px; border:1px solid #e5e7eb; }
    .summary-card .label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#6b7280; margin-bottom:6px; }
    .summary-card .value { font-family:'IBM Plex Mono', monospace; font-size:20px; font-weight:700; }
    .card-blue { background:#eff6ff; border-color:#bfdbfe; }
    .card-blue .value { color:#1433C9; }
    .card-green { background:#f0fdf4; border-color:#bbf7d0; }
    .card-green .value { color:#16a34a; }
    .card-red { background:#fef2f2; border-color:#fecaca; }
    .card-red .value { color:#dc2626; }
    .card-purple { background:#faf5ff; border-color:#e9d5ff; }
    .card-purple .value { color:#7c3aed; }

    /* ── METHOD STATS ── */
    .method-bar { display:flex; gap:10px; margin-bottom:24px; }
    .method-item { flex:1; border-radius:10px; border:1px solid #e5e7eb; padding:10px 14px; }
    .method-item .m-name { font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:1px; }
    .method-item .m-val { font-family:'IBM Plex Mono', monospace; font-size:16px; font-weight:700; margin-top:4px; }
    .method-item .m-detail { font-size:10px; color:#9ca3af; margin-top:2px; }

    /* ── CIERRE ── */
    .cierre-box { background:#1433C9; color:#fff; border-radius:14px; padding:18px 20px; margin-bottom:28px; display:flex; justify-content:space-between; align-items:center; }
    .cierre-box .c-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; opacity:0.7; }
    .cierre-box .c-val { font-family:'IBM Plex Mono', monospace; font-size:26px; font-weight:900; margin-top:4px; }
    .cierre-items { display:flex; gap:32px; }
    .cierre-item { text-align:center; }

    /* ── TABLE ── */
    .section-title { font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:#374151; border-left:4px solid #1433C9; padding-left:10px; margin-bottom:14px; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    thead th { background:#1433C9; color:#fff; padding:9px 10px; text-align:left; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
    thead th:last-child, thead th:nth-child(6) { text-align:right; }
    thead th:nth-child(4), thead th:nth-child(5) { text-align:center; }
    tbody tr:last-child td { border-bottom:none !important; }

    /* ── FOOTER ── */
    .footer { margin-top:30px; border-top:1px dashed #d1d5db; padding-top:14px; display:flex; justify-content:space-between; font-size:10px; color:#9ca3af; }
    .footer strong { color:#374151; }
    .saldo-inicial-row td { background:#f1f5f9 !important; font-style:italic; color:#64748b !important; font-size:11px; }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <div class="logo-block">
      <h1>INFOSISTEL</h1>
      <p>Control de Caja · Reporte Comercial</p>
    </div>
    <div class="report-meta">
      <div class="badge">Reporte Mensual</div>
      <h2>${monthLabel}</h2>
      <p>Generado: ${new Date().toLocaleDateString('es-PE', { dateStyle: 'long' })} ${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
  </div>

  <!-- SUMMARY CARDS -->
  <div class="summary-grid">
    <div class="summary-card card-green">
      <div class="label">Ingresos del mes</div>
      <div class="value">S/ ${totals.ingresos.toFixed(2)}</div>
    </div>
    <div class="summary-card card-red">
      <div class="label">Egresos del mes</div>
      <div class="value">S/ ${totals.egresos.toFixed(2)}</div>
    </div>
    <div class="summary-card card-blue">
      <div class="label">Saldo inicial</div>
      <div class="value">S/ ${previousBalance.balance.toFixed(2)}</div>
    </div>
    <div class="summary-card card-purple">
      <div class="label">Movimientos</div>
      <div class="value">${allRows.length}</div>
    </div>
  </div>

  <!-- METHOD STATS -->
  <div class="method-bar">
    <div class="method-item" style="border-color:#bfdbfe;">
      <div class="m-name">💵 Efectivo</div>
      <div class="m-val" style="color:#1433C9;">S/ ${effectivo_neto.toFixed(2)}</div>
      <div class="m-detail">Saldo acumulado</div>
    </div>
    <div class="method-item" style="border-color:#bfdbfe;">
      <div class="m-name">📱 Yape 1</div>
      <div class="m-val" style="color:#1433C9;">S/ ${yape1_neto.toFixed(2)}</div>
      <div class="m-detail">Saldo acumulado</div>
    </div>
    <div class="method-item" style="border-color:#bfdbfe;">
      <div class="m-name">📱 Yape 2</div>
      <div class="m-val" style="color:#1433C9;">S/ ${yape2_neto.toFixed(2)}</div>
      <div class="m-detail">Saldo acumulado</div>
    </div>
  </div>

  <!-- CIERRE DE MES -->
  <div class="cierre-box">
    <div>
      <div class="c-label">Saldo Final del Mes</div>
      <div class="c-val">S/ ${totals.saldo.toFixed(2)}</div>
    </div>
    <div class="cierre-items">
      <div class="cierre-item">
        <div class="c-label">Ingresos</div>
        <div style="font-family:'IBM Plex Mono',monospace; font-size:14px; font-weight:700; color:#86efac; margin-top:4px;">+ S/ ${totals.ingresos.toFixed(2)}</div>
      </div>
      <div class="cierre-item">
        <div class="c-label">Egresos</div>
        <div style="font-family:'IBM Plex Mono',monospace; font-size:14px; font-weight:700; color:#fca5a5; margin-top:4px;">- S/ ${totals.egresos.toFixed(2)}</div>
      </div>
      <div class="cierre-item">
        <div class="c-label">Saldo Anterior</div>
        <div style="font-family:'IBM Plex Mono',monospace; font-size:14px; font-weight:700; color:#c4b5fd; margin-top:4px;">S/ ${previousBalance.balance.toFixed(2)}</div>
      </div>
    </div>
  </div>

  <!-- TRANSACTION TABLE -->
  <div class="section-title">Detalle de Movimientos (${allRows.length} registros)</div>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Hora</th>
        <th>Descripción</th>
        <th>Tipo</th>
        <th>Método</th>
        <th>Monto</th>
        <th>Ref / Razón</th>
        <th>Saldo</th>
      </tr>
    </thead>
    <tbody>
      ${previousBalance.balance > 0 ? `
      <tr class="saldo-inicial-row">
        <td colspan="7" style="padding:6px 10px; text-align:right;">Saldo acumulado de meses anteriores:</td>
        <td style="padding:6px 10px; text-align:right; font-family:monospace; font-weight:700; color:#64748b;">S/ ${previousBalance.balance.toFixed(2)}</td>
      </tr>` : ''}
      ${rowsHtml}
    </tbody>
  </table>

  <!-- FOOTER -->
  <div class="footer">
    <div><strong>INFOSISTEL</strong> · Sistema de Control de Caja</div>
    <div>Reporte generado para <strong>${monthLabel}</strong> · ${allRows.length} movimientos registrados</div>
    <div><strong>Saldo Final: S/ ${totals.saldo.toFixed(2)}</strong></div>
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="caja-page-container" style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input, select { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        table { border-collapse: collapse; width: 100%; }
        .cd-row-in input, .cd-row-in select { outline: none; }
        .cd-row-in input:focus, .cd-row-in select:focus { box-shadow: 0 0 0 2px #1433C9; border-radius: 4px; }

        @media (max-width: 640px) {
          .caja-header-flex { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .toolbar-controls-flex { flex-direction: column !important; width: 100% !important; }
          .search-box-flex { width: 100% !important; }
          .search-input-flex { width: 100% !important; }
          .select-control-flex { width: 100% !important; }
          .caja-page-container { padding: 12px !important; border-radius: 1rem !important; }
        }
      `}</style>

      <div className="print-container" style={{height: '100%'}}>
        {/* Header */}
        <div className="caja-header-flex" style={styles.header}>
          <div>
            <div style={styles.eyebrow}>CONTROL DE CAJA {isSaving && <Loader2 size={12} className="inline animate-spin ml-2 text-blue-500" />}</div>
            <h1 style={styles.title}>INFOSISTEL</h1>
          </div>
          
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Calendar size={16} color="#64748b" />
            <select 
              className="select-control-flex"
              style={{ ...styles.select, fontWeight: 600, padding: '8px 16px', fontSize: 14 }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dashboard Mockup Grid */}
        <div style={styles.grid}>
          {/* CARD 1: INGRESOS */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{...styles.cardTitle, color: '#16a34a'}}>INGRESOS DEL MES</div>
            </div>
            <div style={styles.cardValue}>{fmt(totals.ingresos)}</div>
            <div style={styles.cardFooter}>
              <div style={styles.cardSubtext}>100% de ingresos</div>
              <div style={styles.miniChart}>
                <div style={{color: '#16a34a', fontSize: 11, marginBottom: 2, fontWeight: 600}}>{fmt(totals.ingresos)}</div>
                <div style={{height: 30, width: 80}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkIngresos}>
                      <Line type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: EGRESOS */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{...styles.cardTitle, color: '#dc2626'}}>EGRESOS DEL MES</div>
            </div>
            <div style={styles.cardValue}>{fmt(totals.egresos)}</div>
            <div style={styles.cardFooter}>
              <div style={styles.cardSubtext}>{totals.ingresos > 0 ? ((totals.egresos / totals.ingresos) * 100).toFixed(1) : '0.0'}% de ingresos</div>
              <div style={styles.miniChart}>
                <div style={{color: '#dc2626', fontSize: 11, marginBottom: 2, fontWeight: 600}}>{fmt(totals.egresos)}</div>
                <div style={{height: 30, width: 80}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkEgresos}>
                      <Line type="monotone" dataKey="v" stroke="#dc2626" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: SALDO ACTUAL */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{...styles.cardTitle, color: '#1433C9'}}>SALDO EFECTIVO</div>
            </div>
            <div style={styles.cardValue}>{fmt(efectivo.neto)}</div>
            <div style={styles.cardFooter}>
              <div style={{...styles.cardSubtext, color: '#16a34a', fontWeight: 600}}>Efectivo en caja</div>
              <div style={styles.miniChart}>
                <div style={{height: 30, width: 80}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkEfectivo}>
                      <Line type="monotone" dataKey="v" stroke="#1433C9" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: YAPE 1 */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{...styles.cardTitle, color: '#2563eb'}}>● SALDO YAPE 1</div>
            </div>
            <div style={styles.cardValue}>{fmt(yape1.neto)}</div>
            <div style={styles.cardFooter}>
              <div style={styles.cardSubtext}>{totals.ingresos > 0 ? ((yape1.Ingresos / totals.ingresos) * 100).toFixed(1) : '0.0'}% de ingresos</div>
              <div style={styles.miniChart}>
                <div style={{height: 30, width: 80, position: 'absolute', right: 0, bottom: 0}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkYape1}>
                      <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 5: YAPE 2 */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{...styles.cardTitle, color: '#4f46e5'}}>● SALDO YAPE 2</div>
            </div>
            <div style={styles.cardValue}>{fmt(yape2.neto)}</div>
            <div style={styles.cardFooter}>
              <div style={styles.cardSubtext}>{totals.ingresos > 0 ? ((yape2.Ingresos / totals.ingresos) * 100).toFixed(1) : '0.0'}% de ingresos</div>
              <div style={styles.miniChart}>
                <div style={{height: 30, width: 80}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkYape2}>
                      <Line type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 6: CIERRE DE CAJA */}
          <div style={{ ...styles.card, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={styles.receiptTitle}>RESUMEN DE CIERRE</div>
            <div style={styles.receiptRow}><span style={{color: '#64748b'}}>Saldo Inicial</span><span style={{color: '#64748b', fontWeight: 600}}>{fmt(previousBalance.balance)}</span></div>
            <div style={styles.receiptRow}><span style={{color: '#1e293b', fontWeight: 600}}>Ingresos del mes</span><span style={{color: '#16a34a', fontWeight: 700}}>+ {fmt(totals.ingresos)}</span></div>
            <div style={styles.receiptRow}><span style={{color: '#1e293b', fontWeight: 600}}>Egresos del mes</span><span style={{color: '#dc2626', fontWeight: 700}}>- {fmt(totals.egresos)}</span></div>
            <div style={styles.receiptDivider} />
            <div style={styles.receiptRow}><span style={{color: '#64748b'}}>Total Efectivo</span><span style={{color: '#64748b'}}>{fmt(efectivo.neto)}</span></div>
            <div style={styles.receiptRow}><span style={{color: '#64748b'}}>Total Yape</span><span style={{color: '#64748b'}}>{fmt(yape1.neto + yape2.neto)}</span></div>
            <div style={styles.receiptDivider} />
            <div style={styles.receiptRow}><span style={{color: '#1433C9', fontWeight: 800}}>SALDO FINAL</span><span style={{color: '#1433C9', fontWeight: 800}}>{fmt(totals.saldo)}</span></div>
          </div>
        </div>

        {/* Ledger */}
        <div style={styles.panel}>
          <datalist id="caja-desc-list">
            {uniqueDescriptions.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
          <datalist id="caja-razon-list">
            {uniqueRazones.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>

          <div className="no-print" style={styles.ledgerToolbar}>
            <div style={styles.panelTitle}>LIBRO DE MOVIMIENTOS ({filteredRows.length})</div>
            <div className="toolbar-controls-flex" style={styles.toolbarControls}>
              <div className="search-box-flex" style={styles.searchBox}>
                <Search size={14} color="#64748b" />
                <input
                  className="search-input-flex"
                  style={{ ...styles.searchInput, width: 220 }}
                  placeholder="Buscar descripción, razón..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className="select-control-flex" style={styles.select} value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
                <option value="todos">Todos los tipos</option>
                <option value="ingreso">Ingresos</option>
                <option value="egreso">Egresos</option>
              </select>
              <select className="select-control-flex" style={styles.select} value={metodoFilter} onChange={(e) => setMetodoFilter(e.target.value)}>
                <option value="todos">Todos los métodos</option>
                {Object.entries(METHOD_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.tableWrap}>
            <table style={{ minWidth: '960px', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[
                    { title: 'Fecha', width: 120 },
                    { title: 'Hora', width: 85 },
                    { title: 'Descripción', minWidth: 260 },
                    { title: 'Tipo', width: 110 },
                    { title: 'Método', width: 120 },
                    { title: 'Monto', width: 100, align: 'right' },
                    { title: 'Razón / Ref', minWidth: 180 },
                    { title: 'Saldo', width: 110, align: 'right' },
                    { title: '', width: 45 }
                  ].map((col) => (
                    <th
                      key={col.title}
                      className={col.title === '' ? 'no-print' : ''}
                      style={{
                        ...styles.th,
                        ...(col.width ? { width: col.width, minWidth: col.width } : {}),
                        ...(col.minWidth ? { minWidth: col.minWidth } : {}),
                        ...(col.align ? { textAlign: col.align as any } : {})
                      }}
                    >
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Fila de Saldo Inicial Opcional para mostrar en la tabla */}
                {previousBalance.balance > 0 && (
                  <tr className="cd-row-in" style={styles.tr}>
                    <td style={styles.tdNarrow} colSpan={7} className="text-right text-slate-500 italic">
                      Saldo acumulado de meses anteriores:
                    </td>
                    <td style={{ ...styles.tdNarrow, textAlign: 'right', fontFamily: 'IBM Plex Mono', color: '#64748b', fontWeight: 600 }}>
                      {fmt(previousBalance.balance)}
                    </td>
                    <td className="no-print"></td>
                  </tr>
                )}
                {filteredRows.map((t) => (
                  <tr key={t.id} className="cd-row-in" style={styles.tr}>
                    <td style={{ ...styles.tdNarrow, width: 120 }}>
                      <TableCellInput 
                        type="date"
                        style={{ ...styles.cellInput, width: 110, padding: 0 }} 
                        value={t.fecha} 
                        onSave={(val) => {
                          handleLocalUpdate(t.id, 'fecha', val);
                          handleDbUpdate(t.id, 'fecha', val);
                        }}
                      />
                    </td>
                    <td style={{ ...styles.tdNarrow, width: 85 }}>
                      <TableCellInput 
                        type="time"
                        style={{ ...styles.cellInput, width: 80, padding: 0 }} 
                        value={t.hora} 
                        onSave={(val) => {
                          handleLocalUpdate(t.id, 'hora', val);
                          handleDbUpdate(t.id, 'hora', val);
                        }}
                      />
                    </td>
                    <td style={{ ...styles.td, minWidth: 260 }}>
                      <TableCellInput 
                        list="caja-desc-list"
                        title={t.desc}
                        style={{ ...styles.cellInput, width: '100%', minWidth: 240 }} 
                        value={t.desc} 
                        onSave={(val) => {
                          handleLocalUpdate(t.id, 'desc', val);
                          handleDbUpdate(t.id, 'desc', val);
                        }}
                      />
                    </td>
                    <td style={{ ...styles.tdNarrow, width: 110 }}>
                      <select
                        style={{ ...styles.cellSelect, color: t.tipo === 'ingreso' ? '#16a34a' : '#dc2626' }}
                        value={t.tipo}
                        onChange={(e) => {
                          handleLocalUpdate(t.id, 'tipo', e.target.value);
                          handleDbUpdate(t.id, 'tipo', e.target.value);
                        }}
                      >
                        <option value="ingreso">Ingreso</option>
                        <option value="egreso">Egreso</option>
                      </select>
                    </td>
                    <td style={{ ...styles.tdNarrow, width: 120 }}>
                      <select
                        // @ts-ignore
                        style={{ ...styles.cellSelect, color: METHOD_META[t.metodo]?.color || '#1e293b' }}
                        value={t.metodo}
                        onChange={(e) => {
                          handleLocalUpdate(t.id, 'metodo', e.target.value);
                          handleDbUpdate(t.id, 'metodo', e.target.value);
                        }}
                      >
                        {Object.entries(METHOD_META).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ ...styles.tdNarrow, width: 100 }}>
                      <TableCellInput
                        type="number"
                        step="0.01"
                        style={{ ...styles.cellInput, textAlign: 'right', width: '100%', fontWeight: 700 }}
                        value={t.monto}
                        onSave={(val) => {
                          const num = parseFloat(val) || 0;
                          handleLocalUpdate(t.id, 'monto', num);
                          handleDbUpdate(t.id, 'monto', num);
                        }}
                      />
                    </td>
                    <td style={{ ...styles.td, minWidth: 180 }}>
                      <TableCellInput 
                        list="caja-razon-list"
                        title={t.razon || ''}
                        style={{ ...styles.cellInput, width: '100%', minWidth: 160 }} 
                        value={t.razon || ''} 
                        placeholder="Ej. N° Operación"
                        onSave={(val) => {
                          handleLocalUpdate(t.id, 'razon', val);
                          handleDbUpdate(t.id, 'razon', val);
                        }}
                      />
                    </td>
                    <td style={{ ...styles.tdNarrow, width: 110, textAlign: 'right', fontFamily: 'IBM Plex Mono', color: '#1433C9', fontWeight: 700 }}>
                      {fmt(t.saldo)}
                    </td>
                    <td className="no-print" style={{ ...styles.tdNarrow, width: 45 }}>
                      <button style={styles.delBtn} onClick={() => handleRemove(t.id)} title="Eliminar" disabled={isSaving}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr style={styles.tr}>
                    <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: 14 }}>
                      No se encontraron movimientos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button style={styles.addBtn} onClick={handleAddRow} disabled={isSaving}>
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} 
              Agregar movimiento
            </button>
            <button style={{...styles.addBtn, background: '#1433C9', color: '#fff', border: 'none', fontWeight: 700}} onClick={handlePrint}>
              Imprimir Reporte Mensual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: '#ffffff', padding: '24px',
    fontFamily: "'Inter', sans-serif", color: '#0f172a',
    borderRadius: '1.5rem', border: '1px solid #e2e8f0', minHeight: '100vh',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    flexWrap: 'wrap', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #e2e8f0',
  },
  eyebrow: { fontFamily: "'Inter', sans-serif", fontSize: 13, letterSpacing: 1.5, color: '#64748b', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase' },
  title: { fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: 1, color: '#1433C9' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 30,
  },
  card: { 
    background: '#ffffff', 
    border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    display: 'flex', flexDirection: 'column',
    position: 'relative', overflow: 'hidden'
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 },
  cardTitle: { fontFamily: "'Inter', sans-serif", fontSize: 12, letterSpacing: 1, fontWeight: 700 },
  cardValue: { fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 12 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
  cardSubtext: { fontSize: 12, color: '#64748b', lineHeight: 1.4 },
  miniChart: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  
  receiptTitle: { textAlign: 'center', color: '#1433C9', fontSize: 12, letterSpacing: 1.5, marginBottom: 16, fontFamily: "'Inter', sans-serif", fontWeight: 800 },
  receiptRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, fontFamily: "'Inter', sans-serif" },
  receiptDivider: { borderTop: '1px dashed #cbd5e1', margin: '12px 0' },

  panel: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' },
  panelTitle: { fontFamily: "'Inter', sans-serif", fontSize: 13, letterSpacing: 1, color: '#475569', marginBottom: 16, fontWeight: 800 },
  ledgerToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  toolbarControls: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px' },
  searchInput: { background: 'transparent', border: 'none', color: '#0f172a', fontSize: 13, width: 160 },
  select: { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, color: '#0f172a', fontSize: 13, padding: '8px 12px' },
  tableWrap: { maxHeight: 480, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 },
  th: {
    position: 'sticky', top: 0, background: '#1433C9', textAlign: 'left', padding: '10px 12px',
    fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: 1, color: '#ffffff',
    borderBottom: '1px solid #1433C9', whiteSpace: 'nowrap', zIndex: 1, fontWeight: 700
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '6px 12px', fontSize: 13, color: '#0f172a' },
  tdNarrow: { padding: '6px 12px', fontSize: 13, whiteSpace: 'nowrap', color: '#0f172a' },
  cellInput: { background: 'transparent', border: '1px solid transparent', color: '#0f172a', fontSize: 13, padding: '6px 8px', width: '100%', fontWeight: 500 },
  cellSelect: { background: 'transparent', border: '1px solid transparent', fontSize: 13, padding: '6px 6px', fontWeight: 600 },
  delBtn: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, display: 'flex' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc',
    border: '1px solid #cbd5e1', borderRadius: 8, color: '#0f172a', fontSize: 13,
    padding: '10px 16px', cursor: 'pointer', fontWeight: 600
  },
};
