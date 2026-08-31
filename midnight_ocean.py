import re

def process_login():
    with open('app/admin/login/page.tsx', 'r') as f:
        text = f.read()

    # Apply Dark Mode "Midnight Ocean" to Login
    text = text.replace('bg-white/80', 'bg-slate-900/80')
    text = text.replace('shadow-[0_40px_100px_rgba(236,72,153,0.15)]', 'shadow-[0_40px_100px_rgba(14,165,233,0.15)]')
    text = text.replace('border-white', 'border-slate-800')
    text = text.replace('bg-pink-500/20', 'bg-cyan-500/20')
    text = text.replace('bg-pink-500', 'bg-blue-600')
    text = text.replace('shadow-pink-500/25', 'shadow-blue-500/25')
    text = text.replace('text-gray-900', 'text-white')
    text = text.replace('text-pink-500', 'text-cyan-400')
    text = text.replace('bg-gray-50/50', 'bg-slate-800/50')
    text = text.replace('text-gray-800', 'text-white')
    text = text.replace('focus:ring-pink-500/20', 'focus:ring-cyan-500/20')
    text = text.replace('hover:bg-pink-500', 'hover:bg-cyan-600')

    with open('app/admin/login/page.tsx', 'w') as f:
        f.write(text)

def process_admin():
    with open('app/admin/page.tsx', 'r') as f:
        text = f.read()

    # 1. Base Layout
    text = text.replace('bg-gray-50/50', 'bg-slate-950')
    text = text.replace('bg-white', 'bg-slate-900')
    text = text.replace('border-gray-100', 'border-slate-800/50')
    text = text.replace('bg-gray-50', 'bg-slate-800/50')
    
    # Text colors
    text = text.replace('text-gray-800', 'text-white')
    text = text.replace('text-gray-900', 'text-white')
    text = text.replace('text-gray-500', 'text-slate-400')
    text = text.replace('text-gray-400', 'text-slate-500')
    text = text.replace('text-gray-600', 'text-slate-300')
    
    # 2. Convert pink back to Midnight Blue/Cyan
    text = text.replace('text-pink-500', 'text-cyan-400')
    text = text.replace('text-pink-900', 'text-white')
    text = text.replace('text-pink-600', 'text-blue-500')
    text = text.replace('bg-pink-500', 'bg-blue-600')
    text = text.replace('hover:bg-pink-600', 'hover:bg-blue-500')
    text = text.replace('bg-pink-600', 'bg-blue-600')
    text = text.replace('ring-pink-400', 'ring-cyan-500')
    
    # Caja Cards - Midnight Ocean specific styling
    # Ingresos
    text = text.replace('from-pink-400 to-rose-500', 'from-blue-600 to-blue-800')
    text = text.replace('shadow-pink-400/30', 'shadow-blue-600/20')
    text = text.replace('text-pink-100', 'text-blue-200')
    
    # Egresos
    text = text.replace('from-purple-400 to-fuchsia-600', 'from-slate-800 to-slate-900 border border-slate-700')
    text = text.replace('shadow-purple-500/30', 'shadow-none')
    text = text.replace('text-purple-100', 'text-slate-400')
    
    # Saldo Final
    text = text.replace('from-fuchsia-600 to-fuchsia-900', 'from-cyan-600 to-blue-900')
    text = text.replace('shadow-fuchsia-900/30', 'shadow-cyan-600/20')
    text = text.replace('text-fuchsia-200', 'text-cyan-100')
    text = text.replace('bg-fuchsia-400', 'bg-cyan-400')
    
    # Table & List Headers
    text = text.replace('bg-rose-900', 'bg-slate-900') # if any
    text = text.replace('bg-blue-900 text-white', 'bg-slate-900/80 text-cyan-400 border-b border-slate-800')
    text = text.replace('hover:bg-pink-50', 'hover:bg-slate-800/50')
    
    # Sidebar
    text = text.replace('border-r border-gray-100', 'border-r border-slate-800')
    text = text.replace('hover:bg-blue-50 text-gray-500', 'hover:bg-slate-800 text-slate-400')
    text = text.replace('bg-blue-50 text-blue-600', 'bg-blue-600/10 text-cyan-400')

    # Input styles
    text = text.replace('bg-white border-gray-200', 'bg-slate-900 border-slate-800')
    
    with open('app/admin/page.tsx', 'w') as f:
        f.write(text)

process_login()
process_admin()
