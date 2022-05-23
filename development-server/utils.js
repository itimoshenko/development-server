module.exports.debounce = function debounce(cb, ms) {
  let isCooldown = false;

  return function() {
    if (isCooldown) return;

    cb.apply(this, arguments);

    isCooldown = true;

    setTimeout(() => isCooldown = false, ms);
  };
};
