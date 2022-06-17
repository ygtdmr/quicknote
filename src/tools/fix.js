const focus_reset = () => {
  if (document.activeElement.getAttribute('data-ignore-focus') === null && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
    document.activeElement.blur();
  }
};

window.addEventListener('click',focus_reset);
window.addEventListener('contextmenu',focus_reset);
window.addEventListener('keydown', e=>{
  switch (e.code) {
    case 'Space':
      if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
        break;
      }
      if (!e.target.onclick) {
        e.preventDefault();
        break;
      }
      document.activeElement.click();
    // eslint-disable-next-line
    case 'Escape':
      focus_reset();
      e.preventDefault();
      break;
    default:
  }
});


// eslint-disable-next-line
Object.defineProperty(Array.prototype, 'getInner', {
    value: function(callback) {
      const inner = parent => {
        return parent.map(child_item=>{
          if(child_item[2]) {
            child_item[2] = callback(inner(child_item[2]));
          }
          return child_item;
        });
      };
      return callback(inner(this));
    }
});

// eslint-disable-next-line
Object.defineProperty(Array.prototype, 'indexMove', {
    value: function(fromIndex, toIndex) {
      const item = this[fromIndex];
      this.splice(fromIndex, 1);
      this.splice(toIndex, 0, item);
      return this;
    }
});
