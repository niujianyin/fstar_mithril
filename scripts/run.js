;(function(win, doc) {
  // util 全局变量 会提前载入  
  util.startApp = function(){
    __inline('indexApp.js');
  }

  function run() {
    m.route.mode = 'hash';
    m.route2(document.getElementById('main'), window.defaultMain, {
      '': {
        name: 'indexApp',
        path: __uri('./indexApp.js')
      },
      'cityFilter': {
        name: 'cityFilter',
        path: __uri('./cityFilter.js')
      },
      'cityFilterbat': {
        name: 'cityFilterbat',
        path: __uri('./cityFilterbat.js')
      },
      'selectDate': {
        name: 'dateSelector',
        path: __uri('./dateSelector.js')
      },
      'searchApp': {
        name: 'searchApp', 
        path: __uri('./searchApp.js')
      },
      'list': {
        name: 'listApp',
        path: __uri('./listApp.js')
      },
      'detail': {
        name: 'detailApp',
        path: __uri('./detail.js')
      },
      'detail/:hotelId/:currentDate/:stayDayCount': {
        name: 'detailApp',
        path: __uri('./detail.js')
      },
      'comment/:hotelId/:hotelName/:userScore': {
        name: 'commentApp',
        path: __uri('./comment.js')
      },
      'detailProduct': {
        name: 'detailProduct',
        path: __uri('./detailProduct.js')
      },
      'hotelDetail': {
        name: 'hotelDetailApp2',
        path: __uri('./hotelDetail2.js')
      },
      'circleFilter': {
        name: 'circleFilter',
        path: __uri('./circleFilter.js')
      },
      'brandFilter': {
        name: 'brandFilter',
        path: __uri('./brandFilter.js')
      },
      'orderPre': {
        name: 'orderPreApp',
        path: __uri('./orderPre.js')
      },
      'order': {
        name: 'orderApp',
        path: __uri('./order.js')
      },
      'pay': {
        name: 'payApp',
        path: __uri('./pay.js')
      }, 
      'verify': {
        name: 'verifyApp',
        path: __uri('./verify.js')
      },
      'user': {
        name: 'userHome',
        path: __uri('./userHome.js')
      },
      'voucher': {
        name: 'voucher',
        path: __uri('./voucher.js')
      },
      'myOrder': {
        name: 'userOrder',
        path: __uri('./userOrder.js')
      },
      'myOrderDetail/:flyOrderId/:gdsOrderId/:gdsId': {
        name: 'userOrderDetail',
        path: __uri('./userOrderDetail.js')
      },
      'userPassengers': {
        name: 'userPassengers',
        path: __uri('./userPassengers.js')
      },
      'userAddress': {
        name: 'userAddress',
        path: __uri('./userAddress.js')
      },
      'userBill': {
        name: 'userBill',
        path: __uri('./userBill.js')
      },
      'account': {
        name: 'accountApp',
        path: __uri('./account.js')
      },
      'demand': {
        name: 'demandApp',
        path: __uri('./demandApp.js')
      },
      'invoice': {
        name: 'invoiceApp',
        path: __uri('./invoiceApp.js')
      },
      'modifyOrder': {
        name: 'modifyOrderApp',
        path: __uri('./modifyOrderApp.js')
      },
      'invoiceInfo': {
        name: 'invoiceInfo',
        path: __uri('./invoiceInfo.js')
      }
    }, {
      'namespace': 'fstar'
    });
  }

  util.PLATFORM = {
    BROWSER: 1,
    WEIXIN: 2,
    HBGJ: 3,
    GTGJ: 4,
    CURRENT: 1,
    CURRENT_STR: '普通浏览器'
  };

  /*
   * 这样写的原因，参考：https://www.zybuluo.com/liuda/note/121888
   */
  var appName = util.cookie.getItem('appName');
  if(appName == 'hbgj'){
    util.PLATFORM.CURRENT = util.PLATFORM.HBGJ;
    util.PLATFORM.CURRENT_STR = '航班管家';
  } else if (appName == 'gtgj'){
    util.PLATFORM.CURRENT = util.PLATFORM.GTGJ;
    util.PLATFORM.CURRENT_STR = '高铁管家';
  } else if (win.location.href.indexOf('from=hbgj') >= 0) {
    util.PLATFORM.CURRENT = util.PLATFORM.HBGJ;
    util.PLATFORM.CURRENT_STR = '航班管家';
  } else if (win.location.href.indexOf('from=gtgj') >= 0) {
    util.PLATFORM.CURRENT = util.PLATFORM.GTGJ;
    util.PLATFORM.CURRENT_STR = '高铁管家';
  } else if (win.navigator.userAgent.toLowerCase().indexOf('micromessenger') >= 0) {
    util.PLATFORM.CURRENT = util.PLATFORM.WEIXIN;
    util.PLATFORM.CURRENT_STR = '微信';
  } else{
    // 暂时先都航班管家
    // util.PLATFORM.CURRENT = util.PLATFORM.HBGJ;
    // util.PLATFORM.CURRENT_STR = '航班管家';
  }

  // alert(win.location.href);

  /* 上次页面访问的城市 */
  try {
    var lastCity = JSON.parse(util.cookie.getItem('lastCity'));
    if (lastCity && lastCity.name && lastCity.cityid) {
      util.COMMON_PARAMS.comm_cityName = lastCity.name;
      util.NCOMMON_PARAMS.city = lastCity.name;
      util.NCOMMON_PARAMS.cityid = lastCity.cityid;
    } else {
      util.COMMON_PARAMS.comm_cityName = '北京';
      util.NCOMMON_PARAMS.city = '北京';
      util.NCOMMON_PARAMS.cityid = 1;
    }
  }catch(e){
    util.COMMON_PARAMS.comm_cityName = '北京';
    util.NCOMMON_PARAMS.city = '北京';
    util.NCOMMON_PARAMS.cityid = 1;
  }

  if (util.PLATFORM.CURRENT == util.PLATFORM.HBGJ) {
    util.NCOMMON_PARAMS.from = 'hbgj';
  } else if (util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) {
    util.NCOMMON_PARAMS.from = 'gtgj';
  } else if (util.PLATFORM.CURRENT == util.PLATFORM.WEIXIN) {
    util.NCOMMON_PARAMS.from = 'weixin';
  } else if (util.PLATFORM.CURRENT == util.PLATFORM.BROWSER) {
    util.NCOMMON_PARAMS.from = 'browser';
  }

  util.COMMON_PARAMS.comm_from = util.PLATFORM.CURRENT;
  util.COMMON_PARAMS.comm_product = 'common';

  /* 添加 comm_entry 参数 */
  util.COMMON_PARAMS.comm_entry = 'xcfw';
  if (win.location.href.indexOf('jdxq') != -1) {
    util.COMMON_PARAMS.comm_entry = 'jdxq';

  } else if(win.location.href.indexOf('jdddxq') != -1) {
    util.COMMON_PARAMS.comm_entry = 'jdddxq';
    
  } else if(win.location.href.indexOf('gtpxq') != -1) {
    util.COMMON_PARAMS.comm_entry = 'gtpxq';
  } else if(win.location.href.indexOf('sssy') != -1) {
    util.COMMON_PARAMS.comm_entry = 'sssy';
  }

  switch(util.PLATFORM.CURRENT) {
    case util.PLATFORM.BROWSER:
      run();
    break;
    case util.PLATFORM.WEIXIN:
      m.loadScript('https://res.wx.qq.com/open/js/jweixin-1.0.0.js', function() {
        run();
      });
    break;
    case util.PLATFORM.HBGJ:
    case util.PLATFORM.GTGJ:
      m.loadScript(__uri('lib/native-api.js'), function() {
        // util.speedUpNativeAPI();
        // alert('加载native-api.js完成');
        _nativeAPI.invoke('getDeviceInfo', null, function(err, result) {
          // alert('调用getDeviceInfo完成---'+JSON.stringify(result));
          try {
            util.COMMON_PARAMS.comm_imei = result.imei;
          } catch(e) {
            util.COMMON_PARAMS.comm_imei = 'unknown';
          }
          run();
        });
      });
    break;
  }

})(window, document);