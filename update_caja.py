import re

with open('components/CajaPro.tsx', 'r') as f:
    text = f.read()

# 1. Update initialTransactions to include razon
text = text.replace("metodo: t.paymentMethod || 'EFECTIVO',", "metodo: t.paymentMethod || 'EFECTIVO',\n    razon: t.notes || '',")

# 2. Update handleDbUpdate to handle razon -> notes
text = text.replace("if (field === 'monto') dbField = 'amount';", "if (field === 'monto') dbField = 'amount';\n    if (field === 'razon') dbField = 'notes';")

# 3. Add Razon to headers
text = text.replace("['Fecha', 'Descripción', 'Tipo', 'Método', 'Monto', 'Saldo', '']", "['Fecha', 'Descripción', 'Tipo', 'Método', 'Monto', 'Razón', 'Saldo', '']")

# 4. Add the razon cell and make fecha slightly better (maybe make it an input text)
row_start = '<tr key={t.id} className="cd-row-in" style={styles.tr}>'
row_code = """                <tr key={t.id} className="cd-row-in" style={styles.tr}>
                  <td style={styles.tdNarrow}>
                    <input 
                      style={styles.cellInput} 
                      value={t.fecha} 
                      readOnly
                      title="Generada automáticamente"
                    />
                  </td>
                  <td style={styles.td}>
                    <input 
                      style={{ ...styles.cellInput, width: '100%' }} 
                      value={t.desc} 
                      onChange={(e) => handleLocalUpdate(t.id, 'desc', e.target.value)} 
                      onBlur={(e) => handleDbUpdate(t.id, 'desc', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdNarrow}>
                    <select
                      style={{ ...styles.cellSelect, color: t.tipo === 'ingreso' ? '#10b981' : '#ef4444' }}
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
                  <td style={styles.tdNarrow}>
                    <select
                      // @ts-ignore
                      style={{ ...styles.cellSelect, color: METHOD_META[t.metodo]?.color || '#ffffff' }}
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
                  <td style={styles.tdNarrow}>
                    <input
                      type="number" step="0.01"
                      style={{ ...styles.cellInput, textAlign: 'right', width: 80 }}
                      value={t.monto}
                      onChange={(e) => handleLocalUpdate(t.id, 'monto', parseFloat(e.target.value) || 0)}
                      onBlur={(e) => handleDbUpdate(t.id, 'monto', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td style={styles.td}>
                    <input 
                      style={{ ...styles.cellInput, width: '100%' }} 
                      value={t.razon || ''} 
                      placeholder="Ej. N° Operación"
                      onChange={(e) => handleLocalUpdate(t.id, 'razon', e.target.value)} 
                      onBlur={(e) => handleDbUpdate(t.id, 'razon', e.target.value)}
                    />
                  </td>
                  <td style={{ ...styles.tdNarrow, textAlign: 'right', fontFamily: 'IBM Plex Mono', color: '#f8fafc' }}>
                    {fmt(t.saldo)}
                  </td>
                  <td style={styles.tdNarrow}>
                    <button style={styles.delBtn} onClick={() => handleRemove(t.id)} title="Eliminar" disabled={isSaving}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>"""

# Regex substitute the row
import re
text = re.sub(r'<tr key=\{t\.id\}.*?</tr>', row_code, text, flags=re.DOTALL)

# 5. Add "Agregar" button to top toolbar
toolbar_search = '<div style={styles.toolbarControls}>'
toolbar_replacement = """<div style={styles.toolbarControls}>
            <button style={{...styles.addBtn, marginTop: 0, padding: '6px 12px', background: '#3b82f6', borderColor: '#3b82f6', fontWeight: 600}} onClick={handleAddRow} disabled={isSaving}>
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Nuevo Movimiento
            </button>"""
text = text.replace(toolbar_search, toolbar_replacement)

# 6. Add razon to handleAddRow
text = text.replace("metodo: newTx.paymentMethod,", "metodo: newTx.paymentMethod,\n          razon: '',")

with open('components/CajaPro.tsx', 'w') as f:
    f.write(text)

print("Done")
