document.addEventListener('DOMContentLoaded', () => {
    
    // LOGIN FORM
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('infosistelToken', data.token);
                    window.location.href = '/dashboard';
                } else {
                    const errDiv = document.getElementById('loginError');
                    errDiv.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${data.message}`;
                    errDiv.style.display = 'block';
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // DASHBOARD LOGIC
    if (window.location.pathname.endsWith('/dashboard')) {
        const token = localStorage.getItem('infosistelToken');
        if (!token) {
            window.location.href = '/admin';
        }

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('infosistelToken');
            window.location.href = '/admin';
        });

        loadCategories(); // Populates product select form
        loadProductsAdmin();
        loadOrders();
        loadRepairsAdmin();

        // Forms
        document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
        document.getElementById('repairStateForm').addEventListener('submit', handleRepairUpdate);
        document.getElementById('newRepairForm').addEventListener('submit', handleNewRepair);

        // Update range live look
        const rProgress = document.getElementById('rProgress');
        const rProgressLive = document.getElementById('rProgressLive');
        if(rProgress && rProgressLive) {
            rProgress.addEventListener('input', (e) => {
                rProgressLive.style.width = e.target.value + '%';
            });
        }
    }
});

// SIDEBAR NAVIGATION LOGIC
function switchDbSection(sectionId, clickedEl) {
    // Hide all sections
    document.querySelectorAll('.db-section').forEach(el => el.classList.remove('active'));
    // Deactivate all links
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    
    // Show selected section
    const target = document.getElementById(sectionId + 'Section');
    if (target) {
        target.classList.add('active');
    }
    
    // Activate clicked link
    if (clickedEl) {
        clickedEl.classList.add('active');
    }

    // Auto-refresh data based on section
    if (sectionId === 'orders') loadOrders();
    if (sectionId === 'products') loadProductsAdmin();
    if (sectionId === 'repairs') loadRepairsAdmin();
}

window.switchDbSection = switchDbSection;

// MODALS & SIDE PANELS LOGIC
function openProductSidePanel() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModalTitle').textContent = 'Registrar Nuevo Producto';
    
    document.getElementById('productSidePanel').classList.add('active');
    document.getElementById('sideOverlay').classList.add('active');
}

function closeProductSidePanel() {
    document.getElementById('productSidePanel').classList.remove('active');
    document.getElementById('sideOverlay').classList.remove('active');
}

function openRepairModal() {
    document.getElementById('newRepairForm').reset();
    document.getElementById('newRepairModal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// API CALLS & RENDER LOGIC

async function authFetch(url, options = {}) {
    const token = localStorage.getItem('infosistelToken');
    options.headers = options.headers || {};
    if (!(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    } else {
        delete options.headers['Content-Type']; // boundary sets automatically
    }
    options.headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(url, options);
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('infosistelToken');
        window.location.href = '/admin';
        throw new Error('Unauthorized');
    }
    return res;
}

// --- PRODUCTS ---
async function loadCategories() {
    try {
        const res = await fetch('/api/products/categories');
        const data = await res.json();
        const select = document.getElementById('pCategory');
        if(select) {
            select.innerHTML = '<option value="" disabled selected>Seleccione una categoría</option>';
            data.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                select.appendChild(opt);
            });
        }
    } catch(err) { console.error('Error load categories:', err); }
}

async function loadProductsAdmin() {
    try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = '';

        data.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${p.image_url || '/assets/default-product.png'}" width="50" height="50"></td>
                <td style="font-weight:600; color:var(--primary);">${p.name}</td>
                <td><span style="color:var(--text-muted); font-size: 0.85rem;">${p.category_name}</span></td>
                <td style="font-weight:600; color:var(--accent);">S/. ${parseFloat(p.price).toFixed(2)}</td>
                <td>${p.stock} <small style="color:var(--text-muted);">uds.</small></td>
                <td>
                    <button class="action-btn edit-btn" title="Editar" onclick='editProduct(${JSON.stringify(p).replace(/'/g, "\\'")})'><i class="fas fa-pen"></i></button>
                    <button class="action-btn del-btn" title="Eliminar" onclick="deleteProduct(${p.id})"><i class="fas fa-trash-can"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) { console.error(err); }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const formData = new FormData();
    formData.append('name', document.getElementById('pName').value);
    formData.append('category_id', document.getElementById('pCategory').value);
    formData.append('price', document.getElementById('pPrice').value);
    formData.append('stock', document.getElementById('pStock').value);
    formData.append('description', document.getElementById('pDesc').value);
    
    const fileField = document.getElementById('pImage');
    if (fileField.files[0]) {
        formData.append('image', fileField.files[0]);
    }

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/products/${id}` : '/api/products';
        await authFetch(url, { method, body: formData });
        closeProductSidePanel();
        loadProductsAdmin();
    } catch (err) { alert('Error al guardar producto'); console.error(err); }
}

function editProduct(p) {
    document.getElementById('productForm').reset();
    document.getElementById('productModalTitle').textContent = 'Editar Producto';
    document.getElementById('productId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pCategory').value = p.category_id;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pStock').value = p.stock;
    document.getElementById('pDesc').value = p.description;
    
    document.getElementById('productSidePanel').classList.add('active');
    document.getElementById('sideOverlay').classList.add('active');
}

async function deleteProduct(id) {
    if (confirm('¿Realmente deseas eliminar este producto?')) {
        try {
            await authFetch(`/api/products/${id}`, { method: 'DELETE' });
            loadProductsAdmin();
        } catch (err) { alert('Error al eliminar'); }
    }
}

