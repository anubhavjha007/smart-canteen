// =========================================================
// getCart(), saveCart(), cartCount(), cartTotal() and
// updateCartBadge() come from script.js (loaded before this
// file in cart.html).
// =========================================================

function renderCart() {
  const cart = getCart();
  const items = Object.values(cart);

  const listEl = document.getElementById("cartList");
  const emptyEl = document.getElementById("cartEmpty");
  const summaryEl = document.getElementById("cartSummary");

  if (items.length === 0) {
    listEl.innerHTML = "";
    emptyEl.style.display = "flex";
    summaryEl.style.display = "none";
    return;
  }

  emptyEl.style.display = "none";
  summaryEl.style.display = "flex";

  listEl.innerHTML = "";
  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-row-info">
        <span class="cart-row-name">${item.name}</span>
        <span class="cart-row-unit">₹${item.price} each</span>
      </div>
      <div class="qty-stepper">
        <button class="qty-btn" data-action="dec">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" data-action="inc">+</button>
      </div>
      <span class="cart-row-total">₹${item.price * item.qty}</span>
      <button class="remove-btn" aria-label="Remove ${item.name}">✕</button>
    `;

    row.querySelector('[data-action="dec"]').addEventListener("click", () => changeQty(item.id, -1));
    row.querySelector('[data-action="inc"]').addEventListener("click", () => changeQty(item.id, 1));
    row.querySelector(".remove-btn").addEventListener("click", () => removeItem(item.id));

    listEl.appendChild(row);
  });

  const subtotal = cartTotal(cart);
  document.getElementById("cartSubtotal").textContent = `₹${subtotal}`;
}

function changeQty(foodId, delta) {
  const cart = getCart();
  if (!cart[foodId]) return;
  cart[foodId].qty += delta;
  if (cart[foodId].qty <= 0) delete cart[foodId];
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

function removeItem(foodId) {
  const cart = getCart();
  delete cart[foodId];
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

// =========================================================
// PROCEED TO PAYMENT
// Hands the cart off to payment.js. sessionStorage (not
// localStorage) on purpose: once this checkout session ends,
// it shouldn't leak into the next one.
// payment.js expects: { items: [{ name, qty, price }, ...] }
// =========================================================
document.getElementById("checkoutBtn").addEventListener("click", () => {
  const cart = getCart();
  const items = Object.values(cart).map(({ id, name, price, qty }) => ({
    menuItemId: Number(id),
    name,
    price: Number(price),
    quantity: Number(qty),
  }));

  if (items.length === 0) return;

  sessionStorage.setItem("checkoutCart", JSON.stringify(items));
  window.location.href = "payment.html";
});

renderCart();
