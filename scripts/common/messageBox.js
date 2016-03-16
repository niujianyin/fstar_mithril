;(function() {
  var messageBox = document.getElementById('messageBox');
  if(!messageBox){ return;}
  messageBox.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, false);
})();

util.messageBox = function(mithrilModule) {
  var viewData = util.viewData();
  var messageBox = document.getElementById('messageBox');
  messageBox.style.top = (viewData.scrollTop - 10) + 'px';
  messageBox.style.height = (viewData.viewHeight + 40) + 'px';

  document.body.style.overflow = 'hidden';
  

  // m.module(messageBox, mithrilModule);
  m.render(messageBox, mithrilModule.view(mithrilModule.controller()));
  messageBox.style.display = 'block';

  setTimeout(function() {
    var cHeight = messageBox.childNodes[0].offsetHeight;
    messageBox.style.paddingTop = (viewData.viewHeight / 2 - cHeight / 2 - 30) + 'px';
    messageBox.classList.add('show');
    messageBox.style.display = 'block';
  }, 100);
};

util.messageBox.hide = function() {
  document.body.style.overflow = 'visible';

  var messageBox = document.getElementById('messageBox');
  messageBox.classList.remove('show');
  setTimeout(function() {
    messageBox.style.display = 'none';
    // messageBox.innerHTML = '';
  }, 100);
  // m.module(messageBox, {
  //   view: function(){return '';},
  //   controller: function() {}
  // });
};