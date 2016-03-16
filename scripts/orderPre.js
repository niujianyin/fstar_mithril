fstar.orderPreApp = (function() {

  var orderPreApp = {
    isInitialized: false,

    viewModel: {

    },

    init: function() {
      this.isInitialized = true;
    }

  };

  orderPreApp.goOrder = function(){
    util.userCenter._checkLogin().then(function(isLogin) {
      if (isLogin) {
        m.route('order',{
          roomStatusIds: m.route.param('roomStatusIds'),
          checkIn: m.route.param('checkIn'),
          checkOut: m.route.param('checkOut')
        },true);
      } else {
        switch(util.PLATFORM.CURRENT) {
          case util.PLATFORM.BROWSER:
          case util.PLATFORM.WEIXIN:
          // 登录完了之后需要判断优惠券是否能够预订
          m.route('verify', {
            toRoute: 'order',
            data: JSON.stringify({
              roomStatusIds: m.route.param('roomStatusIds'),
              checkIn: m.route.param('checkIn'),
              checkOut: m.route.param('checkOut')
            }),
            replaceHistory: true
          });
          
          break;
          case util.PLATFORM.HBGJ:
          case util.PLATFORM.GTGJ:
          util.hideLoading();
          util.userCenter._doNativeLogin().then(function(isLogin) {
            if (isLogin) {
              util.showLoading();
              m.route('order',{
                roomStatusIds: m.route.param('roomStatusIds'),
                checkIn: m.route.param('checkIn'),
                checkOut: m.route.param('checkOut')
              },true);
            } else {
              util.hideLoading();
              util.alert({
                title: '错误',
                content: '登录失败'
              });
            }
          });

          break;
        }
      }
    });
  }

  orderPreApp.controller = function() {
    if (!orderPreApp.isInitialized) {
      orderPreApp.init();
    }

    // _czc.push(﻿['_trackEvent', '订单中间页','订单页:进入', util.COMMON_PARAMS.comm_cityName +':'+util.PLATFORM.CURRENT_STR+':'+util.OS]);

    if (util.getCurrentWeek( m.route.param('checkIn') ) === '今天') {
      var dataReq = {};
      util.extendProp(dataReq, util.COMMON_PARAMS);
      m.request({
        method: 'GET',
        url: util.INTERFACE_GETLASTBOOKTIME,
        data: {param: JSON.stringify(dataReq)}
      }).then(function(data) { 
        // util.log(JSON.stringify(data));
        if(data && data.code == 100){

          var timeBook = data.msg.split(',')[0];
          var timeAry = timeBook.split(':');
          var timeNow = (data.msg.split(',')[1] && new Date(data.msg.split(',')[1]))|| new Date();
          var timeH = parseInt(timeAry[0], 10);
          var timeM = parseInt(timeAry[1], 10);
          if (timeNow.getHours() >= timeH && timeNow.getMinutes() >= timeM) {
            // _czc.push(﻿['_trackEvent', '订单中间页','订单中间页:今天几点之前预定', '请在 ' + timeBook + ' 之前，预订今晚入住的酒店:'+util.COMMON_PARAMS.comm_cityName +':'+util.PLATFORM.CURRENT_STR+':'+util.OS]);

            util.hideLoading();
            util.alert({
              title: '提示',
              content: '请在 ' + timeBook + ' 之前，预订今晚入住的酒店'
            }).then(function() {
              util.closeWebView();
            });
            return;
          } else {
            setTimeout(function(){
              orderPreApp.goOrder();
            },100);
          }

        } else {
          util.alert({content:'获取酒店相关信息失败'}).then(function(){
            util.closeWebView();
          });
        }

      });
    } else {
      setTimeout(function(){
        orderPreApp.goOrder();
      },200);
    }
    document.querySelectorAll('body')[0].style.backgroundColor = '';
    return orderPreApp.viewModel;
  };

  orderPreApp.view = function(ctrl) {
    return '';
  };

  return orderPreApp;

})();