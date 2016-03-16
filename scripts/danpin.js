fstar.listApp = (function() {

  var listApp = {
    
    isInitialized: false,

    viewModel: {
      hotelList: m.prop([]),

      currentCity: m.prop({}),
      currentDate: m.prop(new Date()),
      stayDayCount: m.prop(1),
      businessCircle: m.prop(false),

      isLoading: m.prop(true),


      loadData: function() {
        util.showLoading();

        var self = this;

        self.hotelList([]);


        var dataReq = {
          cityId: self.currentCity().cityId,
          checkIn: util.formatDate(self.currentDate()),
          checkOut: util.formatDate(util.nextDate(self.currentDate(), self.stayDayCount()))
        };
        
        util.extendProp(dataReq, util.COMMON_PARAMS);
        
        m.request({
          method: 'GET',
          // url: window.apiRootPath + '/rest/hotel/getHotelList',
          url: util.INTERFACE_GETHOTELLISTDANPIN,
          data: {param: JSON.stringify(dataReq)},
          background: true
        }).then(function(data) {
          util.hideLoading();

          if (data && data.code == 100 ) {
            if (data.hotels && data.hotels.length > 0) {
              self.hotelList(data.hotels);
            } else {
              self.hotelList(false);
            }
          } else {
            self.hotelList(false);
          }

          self.isLoading(false);

          util.redraw();
        }, function() {
          util.alert({
            content: '网络不给力，请稍后再试试吧',
            ok: '知道了'
          });
          util.hideLoading();
        });
      },

      goToDetail: function(hotelId, name) {
        util.showLoading();


        m.route(['detail', hotelId, this.currentDate().getTime(), this.stayDayCount(), true].join('/'));
      },

      onunload: function() {
        util.log('listApp unload');
        this.hotelList([]);
        util.lazyLoad(false);
      }
    },

    init: function() {
      this.isInitialized = true;
    }
  };


  


  listApp.controller = function() {

    // 只需初始化一次即可
    if (!listApp.isInitialized) {
      util.log('listApp is initialized');

      listApp.init();
    }
    
    if (!IS_DANPIN_OPEN) {
      window.location.replace(window.apiRootPath + '/#?entry=gtpxq');
    }

    var defaultCity = null;

    if (m.route.param('city')) {
      defaultCity = util.openCity[m.route.param('city')];
    } else {
      defaultCity = util.openCity[util.openCity.defaultCity];
    }

    if (!!!defaultCity) {
      window.location.replace(window.apiRootPath + '/#?entry=gtpxq');
    } else if(!defaultCity.isOpen) {
      window.location.replace(window.apiRootPath + '/#?entry=gtpxq&name=' + defaultCity.name + '&cityId=' + defaultCity.cityId);
    }

    util.updateTitle(defaultCity.name + '五星酒店特卖');

    util.COMMON_PARAMS.comm_cityName = defaultCity.name;
    
    
    var flag = '';
    if (util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) {
      flag = '?from=gtgj';
    } else if (util.PLATFORM.CURRENT == util.PLATFORM.HBGJ) {
      flag = '?from=hbgj';
    }
    

    // util.userCenter.show();
    util._getDeviceInfo().then(function() {
      if (util.DEVICE_INFO && (util.DEVICE_INFO.version == '3.1' || (util.DEVICE_INFO.version == '3.2' && util.OS == 'iOS'))) {
        util.alert({
          title: '请升级高铁管家',
          content: '现在版本不能预订酒店'
        });
      } else {
        util.userCenter._checkLogin().then(function(isLogin) {});
      }
    });

    listApp.viewModel.currentCity(defaultCity);
    listApp.viewModel.currentDate(new Date());
    listApp.viewModel.stayDayCount(1);

    listApp.viewModel.hotelList([]);

    listApp.viewModel.isLoading(true);
    listApp.viewModel.loadData();

    return listApp.viewModel;
  };

  listApp.view = function(ctrl) {
    return [
      listApp.bannerView(ctrl),
      listApp.listView(ctrl),
      ctrl.isLoading() ? '' : listApp.homeView(ctrl)
    ];
  };

  listApp.bannerView = function(ctrl) {
    return m('.listApp-banner', [
      m('img', {src: 'http://7xj7u1.com2.z0.glb.qiniucdn.com/danpinBanner.jpg'})
    ]);
  };

  listApp.listView = function(ctrl) {
    document.body.style.overflow = 'auto';

    
    return m('ol.listApp-list', ctrl.hotelList().map(function(hotel, index) {

      // 只展示2个 tag
      hotel.roomInfos[0].productInfos[0].tagList.splice(2);

      return m('li', [
        m('div', {
          onclick: ctrl.goToDetail.bind(ctrl, hotel.id, hotel.name),
          className: hotel.roomInfos[0].productInfos[0].sellTag ? '' : 'soldout'
        }, [
          m('.listApp-img', {
            style: 'height: ' + (util.SCREEN_WIDTH - 20) / 2 + 'px;'
          }, [
            m('img', {
              src: hotel.imageInfos[0].imageUrl,
            }),
            m('h2', hotel.name)
          ]),
          m('.listApp-txt', [
            m('p', [
              m('span.common-icon-loc'),
              hotel.businessCircleStr
            ]),
            m('.listApp-price', [
              m('.listApp-price1', [
                m('span', '￥'),
                hotel.roomInfos[0].productInfos[0].memberPrice
              ]),
              m('.listApp-price2', [
                m('i', window.parseInt(hotel.roomInfos[0].productInfos[0].memberPrice / hotel.roomInfos[0].productInfos[0].bookPrice * 10) + '折'),
                m('span', '￥' + hotel.roomInfos[0].productInfos[0].bookPrice)
              ])
            ])
          ])
        ])
      ]);

    }));
  };

  listApp.homeView = function(ctrl) {
    return m('.listApp-home', [
      m('a', {href: '/'}, '更多五星特惠酒店')
    ]);
  };


  return listApp;

})();