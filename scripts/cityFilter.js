fstar.cityFilter = (function() {

  var cityFilter = {
    isInitialized: false,

    viewModel: {
      city: m.prop(''),
      cityid: m.prop(''),
      cityLoc: m.prop(false),
      hotCity: m.prop([]),
      otherCity: m.prop([]),
      letters: m.prop([]),
      distance: m.prop([]),

      typingSearchKey: m.prop(''),
      searchResult: m.prop(false),
      showKeyWordSearch: m.prop(false),
      searchData: m.prop([]),

      historyRecord: m.prop([]),
      showHistoryRecord: m.prop(false),

      setHistoryKeyWord: function(record){
        var self = this;
        var recordsArr = self.getHistoryKeyWord();
        
        for(var i=0,len=recordsArr.length; i<len; i++){
          var lastestRecord = recordsArr[i];
          if(!lastestRecord){ return;}
          if( (record.name == lastestRecord.name) && (record.cityid == lastestRecord.cityid)){
            recordsArr.splice(i,1);
            len--;
          }
        }
        recordsArr.unshift(record);
        util.storage.setItem('fstar_historycity', JSON.stringify(recordsArr.slice(0,3)));
      },
      getHistoryKeyWord: function(){
        var self = this;
        var keyword = util.storage.getItem('fstar_historycity'),keywordArr=[];
        if(keyword){
          var arr = JSON.parse(keyword);
          for(var i=0,len=arr.length; i<len; i++){
            if(arr[i].name && arr[i].cityid){
              keywordArr.push(arr[i]);
            }
          }
        }
        return keywordArr;
      },


      // config: function(opt) {
      //   var self = this;
      //   var deferred = m.deferred();
      //   self.deferred = deferred;
      //   self.city(opt.city);
      //   if(util.hasCurPos){
      //     self.cityLoc(opt.cityLoc || false);
      //   } else {
      //     self.cityLoc(false);
      //   }
        
      //   return deferred.promise;
      // },

      selectCity: function(city, cityid) {
        var self = this;
        // if (this.deferred) {
        //   this.deferred.resolve({city:city,cityLoc:false,cityid:cityid});
        // }
        self.setHistoryKeyWord({
          name: city,
          cityid: cityid
        });
        util.cookie.setItem("lastCity", JSON.stringify({
          name: city,
          cityid: cityid
        }));
        util.cookie.removeItem("fstar_cityLoc");
        history.back();
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
          function hideLoad(){
            if(document.querySelector('#hot')){
              util.hideLoading();
            } else{
              setTimeout(function(){
                hideLoad();
              },200);
            }
          }
          hideLoad();

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
        // 微信ios 滚动超出一屏会出现黑屏
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
            // self.setHistoryKeyWord({
            //   name: self.city(),
            //   cityid: self.cityid()
            // });
            history.back();
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

      // 检索城市
      setShowKeyWordSearch: function(){
        var self = this;
        self.showKeyWordSearch(true);
      },

      searchInputInput: function(e) {
        var self = this;
        var value;
        if( e && e.target ){
          // value = e.target.value.trim();
          value = e.target.value;
        } else {
          // value = e.value.trim();
          value = e.value;
        }
        
        self.typingSearchKey(value);
        if (!value) {
          return;
        }
        self.getSearchTip(value);
      },

      // searchInputKeyup: function(e) {
      //   var value = e.target.value.trim();
      //   if (e.keyCode == 13) {
      //     this.selectKeyword({
      //       keyword: value,
      //       type: 'q'
      //     });
      //   }
      // },
      // searchInputKeyup1: function(e) {
      //   var self = this;
      //   var value = self.typingSearchKey();

      //   self.selectKeyword({
      //     keyword: value,
      //     type: 'q'
      //   });
      // },

      getSearchTip: function(value) {
        var self = this;
        var dataReq = {
          st: 10,
          q: value,
          from: util.NCOMMON_PARAMS.from,
          uid: util.NCOMMON_PARAMS.uid
        };
        // util.extendCommon(dataReq);

        // http://43.241.208.207:9900/st=4&city=%E5%8C%97%E4%BA%AC&q=%E5%B8%8C&ps=10
        m.request({
          url: util.INTERFACE_GETHOTELMENUDATA,
          method: 'GET',
          data: dataReq
        }).then(function(result) {
          util.log(result);
          if (result.data) {
            self.searchResult(result.data);
          } else {
            self.searchResult([]);
          }
          util.redraw();
        });
      },

      cancelSearch: function(){
        var self = this;
        self.typingSearchKey('');
        self.showKeyWordSearch(false);
        self.searchResult(false);
      },

      onunload: function(){
        var self = this;
        self.distance([]);
        self.showKeyWordSearch(false);
        self.searchResult(false);
      }
    },
    controller: function() {
      util.updateTitle('选择城市');
      var vm = cityFilter.viewModel;
      if (vm.otherCity().length == 0) {
        vm.loadCity();
      } else {
        util.hideLoading();
      }

      var cityLoc = util.cookie.getItem("fstar_cityLoc");
      if(cityLoc && cityLoc!=="0"){
        cityLoc = JSON.parse(cityLoc);
        vm.cityLoc(cityLoc || false);
      } else {
        vm.cityLoc(false);
      }

      vm.cityid(util.NCOMMON_PARAMS.cityid);
      vm.city(util.NCOMMON_PARAMS.city);

      var historycityArr = vm.getHistoryKeyWord();
      if(!historycityArr || historycityArr.length==0){
        vm.showHistoryRecord(false);
        vm.historyRecord([]);
      } else {
        vm.showHistoryRecord(true);
        vm.historyRecord(historycityArr);
      }

      document.body.style.overflow = 'auto';
      return cityFilter.viewModel;
    },
    view: function(ctrl) {
      if(ctrl.showKeyWordSearch()){
        return cityFilter.searchKeyWordView(ctrl);
      } else {
        return cityFilter.searchView(ctrl);
      }
    },
    searchView: function(ctrl){
      if (ctrl.hotCity().length == 0) {
        return m('.cityFilter-w');
      }
      var exist = ctrl.cityLoc()? true: false;
      return m('.cityFilter-w', [
        m('.cityFilter-bar', [
          m('.cityFilter-input', {
            onclick: ctrl.setShowKeyWordSearch.bind(ctrl)
          },[
            m('.common-icon-search-little'),
            m('.common-icon-search-txt',[
              ctrl.typingSearchKey()?
                m('.common-color-default',ctrl.typingSearchKey()):
                '请输入城市名称'
            ])
          ]),
        ]),
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
              className: exist?'selected':''
            }, '我的位置'),
            m('.cityFilter-city', {
              className: exist?'':'selected', 
              onclick: ctrl.selectCity.bind(ctrl, ctrl.city(), ctrl.cityid())
            }, ctrl.city())
          ])
        ]),
        
        ctrl.showHistoryRecord()?
        m('.cityFilter-hot', [
          m('.cityFilter-head', '历史选择'),
          m('.common-border'),
          m('.cityFilter-citys.clearfix', ctrl.historyRecord().map(function(city) {
            return m('.cityFilter-city', {className: (!exist && ctrl.city() == city.name) ? 'selected' : '', onclick: ctrl.selectCity.bind(ctrl, city.name, city.cityid)}, city.name)
          }))
        ]):'',
        m('.cityFilter-hot',{
          id: 'hot'
        }, [
          m('.cityFilter-head', '热门城市'),
          m('.common-border'),
          m('.cityFilter-citys.clearfix', ctrl.hotCity().map(function(city) {
            return m('.cityFilter-city', {className: (!exist && ctrl.city() == city.name) ? 'selected' : '', onclick: ctrl.selectCity.bind(ctrl, city.name, city.id)}, city.name)
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
                      m('.cityFilter-city', {className: (!exist && ctrl.city() == city.name) ? 'selected' : '', onclick: ctrl.selectCity.bind(ctrl, city.name, city.id)}, city.name),
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
    },
    searchKeyWordView: function(ctrl){
      var reg=new RegExp(ctrl.typingSearchKey(),"gi");
      return m('.searchApp-w', [
        m('.searchApp-bar.searchApp-bar1', [
          m('.searchApp-input.searchApp-input1', [
            m('.common-icon-search-little',{
              // onclick: ctrl.searchInputKeyup1.bind(ctrl)
            }),
            m('.searchApp-form', [
              m('form', {
                onsubmit: function() {
                  return false;
                },
                action:""
              }, [
                m('input.input', {
                  config: function(el, isInit, context) {
                    if(!isInit){
                      ctrl.searchInputInput.bind(ctrl)(el);
                      el.focus();
                    }
                  },
                  type: 'search',
                  autocomplete: 'off',
                  value: ctrl.typingSearchKey(),
                  oninput: ctrl.searchInputInput.bind(ctrl),
                  // onkeyup: ctrl.searchInputKeyup.bind(ctrl),
                  placeholder: '请输入城市名称'
                })
              ]),
            ])
          ]),
          m('.searchApp-cancel', {onclick: ctrl.cancelSearch.bind(ctrl)}, '取消')
        ]),
        m('.searchApp-result', [
          ctrl.searchResult()?
            ctrl.searchResult().length <=0?
            m('.searchApp-result-item','无匹配结果')
            :ctrl.searchResult().map(function(city) {
              return [
                m('.searchApp-result-item', {
                  honclick: ctrl.selectCity.bind(ctrl, city.name,city.oid)
                }, [
                  m.trust(city.name.replace(reg,'<i>'+'$&'+'</i>'))
                ])
              ];
            }):'',
        ])
      ]);
    }
  };

  return cityFilter;

})();