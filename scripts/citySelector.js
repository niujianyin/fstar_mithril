fstar.citySelector = (function() {

  var citySelector = {
    isInitialized: false,

    viewModel: {
      allCity: m.prop([]),

      selectedCity: m.prop({}),
      allArea: m.prop([]),
      businessCircleIds: m.prop(false),

      initCity: m.prop(false),

      backUrl: m.prop(false),

      citySelected: function(city) {
        var self = this;
        if( self.cityEquals(self.selectedCity(), city) ){
          return;
        } else {
          self.selectedCity(city);
          self.loadArea(city);
        }
      },

      done: function() {
        var self = this;
        var areas = document.querySelectorAll('.common-icon-square-blue');
        var resultAreaId = [], resultArea = [], areaId = '', area = '';
        for(var i=0,len=areas.length; i<len; i++){
          areaId = areas[i].getAttribute('dataId'); 
          area = '"' +areas[i].getAttribute('dataName') + '"'; 
          if( areaId == 'all'){ areaId = ''; area = ''};
          resultAreaId.push( areaId );
          resultArea.push( area );
        };

        // if (this.deferred) {
        //   this.deferred.resolve({
        //     newCity: self.selectedCity(), 
        //     businessCircleIds: resultAreaId.join(),
        //     businessCircle: resultArea.join("  ")
        //   });
        // }

        var searchObj = {};
        var backUrl = self.backUrl();
        try {
          searchObj = m.route.parseQueryString(backUrl.split('#?')[1]);
        }catch(e){}

        // searchObj.cityId = self.selectedCity().id;
        searchObj.name = self.selectedCity().name;
        searchObj.businessCircleIds = resultAreaId.join(',');
        searchObj.businessCircle = resultArea.join('  ');

        util.cookie.setItem('lastCity', JSON.stringify({name: self.selectedCity().name}));
        util.closeWindow(window.domainName + '/#?' + m.route.buildQueryString(searchObj));
      },

      areaSelected: function(key) {
        var self = this;
        if('selectArea_all'!=key) { self['selectArea_all'](false); }
        self[key]()?self[key](false):self[key](true);
        if(self['selectArea_all']()){
          var areas = self.selectedCity().businessCircles.concat();
          if(areas.length > 0){
            for(var i=0,len= areas.length; i<len; i++){
              var area = areas[i];
              self['selectArea_'+area.id]( false );
            }
          }
        }
      },

      cityEquals: function(city1, city2) {
        return city1.name == city2.name;
      },

      loadCity: function() {
        var self = this;

        util.showLoading();

        util.COMMON_PARAMS.comm_cityName = self.selectedCity().name;

        m.request({
          url: util.INTERFACE_ALLCITY,
          method: 'GET',
          data: {param: JSON.stringify(util.COMMON_PARAMS)},
          background: true
        }).then(function(result) {
          util.hideLoading();
          if(!result || !result.length){
            result = [];
          }

          self.allCity(result);

          // if( !(self.selectedCity().id) ){
          //   self.selectedCity(result[0]);
          // } else {
          var hasCity = false;
          for(var i=0,len=result.length; i<len; i++){
            if( self.selectedCity().name == result[i].name ){
              hasCity = true;
              self.selectedCity(result[i]);
            }
          }
          if (hasCity === false) {
            self.selectedCity(result[0]);
          }
          // }
          self.loadArea(self.selectedCity());
          setTimeout(function(){
            citySelector.adjustBase();
          },100);
        }, function() {

        });
      },

      loadArea: function(city){
        var self = this;
        // util.log(self.selectedCity());
        var areas = (city.businessCircles || []).concat();
        if(areas.length > 0){
          areas.unshift({
            id: 'all',
            name: '不限'
          });

          if(self.cityEquals(city, self.initCity()) && self.businessCircleIds()){
            for(var i=0,len= areas.length; i<len; i++){
              var area = areas[i];
              if( self.businessCircleIds().indexOf(""+area.id) > -1 ){
                self['selectArea_'+area.id] = m.prop( true );
              } else {
                self['selectArea_'+area.id] = m.prop( false );
              }
            }
          } else {
            for(var i=0,len= areas.length; i<len; i++){
              var area = areas[i];
              if( area.id == 'all' ){
                self['selectArea_'+area.id] = m.prop( true );
              } else {
                self['selectArea_'+area.id] = m.prop( false );
              }
            }
          }
        } else {
          areas.unshift({
            id: 'all',
            name: '不限'
          });
          self['selectArea_all'] = m.prop( true );
        }
        
        self.allArea( areas );

        // m.redraw();
        util.redraw();
      },
      config: function(city,businessCircleIds) {
        var deferred = m.deferred();

        this.deferred = deferred;

        this.selectedCity({
          id: city.id,
          name: city.name
        });
        if(!!businessCircleIds){
          this.businessCircleIds(businessCircleIds.split(','));
        } else {
          this.businessCircleIds(false);
        }
        

        return deferred.promise;
      },

      unload: function(){
        var self = this;
        self.selectedCity({});
      }
    },


    resize: function(){
      var resizing = null,clientHeight=null,ele=null;
      window.onresize = function() {
        if (resizing) {
          clearTimeout(resizing);
        }
        resizing = setTimeout(citySelector.adjustBase, 100);
      };
    },

    adjustBase: function() {
      clientHeight = window.innerHeight;


      if( ele = document.querySelectorAll('.citySelector-main')[0]){
        ele.style.height = (clientHeight-70)+'px';
      }
      if( ele = document.querySelectorAll('.citySelector-sub')[0]){
        ele.style.height = (clientHeight-70)+'px';
      }
    },

    init: function() {

      // 只初始化了一次，所以css文件只加载了一次
      this.isInitialized = true;
      this.resize();
    },
    controller: function() {
      // 只需初始化一次即可
      if (!citySelector.isInitialized) {
        util.log('citySelector is initialized');
        citySelector.init();
      }

      // var cityId = m.route.param('cityId');
      var cityName = decodeURIComponent(m.route.param('cityName'));
      var circleIds = m.route.param('circleIds');

      citySelector.viewModel.selectedCity({
        // id: cityId,
        name: cityName
      });

      citySelector.viewModel.initCity({
        name: cityName
      });

      if(circleIds == 'none'){
        citySelector.viewModel.businessCircleIds(false);
      } else {
        citySelector.viewModel.businessCircleIds(circleIds.split(','));
      }

      citySelector.viewModel.backUrl(decodeURIComponent(m.route.param('backUrl')));

      citySelector.viewModel.loadCity();
      util.updateTitle('选择城市、商圈');

      return citySelector.viewModel;
    },
    view: function(ctrl) {
      return m('.citySelector-w', [
        citySelector.allCityView(ctrl),

        m('.common-border.citySelector-bottom-border'),
        m('.common-btn-complete1.citySelector-btn',{
          onclick: ctrl.done.bind(ctrl)
        },'确定')

      ]);
    },

    allCityView: function(ctrl) {
      return m('.citySelector-section', [
        // m('.citySelector-title', '全部'),
        m('.citySelector-main', [
          m('.citySelector-citys', ctrl.allCity().map(function(city) {
            return m('.citySelector-city', {
              onclick: ctrl.citySelected.bind(ctrl, city),
              className: ctrl.cityEquals(city, ctrl.selectedCity()) ? 'citySelector-city-selected' : ''
            }, [city.name, m('.common-border')])
          }))
        ]),
        m('.citySelector-sub', [
          m('.citySelector-areas', ctrl.allArea().map(function(area) {
            return m('.citySelector-area', {
              onclick: ctrl.areaSelected.bind(ctrl, 'selectArea_'+area.id )
            }, [
              m('.citySelector-area-name',area.name), 
              m('.citySelector-checkbox',{
                className: ctrl['selectArea_'+area.id]() ?'common-icon-square-blue':'common-icon-square-default',
                dataId: area.id,
                dataName: area.name
              }),
              m('.common-border')
            ]);
          }))
        ])
      ]);
    }
  };


  return citySelector;

})();