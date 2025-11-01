// src/lib/safe-destroy-shim.js
// Temporary global guard against "x.destroy is not a function" crashes.
// It makes obj.destroy() a no-op when a library/component forgot to define it.
//
// NOTE: enumerable: false so it won't show up in for..in or JSON.stringify.
(() => {
  try {
    if (!Object.prototype.destroy) {
      Object.defineProperty(Object.prototype, "destroy", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: function () {
          // no-op by design
        },
      });
    }
  } catch {
    // If the environment forbids defining on Object.prototype, silently skip.
  }
})();
