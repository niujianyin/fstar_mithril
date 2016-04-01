fstar.searchApp = (function() {

  var searchApp = {

    viewModel: {
      typingSearchKey: m.prop(''),
      searchResult: m.prop(false),
      checkIn: m.prop(''),
      checkOut: m.prop(''),
      currentCity: m.prop(''),
      showKeyWordSearch: m.prop(false),
      showBrand: m.prop(false),
      historyRecord: m.prop([]),
      showHistoryRecord: m.prop(false),
      searchData: m.prop([]),
      cityid: m.prop(false),

      setShowKeyWordSearch: function(){
        var self = this;
        self.showKeyWordSearch(true);
      },
      clearHistory: function(){
        var self = this;
        util.storage.removeItem('fstar_keyword');
        self.showHistoryRecord(false);
        self.historyRecord([]);
      },
      setShowBrand: function(){
        var self = this;
        self.showBrand()?self.showBrand(false):self.showBrand(true);
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

      searchInputKeyup: function(e) {
        var value = e.target.value.trim();
        if (e.keyCode == 13) {
          this.selectKeyword({
            keyword: value,
            type: 'q'
          });
        }
      },
      searchInputKeyup1: function(e) {
        var self = this;
        var value = self.typingSearchKey();

        self.selectKeyword({
          keyword: value,
          type: 'q'
        });
      },

      getSearchTip: function(value) {
        var self = this;
        var dataReq = {
          startdate: util.dateFormatFmt(self.checkIn(), 'yyyyMMdd'), 
          enddate: util.dateFormatFmt(self.checkOut(), 'yyyyMMdd'),
          st: 4,
          city: self.currentCity(),
          q: value,
          ps: 10,
          from: util.NCOMMON_PARAMS.from,
          uid: util.NCOMMON_PARAMS.uid
        };
        util.extendCommon(dataReq);

        // http://43.241.208.207:9900/st=4&city=%E5%8C%97%E4%BA%AC&q=%E5%B8%8C&ps=10
        m.request({
          url: util.INTERFACE_GETHOTELDATA,
          method: 'GET',
          data: dataReq,
          background: true
        }).then(function(result) {
          util.log(result);
          if (result.status === 0) {
            if (result.datas) {
              self.searchResult(result.datas);
            } else {
              self.searchResult([]);
            }
            util.redraw();
          }
        });
      },

      selectKeyword: function(record) {
        var self = this;
        if (self.deferred) {
          self.setHistoryKeyWord({
            keyword:record.keyword,
            type:record.type,
            id: record.id,
            ids: record.ids,
            lat: record.lat,
            lon: record.lon,
            typeid: record.typeid
          });

          if(record.type){
            record.type = util.HOTEL_SEARCH_TYPE[record.type] || 'q';
          } else {
            record.type = 'q';
          }
          self.deferred.resolve({
            keyword:record.keyword,
            type:record.type,
            id: record.id,
            ids: record.ids,
            lat: record.lat,
            lon: record.lon,
            typeid: record.typeid
          });
        }
      },

      setHistoryKeyWord: function(record){
        var self = this;
        var recordsArr = self.getHistoryKeyWord();
        
        for(var i=0,len=recordsArr.length; i<len; i++){
          var lastestRecord = recordsArr[i];
          if(!lastestRecord){ return;}
          if( (record.keyword == lastestRecord.keyword) && (record.type == lastestRecord.type) && (record.id == lastestRecord.id) && (record.typeid == lastestRecord.typeid) && (record.lat == lastestRecord.lat) && (record.lon == lastestRecord.lon)){
            recordsArr.splice(i,1);
            len--;
          }
        }
        recordsArr.unshift(record);
        util.storage.setItem('fstar_keyword', JSON.stringify(recordsArr.slice(0,6)));
        
      },

      getHistoryKeyWord: function(){
        var self = this;
        var keyword = util.storage.getItem('fstar_keyword'),keywordArr=[];
        if(keyword){
          var arr = JSON.parse(keyword);
          for(var i=0,len=arr.length; i<len; i++){
            if(arr[i].keyword){
              keywordArr.push(arr[i]);
            }
          }
        }
        return keywordArr;
      },

      goToDetail: function(hotelId, name) {
        var self = this;
        util.showLoading();
        m.loadRoute('detail').then(function(detailApp) {
          // .isInitialized == false 时取url的入住和离店时间
          detailApp.isInitialized = false;
          m.route(['detail', hotelId, self.checkIn().getTime(), util.dateCount(self.checkIn(), self.checkOut())].join('/'),{},true);
        })
      },

      cancelSearch: function() {
        history.back();
      },

      cancelSearchKey: function(){
        var self = this;
        self.typingSearchKey('');
      },

      loadData: function() {
        var self = this;
        m.request({
          // url: util.INTERFACE_ALLCITY,
          url: util.INTERFACE_GETHOTELMENUDATA,
          method: 'GET',
          data: {
            st:6,
            menu:1,
            cityid: util.NCOMMON_PARAMS.cityid,
            from: util.NCOMMON_PARAMS.from,
            uid: util.NCOMMON_PARAMS.uid
          },
          background: true
        }).then(function(result) {
          self.cityid(util.NCOMMON_PARAMS.cityid);
          util.log(result);
          self.searchData(result.data || []);
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

      onunload: function(){
        var self = this;
        self.showKeyWordSearch(false);
        self.searchResult(false);
      }
    },

    config: function(opt) {
      var vm = searchApp.viewModel;
      vm.typingSearchKey(opt.keyword);
      vm.currentCity(opt.city);
      vm.checkIn(opt.checkIn);
      vm.checkOut(opt.checkOut);

      var deferred = m.deferred();
      vm.deferred = deferred;
      return deferred.promise;
    },

    init: function() {
    }
  };


  searchApp.controller = function() {
    util.updateTitle('搜索酒店');
    // util.hideLoading();
    var vm = searchApp.viewModel;
    var keywordArr = vm.getHistoryKeyWord();
    if(!keywordArr || keywordArr.length==0){
      vm.showHistoryRecord(false);
      vm.historyRecord([]);
    } else {
      vm.showHistoryRecord(true);
      vm.historyRecord(keywordArr);
    }
    if( (vm.searchData().length == 0) || (vm.cityid()!=util.NCOMMON_PARAMS.cityid) ){
      vm.loadData();
    } else {
      util.hideLoading();
    }
    
    return searchApp.viewModel;
  };

  searchApp.view = function(ctrl) {
    if(ctrl.showKeyWordSearch()){
      return searchApp.searchKeyWordView(ctrl);
    } else {
      return searchApp.searchView(ctrl);
    }
  };

  searchApp.searchView = function(ctrl){
    return m('.searchApp-w', [
      m('.searchApp-bar', [
        m('.searchApp-input', {
          onclick: ctrl.setShowKeyWordSearch.bind(ctrl)
        },[
          m('.common-icon-search-little'),
          m('.common-icon-search-txt',[
            ctrl.typingSearchKey()?
              m('.common-color-default',ctrl.typingSearchKey()):
              '关键词/位置/品牌/酒店名'
          ])
        ]),
        ctrl.typingSearchKey()? 
          m('.searchApp-icon-cancel',{
            onclick: ctrl.cancelSearchKey.bind(ctrl)
          },[
            m('.common-icon-input-cancel')
          ]):'',
        m('.common-border'),
      ]),
      m('.searchApp-container', [
        ctrl.showHistoryRecord()?
        m('.searchApp-history.searchApp-box',[
          m('.searchApp-head',[
            '历史记录',
            m('.searchApp-right-btn',{
              onclick: ctrl.clearHistory.bind(ctrl)
            },'清除')
          ]),
          m('.searchApp-main.clearfix',ctrl.historyRecord().map(function(record, index) {
            return m('.searchApp-word',{
              honclick: ctrl.selectKeyword.bind(ctrl,record)
            },record.keyword)
          }))
        ]):'',

        m('.searchApp-box',ctrl.searchData().map(function(data, index) {
          var maindata = data.data || [];
          if(maindata.length == 0){ return;}
          if('品牌' == data.name && maindata.length > 6){
            var maindata1 = maindata.slice(0, 6);
            var maindata2 = maindata.slice(6);
            return [
              m('.searchApp-head',[
                '品牌',
                m('.searchApp-right-btn',{
                  onclick: ctrl.setShowBrand.bind(ctrl)
                }, ctrl.showBrand()? '收起': '展开')
              ]),
              m('.searchApp-main.clearfix', maindata1.map(function(mdata, index) {
                return m('.searchApp-word',{
                  honclick: ctrl.selectKeyword.bind(ctrl,{
                    keyword: mdata.name,
                    type: '品牌',
                    id: mdata.id,
                    ids: mdata.ids,
                    lat: '',
                    lon:'',
                    typeid: data.typeid
                  })
                }, mdata.name);
              })),

              m('.searchApp-main.clearfix',{
                className: ctrl.showBrand()? '': 'none'
              }, maindata2.map(function(mdata, index) {
                return m('.searchApp-word',{
                  honclick: ctrl.selectKeyword.bind(ctrl,{
                    keyword: mdata.name,
                    type: '品牌',
                    id: mdata.id,
                    ids: mdata.ids,
                    lat: '',
                    lon:'',
                    typeid: data.typeid
                  })
                }, mdata.name);
              })),
            ];
          }

          return [
            m('.searchApp-head',[
              data.name
            ]),
            (function(ctrl,data){
              if('热词' == data.name){
                return m('.searchApp-main.clearfix', maindata.map(function(mdata, index) {
                  return m('.searchApp-word',{
                    honclick: ctrl.selectKeyword.bind(ctrl,{
                      keyword: mdata.name,
                      type: mdata.type,
                      id: mdata.id,
                      ids: mdata.ids,
                      lat: mdata.lat,
                      lon: mdata.lon,
                      typeid: mdata.typeid
                    })
                  }, mdata.name);
                }));
              } else {
                return m('.searchApp-main.clearfix', maindata.map(function(mdata, index) {
                  return m('.searchApp-word',{
                    honclick: ctrl.selectKeyword.bind(ctrl,{
                      keyword: mdata.name,
                      type: data.name,
                      id: mdata.id,
                      ids: mdata.ids,
                      lat: mdata.lat,
                      lon: mdata.lon,
                      typeid: data.typeid
                    })
                  }, mdata.name);
                }));
              }
            })(ctrl,data),
          ];
        })),

        // m('.searchApp-box',[
        //   m('.searchApp-head',[
        //     '热词'
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'三里屯')
        //     },'三里屯'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'王府井')
        //     },'王府井'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'温泉')
        //     },'温泉')
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'万丽')
        //     },'万丽'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'西单')
        //     },'西单')
        //   ])
        // ]),

        // m('.searchApp-box',[
        //   m('.searchApp-head',[
        //     '特色'
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'亲子')
        //     },'亲子'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'情侣')
        //     },'情侣'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'周末出行')
        //     },'周末出行')
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'公寓')
        //     },'公寓'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'精品酒店')
        //     },'精品酒店')
        //   ])
        // ]),

        // m('.searchApp-box',[
        //   m('.searchApp-head',[
        //     '品牌',
        //     m('.searchApp-right-btn',{
        //       onclick: ctrl.setShowBrand.bind(ctrl)
        //     },'展开')
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'希尔顿')
        //     },'希尔顿'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'诺富特')
        //     },'诺富特'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'皇冠假日')
        //     },'皇冠假日')
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'万丽')
        //     },'万丽'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'华天')
        //     },'华天'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'雅乐轩')
        //     },'雅乐轩')
        //   ]),
        //   m('.searchApp-main.clearfix',{
        //     className: ctrl.showBrand()? '': 'none'
        //   },[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'希尔顿')
        //     },'希尔顿1'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'诺富特')
        //     },'诺富特1'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'皇冠假日')
        //     },'皇冠假日1')
        //   ]),
        //   m('.searchApp-main.clearfix',{
        //     className: ctrl.showBrand()? '': 'none'
        //   },[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'万丽')
        //     },'万丽1'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'华天')
        //     },'华天1'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'雅乐轩')
        //     },'雅乐轩1')
        //   ]),

        // ]),

        // m('.searchApp-box',[
        //   m('.searchApp-head',[
        //     '热门商圈'
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'东直门')
        //     },'东直门'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'王府井')
        //     },'王府井'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'中关村')
        //     },'中关村')
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'五道口/学院路')
        //     },'五道口/学院路'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'西直门')
        //     },'西直门'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'工体')
        //     },'工体')
        //   ])
        // ]),

        // m('.searchApp-box',[
        //   m('.searchApp-head',[
        //     '机场火车站'
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'首都机场')
        //     },'首都机场'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'南苑机场')
        //     },'南苑机场'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'北京西站')
        //     },'北京西站')
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'北京南站')
        //     },'北京南站'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'北京站')
        //     },'北京站'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'北京北站')
        //     },'北京北站')
        //   ])
        // ]),

        // m('.searchApp-box',[
        //   m('.searchApp-head',[
        //     '地铁站'
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'三元桥')
        //     },'三元桥'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'东直门')
        //     },'东直门'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'五棵松')
        //     },'五棵松')
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'西直门')
        //     },'西直门'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'双井')
        //     },'双井')
        //   ])
        // ]),

        // m('.searchApp-box',[
        //   m('.searchApp-head',[
        //     '行政区域'
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'朝阳门')
        //     },'朝阳门'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'海淀区')
        //     },'海淀区'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'东城区')
        //     },'东城区')
        //   ]),
        //   m('.searchApp-main.clearfix',[
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'西城区')
        //     },'西城区'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'昌平区')
        //     },'昌平区'),
        //     m('.searchApp-word',{
        //       honclick: ctrl.selectKeyword.bind(ctrl,'怀柔区')
        //     },'怀柔区')
        //   ])
        // ]),
      ])
    ]);
  }

  searchApp.searchKeyWordView = function(ctrl){
    var reg=new RegExp(ctrl.typingSearchKey(),"gi");
    return m('.searchApp-w', [
      m('.searchApp-bar.searchApp-bar1', [
        m('.searchApp-input.searchApp-input1', [
          m('.common-icon-search-little',{
            onclick: ctrl.searchInputKeyup1.bind(ctrl)
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
                onkeyup: ctrl.searchInputKeyup.bind(ctrl),
                placeholder: '关键词/位置/品牌/酒店名'
              })
            ]),
          ])
        ]),
        m('.searchApp-cancel', {onclick: ctrl.searchInputKeyup1.bind(ctrl)}, '完成'),
        // m('.searchApp-cancel', {onclick: ctrl.cancelSearch.bind(ctrl)}, '取消')
      ]),
      m('.searchApp-result', [
        ctrl.searchResult()?
          ctrl.searchResult().length <=0?
          m('.searchApp-result-item','无匹配结果')
          :ctrl.searchResult().map(function(hotel) {
            return [
              m('.searchApp-result-item', {
                onclick: hotel.hotelcode?
                  ctrl.goToDetail.bind(ctrl, hotel.hotelcode,hotel.text):
                  ctrl.selectKeyword.bind(ctrl, {
                    keyword: hotel.text,
                    type: util.HOTEL_SUGGEST_TYPE[hotel.type],
                    id: hotel.id,
                    lat: hotel.lat,
                    lon: hotel.lon,
                    typeid: hotel.typeid
                  })
              }, [
                m.trust(hotel.text.replace(reg,'<i>'+'$&'+'</i>')),
                m('span.searchApp-result-i', util.HOTEL_SUGGEST_TYPE[hotel.type])
              ])
            ];
          }):'',
      ])
    ]);
  }
  return searchApp;
})();