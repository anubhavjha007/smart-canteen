const MENU_ITEMS = [];
const CATEGORIES = ["All", "Snacks", "Meals", "Beverages", "Fast Food", "Combos"];
const FALLBACK_MENU = [
  { id: '1', name: 'Veg Sandwich', desc: 'Grilled bread, veggies, mint chutney', price: 40, category: 'Snacks', icon: '🥪', available: true },
  { id: '2', name: 'Samosa (2 pcs)', desc: 'Crisp pastry, spiced potato filling', price: 20, category: 'Snacks', icon: '🥟', available: true },
  { id: '3', name: 'Veg Cutlet', desc: 'Pan-fried mixed vegetable patty', price: 35, category: 'Snacks', icon: '🧆', available: false },
  { id: '4', name: 'Veg Thali', desc: 'Rice, dal, sabzi, roti, salad', price: 90, category: 'Meals', icon: '🍛', available: true },
  { id: '5', name: 'Rice & Dal Combo', desc: 'Steamed rice with tadka dal', price: 70, category: 'Meals', icon: '🍚', available: true },
  { id: '6', name: 'Chole Bhature', desc: 'Spiced chickpeas, fried bread', price: 80, category: 'Meals', icon: '🫓', available: false },
  { id: '7', name: 'Cold Coffee', desc: 'Chilled, blended, lightly sweet', price: 50, category: 'Beverages', icon: '🥤', available: true },
  { id: '8', name: 'Masala Chai', desc: 'Spiced milk tea, served hot', price: 15, category: 'Beverages', icon: '☕', available: true },
  { id: '9', name: 'Fresh Lime Soda', desc: 'Sweet or salted, made fresh', price: 30, category: 'Beverages', icon: '🍋', available: true },
  { id: '10', name: 'Veg Burger', desc: 'Grilled patty, lettuce, mayo', price: 60, category: 'Fast Food', icon: '🍔', available: true },
  { id: '11', name: 'French Fries', desc: 'Salted, crisp, served hot', price: 50, category: 'Fast Food', icon: '🍟', available: true },
  { id: '12', name: 'Veg Noodles', desc: 'Stir-fried noodles, mixed vegetables', price: 70, category: 'Fast Food', icon: '🍜', available: true },
  { id: '13', name: 'Cheese Pizza Slice', desc: 'Wood-fired base, extra cheese', price: 65, category: 'Fast Food', icon: '🍕', available: false },
  { id: '14', name: 'Sandwich + Coffee', desc: 'Veg sandwich with a cold coffee', price: 80, category: 'Combos', icon: '🥪', available: true },
  { id: '15', name: 'Burger + Fries', desc: 'Veg burger with a side of fries', price: 100, category: 'Combos', icon: '🍔', available: true },
];

function loadMenu() {
  MENU_ITEMS.push(...FALLBACK_MENU);
  renderTabs();
  renderMenu();
  renderStickyBar();
}

// NOTE: getCart(), saveCart(), cartCount(), cartTotal() and
// updateCartBadge() live in script.js — it's loaded before this
// file on every page (index.html, menu.html, cart.html) so the
// cart logic has one single source of truth instead of being
// copy-pasted into every page's own script.

// =========================================================
// STATE
// =========================================================
let activeCategory = "All";

// =========================================================
// RENDER MENU GRID
// =========================================================
function renderMenu() {
  const grid = document.getElementById("menuGrid");
  grid.innerHTML = "";

  const cart = getCart();
  const items = MENU_ITEMS.filter(
    item => activeCategory === "All" || item.category === activeCategory
  );

  items.forEach(item => {
    const inCart = cart[item.id];
    const card = document.createElement("div");
    card.className = "food-card" + (item.available ? "" : " unavailable");

    card.innerHTML = `
      <div class="food-icon">${item.icon}</div>
      ${!item.available ? '<span class="stock-flag">OUT OF STOCK</span>' : ""}
      <h3 class="food-name">${item.name}</h3>
      <p class="food-desc">${item.desc}</p>
      <div class="food-footer">
        <span class="food-price">₹${item.price}</span>
        <div class="food-action" data-id="${item.id}"></div>
      </div>
    `;

    const actionSlot = card.querySelector(".food-action");

    if (!item.available) {
      actionSlot.innerHTML = `<button class="btn-add" disabled>Unavailable</button>`;
    } else if (inCart) {
      actionSlot.innerHTML = `
        <div class="qty-stepper">
          <button class="qty-btn" data-action="dec">−</button>
          <span class="qty-value">${inCart.qty}</span>
          <button class="qty-btn" data-action="inc">+</button>
        </div>
      `;
      actionSlot.querySelector('[data-action="dec"]').addEventListener("click", () => changeQty(item.id, -1));
      actionSlot.querySelector('[data-action="inc"]').addEventListener("click", () => changeQty(item.id, 1));
    } else {
      actionSlot.innerHTML = `<button class="btn-add">Add to Cart</button>`;
      actionSlot.querySelector(".btn-add").addEventListener("click", () => changeQty(item.id, 1));
    }

    grid.appendChild(card);
  });
}

// Adjusts quantity of a food item in the cart by `delta` (+1 / -1)
// and removes the line entirely once it hits 0.
function changeQty(foodId, delta) {
  const cart = getCart();
  const item = MENU_ITEMS.find(f => f.id === foodId);
  if (!item || !item.available) return; // never allow adding unavailable items

  if (!cart[foodId]) {
    cart[foodId] = { id: item.id, name: item.name, price: item.price, qty: 0 };
  }
  cart[foodId].qty += delta;

  if (cart[foodId].qty <= 0) {
    delete cart[foodId];
  }

  saveCart(cart);
  renderMenu();
  updateCartBadge();
  renderStickyBar();
}

// =========================================================
// STICKY "VIEW CART" BAR
// Only visible once the cart has at least one item.
// =========================================================
function renderStickyBar() {
  const bar = document.getElementById("stickyCartBar");
  const cart = getCart();
  const count = cartCount(cart);

  if (count === 0) {
    bar.classList.remove("visible");
    return;
  }

  document.getElementById("stickyItemCount").textContent =
    count + (count === 1 ? " item" : " items");
  document.getElementById("stickyTotal").textContent = `₹${cartTotal(cart)}`;
  bar.classList.add("visible");
}

// =========================================================
// CATEGORY TABS
// =========================================================
function renderTabs() {
  const tabBar = document.getElementById("categoryTabs");
  tabBar.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const tab = document.createElement("button");
    tab.className = "cat-tab" + (cat === activeCategory ? " active" : "");
    tab.textContent = cat;
    tab.addEventListener("click", () => {
      activeCategory = cat;
      renderTabs();
      renderMenu();
    });
    tabBar.appendChild(tab);
  });
}

// =========================================================
// INIT
// =========================================================
loadMenu();
