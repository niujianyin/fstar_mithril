util.notice = (function() {

  var noticeModule = {
    viewModel : {
      icon: m.prop(false),
      title: m.prop(''),
      content: m.prop(''),

      hide: function() {
        util.messageBox.hide();
        noticeModule.deferred.resolve();
      }
    },

    config: function(opt) {
      var self = this;
      self.deferred = m.deferred();

      if (opt.icon) {
        noticeModule.viewModel.icon(opt.icon);
      } else {
        noticeModule.viewModel.icon(false);
      }

      if (opt.title) {
        noticeModule.viewModel.title(opt.title);
      } else {
        noticeModule.viewModel.title('');
      }

      if (opt.content) {
        noticeModule.viewModel.content(opt.content);
      } else {
        noticeModule.viewModel.content('');
      }

      var timeToHide = 2000;
      if (opt.timeout) {
        timeToHide = opt.timeout;
      }

      setTimeout(function() {
        noticeModule.viewModel.hide();
      }, timeToHide);

      
      return this.deferred.promise;
    },


    controller: function() {
      return noticeModule.viewModel;
    },
    view: function(ctrl) {
      return m('.common-msg-c.common-msg-notice', [
        ctrl.icon() ? m('.common_icon_notice') : '',
        m('.common-msg-tit', ctrl.title()),
        m('.common-msg-text', ctrl.content())
      ]);
    }
  };



  function notice(opt) {
    var promise = noticeModule.config(opt);
    util.messageBox(noticeModule);

    return promise;
  }

  return notice;

})();