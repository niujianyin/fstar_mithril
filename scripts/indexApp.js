fstar.indexApp = (function() {

  var indexApp = {

    isInitialized: false,

    viewModel: {
      city: m.prop(''),
      cityid: m.prop(''),
      cityLoc: m.prop(false),
      checkIn: m.prop(''),
      checkOut: m.prop(''),
      priceStar: m.prop(''),
      starLevel: m.prop(['不限']),
      priceRange: m.prop('不限'),

      keyword: m.prop(''),
      type: m.prop('q'),

      sid: m.prop(''),
      sids: m.prop(''),
      lat: m.prop(''),
      lon: m.prop(''),
      typeid: m.prop(''),

      unreadMessageCount: m.prop(0),
      checkTime: function(){
        var self = this;
        util.reloadByTimeLocal(self.checkIn());
        if(util.isReload){
          self.checkIn( new Date() );
          var ct = new Date( self.checkOut() ).getTime();
          var ct1 = new Date( util.nextDate(new Date(), 1) ).getTime();
          if( ct < ct1 ){
            self.checkOut( util.nextDate(new Date(), 1) );
          }
          return true;
        }
      },

      selectCity: function() {
        var self = this;
        self.checkTime();
        util.showLoading();
        var flag = '';
        if (util.PLATFORM.CURRENT == util.PLATFORM.HBGJ || (util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) ) {
          if (util.PLATFORM.CURRENT = util.PLATFORM.HBGJ) {
            flag='?from=hbgj'
          }
          if (util.PLATFORM.CURRENT = util.PLATFORM.GTGJ) {
            flag='?from=gtgj'
          }
        } else {
          // m.loadRoute('cityFilter').then(function(cityFilter) {
          //   cityFilter.viewModel.config({
          //     city: self.city(),
          //     cityLoc: self.cityLoc()
          //   }).then(function(result) {
          //     self.city(result.city);
          //     self.cityid(result.cityid);
          //     self.cityLoc(result.cityLoc);
          //     util.cookie.setItem("lastCity", JSON.stringify({
          //       name: result.city,
          //       cityid: result.cityid
          //     }));
          //     util.COMMON_PARAMS.comm_cityName = result.city;
          //     util.NCOMMON_PARAMS.city = result.city;
          //     util.NCOMMON_PARAMS.cityid = result.cityid;
          //     history.back();
          //   });
          //   m.route('cityFilter');
          // });
        }
        
        util.storage.setItem("fstar_indexdata", JSON.stringify({
          checkIn: self.checkIn(),
          checkOut: self.checkOut(),
          priceStar: self.priceStar(),
          starLevel: self.starLevel(),
          priceRange: self.priceRange(),
          keyword: self.keyword(),
          type: self.type(),
          sid: self.sid(),
          sids: self.sids(),
          lat: self.lat(),
          lon: self.lon(),
          typeid: self.typeid(),
        }));

        util.cookie.setItem("lastDefaultCity", JSON.stringify({
          name: util.NCOMMON_PARAMS.city,
          cityid: util.NCOMMON_PARAMS.cityid
        }));
        // window.apiRootPath +   正式上线用这个
        var url = './cityFilter.html#cityFilter' +flag;
        location.href = url;
      },

      selectDate: function() {
        var self = this;
        self.checkTime();
        util.showLoading();
        m.loadRoute('selectDate').then(function(dateSelector) {
          util.hideLoading();
          dateSelector.viewModel.config({
            beginDate: self.checkIn().getTime(),
            dayCount: util.dateCount(self.checkIn(), self.checkOut())
          }).then(function(newDate) {
            self.checkIn(newDate.beginDate);
            self.checkOut(util.nextDate(newDate.beginDate, newDate.dayCount));
            // 供首页使用
            util.storage.setItem('fstar_hotelDateInfo', JSON.stringify({
              checkIn: self.checkIn(),
              checkOut: self.checkOut(),
              stayDayCount: newDate.dayCount
            }));
            history.back();
          });
          m.route('selectDate');
        });
      },

      searchKeyword: function() {
        var self = this;
        self.checkTime();
        util.showLoading();
        m.loadRoute('searchApp').then(function(searchApp) {
          fstar.searchApp.config({
            keyword: self.keyword(),
            city: self.city(),
            checkIn: self.checkIn(),
            checkOut: self.checkOut()
          }).then(function(data) {
            util.log(data);
            self.keyword(data.keyword || '');
            self.type(data.type || 'q');
            self.sid(data.id);
            self.sids(data.ids);
            self.lat(data.lat);
            self.lon(data.lon);
            self.typeid(data.typeid);
            history.back();
          });
          m.route('searchApp');
        });
      },

      goToList: function() {
        var self = this;
        self.checkTime();
        util.showLoading();
        m.loadRoute('list').then(function(listApp) {
          var vm = listApp.viewModel;
          // 是否使用url的参数 flase 为使用
          listApp.isInitialized = false;
          // 品牌 brand   品牌 设施服务 特色  统一耦合成品牌 多选
          if(util.HOTEL_TYPE_ID[self.typeid()] == 'brand'){
            vm.brands([{
              name:self.keyword(),
              id: self.sid(),
              ids: self.sids(),
              typeid: self.typeid()
            }]);
          } else {
            vm.brands([]);
          }

          // 特色 feature
          if(util.HOTEL_TYPE_ID[self.typeid()] == 'feature'){
            vm.brands().push({
              name: self.keyword(),
              id: self.sid(),
              typeid: self.typeid()
            });
          }

          // 设施 sheshi
          if(util.HOTEL_TYPE_ID[self.typeid()] == 'sheshi'){
            vm.brands().push({
              name: self.keyword(),
              id: self.sid(),
              typeid: self.typeid()
            });
          }

          // 商圈 commercial 商圈 行政区  机场车站  地铁站  统一耦合成商圈 单选
          if(util.HOTEL_TYPE_ID[self.typeid()] == 'commercial'){
            vm.circles([{
              name: self.keyword(),
              id: self.sid(),
              lat: self.lat(),
              lon: self.lon(),
              typeid: self.typeid()
            }]);
          } else if(util.HOTEL_TYPE_ID[self.typeid()] == 'district'){
            // 行政区 district  耦合到商圈  单选 所以不做过多的判断
            vm.circles([{
              name: self.keyword(),
              id: self.sid(),
              lat: self.lat(),
              lon: self.lon(),
              typeid: self.typeid()
            }]);
          } else {
            vm.circles([]);
          }

          // 价格星级
          vm.starLevel(self.starLevel());
          vm.priceRange(self.priceRange());
          
          // 关键字
          if(self.type() == 'q'){
            vm.keyword(self.keyword());
          } else {
            vm.keyword('');
          }
          // 排序  -1 为推荐排序
          // 坐标优先级最高的  首页的我的位置 列表页面的附近
          if( self.cityLoc() && self.cityLoc().lat ){
            vm.cityLoc(self.cityLoc());
            vm.sortType('距离优先');
          } else {
            vm.cityLoc(false);
            vm.sortType('-1');
          }

          // 行政区域 district
          // if(self.type() == 'district'){
          //   vm.district([{
          //     name: self.keyword(),
          //     id: self.sid(),
          //     typeid: self.typeid()
          //   }]);
          // } else {
          //   vm.district([]);
          // }

          // 供首页使用
          util.storage.setItem('fstar_hotelDateInfo', JSON.stringify({
            checkIn: self.checkIn(),
            checkOut: self.checkOut(),
            stayDayCount: util.dateCount(self.checkIn(),self.checkOut())
          }));
          //存储到session
          // util.sessionStorage.setItem('fstar_filterRule', JSON.stringify({
          //   /* 排序类型：（可选）
          //     price：价格
          //     score：综合打分
          //     dis：和（lat，lon）的距离
          //     uscore: 用户评分
          //     默认按score排序
          //   */
          //   stf: 'score',
          //   /*排序类型。
          //     0 升序
          //     1 降序
          //     默认为0
          //   */ 
          //   stt: 0,
          //   /*入住日期（必须）*/ 
          //   startdate: self.checkIn(),
          //   /*离开日期（必须）*/ 
          //   enddate: self.checkOut(),
          //   /*查询关键词（可选）*/ 
          //   q: self.keyword(),
          //   /*最低价,最高价*/ 
          //   priceRange: self.priceRange(),
          //   /*商圈id（可选）*/ 
          //   commercial: null,
          //   /*品牌。支持多个，逗号分隔。*/ 
          //   brand: null,
          //   /*int类型。按比特位表示星级，可以指定多个星级：1:1星级2:2星级4:3星级8:4星级16:5星级 */ 
          //   starLevel: self.starLevel()
          // }));
          
          m.route('list', {
            checkIn: self.checkIn().getTime(),
            checkOut: self.checkOut().getTime(),
            city: self.city()
          });
        });
      },

      cancelKeyword: function() {
        var self = this;
        self.typeid('');
        self.type('q');
        self.keyword('');
      },

      checkNewMessage: function() {
        var self = this;
        m.request({
          method: 'GET',
          url: util.INTERFACE_HASUNREADMSG,
          data: {param: JSON.stringify(util.COMMON_PARAMS)},
          background: true
        }).then(function(result) {
          if (result.code == 100) {
            self.unreadMessageCount(window.parseInt(result.content, 10));
            util.redraw();
          }
        });
      },

      goToDetail: function(hotelId, name) {
        var self = this;
        self.checkTime();
        if (util.PLATFORM.CURRENT == util.PLATFORM.HBGJ || (util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) ) {
          var flag = '';
          if (util.PLATFORM.CURRENT = util.PLATFORM.HBGJ) {
            flag='?from=hbgj'
          }
          if (util.PLATFORM.CURRENT = util.PLATFORM.GTGJ) {
            flag='?from=gtgj'
          }
          // index.html#  正式上线用这个
          var url = window.apiRootPath + '/index.html#' + ['detail', hotelId, self.checkIn().getTime(), self.stayDayCount()].join('/') +flag;
          util.openWindow( url , true);
        } else {
          util.showLoading();
          m.loadRoute('detail').then(function(detailApp) {
            // .isInitialized == false 时取url的入住和离店时间
            detailApp.isInitialized = false;
            m.route(['detail', hotelId, self.checkIn().getTime(), self.stayDayCount()].join('/'));
          });
        }
      },
      goToOrder: function() {
        var self = this;
        self.checkTime();
        if (util.userCenter.isLogin()) {
          if (util.PLATFORM.CURRENT == util.PLATFORM.HBGJ || (util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) ) {
            var flag = '';
            if (util.PLATFORM.CURRENT = util.PLATFORM.HBGJ) {
              flag='?from=hbgj'
            }
            if (util.PLATFORM.CURRENT = util.PLATFORM.GTGJ) {
              flag='?from=gtgj'
            }
            var url = window.apiRootPath + '/index.html#myOrder' +flag;
            util.openWindow( url , true);
          } else {
            util.showLoading();
            m.route('myOrder');
          }
        } else {
          if (util.PLATFORM.CURRENT == util.PLATFORM.GTGJ || util.PLATFORM.CURRENT == util.PLATFORM.HBGJ) {
            util.userCenter._doNativeLogin().then(function(isSuccess) {
              if (isSuccess) {
                var flag = '';
                if (util.PLATFORM.CURRENT = util.PLATFORM.HBGJ) {
                  flag='?from=hbgj'
                }
                if (util.PLATFORM.CURRENT = util.PLATFORM.GTGJ) {
                  flag='?from=gtgj'
                }
                var url = window.apiRootPath + '/index.html#myOrder' +flag;
                // if(location.href.indexOf('test.html') > -1 ){
                //   url = window.apiRootPath + '/hotel1/test.html#myOrder' +flag;
                // }
                util.openWindow( url , true);
              }
            });
          } else {
            util.showLoading();
            m.route('myOrder');
          }
        }
      },

      getCoorByAPI: function(){
        var self = this;
        var currentPlatName = '浏览器';

        // 获取位置信息
        util.currentPosition = null;
        if(util.PLATFORM.CURRENT == util.PLATFORM.HBGJ || util.PLATFORM.CURRENT == util.PLATFORM.GTGJ){
          currentPlatName = '高铁管家';
          if(util.PLATFORM.CURRENT == util.PLATFORM.HBGJ){
            currentPlatName = '航班管家';
          }
          _nativeAPI.invoke('getCurrentPosition', null, function(err, result) {
            // alert(JSON.stringify(result));
            if (!result.errDesc) {
              try {
                util.currentPosition = result;
                // alert(JSON.stringify(result));

                var lat = util.currentPosition.latitude;
                var lng = util.currentPosition.longitude;

                if((""+lat).indexOf('E-')>-1){
                  util.currentPosition = null;
                  util.alert({
                    title: '获取位置失败',
                    content: '未获取到位置，请重新点击获取'
                  });
                  return;
                }

                if(lat && (lat > 90) ){
                  util.currentPosition.latitude = lng;
                  util.currentPosition.longitude = lat;
                }

                self.getAddressByCoor(currentPlatName);
              } catch(e) {
                util.currentPosition = null;
                util.alert({
                  title: '获取位置失败',
                  content: '请在系统设置中打开“定位服务”，并允许“'+currentPlatName+'”获取您的位置'
                });
              }
            } else{
              util.currentPosition = null;
              util.alert({
                title: '获取位置失败',
                content: '请在系统设置中打开“定位服务”，并允许“'+currentPlatName+'”获取您的位置'
              });
            }
          });
        } else {
          util.currentPosition = null;
          util.alert({
            title:'获取位置失败',
            content:'请在系统设置中打开“定位服务”，并允许“'+currentPlatName+'”获取您的位置'
          });
          return;
        }
      },

      getAddressByCoor: function(currentPlatName){
        var self = this;
        if(!util.currentPosition){
          util.alert({
            title:'获取位置失败',
            content:'请在系统设置中打开“定位服务”，并允许“'+currentPlatName+'”获取您的位置'
          });
          return;
        }
        // 用坐标获取城市名和城市id   航班管家的nativeAPI  获取不到城市名  只能获取到坐标
        var dataReq = {
          st:9,
          lat:util.currentPosition.latitude,
          lon:util.currentPosition.longitude,
          from: util.NCOMMON_PARAMS.from,
          uid: util.NCOMMON_PARAMS.uid
        };

        m.request({
          method: 'GET',
          url: util.INTERFACE_GETHOTELMENUDATA,
          data: dataReq
        }).then(function(data) {

          if (data.id && data.name) {
           // 这里需要城市的名称和cityid
            self.cityLoc({
              name: util.currentPosition.address || '我的位置',
              lat:util.currentPosition.latitude,
              lon:util.currentPosition.longitude
            });
            util.hasCurPos = true;
            self.city(data.name);
            self.cityid(data.id);
            
            util.cookie.setItem("lastCity", JSON.stringify({
              name: self.city(),
              cityid: self.cityid()
            }));
            util.COMMON_PARAMS.comm_cityName = self.city();
            util.NCOMMON_PARAMS.city = self.city();
            util.NCOMMON_PARAMS.cityid = self.cityid();

            util.cookie.setItem("fstar_cityLoc", JSON.stringify(self.cityLoc()));
          } else {
            util.alert({
              title:'获取位置失败',
              content:'请在系统设置中打开“定位服务”，并允许“'+currentPlatName+'”获取您的位置'
            });
            return;
          }

          util.redraw();
        }, function() {
          util.alert({
            content: '网络不给力，请稍后再试试吧',
            ok: '知道了'
          });
          util.hideLoading();
        });
      },

      priceFilter: function() {
        var self = this;
        self.checkTime();
        util.actionSheet(util.STAR_TYPES, self.starLevel(),util.SEARCH_PRICE_RANGES, self.priceRange()).then(function(data) {
          if('cancel' == data ){
            return;
          }
          util.log(data);
          self.starLevel(data.level.concat());
          self.priceRange(data.range.concat());

          if(data.level[0] == '不限'){
            if(data.range == '不限' ){
              self.priceStar('');
            } else {
              self.priceStar(data.range);
            }
          } else {
            if(data.range == '不限' ){
              self.priceStar(data.level.join(','));
            } else {
              self.priceStar( data.range+','+data.level.join(',') );
            }
          }
          
          util.redraw();
        });
      },

      cancelPriceStar: function() {
        var self = this;
        self.starLevel(['不限']);
        self.priceRange('不限');
        self.priceStar('');
      },

      reloadTime: function(){
        var self = this;
        var hotelDateInfo = JSON.parse(util.storage.getItem('fstar_hotelDateInfo') || "{}");
        var checkIn = hotelDateInfo.checkIn;
        var checkOut = hotelDateInfo.checkOut;

        util.reloadByTimeLocal(checkIn);
        if(util.isReload){
          self.checkIn( new Date() );
          self.checkOut( util.nextDate(new Date(), 1));
        } else {
          self.checkIn( (checkIn && new Date(checkIn)) || new Date() );
          self.checkOut( (checkOut && new Date(checkOut)) || util.nextDate(new Date(), 1));
        }
      },

      onunload: function(){
        var self = this;
      }

    },


    init: function() {
      this.isInitialized = true;
      var vm = indexApp.viewModel;
      vm.checkIn( new Date());
      vm.checkOut(util.nextDate(new Date(), 1));

      vm.keyword('');
      util.hasCurPos = false;
      util.currentPosition = null;


      // 只在非app中使用  跳转城市所选信息不丢失
      var fstar_indexdata = util.storage.getItem("fstar_indexdata");
      if(fstar_indexdata){
        var data = JSON.parse(fstar_indexdata);
        if(data.checkIn){
          vm.checkIn(new Date(data.checkIn) );
          vm.checkOut(new Date(data.checkOut) );
          vm.priceStar(data.priceStar);
          vm.starLevel(data.starLevel);
          vm.priceRange(data.priceRange);
          vm.keyword(data.keyword);
          vm.type(data.type);
          vm.sid(data.sid);
          vm.sids(data.sids);
          vm.lat(data.lat);
          vm.lon(data.lon);
          vm.typeid(data.typeid);
          util.storage.removeItem("fstar_indexdata");
        }

        var lastDefaultCity = JSON.parse(util.cookie.getItem("lastDefaultCity"));
        if(lastDefaultCity.name==util.NCOMMON_PARAMS.city && lastDefaultCity.cityid==util.NCOMMON_PARAMS.cityid){
    
        } else {
          vm.keyword('');
        }
      }
      util.log('indexApp is initialized');
    }
  };


  indexApp.controller = function() {
    var vm = indexApp.viewModel;
    // 同步日期
    vm.reloadTime();
    
    vm.city(util.NCOMMON_PARAMS.city);
    vm.cityid(util.NCOMMON_PARAMS.cityid);
    var cityLoc = util.cookie.getItem("fstar_cityLoc");
    // var time = new Date();
    // time.setDate(time.getDate()-1); 
    // var cityLoc = util.cookie.setItem("fstar_cityLoc",'',time );
    // alert(util.cookie.getItem("lastCity"));
    // alert(util.cookie.getItem("fstar_cityLoc"));
    if(cityLoc && cityLoc!=="0"){
      cityLoc = JSON.parse(cityLoc);
      vm.cityLoc(cityLoc || false);
    } else {
      vm.cityLoc(false);
    }
    
    
    if (!indexApp.isInitialized) {
      indexApp.init();
    }

    util.updateTitle('伙力特惠五星');
    util.hideLoading();
    vm.unreadMessageCount(0);
    util.userCenter._checkLogin();
    // indexApp.viewModel.checkNewMessage();

    return indexApp.viewModel;
  };

  indexApp.view = function(ctrl) {
    return m('.indexApp', [
      indexApp.searchView(ctrl),
      m('.common-border'),
      indexApp.myBillView(ctrl),
      indexApp.redPacketsView(ctrl),
    ]);
  };

  indexApp.searchView = function(ctrl) {
    return m('.indexApp-search', [
      m('.indexApp-search-item', [
        m('.indexApp-search-label', [
          m('.common-icon-search-city')
        ]),
        m('.indexApp-search-content', [
          m('.indexApp-search-text', {
            honclick: ctrl.selectCity.bind(ctrl)
          },[ 
            ctrl.cityLoc()&&ctrl.cityLoc().name? m('.indexApp-search-loc-text', ctrl.cityLoc().name) : ctrl.city()
          ]),
          m('.common-icon-more-right')
        ]),
        m('.indexApp-search-loc', {
          onclick: ctrl.getCoorByAPI.bind(ctrl)
        },[
          m('span.common-icon-myloc.indexApp-icon-myloc'),
          '我的位置'
        ]),
      ]),

      m('.common-border'),


      m('.indexApp-search-item.indexApp-search-item1', [
        m('.indexApp-search-label.label2', [
          m('.common-icon-search-date')
        ]),
        m('.indexApp-search-content', [
          m('.indexApp-search-date-box', {honclick: ctrl.selectDate.bind(ctrl)}, [
            m('.indexApp-search-date', [
              m('span', [
                util.dateFormatFmt(ctrl.checkIn(), 'MM月dd日')
              ]),
              m('span', util.getCurrentWeek(ctrl.checkIn()) + '入住')
            ]),
            m('.indexApp-search-date', [
              m('span', [
                util.dateFormatFmt(ctrl.checkOut(), 'MM月dd日')
              ]),
              m('span', util.getCurrentWeek(ctrl.checkOut()) + '离店')
            ])
          ]),
          m('.indexApp-search-date-count', '共' + util.dateCount(ctrl.checkIn(), ctrl.checkOut()) + '晚'),
          m('.common-icon-more-right')
        ])
      ]),
      m('.common-border'),

      m('.indexApp-search-item', [
        m('.indexApp-search-label', [
          m('.common-icon-search-search')
        ]),
        m('.indexApp-search-content', [
          m('.indexApp-search-text', {
            className: ctrl.keyword() === '' ? 'default-text' : '', 
            honclick: ctrl.searchKeyword.bind(ctrl)
          }, 
            ctrl.keyword() === '' ? '关键词/位置/品牌/酒店名' : ctrl.keyword()
          ),
          ctrl.keyword() === '' ? m('.common-icon-more-right') : m('.common-icon-input-cancel', {onclick: ctrl.cancelKeyword.bind(ctrl)})
        ])
      ]),
      m('.common-border'),

      m('.indexApp-search-item', [
        m('.indexApp-search-label', [
          m('.common-icon-search-price')
        ]),
        m('.indexApp-search-content', [
          m('.indexApp-search-text', {
            className: ctrl.priceStar() === '' ? 'default-text' : '', 
            honclick: ctrl.priceFilter.bind(ctrl)
          }, 
            ctrl.priceStar() === '' ? '价格/星级' : ctrl.priceStar()
          ),
          ctrl.priceStar() === '' ? m('.common-icon-more-right') : m('.common-icon-input-cancel', {onclick: ctrl.cancelPriceStar.bind(ctrl)})
        ])
      ]),
      m('.common-border'),

      m('.indexApp-search-item', [
        m('.indexApp-search-go', {honclick: ctrl.goToList.bind(ctrl)}, '搜索')
      ]),
    ]);
  };

  indexApp.myBillView = function(ctrl) {
    return m('.indexApp-bill', {honclick: ctrl.goToOrder.bind(ctrl)}, [
      m('.indexApp-bill-label', [
        m('.common-icon-mbill')
      ]),
      m('.indexApp-bill-content', '我的订单'),
      ctrl.unreadMessageCount()>0
      ? m('.indexApp-bill-count.numFont', ctrl.unreadMessageCount() > 99 ? '99' : ctrl.unreadMessageCount())
      : null,
      m('.common-icon-more-right')
    ]);
  };

  indexApp.redPacketsView = function(ctrl) {
    return m('.indexApp-rp', [
      m('span.indexApp-rp-icon.common_icon_packet'),
      m('.indexApp-rp-txt', [
        m('.indexApp-rp-top', '高铁管家红包'),
        m('.indexApp-rp-bottom', '预订酒店可用高铁管家红包，离店后领取返现'),
      ]),
    ]);
  };
  return indexApp;

})();