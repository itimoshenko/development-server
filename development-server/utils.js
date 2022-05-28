module.exports.debounce = (cb, ms) => {
  let isCooldown = false;

  return (...args) => {
    if (isCooldown) return;

    cb.apply(this, args);

    isCooldown = true;

    setTimeout(() => isCooldown = false, ms);
  };
};
