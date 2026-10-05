const checkoutItems = JSON.parse(sessionStorage.getItem("checkoutCart") || "[]");

function itemQuantity(item) {
  return Number(item.qty || item.quantity || 0);
}

// ---------------------------------------------------------
// Calculate subtotal by summing (price * qty) for every item
// ---------------------------------------------------------
function calculateSubtotal(items) {
  return items.reduce((total, item) => {
    return total + Number(item.price || 0) * itemQuantity(item);
  }, 0);
}

function renderOrder() {
  const orderList = document.getElementById("orderList");
  orderList.innerHTML = "";

  if (checkoutItems.length === 0) {
    orderList.innerHTML = '<li>Your cart is empty.</li>';
    return;
  }

  checkoutItems.forEach(item => {
    const quantity = itemQuantity(item);
    const li = document.createElement("li");
    li.innerHTML = `<span>${item.name || 'Item'} ×${quantity}</span><span>₹${Number(item.price || 0) * quantity}</span>`;
    orderList.appendChild(li);
  });

  const subtotal = calculateSubtotal(checkoutItems);
  const gst = Number((subtotal * 0.05).toFixed(2));
  const grandTotal = Number((subtotal + gst).toFixed(2));

  document.getElementById("subtotal").textContent = `₹${subtotal}`;
  document.getElementById("gst").textContent = `₹${gst}`;
  document.getElementById("grandTotal").textContent = `₹${grandTotal}`;
}

function generateToken() {
  return `A${Math.floor(100 + Math.random() * 900)}`;
}

// ---------------------------------------------------------
// Countdown timer — DECORATIVE ONLY in V1.
// It does NOT cancel the order or redirect when it hits 0.
// V2/V3: this should trigger an actual session-expiry flow.
// ---------------------------------------------------------
function startTimer() {
  let seconds = 599; // 9 minutes 59 seconds
  const timerEl = document.getElementById("timer");

  const interval = setInterval(() => {
    seconds--;
    if (seconds < 0) {
      clearInterval(interval); // stop counting, but no further action taken (V1 limitation)
      return;
    }
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    timerEl.textContent = `${mins}:${secs}`;
  }, 1000);
}

// ---------------------------------------------------------
// Pay Now button logic
// ---------------------------------------------------------
document.getElementById("payNowBtn").addEventListener("click", () => {
  const overlay = document.getElementById("processingOverlay");
  overlay.classList.remove("hidden");
  if (checkoutItems.length === 0) {
    overlay.classList.add("hidden");
    alert("Your cart is empty.");
    return;
  }

  const subtotal = calculateSubtotal(checkoutItems);
  const gst = Number((subtotal * 0.05).toFixed(2));
  const grandTotal = Number((subtotal + gst).toFixed(2));
  const orderData = {
    token: generateToken(),
    items: checkoutItems.map((item) => ({
      name: item.name,
      qty: itemQuantity(item),
      price: Number(item.unit_price || item.price || 0),
    })),
    subtotal,
    gst,
    grandTotal,
    createdAt: new Date().toISOString(),
    paymentStatus: "PAID",
  };

  sessionStorage.setItem("orderData", JSON.stringify(orderData));
  setTimeout(() => {
    window.location.href = "success.html";
  }, 1200);
});

// ---------------------------------------------------------
// Cancel button — goes back to previous page (e.g. Cart)
// ---------------------------------------------------------
document.getElementById("cancelBtn").addEventListener("click", () => {
  window.history.back();
});

// ---------------------------------------------------------
// Run on page load
// ---------------------------------------------------------
function initPaymentPage() {
  renderOrder();
  startTimer();
}

initPaymentPage();