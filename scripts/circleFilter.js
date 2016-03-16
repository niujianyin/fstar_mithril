fstar.circleFilter = (function() {

  var circleFilter = {
    isInitialized: false,
    timer: null,

    viewModel: {
      type: m.prop(''),
      circle: m.prop(''),
      circleId: m.prop(''),
      distance: m.prop(false),
      lat: m.prop(''),
      lon: m.prop(''),
      typeid: m.prop(''),
      noSaveType: m.prop(''),
      noSaveTypeid: m.prop(''),
      saveWay: m.prop(''),
      noSaveWay: m.prop(''),
      types: m.prop([]),
      circles: m.prop([]),
      allSelected: m.prop(true),
      
      config: function(opt) {
        var self = this;
        var deferred = m.deferred();
        self.deferred = deferred;
        // 地铁几号线
        self.noSaveWay('');
        self.saveWay('');
        if(opt.circles.length == 0){
          self.allSelected(true);
          self.type('');
          self.circle('');
          self.circleId('');
          self.lat('');
          self.lon('');
          self.typeid('');
          self.noSaveType('');
          self.noSaveTypeid('');
          self.distance(false);
        } else {
          self.allSelected(false);
          self.type('');
          self.circle(opt.circles[0].name);
          self.circleId(opt.circles[0].id);
          self.lat(opt.circles[0].lat);
          self.lon(opt.circles[0].lon);
          self.typeid(opt.circles[0].typeid);
          self.noSaveType(opt.circles[0].typeid);
          self.noSaveTypeid(opt.circles[0].typeid);
          self.distance(opt.circles[0].distance || false);
        }
        
        return deferred.promise;
      },

      done: function() {
        var self = this;
        if (self.deferred) {
          if(self.circleId()&&self.circle()){
            self.deferred.resolve([{
              name: self.circle(),
              id: self.circleId(),
              lat: self.lat(),
              lon: self.lon(),
              distance: self.distance() || 4000,
              typeid: self.typeid()
            }]);
          } else {
            self.deferred.resolve([]);
          }
          
        }
      },
      cancel: function(){
        var self = this;
        self.allSelected(true);
        self.circle('');
        self.circleId('');
        self.lat('');
        self.lon('');
        self.distance(false);
        self.typeid('');
        self.type('');
        self.saveWay('');
      },

      selectType: function(type) {
        var self = this;
        if( type.typeid == self.noSaveTypeid() ){

        } else {
          self.noSaveType(type.name);
          self.noSaveTypeid(type.typeid);
          self.adjustBase();
          util.redraw();
        }
      },

      selectWay: function(way) {
        var self = this;
        if( way.name == self.noSaveWay() ){

        } else {
          self.noSaveWay(way.name);
          util.redraw();
        }
      },

      selectCircle: function(circle) {
        var self = this;
        if( circle.id == self.circleId() ){

        } else {
          self.typeid( self.noSaveTypeid() );
          self.type( self.noSaveType() );
          self.circleId(circle.id);
          self.circle(circle.name);
          self.lat(circle.lat);
          self.lon(circle.lon);

          if(self.noSaveTypeid()==7){
            self.saveWay(self.noSaveWay());
          } else {
            self.saveWay('');
          }

          util.redraw();
        }
      },

      selectDistance: function(circle) {
        var self = this;
        if( circle.id == self.distance() ){

        } else {
          self.distance(circle.id);
          util.redraw();
        }
      },

      loadCircles: function() {
        var self = this;
        util.showLoading();
        var dataReq = {
          st: 6,
          menu: 2,
          from: util.NCOMMON_PARAMS.from,
          uid: util.NCOMMON_PARAMS.uid
        };
        // 追加城市参数
        util.extendCommon(dataReq);

        m.request({
          url: util.INTERFACE_GETHOTELMENUDATA,
          method: 'GET',
          data: dataReq,
          background: true
        }).then(function(result) {
          util.log(result);
          if(result && result.data && result.data.length > 0){
            var rdata = result.data;
            var fdata = {};
            var hasSelect = true;
            var firstSelect = true;
            var firstNum = 0;
            for(var i=0,len=rdata.length; i<len; i++){
              var typedata = rdata[i].data;
              var typeid = rdata[i].typeid || rdata[i].name;
              if(!typedata || typedata.length == 0){ 
                continue;
              }
              if(firstSelect){
                firstNum = i;
                firstSelect = false;
              }
              self.types().push({
                name:rdata[i].name,
                typeid: typeid
              });
              fdata[typeid] = typedata;
              if(typeid == 7 &&typedata&&typedata[0]&&typedata[0].data ){
                for(var j=0,length=typedata.length; j<length; j++){
                  var subway = typedata[j].data;
                  var wayname = typedata[j].name;
                  if(j==0){
                    self.noSaveWay(wayname);
                  }
                  fdata[typeid][wayname]=subway;
                  for(var jj=0,jl=subway.length; jj<jl; jj++){
                    if(rdata[i].typeid == self.typeid() && subway[jj].id == self.circleId()){
                      self.type(rdata[i].name);
                      self.typeid(rdata[i].typeid);
                      self.circle(subway[jj].name);
                      self.circleId(subway[jj].id);

                      self.saveWay(wayname);
                      self.noSaveWay(wayname);
                      hasSelect = false;
                    }
                  }
                }
              } else if(self.allSelected()){
                // self.type(rdata[0].name);
              } else {
                for(var j=0,length=typedata.length; j<length; j++){
                  if(rdata[i].typeid == self.typeid() && typedata[j].id == self.circleId()){
                    self.type(rdata[i].name);
                    self.typeid(rdata[i].typeid);
                    self.circle(typedata[j].name);
                    self.circleId(typedata[j].id);
                    hasSelect = false;
                  }
                }
              }
            }
            if(hasSelect){
              // self.type(rdata[0].name);
              // self.typeid(rdata[0].typeid);
              self.noSaveType(rdata[firstNum].name);
              self.noSaveTypeid(rdata[firstNum].typeid);
              // self.circle('');
              // self.circleId('');
            }
            self.circles(fdata);

            self.adjustBase();
            util.hideLoading();
            util.redraw();
          } else {
            util.alert({
              title: '不存在商圈筛选'
            }).then(function(){
              history.back();
            });
            util.hideLoading();
          }
        }, function() {
          util.alert({
            content: '网络不给力，请稍后再试试吧',
            ok: '知道了'
          });
          util.hideLoading();
        });
      },

      resize: function(){
        var self = this;
        var resizing = null,clientHeight=null,ele=null;
        window.onresize = function() {
          if (resizing) {
            clearTimeout(resizing);
          }
          resizing = setTimeout(self.adjustBase, 100);
        };
      },

      adjustBase: function() {
        var self = this;
        var clientHeight = window.innerHeight;
        if( ele = document.querySelectorAll('.circleFilter-main')[0]){
          ele.style.height = (clientHeight-57)+'px';
        }
        if( ele1 = document.querySelectorAll('.circleFilter-extra')[0]){
          ele1.style.height = (clientHeight-57)+'px';
        }
        if( ele2 = document.querySelectorAll('.circleFilter-sub')[0]){
          ele2.style.height = (clientHeight-57)+'px';
        }

        if(self.noSaveTypeid && self.noSaveTypeid()==7){
          if(document.querySelectorAll('#circleFilter-subway')[0]){
            clearTimeout(circleFilter.timer);
            circleFilter.timer = null;
            var clientHeight = window.innerHeight;
            if( ele = document.querySelectorAll('.circleFilter-main')[0]){
              ele.style.height = (clientHeight-57)+'px';
            }
            if( ele1 = document.querySelectorAll('.circleFilter-extra')[0]){
              ele1.style.height = (clientHeight-57)+'px';
            }
            if( ele2 = document.querySelectorAll('.circleFilter-sub')[0]){
              ele2.style.height = (clientHeight-57)+'px';
            }
          } else {
            circleFilter.timer = setTimeout(function(){
              self.adjustBase();
            },200);
          }
        } else {
          clearTimeout(circleFilter.timer);
          circleFilter.timer = null;
        }
      },
      onunload: function() {
        var self = this;
        self.types([]);
        self.circles([]);
        clearTimeout(circleFilter.timer);
        circleFilter.timer = null;
      }
    },
    controller: function() {
      util.updateTitle('位置筛选');

      circleFilter.viewModel.loadCircles();
      circleFilter.viewModel.resize();
      document.body.style.overflow = 'auto';

      return circleFilter.viewModel;
    },
    view: function(ctrl) {
      if (ctrl.circles().length == 0) {
        return m('.circleFilter-w',[
          m('.circleFilter-section',[
            m('.circleFilter-main', {
              style: 'height: 1000px'
            }),
            m('.circleFilter-sub', {
              style: 'height: 1000px'
            }),
          ]),
          m('.circleFilter-btn-w')
        ]);
      }
      if(ctrl.noSaveTypeid()==7&&ctrl.noSaveWay()){
        return m('.circleFilter-w', [
          m('.circleFilter-section#circleFilter-subway',[
            m('.circleFilter-main', {
              style: 'height: 1000px'
            },[
              m('.circleFilter-types', ctrl.types().map(function(type, index){
                var classes = '';
                if(type.typeid == ctrl.noSaveTypeid()){
                  classes += 'selected';
                }
                if(type.typeid == ctrl.typeid() ){
                  classes += ' selected1';
                }

                return m('.circleFilter-type',{
                  className: classes,
                  honclick: ctrl.selectType.bind(ctrl, type)
                },[
                  type.name, 
                  m('span.circleFilter-type-icon')
                ]);
              })),
            ]),
            m('.circleFilter-extra', {
              style: 'height: 1000px'
            }, [
              m('.circleFilter-areas',ctrl.circles()[ctrl.noSaveTypeid()].map(function(way, index){
                var classes = '';
                if(way.name == ctrl.noSaveWay()){
                  classes += 'selected';
                }
                if(way.name == ctrl.saveWay() ){
                  classes += ' selected1';
                }
                return m('.circleFilter-area',{
                  className: classes,
                  honclick: ctrl.selectWay.bind(ctrl, way)
                },[
                  m('.circleFilter-area-name', way.name), 
                  m('.circleFilter-type-icon')
                ]);
              })),
            ]),
            m('.circleFilter-sub', {
              style: 'height: 1000px'
            }, [
              m('.circleFilter-areas',ctrl.circles()[ctrl.noSaveTypeid()][ctrl.noSaveWay()].map(function(circle, index){
                return m('.circleFilter-area',{
                  className: (ctrl.noSaveTypeid() == ctrl.typeid() && circle.id == ctrl.circleId() )?'selected':'',
                  honclick: ctrl.selectCircle.bind(ctrl, circle)
                },[
                  m('.circleFilter-area-name', circle.name), 
                  m('.icon.common-icon-selected-blue')
                ]);
              })),
            ]),
          ]),
          m('.circleFilter-btn-w',[
            m('.circleFilter-btn-left',[
              m('.circleFilter-btn-clear',{onclick: ctrl.cancel.bind(ctrl)},'清空'),
            ]),
            m('.circleFilter-btn-right',[
              m('.circleFilter-btn-ok',{onclick: ctrl.done.bind(ctrl)},'确定'),
            ]),
          ])
        ]);
      } else {
        return m('.circleFilter-w', [
          m('.circleFilter-section',[
            m('.circleFilter-main', {
              style: 'height: 1000px'
            },[
              m('.circleFilter-types', ctrl.types().map(function(type, index){
                var classes = '';
                if(type.typeid == ctrl.noSaveTypeid()){
                  classes += 'selected';
                }
                if(type.typeid == ctrl.typeid() ){
                  classes += ' selected1';
                }
                if(type.typeid =='距离' && ctrl.distance() ){
                  classes += ' selected1';
                }

                return m('.circleFilter-type',{
                  className: classes,
                  honclick: ctrl.selectType.bind(ctrl, type)
                },[
                  type.name, 
                  m('span.circleFilter-type-icon')
                ]);
              })),
            ]),
            m('.circleFilter-sub', {
              style: 'height: 1000px'
            }, [
              m('.circleFilter-areas',ctrl.circles()[ctrl.noSaveTypeid()].map(function(circle, index){
                return ctrl.noSaveTypeid()== '距离'?
                m('.circleFilter-area',{
                  className: circle.id == ctrl.distance()?'selected':'',
                  honclick: ctrl.selectDistance.bind(ctrl, circle)
                },[
                  m('.circleFilter-area-name', circle.name), 
                  m('.icon.common-icon-selected-blue')
                ]):
                m('.circleFilter-area',{
                  className: (ctrl.noSaveTypeid() == ctrl.typeid() && circle.id == ctrl.circleId() )?'selected':'',
                  honclick: ctrl.selectCircle.bind(ctrl, circle)
                },[
                  m('.circleFilter-area-name', circle.name), 
                  m('.icon.common-icon-selected-blue')
                ]);
              })),
            ]),
          ]),
          m('.circleFilter-btn-w',[
            m('.circleFilter-btn-left',[
              m('.circleFilter-btn-clear',{onclick: ctrl.cancel.bind(ctrl)},'清空'),
            ]),
            m('.circleFilter-btn-right',[
              m('.circleFilter-btn-ok',{onclick: ctrl.done.bind(ctrl)},'确定'),
            ]),
          ])
        ]);
      }
      
    }
  };


  return circleFilter;

})();