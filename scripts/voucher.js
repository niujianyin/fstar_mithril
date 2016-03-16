fstar.voucher = (function() {

  var voucherApp = {

    isInitialized: false,

    viewModel: {
      vouchers: m.prop([]),
      userMoney: m.prop('0'),

      back: function() {
        window.history.back();
      },

      loadVouchers: function() {
        util.showLoading();

        var self = this;

        util.userCenter._getWebUserInfo(true).then(function() {
          self.userMoney(util.userCenter.userMoney());

          var dataReq = {};
          util.extendProp(dataReq, util.COMMON_PARAMS);

          m.request({
            method: 'GET',
            // url: window.apiRootPath + '/rest/user/getAccountVoucherLog',
            url: util.INTERFACE_GETACCOUNTVOFUCHERLOG,
            data: {param: JSON.stringify(dataReq)},
            background: true
          }).then(function(data) {
            util.hideLoading();
            if (data.code == 100) {
              if (data.vouchersLogInfos != null) {
                self.vouchers(data.vouchersLogInfos);
                // m.redraw();
                util.redraw();
              }
            } else {
              util.alert({
                title: '错误',
                content: data.content
              });
            }
          }, function() {
            util.alert({
              title: '未连接到互联网',
              content: '请检查网络是否通畅'
            });
            util.hideLoading();
          });


        });

        

        
      },

      goToOrderDetail: function(hotelOrderId) {
        m.route('myOrderDetail/' + hotelOrderId);
      },

      onunload: function() {
        util.log('voucherApp unload');
        this.vouchers([]);
        this.userMoney('0');
      }
    },

    init: function() {
      util.log('voucherApp is initialized');

      this.isInitialized = true;
    }
  };



  voucherApp.controller = function() {
    if (!voucherApp.isInitialized) {
      voucherApp.init();
    }

    util.updateTitle('代金券明细');

    voucherApp.viewModel.loadVouchers();

    return voucherApp.viewModel;
  };

  voucherApp.view = function(ctrl) {
    return [
      voucherApp.headView(ctrl),
      voucherApp.mainView(ctrl)
    ];
  };

  voucherApp.headView = function(ctrl) {
    return m('.voucherApp-header', [
      m('.voucherApp-header-total', [m('span', '￥'), util.readableNum(ctrl.userMoney())]),
      m('.voucherApp-header-txt', '总金额')
    ]);
  };

  voucherApp.mainView = function(ctrl) {
    return m('.voucherApp-box',[
      m('.common-border'),
      m('ul.voucher-list', ctrl.vouchers().map(function(voucher, index) {
        if (voucher.vouchersRuleId == 21) {
          return m('li.clearfix.yellow', [
              m('.voucherApp-list-price', (voucher.price > 0? '+':'') + voucher.price ),
              m('.voucherApp-list-title', voucher.description),
              m('.voucherApp-list-date', '(' + util.dateFormatFmt(new Date(voucher.transactionTime), 'yyyy年MM月dd日') + ')')
          ]);
        } else {
          return m('li.clearfix', {
              onclick: ctrl.goToOrderDetail.bind(ctrl, voucher.hotelOrderId),
              className: voucher.price > 0 ? 'yellow' : ''
            }, [
              m('.voucherApp-list-price', (voucher.price > 0? '+':'') + voucher.price ),
              m('.voucherApp-list-title', util.VOUCHER_STATUS[voucher.vouchersRuleId]),
              m('.voucherApp-list-date', '(' + util.dateFormatFmt(new Date(voucher.transactionTime), 'yyyy年MM月dd日') + ')')
          ]);
        }
        
      }))
    ]);
  };

  return voucherApp;

})();