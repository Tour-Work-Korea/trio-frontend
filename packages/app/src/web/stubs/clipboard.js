const Clipboard = {
  setString: async value => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(String(value));
    }
  },
  getString: async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      return navigator.clipboard.readText();
    }

    return '';
  },
};

export default Clipboard;
