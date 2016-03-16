fstar.userOrder = (function() {

  var userOrder = {

    isInitialized: false,

    viewModel: {
      orders: m.prop([]),

      isFirstLoading: m.prop(false),
      noData: m.prop(false),
      isFirstLoadError: m.prop(false),
      currentPage: m.prop(0),
      isLoadingMore: m.prop(false),
      isLoadingMoreError: m.prop(false),
      isLoadingMoreNo: m.prop(false),
      isLoading: m.prop(false),

      loadFirstPage: function() {
        var self = this;
        window.scrollTo(0, 0);
        util.showLoading();
        self.currentPage(0);
        self.isFirstLoading(true);
        if(self.isLoading()){ util.log('正在请求。。。'); return;}
        self.isLoading(true);
        var loadTimer = setTimeout(function(){
          self.isLoading(false);
          util.hideLoading();
        },3000)

        self.loadData().then(function(result) {
          clearTimeout(loadTimer);
          self.isLoading(false);
          self.isFirstLoading(false);
          var orders = [];
          if (result.code == 1) {
            var data = result.data;
            orders = data.data || [];
            var total = orders.length;
            self.isFirstLoadError(false);
            if ( total >= util.PS ) {
              self.isLoadingMoreNo(false);
            } else {
              self.isLoadingMoreNo(true);
            }
            self.orders(orders);
          } else {
            self.orders([]);
            self.isLoadingMoreNo(true);
            self.isFirstLoadError(true);
          }

          if(orders.length == 0){
            self.noData(true);
            // util.scrollEnd(function() {}, true);
          } else {
            self.noData(false);
          }

          util.hideLoading();
          util.redraw();
        });
      },

      loadMorePage: function() {
        var self = this;
        self.isLoadingMore(true);
        self.loadData().then(function(result) {
          self.isLoadingMore(false);
         
          if (result.code == 1) {
            var data = result.data;
            var orders = data.data || [];
            var total = orders.length;
            self.isLoadingMoreError(false);
            if ( total >= util.PS ) {
              self.isLoadingMoreNo(false);
            } else {
              self.isLoadingMoreNo(true);
            }
            var oldordersList = self.orders();
            Array.prototype.push.apply(oldordersList, orders);
            self.orders(oldordersList);
          } else {
            self.isLoadingMoreNo(true);
            self.isLoadingMoreError(true);
          }

          util.redraw();
        });
      },

      loadData: function(result) {
        var self = this;
        var deferred = m.deferred();

        var dataReq = {};
        var listData = {
          "pageIndex":''+self.currentPage(),
          "count": ''+util.PS
        }
        
        dataReq.handler="list";
        dataReq.header=JSON.stringify(util.header);
        dataReq.data=JSON.stringify(listData);
        util.log(dataReq);
        m.request({
          method: 'get',
          // url: window.apiRootPath + '/hotel/order?handler=create'+'&header='+header+'&data='+JSON.stringify(data)',
          url: util.INTERFACE_ADDORDERDATA,
          data: dataReq,
          background: true
        }).then(function(result) {

          util.log(result);
          if (result && (result.code === 100) ) {
            deferred.resolve({
              code: 1,
              data: result
            });
          } else {
            util.alert({content:result.msg});
            deferred.resolve({
              code: -1
            });
          }
        }, function() {
          util.alert({
            content: '网络不给力，请稍后再试试吧',
            ok: '知道了'
          });
          deferred.resolve({
            code: -1
          });
          util.hideLoading();
        });
        
        return deferred.promise;
      },

      goToDetail: function(flyorderid,gdsorderid,gdsid) {
        util.showLoading();
        m.route(['myOrderDetail', flyorderid, gdsorderid ||'-10001', gdsid].join('/'));
      },

      autoLogin: function(){
        util.userCenter._doLogin().then(function(isLogin){
          if(isLogin){
            m.route('myOrder',{},true);
          } else {
            util.alert({
              title:'用户登录失败',
              content:'请退出重新登录'
            });
          }
        });
      },

      onunload: function() {
        // util.log('userOrder unload');
        this.orders([]);
      }
    },

    init: function() {
      // util.log('userOrder init');
      this.isInitialized = true;
    }
  };



  userOrder.controller = function() {
    if (!userOrder.isInitialized) {
      userOrder.init();
    }
    util.updateTitle('我的订单');
    var vm = userOrder.viewModel;
    vm.isFirstLoading(true);
    util.userCenter._checkLogin().then(function(isLogin) {
      if(isLogin){
        vm.loadFirstPage();
        util.lazyLoad(true);
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
      } else {
        vm.autoLogin();
      }
    });
  
    document.querySelectorAll('body')[0].style.backgroundColor = '';
    return userOrder.viewModel;
  };

  userOrder.view = function(ctrl) {
    return m('.userOrder-w', [
      // userOrder.userView(ctrl),
      userOrder.mainView(ctrl),
      userOrder.loadMoreView(ctrl),
    ]);
  };

  userOrder.userView = function(ctrl) {
    var phone = util.HUOLIUSER_INFO && util.HUOLIUSER_INFO.phone;
    return m('.userOrder-user', [
      m('.common-icon-user'),
      m('span.phone', util.secretNumber(phone)),
      // m('span.more', {onclick: ctrl.goToVoucher.bind(ctrl)}, '代金券流水'),
      // m('.common-icon-more-right')
    ]);
  };

  userOrder.mainView = function(ctrl) {
    if (ctrl.isFirstLoading()) {
      return null;
    }
    if (ctrl.isFirstLoadError()) {
      return userOrder.emptyListView(ctrl);
    }
    if (ctrl.orders().length == 0) {
      document.body.style.overflow = 'hidden';
      return userOrder.emptyListView(ctrl);
    }
    document.body.style.overflow = 'auto';

    return m('ul.userOrder-list', ctrl.orders().map(function(order, index) {
      return m('li', {
          onclick: ctrl.goToDetail.bind(ctrl, order.flyorderid,order.gdsorderid,order.gdsid),
          className: 'userOrder-item ' + 'userOrder-item' + order.matchStatus
        }, [
          m('.userOrder-li-top', [
            m('.userOrder-hotel-icon.common_icon_hotel'),
            m('.userOrder-hotel', order.hotelname),
            m('.userOrder-price', [
              '￥',
              m('span.numFont', order.totalprice)
            ])
          ]),
          m('.userOrder-li-main', [
            m('.userOrder-li-mleft', [
              m('.userOrder-hotel-info', [
                order.roomtypename, 
                order.roomcount + '间',].join('·')),
              m('.userOrder-in-out', [
                m('span.numFont',util.dateFormatFmt(new Date(order.arrivedate), 'MM月dd日') ),
                '-',
                m('span.numFont',util.dateFormatFmt(new Date(order.leavedate), 'MM月dd日'))
              ])
            ]),
            m('.userOrder-li-mright', [
              m('.userOrder-status', order.gdsdesc)
            ]),
          ]),
          // order.unreadMsgCount > 0 ? m('.userOrder-new-msg', order.unreadMsgCount) : null
          // order.hasUnreadMsg ? m('.userOrder-new-msg') : null
      ]);
    }));
  };

  userOrder.emptyListView = function(ctrl) {
    return m('.userOrder-empty', [
      m('.userOrder-empty-img'),
      m('.userOrder-empty-txt', '您还没有酒店订单哦~')
    ]);
  };

  userOrder.loadMoreView = function(ctrl) {
    if (ctrl.isFirstLoading() || ctrl.noData() || ctrl.isFirstLoadError() ) {
      return null;
    }
    if (ctrl.isLoadingMoreNo()) {
      return m('.common-more', [
        '没有更多订单了'
      ]);
    } else if (ctrl.isLoadingMoreError()){
      return m('.common-more', [
        'error'
      ]);
    } else {
      return m('.common-more', [
        m('img', {className: 'loading', src: __uri('../images/loading.gif')}),
        '加载中...'
      ]);
    }
  };

  return userOrder;

})();