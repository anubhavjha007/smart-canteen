function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

function isValidQuantity(quantity) {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 999;
}

function normalizeStatus(status) {
  return typeof status === 'string' ? status.trim().toUpperCase() : '';
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidQuantity,
  normalizeStatus,
};
