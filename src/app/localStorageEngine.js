/**
 * A minimal redux-persist storage engine backed by window.localStorage.
 *
 * We intentionally don't import "redux-persist/lib/storage" — that package
 * is CommonJS, and depending on the bundler/dev-server, its default export
 * can fail to interop correctly (you get the module namespace object
 * instead of the actual storage instance), which surfaces as
 * "storage.getItem is not a function" at runtime. Implementing the same
 * three-method interface ourselves sidesteps that entirely.
 */
const storage = {
  getItem(key) {
    try {
      return Promise.resolve(window.localStorage.getItem(key));
    } catch (err) {
      return Promise.reject(err);
    }
  },
  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return Promise.resolve(true);
    } catch (err) {
      return Promise.reject(err);
    }
  },
  removeItem(key) {
    try {
      window.localStorage.removeItem(key);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default storage;
