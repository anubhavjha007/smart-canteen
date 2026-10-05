// =========================================================
// MOBILE NAV TOGGLE
// Clicking the hamburger icon shows/hides the mobile dropdown
// nav and animates the three bars into an "X".
// =========================================================
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileNav = document.getElementById("mobileNav");

hamburgerBtn.addEventListener("click", () => {
  // .classList.toggle() adds the class if it's missing, removes it if present.
  // This is what flips the hamburger open/closed on every click.
  hamburgerBtn.classList.toggle("open");
  mobileNav.classList.toggle("open");
});

// ---------------------------------------------------------
// Auto-close mobile nav when a link is clicked
// Without this, clicking "Menu" scrolls the page but the
// dropdown stays open on top of it — annoying UX bug.
// ---------------------------------------------------------
const mobileLinks = mobileNav.querySelectorAll("a");
mobileLinks.forEach(link => {
  link.addEventListener("click", () => {
    hamburgerBtn.classList.remove("open");
    mobileNav.classList.remove("open");
  });
});

// =========================================================
// CART STORAGE — single source of truth
// Loaded on every page (index.html, menu.html, cart.html) so
// menu.js and cart.js both call these instead of each keeping
// their own copy. There is no backend in V1, so localStorage
// stands in for a database: it survives page navigation and
// tab close/reopen, but only on this one browser.
// Shape: { [foodId]: { id, name, price, qty } }
// =========================================================
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("scCart")) || {};
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem("scCart", JSON.stringify(cart));
}


function cartCount(cart) {
  return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal(cart) {
  return Object.values(cart).reduce((sum, item) => sum + item.qty * item.price, 0);
}

// Updates the small number badge on the navbar cart icon.
// Runs once below on every page load; menu.js/cart.js call it
// again after any add/remove/quantity change.
function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  const count = cartCount(getCart());
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

updateCartBadge();