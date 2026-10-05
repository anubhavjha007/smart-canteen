const orderDataRaw = sessionStorage.getItem("orderData");
const orderData = orderDataRaw
  ? JSON.parse(orderDataRaw)
  : { items: [], subtotal: 0, gst: 0, grandTotal: 0, token: 'A001' };

function estimateWaitTime() {
  return "4 min";
}

// ---------------------------------------------------------
// STEP 4: DOM MANIPULATION
// "DOM manipulation" means using JavaScript to change what's
// on the page AFTER it has loaded — here we're filling in
// elements that were empty placeholders in the HTML.
// document.getElementById() finds an element by its id attribute,
// and .textContent / .innerHTML sets what's displayed inside it.
// ---------------------------------------------------------
function renderSuccessPage() {
  const itemsList = document.getElementById("itemsList");
  itemsList.innerHTML = "";
  document.getElementById("tokenValue").textContent = orderData.token || 'A001';
  document.getElementById("waitTime").textContent = estimateWaitTime();

  if (Array.isArray(orderData.items) && orderData.items.length > 0) {
    orderData.items.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${item.name} ×${item.qty || item.quantity}</span><span>₹${Number(item.price || 0) * Number(item.qty || item.quantity || 0)}</span>`;
      itemsList.appendChild(li);
    });
  }

  document.getElementById("grandTotalDisplay").textContent = `₹${orderData.grandTotal || orderData.total_amount || 0}`;

  const createdAt = orderData.createdAt ? new Date(orderData.createdAt) : new Date();
  document.getElementById("orderDate").textContent = createdAt.toLocaleDateString();
  document.getElementById("orderTime").textContent = createdAt.toLocaleTimeString();
}

// ---------------------------------------------------------
// The order is now placed — the shopping cart (in localStorage,
// used by menu.html/cart.html) must be cleared here. Otherwise
// the next time the student opens the menu, last order's items
// would still be sitting in their cart.
// ---------------------------------------------------------
localStorage.removeItem("scCart");

// ---------------------------------------------------------
// STEP 5: Button navigation
//
// window.location.href changes the page the browser is showing.
// Setting it to a new path is how we navigate WITHOUT a backend —
// it's just telling the browser "load this other HTML file."
// ---------------------------------------------------------
document.getElementById("viewMenuBtn").addEventListener("click", () => {
  window.location.href = "menu.html";
});

document.getElementById("backHomeBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});

// ---------------------------------------------------------
// Run everything on page load
// ---------------------------------------------------------
renderSuccessPage();