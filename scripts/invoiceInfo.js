fstar.invoiceInfo = (function() {

  var invoiceInfo = {

    isInitialized: false,

    viewModel: {
      info: m.prop('')
    },

    init: function() {
      this.isInitialized = true;
    }
  };

  invoiceInfo.controller = function() {
    if (!invoiceInfo.isInitialized) {
      invoiceInfo.init();
    }
    util.updateTitle('发票状态');
    var info = JSON.parse(m.route.param('info'));
    invoiceInfo.viewModel.info(info);
    util.hideLoading();

    return invoiceInfo.viewModel;
  };

  invoiceInfo.view = function(ctrl) {
    return m('.invoiceInfo-w', [
      invoiceInfo.headView(ctrl),
      invoiceInfo.infoView(ctrl),
    ]);
  };

  invoiceInfo.headView = function(ctrl) {
    return m('.invoiceInfo-head.invoiceInfo-border', [
      ctrl.info().status
    ]);
  };

  invoiceInfo.infoView = function(ctrl) {
    // var sendTime = ctrl.info().sendTime.replace(/-/g,"/"); 
    // var sendOverTime = ctrl.info().sendOverTime.replace(/-/g,"/"); 
    // 快递订单号
    var invoicePostNo = ctrl.info().invoicePostNo;
    // sendTime = util.dateFormatFmt(new Date(sendTime),"MM月dd日");
    // sendOverTime = util.dateFormatFmt(new Date(sendOverTime),"MM月dd日");
    


    return m('.invoiceInfo-info', [
      m('.invoiceInfo-box.invoiceInfo-border',[
        m('.invoiceInfo-title','配送信息'),
        m('ul.invoiceInfo-list',[
          m('li',[
            m('span.invoiceInfo-label', '配送方式'),
            m('span.invoiceInfo-content', [
              util.ORDER_MAIL_TYPE[ctrl.info().mailType || 2],
              m('span.invoiceInfo-explain','预计在您离店后10个工作日内送达')
            ])
          ]),
          m('li',[
            m('span.invoiceInfo-label', '单号'),
            m('span.invoiceInfo-content', [
              invoicePostNo || '暂无',
              // m('span.invoiceInfo-explain','预计'+sendTime+'配送')
            ])
          ]),
          m('li',[
            m('span.invoiceInfo-label', '发票明细'),
            m('span.invoiceInfo-content', [
              ctrl.info().invoiceDetail || '代订房费',
              m('span.invoiceInfo-explain','由旅行社开具')
            ])
          ]),
          m('li',[
            m('span.invoiceInfo-label', '发票金额'),
            m('span.invoiceInfo-content', [
              '¥'+ctrl.info().invoiceAmount
            ])
          ]),
        ])
      ]),
      m('.invoiceInfo-instruction', 
        ctrl.info().payType == 2?
        '房费发票:请在酒店前台申请/服务费发票:填写后邮寄':
        '发票在您入住且离店后邮寄，不需要向酒店前台申请'
      ),
      m('.invoiceInfo-box.invoiceInfo-border',[
        m('.invoiceInfo-title','发票信息'),
        m('ul.invoiceInfo-list',[
          m('li',[
            m('span.invoiceInfo-label', '发票抬头'),
            m('span.invoiceInfo-content', [
              ctrl.info().invoicetitle || '暂无'
            ])
          ]),
          m('li',[
            m('span.invoiceInfo-label', '收件人'),
            m('span.invoiceInfo-content', 
              ctrl.info().receiver || '暂无'
            )
          ]),
          m('li',[
            m('span.invoiceInfo-label', '联系手机'),
            m('span.invoiceInfo-content', 
              ctrl.info().phone || '暂无'
            )
          ]),
          m('li',[
            m('span.invoiceInfo-label', '地址'),
            m('span.invoiceInfo-content', 
              ctrl.info().address || '暂无'
            )
          ]),
        ])
      ]),
      m('.invoiceInfo-instruction', '发票信息提交后，不可修改。如有特殊需求，请联系客服。')
    ]);
  };

  return invoiceInfo;

})();