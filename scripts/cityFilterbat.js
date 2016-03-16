fstar.cityFilter = (function() {

  var cityFilter = {
    isInitialized: false,

    viewModel: {
      selectedCity: m.prop(''),
      cityid: m.prop(''),
      cityLoc: m.prop(false),
      hotCity: m.prop([]),
      otherCity: m.prop([]),
      letters: m.prop([]),
      distance: m.prop([]),


      config: function(opt) {
        var self = this;
        var deferred = m.deferred();
        self.deferred = deferred;
        self.selectedCity(opt.city);
        if(util.hasCurPos){
          self.cityLoc(opt.cityLoc || false);
        } else {
          self.cityLoc(false);
        }
        
        return deferred.promise;
      },

      selectCity: function(city, cityid) {
        var self = this;
        if (this.deferred) {
          this.deferred.resolve({city:city,cityLoc:false,cityid:cityid});
        }
      },

      loadCity: function() {
        var self = this;

        m.request({
          // url: util.INTERFACE_ALLCITY,
          url: util.INTERFACE_GETHOTELMENUDATA,
          method: 'GET',
          data: {
            st:6,
            menu:6,
            from: util.NCOMMON_PARAMS.from,
            uid: util.NCOMMON_PARAMS.uid
          },
          background: true
        }).then(function(result) {
          util.log(result);
          self.hotCity(result.data.shift().data ||[]);
          var cityLetter = {};
          var otherCityList = result.data;
          if(otherCityList){
            for(var i=0,len = otherCityList.length; i<len; i++){
              var city = otherCityList[i];
              cityLetter[city.name]=city.data;
            }
          }
          // util.log(JSON.stringify(cityLetter));
          self.otherCity(cityLetter);
          self.letters( Object.keys(cityLetter) );
          // util.log(self.letters());
          util.hideLoading();
          util.redraw();

        }, function() {
          util.alert({
            content: '网络不给力，请稍后再试试吧',
            ok: '知道了'
          });
          util.hideLoading();
        });
      },

      scrollLetter: function(index){
        function getOffsetTop (el, p) {
          var _t = el.offsetTop;
          while (el = el.offsetParent) {
            if (el == p) break;
            _t += el.offsetTop;
          }
          return _t;
        }
        var self = this;
        if(self.distance().length <=0){
          self.distance().push(0);
          var letterDistance = document.querySelectorAll('.cityFilter-city-box');
          for(var i=0,len=letterDistance.length; i<len; i++){
            self.distance().push( getOffsetTop(letterDistance[i], document.querySelector('body')) );
          }
        }
        window.scrollTo(0, self.distance()[index]);
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
            if (!result.errDesc) {
              try {
                util.currentPosition = result;

                var lat = util.currentPosition.latitude;
                var lng = util.currentPosition.longitude;

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

        self.cityLoc({
          name: util.currentPosition.address,
          lat:util.currentPosition.latitude,
          lon:util.currentPosition.longitude
        });
        util.hasCurPos = true;
        self.city('北京');
        self.cityid(1);
        
        util.cookie.setItem("lastCity", JSON.stringify({
          name: self.city(),
          cityid: self.cityid()
        }));
        util.COMMON_PARAMS.comm_cityName = self.city();
        util.NCOMMON_PARAMS.city = self.city();
        util.NCOMMON_PARAMS.cityid = self.cityid();

        util.cookie.setItem("fstar_cityLoc", JSON.stringify(self.cityLoc()));

        // self.selectCity();

        // var dataReq = {
        //   lat: util.currentPosition.latitude,
        //   lng: util.currentPosition.longitude
        // };

        // util.extendProp(dataReq, util.COMMON_PARAMS);
        
        // m.request({
        //   method: 'GET',
        //   url: util.INTERFACE_GETADDRESSBYCOOR,
        //   data: {param: JSON.stringify(dataReq)},
        //   background: true
        // }).then(function(data) {
        //   if (data && data.code == 100 ) {
        //     self.city(data.cityName);
        //     self.cityLoc(data.address);
        //     util.hasCurPos = true;
        //     util.cookie.setItem("lastCity", JSON.stringify({
        //       name: self.city()
        //     }));

        //     self.selectCity(data.cityName);
        //   } else if(data && data.code == 1001) {
        //     util.alert({title:'不提供当前城市的预订服务',content:'目前只支持部分省会和旅游城市，以后会逐步增加'});
        //     return;
        //   } else {
        //     util.alert({
        //       title:'获取位置失败',
        //       content:'请在系统设置中打开“定位服务”，并允许“'+currentPlatName+'”获取您的位置'
        //     });
        //     return;
        //   }

        //   util.redraw();
        // }, function() {
        //   util.alert({
        //     title: '未连接到互联网',
        //     content: '请检查网络是否通畅'
        //   });
        //   util.hideLoading();
        // });
      },

      onunload: function(){
        var self = this;
        self.distance([]);
      }
    },
    controller: function() {
      util.updateTitle('选择城市');

      if (cityFilter.viewModel.otherCity().length == 0) {
        cityFilter.viewModel.loadCity();
      } else {
        util.hideLoading();
      }

      var cityLoc = util.cookie.getItem("fstar_cityLoc");
      if(cityLoc){
        cityLoc = JSON.parse(cityLoc);
        cityFilter.viewModel.cityLoc(cityLoc || false);
      } else {
        cityFilter.viewModel.cityLoc(false);
      }

      document.body.style.overflow = 'auto';
      return cityFilter.viewModel;
    },
    view: function(ctrl) {
      if (ctrl.hotCity().length == 0) {
        return m('.cityFilter-w');
      }
      return m('.cityFilter-w', [
        m('.cityFilter-letters-box',[
          m('.cityFilter-letters',{
            style: 'margin-top:-'+ 0.28*(ctrl.letters().length/2+1) +'rem'
          },[
            m('.cityFilter-letter#cityFilter-letter-hot',{
              onclick: ctrl.scrollLetter.bind(ctrl,0)
            },'热门'),
            ctrl.letters().map(function(letter, index){
              return m('.cityFilter-letter',{
                onclick: ctrl.scrollLetter.bind(ctrl, index+1)
              },letter);
            }),
            m('.cityFilter-letter','#')
          ])
        ]),
        m('.cityFilter-hot',{
          id: 'current'
        }, [
          m('.cityFilter-head', '当前'),
          m('.common-border'),
          m('.cityFilter-citys.clearfix', [
            m('.cityFilter-city', {
              onclick: ctrl.getCoorByAPI.bind(ctrl),
              className: ctrl.cityLoc()?'selected':''
            }, '我的位置'),
            m('.cityFilter-city', {
              className: 'selected', 
              onclick: ctrl.selectCity.bind(ctrl, ctrl.selectedCity())
            }, ctrl.selectedCity())
          ])
        ]),
        m('.cityFilter-hot',{
          id: 'hot'
        }, [
          m('.cityFilter-head', '热门城市'),
          m('.common-border'),
          m('.cityFilter-citys.clearfix', ctrl.hotCity().map(function(city) {
            return m('.cityFilter-city', {className: ctrl.selectedCity() == city.name ? 'selected' : '', onclick: ctrl.selectCity.bind(ctrl, city.name, city.id)}, city.name)
          }))
        ]),

        m('.cityFilter-other',[ 
          // m('.cityFilter-head', '所有城市'),
          m('.common-border'),
          m('.cityFilter-citys', (function(ctrl){
              var otherCity = ctrl.otherCity();
              var result = [];
              for (var letter in otherCity ){
                if( otherCity.hasOwnProperty(letter) ){
                  var citys = otherCity[letter];
                  result.push( m('.cityFilter-city-box',[
                    m('.cityFilter-city-letter', letter),
                    m('.common-border')
                  ]) );

                  citys.map(function(city, index){
                    result.push(m('.cityFilter-city-row', [
                      m('.cityFilter-city', {className: ctrl.selectedCity() == city.name ? 'selected' : '', onclick: ctrl.selectCity.bind(ctrl, city.name, city.id)}, city.name),
                      m('.common-border')
                    ]) );
                  });
                }
              }
              return result;
            })(ctrl)
          )
        ])
      ]);
    }
  };


  return cityFilter;

})();