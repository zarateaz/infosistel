// Variables del Carrito
let cart = JSON.parse(localStorage.getItem('infosistel_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartUI();
    
    // Configurar form de tracking
    const trackForm = document.getElementById('trackForm');
    if (trackForm) {
        trackForm.addEventListener('submit', handleTracking);
    }

    // Configurar Modal del Carrito
    setupCartControls();
});

function setupCartControls() {
    const cartFab = document.getElementById('cartFab');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const successDone = document.getElementById('successDone');
    const checkoutForm = document.getElementById('checkoutForm');

    cartFab.addEventListener('click', () => {
        cartModal.style.display = 'block';
        renderCartItems();
    });

    closeCart.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    successDone.addEventListener('click', () => {
        cartModal.style.display = 'none';
        document.getElementById('orderSuccess').style.display = 'none';
        document.getElementById('checkoutSection').style.display = 'block';
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target == cartModal) cartModal.style.display = 'none';
    });

    // Manejar envío de pedido
    checkoutForm.addEventListener('submit', handleCheckout);
}

async function loadProducts() {
    const grid = document.getElementById('productGrid');
    const filter = document.getElementById('categoryFilter');
    if (!grid) return;

    try {
        const res = await fetch('/api/products');
        const products = await res.json();
        
        // Populate Categories Filter
        const catRes = await fetch('/api/products/categories');
        const categories = await catRes.json();
        
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            filter.appendChild(opt);
        });

        // Event Listener for Category Filter
        filter.addEventListener('change', (e) => {
            const val = e.target.value;
            renderProducts(products, val);
        });

        renderProducts(products, 'all');

    } catch (err) {
        console.error(err);
        grid.innerHTML = '<p style="color: red; text-align:center; width:100%;">No se pudo cargar el catálogo en este momento. Por favor, intente más tarde.</p>';
    }
}

function renderProducts(products, filterValue) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    
    let filtered = products;
    if (filterValue !== 'all') {
        filtered = products.filter(p => p.category_id == filterValue);
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; color: var(--text-muted);">No se encontraron productos en esta categoría.</p>';
        return;
    }

    filtered.forEach(p => {
        const img = p.image_url ? p.image_url : '/assets/default-product.png';
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img src="${img}" alt="${p.name}" class="product-img" onerror="this.src='/assets/default-product.png'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${p.name}</h3>
                <p class="product-details">
                    <strong style="color:var(--accent); font-size: 0.75rem; text-transform: uppercase;">${p.category_name || 'General'}</strong><br>
                    ${p.description || 'Sin descripción disponible.'}
                </p>
                <div class="product-price">S/. ${parseFloat(p.price).toFixed(2)}</div>
                <button class="btn btn-primary add-to-cart" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" style="width: 100%; margin-top: 15px; padding: 10px;">
                    <i class="fas fa-cart-plus"></i> Agregar al Carrito
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Event Listeners para botones de agregar
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { id, name, price } = btn.dataset;
            addToCart(id, name, price);
        });
    });
}

function addToCart(id, name, price) {
    const existing = cart.find(item => item.product_id == id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            product_id: parseInt(id),
            name: name,
            price: parseFloat(price),
            quantity: 1
        });
    }
    saveCart();
    updateCartUI();
    
    // Feedback visual
    const btn = document.querySelector(`.add-to-cart[data-id="${id}"]`);
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
    btn.style.background = '#2ed573';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = 'var(--primary)';
    }, 1500);
}

function saveCart() {
    localStorage.setItem('infosistel_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function renderCartItems() {
    const list = document.getElementById('cartItemsList');
    const checkoutSec = document.getElementById('checkoutSection');
    const totalSpan = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        list.innerHTML = '<p class="text-center" style="padding: 20px; color: var(--text-muted);">El carrito está vacío</p>';
        checkoutSec.style.display = 'none';
        return;
    }

    checkoutSec.style.display = 'block';
    list.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <h5>${item.name} x ${item.quantity}</h5>
                <span class="cart-item-price">S/ ${subtotal.toFixed(2)}</span>
            </div>
            <button class="btn-remove" onclick="removeFromCart(${index})" style="background:none; border:none; color: #ff4757; cursor:pointer;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(div);
    });

    totalSpan.textContent = total.toFixed(2);
}

// Expuesto globalmente para el onclick del HTML generado
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    renderCartItems();
};

async function handleCheckout(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const orderData = {
        customer_name: document.getElementById('custName').value,
        customer_phone: document.getElementById('custPhone').value,
        customer_dni: "", // Simplified
        customer_address: "", // Simplified
        items: cart,
        total_price: parseFloat(document.getElementById('cartTotal').textContent)
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            cart = [];
            saveCart();
            updateCartUI();
            document.getElementById('checkoutSection').style.display = 'none';
            document.getElementById('orderSuccess').style.display = 'block';
            e.target.reset();
        } else {
            alert('Error al enviar el pedido. Por favor intente más tarde.');
        }
    } catch (err) {
        console.error(err);
        alert('Error de conexión.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Finalizar y Coordinar por WhatsApp';
    }
}

async function handleTracking(e) {
    e.preventDefault();
    const input = document.getElementById('trackInput').value.trim();
    const resultDiv = document.getElementById('trackResult');
    
    if (!input) return;

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p style="color: white; text-align:center;">Buscando información de su servicio...</p>';

    try {
        const res = await fetch(`/api/repairs/track?query=${encodeURIComponent(input)}`);
        
        if (res.status === 404) {
            resultDiv.innerHTML = `<div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 20px; border-radius: 8px; color: #fca5a5; text-align:center;">
                <i class="fas fa-exclamation-circle"></i> No se encontró ninguna reparación con los datos proporcionados.
            </div>`;
            return;
        }

        const data = await res.json();
        
        let htmlContent = '';
        data.forEach(repair => {
            const statusColor = repair.progress_percentage >= 100 ? '#22c55e' : '#3b82f6';
            htmlContent += `
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 10px;">
                        <h3 style="color: white; margin:0;">TICKET: <span style="color:var(--accent)">${repair.ticket_code}</span></h3>
                        <span style="background:${statusColor}; color: white; padding: 5px 15px; border-radius: 30px; font-size:0.75rem; font-weight:700; text-transform: uppercase;">
                            ${repair.status}
                        </span>
                    </div>
                    <div style="margin-top:20px; color: rgba(255,255,255,0.8);">
                        <p style="margin-bottom:8px;"><strong>Cliente:</strong> ${repair.client_name}</p>
                        <p style="margin-bottom:8px;"><strong>Equipo / Falla:</strong> ${repair.device_problem}</p>
                    </div>
                    
                    <div style="margin-top:25px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.85rem;">
                            <span>Progreso del servicio</span>
                            <span>${repair.progress_percentage}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${repair.progress_percentage}%; background: ${statusColor};"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        resultDiv.innerHTML = htmlContent;

    } catch (err) {
        console.error(err);
        resultDiv.innerHTML = '<p style="color: #ef4444; text-align:center;">Error interno del sistema. Por favor intente más tarde.</p>';
    }
}
