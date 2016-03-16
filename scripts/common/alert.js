util.alert = (function() {

  var alertModule = {
    viewModel : {
      icon: m.prop(false),
      title: m.prop(''),
      content: m.prop(''),
      ok: m.prop('确定'),

      menuClicked: function(message) {
        util.messageBox.hide();
        alertModule.deferred.resolve(message);
      }
    },


    config: function(opt) {
      this.deferred = m.deferred();

      if (opt.icon) {
        alertModule.viewModel.icon(opt.icon);
      } else {
        alertModule.viewModel.icon(false);
      }

      if (opt.title) {
        alertModule.viewModel.title(opt.title);
      } else {
        alertModule.viewModel.title('');
      }

      if (opt.content) {
        alertModule.viewModel.content(opt.content);
      } else {
        alertModule.viewModel.content('');
      }

      if (opt.ok) {
        alertModule.viewModel.ok(opt.ok);
      } else {
        alertModule.viewModel.ok('确定');
      }

      
      return this.deferred.promise;
    },


    controller: function() {
      return alertModule.viewModel;
    },
    view: function(ctrl) {
      return m('.common-msg-c.common-msg-alert', [
        ctrl.icon() ? m('.common-msg-icon', [
          m('img', {src: ctrl.icon()})
        ]) : '',
        m('.common-msg-tit', ctrl.title()),
        m('.common-msg-text', ctrl.content()),
        m('.common-msg-menu', [
          m('.common-msg-ok1', {onclick: ctrl.menuClicked.bind(ctrl, 'ok')}, ctrl.ok())
        ])
      ]);
    }
  };



  function webAlert(opt) {
    var promise = alertModule.config(opt);
    util.messageBox(alertModule);
    return promise;
  }


  function nativeAlert(opt) {
    
    var alertData = {};

    alertData.message = opt.content || '';
    alertData.title = opt.title || '';
    alertData.btn_text = opt.btn_text || '确定';

    var deferred = m.deferred();

    _nativeAPI.invoke('alert', alertData, function(err, data) {
      deferred.resolve(err);
    });

    return deferred.promise;
  }


  function _alert(opt) {
    return webAlert(opt);
    // switch(util.PLATFORM.CURRENT) {
    //   case util.PLATFORM.BROWSER:
    //   case util.PLATFORM.WEIXIN:
    //   return webAlert(opt);
    //   break;
    //   case util.PLATFORM.HBGJ:
    //   case util.PLATFORM.GTGJ:
    //   return nativeAlert(opt);
    //   break;
    // }
  }

  return _alert;

})();