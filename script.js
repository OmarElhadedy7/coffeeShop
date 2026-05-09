// Brew & Bean — interactive logic
const MENU = [
  { id: 'esp', name: 'Espresso',        desc: 'Bold single shot of pure crema.',          price: 2.5 },
  { id: 'cap', name: 'Cappuccino',      desc: 'Espresso topped with velvety foam.',       price: 3.8 },
  { id: 'lat', name: 'Caffè Latte',     desc: 'Smooth espresso with steamed milk.',       price: 4.2 },
  { id: 'moc', name: 'Mocha',           desc: 'Chocolate, espresso, and cream.',          price: 4.5 },
  { id: 'cld', name: 'Cold Brew',       desc: 'Slow-steeped, smooth and refreshing.',     price: 4.0 },
  { id: 'crs', name: 'Butter Croissant',desc: 'Flaky, buttery, baked fresh daily.',       price: 3.0 },
];

const cart = {};
const $ = (s) => document.querySelector(s);

// year
$('#year').textContent = new Date().getFullYear();

// Render menu
const menuGrid = $('#menu-grid');
menuGrid.innerHTML = MENU.map(item => `
  <div class="card menu-item">
    <div>
      <div class="menu-head">
        <h3>${item.name}</h3>
        <span class="menu-price">$${item.price.toFixed(2)}</span>
      </div>
      <p class="menu-desc">${item.desc}</p>
    </div>
    <button class="btn btn-primary menu-add" data-add="${item.id}">+ Add to cart</button>
  </div>
`).join('');

// Toast
let toastTimer;
function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 1800);
}

// Cart logic
function updateCartUI() {
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = Object.entries(cart).reduce((s, [id, q]) => s + MENU.find(m => m.id === id).price * q, 0);
  const badge = $('#cart-badge');
  badge.textContent = count;
  badge.hidden = count === 0;
  $('#cart-total').textContent = '$' + total.toFixed(2);
  $('#checkout-btn').disabled = count === 0;

  const items = $('#cart-items');
  if (count === 0) {
    items.innerHTML = '<p class="empty">Your cart is empty.</p>';
    return;
  }
  items.innerHTML = Object.entries(cart).map(([id, qty]) => {
    const item = MENU.find(m => m.id === id);
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span>$${item.price.toFixed(2)} each</span>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" data-dec="${id}" aria-label="Decrease">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn" data-inc="${id}" aria-label="Increase">+</button>
          <button class="remove-btn" data-rm="${id}" aria-label="Remove">🗑</button>
        </div>
      </div>`;
  }).join('');
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCartUI();
  const item = MENU.find(m => m.id === id);
  showToast(`${item.name} added to cart`);
}
function decFromCart(id) {
  if (!cart[id]) return;
  cart[id]--;
  if (cart[id] <= 0) delete cart[id];
  updateCartUI();
}
function removeFromCart(id) { delete cart[id]; updateCartUI(); }

// Click delegation
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-add],[data-inc],[data-dec],[data-rm],[data-close-cart],[data-close-confirm]');
  if (!t) return;
  if (t.dataset.add) addToCart(t.dataset.add);
  else if (t.dataset.inc) addToCart(t.dataset.inc);
  else if (t.dataset.dec) decFromCart(t.dataset.dec);
  else if (t.dataset.rm) removeFromCart(t.dataset.rm);
  else if (t.hasAttribute('data-close-cart')) $('#cart-overlay').hidden = true;
  else if (t.hasAttribute('data-close-confirm')) $('#confirm-modal').hidden = true;
});

// Cart open
$('#open-cart').addEventListener('click', () => { updateCartUI(); $('#cart-overlay').hidden = false; });

// Checkout
$('#checkout-btn').addEventListener('click', () => {
  const code = 'BB-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  $('#order-code').textContent = code;
  for (const k in cart) delete cart[k];
  updateCartUI();
  $('#cart-overlay').hidden = true;
  // Small delay so cart closes before modal appears
  setTimeout(() => { $('#confirm-modal').hidden = false; }, 50);
});

// Contact form
$('#contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  e.target.reset();
  showToast("Thanks! We'll be in touch soon.");
});

// Escape closes overlays
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { $('#cart-overlay').hidden = true; $('#confirm-modal').hidden = true; }
});

updateCartUI();
