fstar.payApp = (function() {

  var payApp = {
    
    isInitialized: false,

    viewModel: {
      isLogin: m.prop(false),
      orderId: m.prop(''),
      wxConfig: m.prop({}),
      url: m.prop(''),
      beginTime: m.prop(''),
      wxPayReady: m.prop(false),

      keepOrderTime: m.prop(30),


      // MM月dd日
      dateFormat: function(date) {
        if(date === ""){ return;}
        date = date.replace(/-/g,"/");
        var rdate = util.dateFormatFmt(new Date(date),"MM月dd日");
        return rdate;
      },

      getWXConfig: function() {
        var self = this;
        var _config ;
        var _url = self.url();

        var dataReq = {
            url: _url
          };
        util.extendProp(dataReq, util.COMMON_PARAMS);

        m.request({
          method: 'GET',
          // url: window.apiRootPath + '/rest/wx/pay/payConfig',
          url: util.INTERFACE_PAYCONFIG,
          data: {param: JSON.stringify(dataReq)},
          background: true
        }).then(function(data) {
          _config = data;
          util.hideLoading();

          self.wxPayReady(true);
          util.hideLoading();
          m.redraw();

          /**
           *_config Object
           *appid String
           *sign String
           *signature Object{ noncestr String ,timestamp String }
           */ 
          self.wxInit(_config);
          self.wxConfig(_config);
        }, function() {
          util.alert({
            content: '网络不给力，请稍后再试试吧',
            ok: '知道了'
          });
        });
      },

      wxInit: function(config){
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: config.appid, // 必填，公众号的唯一标识
          timestamp: config.signature.timestamp, // 必填，生成签名的时间戳
          nonceStr: config.signature.noncestr, // 必填，生成签名的随机串
          signature: config.sign,// 必填，签名，见附录1
          jsApiList: ['chooseWXPay'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
      },

      wxPay: function(){
        var self = this;

        if (!self.wxPayReady()) {
          return;
        }

        if (self.isBu && self.isBu()) {
          // 补差价没有时间限制
        } else {
          var endTime = (new Date()).getTime();
          var beginTime = self.beginTime();
          var orderTime = self.orderTime();
          var nowTime = self.nowTime();

          if( (self.keepOrderTime() * 60 * 1000) < (nowTime-beginTime+endTime-orderTime) ){
            util.alert({
              title: '支付超时',
              content: '请重新下订单'
            }).then(function(message) {
              window.history.back();
            });
            return;
          }
        }
        

        // if(self.isPaying()){
        //   self.isPaying(false);
          // var payTimeOut = setTimeout(function(){
          //   self.isPaying(true);     
          // },5000);
          var _config = self.wxConfig();

          util.showLoading();

          var dataReq = {
              id: ("" + self.orderId()),
              nonceStr: _config.signature.noncestr,
              timestamp: _config.signature.timestamp
            };
          util.extendProp(dataReq, util.COMMON_PARAMS);

          m.request({
            method: 'GET',
            // url: window.apiRootPath + "/rest/wx/pay/getPreOrder?id="+self.orderId()
            //   +"&nonceStr="+_config.signature.noncestr
            //   +"&timestamp="+_config.signature.timestamp,
            url: util.INTERFACE_GETPREORDER,
            data: {param: JSON.stringify(dataReq)},
            background: true
          }).then(function(jsParam) {
            util.messageBox.hide();
            util.hideLoading();

            // alert(JSON.stringify({
            //     "appId" : jsParam.appId, //公众号名称,由商户传入 
            //     "timestamp":jsParam.timeStamp, //时间戳,自 1970 年以来的秒数
            //     "nonceStr" : jsParam.nonceStr, //随机串 
            //     "package" : jsParam.package_,
            //     "signType" : jsParam.signType, //微信签名方式:
            //     "paySign" : jsParam.paySign
            //   }));

            wx.chooseWXPay({
                "appId" : jsParam.appId, //公众号名称,由商户传入
                "timestamp":jsParam.timeStamp, //时间戳,自 1970 年以来的秒数
                "nonceStr" : jsParam.nonceStr, //随机串 
                "package" : jsParam.package_,
                "signType" : jsParam.signType, //微信签名方式:
                "paySign" : jsParam.paySign, //微信签名 
                success:function(res){
                  // alert(JSON.stringify(res));
                  if(res.errMsg == "chooseWXPay:ok" ) {

                    var dataReq = {
                      orderId: self.orderId()
                    };
                    util.extendProp(dataReq, util.COMMON_PARAMS);

                    m.request({
                      method: 'GET',
                      // url: window.apiRootPath + "/rest/order/getOrderPayMsg?orderId="+self.orderId(),
                      url: util.INTERFACE_GETORDERPAYMSG,
                      data: {param: JSON.stringify(dataReq)},
                      background: true
                    }).then(function(okData) {
                      // util.alert({title:'订单支付成功',content:okData.CommonMsg}).then(function() {
                      //   self.goToOrderDetail();
                      //   util.userCenter._getWebUserInfo();
                      // });
                      self.goToOrderDetail();
                      util.userCenter._getWebUserInfo();
                    }, function () {
                      // util.alert({content:'订单支付成功'}).then(function() {
                      //   self.goToOrderDetail();
                      //   util.userCenter._getWebUserInfo();
                      // });
                      self.goToOrderDetail();
                      util.userCenter._getWebUserInfo();
                    });
                  }else{
                    util.confirm({
                      title: '支付失败，是否继续支付?',
                      ok: '继续支付',
                      cancel: '稍后支付'
                    }).then(function(msg) {
                      if (msg === 'cancel') {
                        self.goToOrderDetail();
                        util.userCenter._getWebUserInfo();
                      }
                    });
                  }
                },
                fail: function(){
                  util.confirm({
                    title:'支付失败，是否继续支付',
                    cancel: '稍后支付',
                    ok: '继续支付'
                  }).then(function(message){
                    if (message === 'cancel') {
                      window.history.back();
                    }
                  });
                },
                cancel: function(){

                },
                complete: function(){
                  clearTimeout(payTimeOut);
                }
              });
          }, function() {
            util.alert({
              title: '未连接到互联网',
              content: '请检查网络是否通畅'
            });
          });
        // }
      },
      goToOrderDetail: function() {
        m.route('myOrderDetail/' + this.orderId(), {
          from: 'pay'
        }, true);
      },
      goHistoryBack: function(){
        // history.back();
        util.confirm({
          content: '支付尚未完成，是否取消支付',
          ok: '继续支付',
          cancel: '取消支付'
        }).then(function(message) {
          if (message === 'cancel') {
            history.back();
          }
        });
      }
    },

    init: function() {
      this.isInitialized = true;
      util.hideLoading();
    }

  };

  payApp.controller = function() {
    if (!payApp.isInitialized) {
      payApp.init();
    }

    util.updateTitle('酒店预订');

    payApp.viewModel.orderId(m.route.param('orderId'));
    util.extend(payApp.viewModel, JSON.parse(m.route.param('data')));
    payApp.viewModel.currentDate(new Date(window.parseInt(payApp.viewModel.currentDate(), 10)));
    payApp.viewModel.stayDayCount(window.parseInt(payApp.viewModel.stayDayCount(),10));

    payApp.viewModel.beginTime((new Date()).getTime());
    payApp.viewModel.wxPayReady(false);
    util.showLoading();

    payApp.viewModel.url(location.href.split('#')[0]);
    // payApp.viewModel.url(encodeURIComponent(location.href.split('#')[0]));

    payApp.viewModel.getWXConfig();

    // _czc.push(﻿['_trackEvent', '微信支付页','微信支付页:进入', util.COMMON_PARAMS.comm_cityName +':'+util.PLATFORM.CURRENT_STR+':'+util.OS]);

    return payApp.viewModel;
  };

  payApp.view = function(ctrl) {
    return [
      payApp.creditView(ctrl),
      payApp.inforView(ctrl),
      payApp.payView(ctrl),
      payApp.tipView(ctrl)
    ];
  };

  payApp.creditView = function(ctrl) {
    return m('.payApp-credit', ['航班管家/高铁管家旗下酒店预订平台', m('.common-border')]);
  };

  payApp.inforView = function(ctrl) {
    return m('.payApp-infor',[
      m('.payApp-infor-main',[
        m('.payApp-infor-main-name',ctrl.name()),
        m('.payApp-infor-main-p',[
          m('span.payApp-date-txt','入住'),
          m('span.payApp-date-time', util.dateFormatFmt(ctrl.currentDate(), 'MM/dd')+'（'+util.getCurrentWeek(ctrl.currentDate())+'）'),
          m('span.payApp-date-txt.payApp-date-outtime','离店'),
          m('span.payApp-date-time', util.dateFormatFmt( util.nextDate(ctrl.currentDate(), ctrl.stayDayCount()), 'MM/dd')+'（'+util.getCurrentWeek( util.nextDate(ctrl.currentDate(), ctrl.stayDayCount()) )+'）')
        ]),
        m('.payApp-infor-main-p', ctrl.roomType()+','+ctrl.breakFastQty()+','+ctrl.roomCount()+'间')
      ]),
      m('.payApp-infor-price','¥'+ ctrl.totalPrice())
    ]);
  };

  payApp.payView = function(ctrl) {
    return m('div.payApp-pay',[
        m('a.payApp-pay-item#payApp-pay-item1', { 
          // className : ctrl.wxPayReady() ? '' : 'orderPay-disable', 
          href: 'javascript:;', onclick: ctrl.wxPay.bind(ctrl)
        },[
          m('span.payApp-pay-item-icon#payApp-pay-item-weixin'),
          m('span.payApp-pay-item-main',[
            '微信支付',
            m('span.payApp-pay-item-arrow.common-icon-more-right')
          ])
        ])
        // m('a.payApp-pay-item', {href: 'javascript:;'},[
        //   m('span.payApp-pay-item-icon#payApp-pay-item-zfb'),
        //   m('span.payApp-pay-item-main',['支付宝',m('span.payApp-pay-item-arrow')])
        // ]),
        // m('a.payApp-pay-item', {href: 'javascript:;'},[
        //   m('span.payApp-pay-item-icon#payApp-pay-item-card'),
        //   m('span.payApp-pay-item-main',['银行卡支付',m('span.payApp-pay-item-arrow')])
        // ])
      ]);
  };
  payApp.tipView = function(ctrl) {
    if (ctrl.isBu && ctrl.isBu()) {
      return '';
    }
    var time = new Date(parseInt(ctrl.orderTime(), 10) + ctrl.keepOrderTime() * 1000 * 60);
    return m('div.payApp-tip',[m('span.payApp-icon-circle'),'请在' + util.dateFormatFmt(time, 'hh:mm') + '前付款，否则订单将被取消']);
  };

  return payApp;

})();