// --- REPAIRS ---
async function loadRepairsAdmin() {
    try {
        const res = await authFetch('/api/repairs');
        const data = await res.json();
        const tbody = document.querySelector('#repairsTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        data.forEach(r => {
            const tr = document.createElement('tr');
            const statusColor = r.progress_percentage >= 100 ? '#22c55e' : '#3b82f6';
            const statusBg = r.progress_percentage >= 100 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)';
            
            tr.innerHTML = `
                <td><strong style="color:var(--accent);">${r.ticket_code}</strong></td>
                <td style="font-weight:500;">${r.client_name}</td>
                <td style="color:var(--text-muted); font-size:0.85rem;">${r.client_dni}</td>
                <td style="font-size:0.85rem; max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${r.device_problem}">${r.device_problem}</td>
                <td><span class="status-badge" style="background:${statusBg}; color:${statusColor};">${r.status}</span></td>
                <td style="width:120px;">
                    <div class="progress-bar" style="height:6px; margin:0 0 5px 0;">
                         <div class="progress-fill" style="width: ${r.progress_percentage}%; background: ${statusColor};"></div>
                    </div>
                    <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${r.progress_percentage}%</span>
                </td>
                <td>
                    <button class="action-btn edit-btn" title="Gestionar Estado" onclick='openStateModal(${r.id}, "${r.ticket_code}", "${r.status}", ${r.progress_percentage})'><i class="fas fa-list-check"></i></button>
                    <button class="action-btn del-btn" title="Eliminar Ticket" onclick="deleteRepair(${r.id})"><i class="fas fa-trash-can"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) { console.error(err); }
}

function openStateModal(id, code, status, progress) {
    document.getElementById('rId').value = id;
    document.getElementById('rTicketCode').textContent = code;
    document.getElementById('rStatus').value = status;
    document.getElementById('rProgress').value = progress;
    document.getElementById('rProgressLive').style.width = progress + '%';
    document.getElementById('repairStateModal').style.display = 'flex';
}

async function handleRepairUpdate(e) {
    e.preventDefault();
    const id = document.getElementById('rId').value;
    const status = document.getElementById('rStatus').value;
    const progress_percentage = document.getElementById('rProgress').value;

    try {
        await authFetch(`/api/repairs/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status, progress_percentage })
        });
        closeModal('repairStateModal');
        loadRepairsAdmin();
    } catch (err) { alert('Error al actualizar'); }
}

async function handleNewRepair(e) {
    e.preventDefault();
    const body = {
        client_name: document.getElementById('nClientName').value,
        client_dni: document.getElementById('nClientDNI').value,
        client_phone: document.getElementById('nClientPhone').value,
        device_problem: document.getElementById('nProblem').value
    };

    try {
        const res = await authFetch('/api/repairs', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        const data = await res.json();
        alert(`¡Reparación registrada con éxito! El ticket generado es: ${data.ticket_code}`);
        closeModal('newRepairModal');
        loadRepairsAdmin();
    } catch (err) { alert('Error al crear reparación'); }
}

async function deleteRepair(id) {
    if (confirm('¿Realmente deseas eliminar este ticket de reparación? Esta acción no se puede deshacer.')) {
        try {
            await authFetch(`/api/repairs/${id}`, { method: 'DELETE' });
            loadRepairsAdmin();
        } catch (err) { alert('Error al eliminar el ticket'); }
    }
}

// Global exposure for onclicks
window.handleRepairUpdate = handleRepairUpdate;
window.handleNewRepair = handleNewRepair;

async function loadOrders() {
    try {
        const res = await authFetch('/api/orders');
        const data = await res.json();
        const tbody = document.querySelector('#ordersTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        data.forEach(o => {
            const tr = document.createElement('tr');
            
            // Format items list
            const itemsHtml = o.items.map(i => `• ${i.product_name} (x${i.quantity})`).join('<br>');
            
            // Color according to status
            let statusColor = '#3b82f6';
            if (o.status === 'Completado') statusColor = '#22c55e';
            if (o.status === 'Cancelado') statusColor = '#ef4444';

            tr.innerHTML = `
                <td><strong>#${o.id}</strong></td>
                <td style="font-weight:600;">${o.customer_name}</td>
                <td><a href="https://wa.me/${o.customer_phone.replace(/\D/g, '')}" target="_blank" style="color:var(--primary); text-decoration:none; font-weight:600;"><i class="fab fa-whatsapp"></i> ${o.customer_phone}</a></td>
                <td style="font-size: 0.8rem; line-height: 1.2;">${itemsHtml}</td>
                <td style="font-weight:700; color:var(--accent);">S/ ${parseFloat(o.total_price).toFixed(2)}</td>
                <td><span class="status-badge" style="background:${statusColor}1A; color:${statusColor};">${o.status}</span></td>
                <td>
                    <div style="display:flex; gap:5px;">
                        <button class="action-btn" title="Completar" onclick="updateOrderStatus(${o.id}, 'Completado')" style="color: #22c55e;"><i class="fas fa-check"></i></button>
                        <button class="action-btn" title="Cancelar" onclick="updateOrderStatus(${o.id}, 'Cancelado')" style="color: #ef4444;"><i class="fas fa-times"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) { console.error('Error load orders:', err); }
}

async function updateOrderStatus(id, status) {
    if (confirm(`¿Marcar pedido #${id} como ${status}?`)) {
        try {
            await authFetch(`/api/orders/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            loadOrders();
        } catch (err) { alert('Error al actualizar estado del pedido'); }
    }
}

// Global exposure for onclicks
window.switchDbSection = switchDbSection;
window.openProductModal = openProductSidePanel;
window.closeProductSidePanel = closeProductSidePanel;
window.openRepairModal = openRepairModal;
window.closeModal = closeModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.openStateModal = openStateModal;
window.deleteRepair = deleteRepair;
window.loadOrders = loadOrders;
window.updateOrderStatus = updateOrderStatus;
