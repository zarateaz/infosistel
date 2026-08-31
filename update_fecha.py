import re

with open('components/CajaPro.tsx', 'r') as f:
    text = f.read()

# 1. Update initialTransactions for fecha
text = text.replace("fecha: new Date(t.date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }),", "fecha: new Date(t.date).toISOString().split('T')[0],")
text = text.replace("fecha: new Date(newTx.date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }),", "fecha: new Date(newTx.date).toISOString().split('T')[0],")

# 2. Update handleDbUpdate for fecha
text = text.replace("if (field === 'monto') dbField = 'amount';", "if (field === 'monto') dbField = 'amount';\n    if (field === 'fecha') { dbField = 'date'; dbValue = new Date(value + 'T00:00:00Z'); }")

# 3. Update the input field in the row
old_fecha_input = """<input 
                      style={styles.cellInput} 
                      value={t.fecha} 
                      readOnly
                      title="Generada automáticamente"
                    />"""
new_fecha_input = """<input 
                      type="date"
                      style={{ ...styles.cellInput, width: 110, padding: 0 }} 
                      value={t.fecha} 
                      onChange={(e) => handleLocalUpdate(t.id, 'fecha', e.target.value)}
                      onBlur={(e) => handleDbUpdate(t.id, 'fecha', e.target.value)}
                    />"""

text = text.replace(old_fecha_input, new_fecha_input)

with open('components/CajaPro.tsx', 'w') as f:
    f.write(text)

print("Done")
