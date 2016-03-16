;(function(win, doc) {

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
  if (appName == 'gtgj'){
    util.PLATFORM.CURRENT = util.PLATFORM.GTGJ;
    util.PLATFORM.CURRENT_STR = '高铁管家';
  } else if(appName == 'hbgj'){
    util.PLATFORM.CURRENT = util.PLATFORM.HBGJ;
    util.PLATFORM.CURRENT_STR = '航班管家';
  } else if (win.location.href.indexOf('from=gtgj') >= 0) {
    util.PLATFORM.CURRENT = util.PLATFORM.GTGJ;
    util.PLATFORM.CURRENT_STR = '高铁管家';
  } else if (win.location.href.indexOf('from=hbgj') >= 0) {
    util.PLATFORM.CURRENT = util.PLATFORM.HBGJ;
    util.PLATFORM.CURRENT_STR = '航班管家';
  } else if (win.navigator.userAgent.toLowerCase().indexOf('micromessenger') >= 0) {
    util.PLATFORM.CURRENT = util.PLATFORM.WEIXIN;
    util.PLATFORM.CURRENT_STR = '微信';
  }


  /* 上次页面访问的城市 */
  try {
    var lastCity = JSON.parse(util.cookie.getItem('lastCity'));
    if (lastCity && lastCity.name) {
      util.COMMON_PARAMS.comm_cityName = lastCity.name;
      util.LAST_CITY = lastCity;
    } else {
      util.LAST_CITY = {name: '北京'};
      util.COMMON_PARAMS.comm_cityName = '北京';
    }
  }catch(e){
    util.LAST_CITY = {name: '北京'};
    util.COMMON_PARAMS.comm_cityName = '北京';
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

  if(util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) {
    m.loadScript(__uri('lib/native-api.js'), function() {
      // util.speedUpNativeAPI();
      _nativeAPI.invoke('getDeviceInfo', null, function(err, result) {
        try {
          util.COMMON_PARAMS.comm_imei = result.imei;
        } catch(e) {
          util.COMMON_PARAMS.comm_imei = 'unknown';
        }
        run();
      });
    });
  } else {
    util.hideLoading();
    mainTips('请到高铁管家查看订单');
  }

  function mainTips(msg){
    document.getElementById('main').innerHTML='<div id="tipsNoGTGJ">'+msg+'</div>'
  }

  function run(){
    var orderList = (function() {
      var orderList = {
        isInitialized: false,
        viewModel: {
          orders: m.prop([]),
          isLoading: m.prop(true),
          currentPage: m.prop(0),
          isFirstLoading: m.prop(false),
          isLoadingMore: m.prop(false),
          isLoadingMoreNo: m.prop(false),

          reinit: function(){
            var self = this;
            util.userCenter._checkLogin().then(function(isLogin) {
              if (isLogin) {
                self.loadOrders();
              } else {
                util.userCenter._doNativeLoginSimple().then(function(isLogin) {
                  if (isLogin) {
                    self.loadOrders();
                  } else {
                    util.hideLoading();
                    mainTips('请重新认证登录');
                    util.alert({
                      title: '登录失败',
                      content: '请重新认证登录'
                    });
                  }
                });
              }
            });
          },

          loadOrders: function() {
            var self = this;
            util.showLoading();

            var userInfo = util.HUOLIUSER_INFO;
            var deviceInfo = util.DEVICE_INFO;

            var dataReq = {};
            util.extendProp(dataReq, util.COMMON_PARAMS);

            m.request({
              method: 'GET',
              url: util.INTERFACE_GETORDERLIST,
              data: {param: JSON.stringify(dataReq)},
              background: true
            }).then(function(data) {
              self.isLoading(false);
              if (data.code == 100) {
                self.orders(data.orderInfos || []);
                util.hideLoading();
                util.redraw();
              } else {
                util.alert({
                  title: '错误',
                  content: data.content
                })
                util.hideLoading();
              }
            }, function() {
              util.alert({
                title: '未连接到互联网',
                content: '请检查网络是否通畅'
              });
              util.hideLoading();
            });
          },

          goToDetail: function(orderId, gdsid) {
            var self = this;
            // gdsid : "hl_0000"  艺龙： gdsid : "0001"
            
            var url = window.apiRootPath + '/index.html#' + ['myOrderDetail', orderId].join('/') +'?from=gtgj';
            // if(util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) {
            //   util.openWindow( url , true);
            // } else {
              location.href = url;
            // }
          },

          loadFirstPage: function() {
            var self = this;
            util.showLoading();
            self.currentPage(1);
            self.isFirstLoading(true);

            self.loadData().then(function(result) {
              var orderInfos = result.orderInfos || [];
              if (result.code == 100) {
                if (orderInfos.length < 20 ) {
                  self.isLoadingMoreNo(true);
                  util.scrollEnd(function() {}, true);
                } else {
                  self.isLoadingMoreNo(false);
                }
                self.orders(orderInfos);
              } else {
                self.isLoadingMoreNo(true);
                util.scrollEnd(function() {}, true);
              }

              util.hideLoading();
              self.isFirstLoading(false);
              util.redraw();
            });
          },

          loadMorePage: function() {
            var self = this;
            self.isLoadingMore(true);
            self.loadData().then(function(result) {
              var orderInfos = result.orderInfos || [];
              if (result.code == 100) {
                if (orderInfos.length < 20 ) {
                  self.isLoadingMoreNo(true);
                  util.scrollEnd(function() {}, true);
                } else {
                  self.isLoadingMoreNo(false);
                }
                var oldHotelList = self.orders();
                Array.prototype.push.apply(oldHotelList, orderInfos);
                self.orders(oldHotelList);
              } else {
                self.isLoadingMoreNo(true);
                util.scrollEnd(function() {}, true);
              }

              self.isLoadingMore(false);
              util.redraw();
            });
          },

          loadData: function(result) {
            var self = this;
            var deferred = m.deferred();

            var dataReq = {
              "authcode":"0A45E599A9314E2A78757D92C697FCE8",
              "uid":"2310c373f10100001",
              "userid":"411957",
              "source":"AMarket",
              "s":"3",
              "pt":"",
              "platform":"GT-N7100",
              "pid":"607",
              "cver":"4.0",
              "dver":"4.0",
              "imei":"864387022619577",
              "p":"BCHWzhihuiyun,android,4.4.2,gtgj,4.0,H60-L11,0",
              "pageNum": self.currentPage()
            };

            util.extendProp(dataReq, util.COMMON_PARAMS);
            
            m.request({
              method: 'GET',
              url: util.INTERFACE_GETHUOLIORDERLIST,
              data: {param: JSON.stringify(dataReq)},
              background: true
            }).then(function(data) {
              if (data && data.code == 100) {
                deferred.resolve(data);
              } else {
                deferred.resolve(data);
              }
            }, function() {
              deferred.resolve({
                "code":"error"
              });
            });
            return deferred.promise;
          },

          onunload: function() {
            this.orders([]);
          }
        },

        init: function() {
          this.isInitialized = true;
        }
      };

      orderList.controller = function() {
        if (!orderList.isInitialized) {
          orderList.init();
        }
        var vm = orderList.viewModel;
        // util.updateTitle('我的酒店订单');
        // 登录逻辑
        // vm.reinit();
        // vm.loadOrders();
        vm.loadFirstPage();
        util.scrollEnd(function() {
          if (vm.isFirstLoading()) {
            return;
          }
          if (vm.isLoadingMore()) {
            return;
          }
          if (vm.isLoadingMoreNo()) {
            return;
          }
          vm.currentPage(vm.currentPage() + 1);
          vm.loadMorePage();
        }, true);
        
        return orderList.viewModel;
      };

      orderList.view = function(ctrl) {
        if (ctrl.isFirstLoading()) {
          return null;
        }

        return m('.orderList-w', [
          orderList.userView(ctrl),
          orderList.mainView(ctrl),
          orderList.loadMoreView(ctrl)
        ]);
      };

      orderList.userView = function(ctrl) {
        return m('.orderList-user', [
          m('.common-icon-user'),
          m('span.phone', '1520298454')
        ]);
      };

      orderList.mainView = function(ctrl) {
        if (ctrl.orders().length == 0) {
          return orderList.emptyListView(ctrl);
        }
        return m('ul.orderList-list', ctrl.orders().map(function(order, index) {
          return m('li.clearfix', {
              honclick: ctrl.goToDetail.bind(ctrl, order.hotelOrderid, order.gdsid),
              className: 'orderList-item'
            }, [
              m('.common-border.border-top'),
              m('.orderList-li-top', [
                m('.orderList-hotel', order.hotelname),
                m('.orderList-status', order.paystatus )
              ]),
              m('.orderList-li-main', [
                m('.left', [
                  m('.orderList-hotel-info', [
                    order.roomtypename, 
                    order.roomcount + '间',].join('，')),
                  m('.orderList-in-out', ['入住：', util.dateFormatFmt(new Date(order.arrivedate), 'M月d日'), ' 离店：', util.dateFormatFmt(new Date(order.leavedate), 'M月d日')].join(''))
                ]),
                m('.right', [
                  m('.orderList-price', [
                    m('span', '￥' + order.sumprice)
                  ])
                ]),
              ]),
          ]);
        }));
      };

      orderList.emptyListView = function(ctrl) {
        return m('.orderList-empty', [
          m('.orderList-empty-img'),
          m('.orderList-empty-txt', '您还没有酒店订单哦~')
        ]);
      };
      orderList.loadMoreView = function(ctrl) {
        if (ctrl.isFirstLoading() ) {
          return null;
        }
        if (ctrl.isLoadingMoreNo()) {
          return m('.orderList-more', [
            '没有更多订单了'
          ]);
        } else {
          return m('.orderList-more', [
            m('img', {className: 'loading', src: __uri('../images/loading.gif')}),
            '加载中...'
          ]);
        }
      };
      return orderList;
    })();

    m.module(document.getElementById('main'), orderList);
  }

})(window, document);

