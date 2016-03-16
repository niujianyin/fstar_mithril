util.lazyLoad = (function() {

  var timeout = null;

  var viewData = function(){
    var e = 0, l = 0, i = 0, g = 0, f = 0, m = 0;
    var j = window, h = document, k = h.documentElement;
    e = k.clientWidth || h.body.clientWidth || 0;
    l = j.innerHeight || k.clientHeight || h.body.clientHeight || 0;
    g = h.body.scrollTop || k.scrollTop || j.pageYOffset || 0;
    i = h.body.scrollLeft || k.scrollLeft || j.pageXOffset || 0;
    f = Math.max(h.body.scrollWidth, k.scrollWidth || 0);
    m = Math.max(h.body.scrollHeight, k.scrollHeight || 0, l);
    return {scrollTop: g,scrollLeft: i,documentWidth: f,documentHeight: m,viewWidth: e,viewHeight: l};
  };

  function _onScroll() {
    if (timeout) {
      window.clearTimeout(timeout);
    }
    timeout = setTimeout(function() {
      checkLoad();
    }, 200);
  }

  function checkLoad() {
    var images = document.querySelectorAll('.lazy-load');
    var vD = viewData();
    for(var i = 0; i < images.length; i ++) {
      if (images[i].parentElement.parentElement.offsetTop < vD.viewHeight + vD.scrollTop - 50) {
        var srcUrl = images[i].getAttribute('data-src');
        if(!/null/.test(srcUrl)){
          images[i].src = images[i].getAttribute('data-src');
        }
      }
    }
  }



  return function(enable) {
    if (enable) {
      window.removeEventListener('scroll', _onScroll, false);
      window.addEventListener('scroll', _onScroll, false);
    } else {
      window.removeEventListener('scroll', _onScroll, false);
    }
    
  };

})();