util.showToast = (function() {

  var toastTimeout = null;
  var toastDOM = document.getElementById('toast');

  function showToast(msg, hideToastDelay) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }

    toastDOM.innerHTML = '<span>' + msg + '</span>';
    toastDOM.classList.add('show');

    toastTimeout = setTimeout(function() {
      toastDOM.classList.remove('show');
    }, hideToastDelay);

  }

  return showToast;

})();

util.hideToast = function() {
  var toastDOM = document.getElementById('toast');
  toastDOM.classList.remove('show');
};