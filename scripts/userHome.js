fstar.userHome = (function() {

  var userHome = {
    isInitialized: false,

    viewModel: {

      userMoney: m.prop('0'),
      userNumber: m.prop('--'),
      isNative: m.prop(false),

      showLogoutButton: util.PLATFORM.CURRENT === util.PLATFORM.BROWSER ? m.prop(true) : m.prop(false),

      menuData: [{icon: __inline('../images/icon_passenger@2x.png'), title: '常用入住人', url: 'userPassengers', width: 34, height: 38}, 
        {icon: __inline('../images/icon_address@2x.png'), title: '常用地址', url: 'userAddress', width: 30, height: 40}, 
        {icon: __inline('../images/icon_receipt@2x.png'), title: '常用发票抬头', url: 'userBill', width: 34, height: 34}],

      back: function() {
        window.history.back();
      },
      doLogout: function() {
        var self = this;

        var dataReq = {};
        util.extendProp(dataReq, util.COMMON_PARAMS);

        m.request({
          method: 'GET',
          // url: window.apiRootPath + '/rest/user/quitLogin',
          url: util.INTERFACE_QUITLOGIN,
          data: {param: JSON.stringify(dataReq)},
          background: true
        }).then(function(data) {
          if (data && data.code ==  100) {
            m.route('',{},true);
            util.userCenter._checkLogin();
          } else {
            util.alert({
              title: '错误',
              content: data.msg
            });
          }
        }, function() {
          util.alert({
            title: '错误',
            content: '您的网络有问题！'
          });
        });
      },
      goToVoucher: function() {
        var self = this;
        m.route('voucher',{
          userMoney: self.userMoney()
        });
      },
      goToOrder: function() {
        m.route('myOrder');
      },
      menuClick: function(menu) {
        m.loadRoute(menu.url).then(function(user){
          user.config({},{}).then(function(msg){
          });
          m.route(menu.url,{
            source: 'userHome'
          });
        })
      },
      loadUserInfo: function() {
        var self = this;
        
        util.showLoading();

        util.userCenter._getWebUserInfo(true).then(function(isSuccess) {
          util.hideLoading();
          
          if (isSuccess) {
            if (util.userCenter.isLogin()) {
              self.userNumber(util.userCenter.userInfo().phone);
              self.userMoney(util.userCenter.userMoney());

              util.redraw();
              
            } else {
              util.alert({
                title: '错误',
                content: '您还没有登录，请先登录'
              }).then(function() {
                util.userCenter._doLogin();
              });
            }
          } else {
            util.alert({
              title: '错误',
              content: '您还没有登录，请先登录'
            }).then(function() {
              util.userCenter._doLogin();
            });
          }
        });
      },
      goAccount: function(){
        var self = this;
        if (self.isNative()) return;
        
        m.route('account',{
          phone: self.userNumber()
        }, false);
      },

      onunload: function(){
        util.log('userHome unload');
        var self = this;
        self.userMoney('0');
        self.userNumber('--');
      }
    },

    init: function() {
      // 只初始化了一次，所以css文件只加载了一次
      this.isInitialized = true;
    }
  };

  userHome.controller = function() {
    // 只需初始化一次即可
    if (!userHome.isInitialized) {
      util.log('userHome is initialized');
      userHome.init();
    }
    
    if (util.PLATFORM.CURRENT == util.PLATFORM.GTGJ || util.PLATFORM.CURRENT == util.PLATFORM.HBGJ) {
      userHome.viewModel.isNative(true);
    }

    util.updateTitle('我的账户');

    util.hideLoading();
    userHome.viewModel.loadUserInfo();

    document.querySelectorAll('body')[0].style.backgroundColor = '';
    
    return userHome.viewModel;
  };

  userHome.view = function(ctrl) {
    return m('.user-w', [
      userHome.mainView(ctrl)
    ]);
  };

  userHome.mainView = function(ctrl) {
    return [
      m('.user-info',{
        onclick: ctrl.goAccount.bind(ctrl)
      }, [
        m('.user-photo'),
        m('.user-number', util.secretNumber(ctrl.userNumber())),
        ctrl.isNative() ? '' : m('.common-icon-more-right')
      ]),

      m('.common-border'),
      m('.user-focus.clearfix', [
        m('.user-money', {onclick: ctrl.goToVoucher.bind(ctrl)}, [
          m('span.user-money-w', [
            m('span.user-money-c', [
              m('i', '￥'),
              util.readableNum(ctrl.userMoney())
            ])
          ]),
          m('span.user-money-t', '代金券')
        ]),
        m('.user-order', {onclick: ctrl.goToOrder.bind(ctrl)}, [
          m('.user-order-c', [
            m('span.user-icon-order'),
            m('span.user-order-t', '订单'),
            // m('span.user-order-barget', 1)
          ])
        ])
      ]),
      m('.common-border'),

      ctrl.isNative() ? '' : m('ul.common-table', ctrl.menuData.map(function(menu, index) {
        return m('li.clearfix', {honclick: ctrl.menuClick.bind(ctrl, menu)}, [
          m('img.common-table-icon', {
            src: menu.icon, 
            width: menu.width / 2, 
            height: menu.height / 2,
            style: 'margin:' +  Math.floor((44 - menu.height / 2) / 2) + 'px 0 0 ' + (Math.floor((34 - menu.width / 2 ) / 2) - 2) + 'px;'
          }),
          m('.common-table-cell', [
            m('span', menu.title),
            m('.common-icon-more-right')
          ])
        ]);
      })),
      ctrl.showLogoutButton() ? m('.user-logout-button', {onclick: ctrl.doLogout.bind(ctrl)}, '退出登录') : ''
    ];
  };




  return userHome;

})();