__inline('accountPhoneApp.js');

fstar.accountApp = (function() {

  var accountApp = {

    isInitialized: false,
    viewModel: {
      menuData: [{icon: __inline('../images/icon_phone@2x.png'), title: '修改手机号', url: 'accountPhoneApp',  toTitle: '验证新手机号'}],
      // accountPhone: m.prop(''),
      back: function() {
        window.history.back();
      },

      menuClick: function(menu) {
        var self = this;
        fstar.accountPhoneApp.config({
          title: menu.toTitle
        });
        m.route(menu.url,{},true);
      },

      onunload: function() {
        util.log('accountApp unload');
      }
    },

    init: function() {
      window.__realRoutes.accountPhoneApp = fstar.accountPhoneApp;
      this.isInitialized = true;
    }
  };

  accountApp.controller = function() {
    if (!accountApp.isInitialized) {
      util.log('accountApp init');
      accountApp.init();
    }

    util.updateTitle('账户信息');
    util.hideLoading();
    // accountApp.viewModel.accountPhone(m.route.param('phone'));
    return accountApp.viewModel;
  };

  accountApp.view = function(ctrl) {
    return m('.accountApp-w', [
      accountApp.listView(ctrl)
    ]);
  };

  accountApp.listView = function(ctrl) {
    return m('.accountApp-box', [
      m('ul.common-table', ctrl.menuData.map(function(menu, index) {
        return m('li.clearfix', {onclick: ctrl.menuClick.bind(ctrl, menu)}, [
          m('img.common-table-icon', {src: menu.icon, width: 12, height: 20}),
          m('.common-table-cell', [
            m('span', menu.title),
            m('span.common-icon-more-right.user-cell-icon-more')
          ])
        ]);
      }))
    ]);
  };

  return accountApp;

})();