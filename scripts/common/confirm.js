util.confirm = (function() {

  var confirmModule = {
    viewModel : {
      icon: m.prop(false),
      title: m.prop(''),
      content: m.prop(''),
      ok: m.prop('确定'),
      cancel: m.prop('取消'),
      status: m.prop(''),

      menuClicked: function(message) {
        util.messageBox.hide();
        confirmModule.deferred.resolve(message);
      }
    },


    config: function(opt) {
      this.deferred = m.deferred();

      if (opt.icon) {
        confirmModule.viewModel.icon(opt.icon);
      } else {
        confirmModule.viewModel.icon(false);
      }

      if (opt.title) {
        confirmModule.viewModel.title(opt.title);
      } else {
        confirmModule.viewModel.title('');
      }

      if (opt.content) {
        confirmModule.viewModel.content(opt.content);
      } else {
        confirmModule.viewModel.content('');
      }

      if (opt.ok) {
        confirmModule.viewModel.ok(opt.ok);
      } else {
        confirmModule.viewModel.ok('确定');
      }

      if (opt.cancel) {
        confirmModule.viewModel.cancel(opt.cancel);
      } else {
        confirmModule.viewModel.cancel('取消');
      }

      if (opt.status) {
        confirmModule.viewModel.status(opt.status);
      } else {
        confirmModule.viewModel.status('');
      }

      
      return this.deferred.promise;
    },


    controller: function() {
      return confirmModule.viewModel;
    },
    view: function(ctrl) {
      return m('.common-msg-c.common-msg-confirm', [
        ctrl.icon() ? m('.common-msg-icon', [
          m('img', {src: ctrl.icon()})
        ]) : '',
        m('.common-msg-tit', ctrl.title()),
        m('.common-msg-text', m.trust(ctrl.content())),
        m('.common-msg-menu', [
          m('.common-msg-cancel', {onclick: ctrl.menuClicked.bind(ctrl, 'cancel')}, ctrl.cancel()),
          m('.common-msg-ok', {
            className: ctrl.status() == 'delete'?'common-msg-delete':'',
            onclick: ctrl.menuClicked.bind(ctrl, 'ok')
          }, ctrl.ok())
        ])
      ]);
    }
  };



  function webConfirm(opt) {
    var promise = confirmModule.config(opt);
    util.messageBox(confirmModule);
    return promise;
  }

  function nativeConfirm(opt) {
    var confirmData = {};

    confirmData.message = opt.content || '';
    confirmData.title = opt.title || '';
    confirmData.yes_btn_text = opt.yes_btn_text || '确定';
    confirmData.no_btn_text = opt.no_btn_text || '取消';

    var deferred = m.deferred();

    _nativeAPI.invoke('confirm', confirmData, function(err, data) {
      if (data.value === data.YES) {
        deferred.resolve('ok');
      } else {
        deferred.resolve('cancel');
      }
    });

    return deferred.promise;
  }

  function _confirm(opt) {
    return webConfirm(opt);
    // switch(util.PLATFORM.CURRENT) {
    //   case util.PLATFORM.BROWSER:
    //   case util.PLATFORM.WEIXIN:
    //   return webConfirm(opt);
    //   break;
    //   case util.PLATFORM.HBGJ:
    //   case util.PLATFORM.GTGJ:
    //   return nativeConfirm(opt);
    //   break;
    // }
  }

  return _confirm;

})();