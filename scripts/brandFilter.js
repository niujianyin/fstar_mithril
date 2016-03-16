fstar.brandFilter = (function() {

  var brandFilter = {
    isInitialized: false,

    viewModel: {
      type: m.prop(''),
      typeid: m.prop(''),
      types: m.prop([]),

      // 索引
      ids: m.prop([]),
      // 已选品牌类型数组
      typeIds: m.prop([]),
      // 对象
      ob: m.prop({}),
      // 最终选择品牌数组
      selectbrands: m.prop([]),
      // 原始数据数组
      brands: m.prop([]),
      
      config: function(opt) {
        var self = this;
        var deferred = m.deferred();
        self.deferred = deferred;
        if(opt.brands.length == 0){
          self.selectbrands([]);
        } else {
          self.selectbrands(opt.brands);
        }
        return deferred.promise;
      },

      done: function() {
        var self = this;
        if (self.deferred) {
          self.selectbrands([]);
          for(var i=0,len=self.ids().length; i<len; i++){
            var bid = self.ids()[i];
            self.selectbrands().push(self.ob()[bid]);
          }
          self.deferred.resolve(self.selectbrands());
        }
      },
      
      cancel: function(){
        var self = this;
        self.ids([]);
        self.typeIds([]);
        self.adjustBase();
        util.redraw();
      },

      selectType: function(type) {
        var self = this;
        if( type.typeid == self.typeid() ){

        } else {
          self.type(type.name);
          self.typeid(type.typeid);
          for(var i=0,len=self.types().length; i<len; i++){
            self['type_'+self.types()[i].typeid](false);
          }
          self['type_'+type.typeid](true);
          util.redraw();
        }
      },

      selectItem: function(brandid) {
        var self = this;
        var ids = self.ids();
        var idx = ids.indexOf(brandid);
        if(idx > -1){
          ids.splice(idx,1);
        } else if( ids.length >=8){
          util.alert({
            title: '最多选择8个品牌'
          })
        } else {
          ids.push(brandid);
        }
        self.ids(ids);
        self.getTypeIds();
        self.adjustBase();
        util.redraw();
      },

      closeItem: function(brandid){
        var self = this;
        var ids = self.ids();
        var idx = ids.indexOf(brandid);
        if(idx > -1){
          ids.splice(idx,1);
        }
        self.ids(ids);
        self.getTypeIds();
        self.adjustBase();
        util.redraw();
      },

      getTypeIds: function(){
        var self = this;
        var typeIds = [];
        var ids = self.ids();
        for(var i=0,len=ids.length; i<len; i++){
          typeIds.push(ids[i].split('_')[0]);
        }
        self.typeIds(typeIds);
      },

      loadBrands: function() {
        var self = this;
        util.showLoading();
        var dataReq = {
          st: 6,
          menu: 4,
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
            self.types([]);
            for(var i=0,len=rdata.length; i<len; i++){
              self.types().push({
                name:rdata[i].name,
                typeid:rdata[i].typeid
              });
              if(i==0){
                self['type_'+rdata[i].typeid] = m.prop(true);
                self.type(rdata[i].name);
                self.typeid(rdata[i].typeid);
              } else {
                self['type_'+rdata[i].typeid] = m.prop(false);
              }
              // 拼接出唯一id
              for(var j=0,length=rdata[i].data.length; j<length; j++){
                var bdatd = rdata[i].data[j];
                bdatd.brandid = rdata[i].typeid + '_' + bdatd.id;
                bdatd.typeid = rdata[i].typeid;
                self.ob()[bdatd.brandid] = bdatd;
              }
            }
            // util.log(self.ob());
            self.brands(rdata);
            self.ids([]);
            for(var i=0,len=self.selectbrands().length; i<len; i++){
              var sdatd = self.selectbrands()[i];
              sdatd.brandid = sdatd.typeid + '_' + sdatd.id;
              self.ids().push(sdatd.brandid);
            }
            self.getTypeIds();
            // util.log(self.ids());
            self.adjustBase();
            util.hideLoading();
            util.redraw();
          } else {
            util.alert({
              title: '不存在品牌筛选'
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
        var height = 57;
        if(self.ids && self.ids().length>0){
          var num = Math.ceil(self.ids().length/4)+1;
          num = num>3? 3: num;
          height= num*43-4+13;
        }
        var clientHeight = window.innerHeight;
        if( ele = document.querySelectorAll('.brandFilter-main')[0]){
          ele.style.height = (clientHeight-height)+'px';
        }
        if( ele = document.querySelectorAll('.brandFilter-sub')[0]){
          ele.style.height = (clientHeight-height)+'px';
        }
      },
      onunload: function() {
        var self = this;
        self.ob([]);
        self.brands([]);
        self.types([]);
        self.typeIds([]);
      }
    },
    controller: function() {
      util.updateTitle('品牌筛选');

      brandFilter.viewModel.loadBrands();
      brandFilter.viewModel.resize();
      document.body.style.overflow = 'auto';

      return brandFilter.viewModel;
    },
    view: function(ctrl) {
      if (ctrl.brands().length == 0) {
        return m('.brandFilter-w',[
          m('.brandFilter-w500',[
            m('.brandFilter-top.clearfix',{
              className: ctrl.ids().length==0? 'brandFilter-hide':''
            }, [
            ]),
            m('.brandFilter-section',[
              m('.brandFilter-main', {
                style: 'height: 1000px'
              }),
              m('.brandFilter-sub', {
                style: 'height: 1000px'
              }),
            ]),
            m('.brandFilter-btn-w')
          ])
        ]);
      }

      return m('.brandFilter-w', [
        m('.brandFilter-w500',[
          m('.brandFilter-top',{
            className: ctrl.ids().length==0? 'brandFilter-hide':''
          }, [
            m('.brandFilter-sbrands',ctrl.ids().map(function(brandid, index){
              var brand = ctrl.ob()[brandid];
              return m('.brandFilter-sbrand',{
                honclick: ctrl.closeItem.bind(ctrl, brandid)
              },[
                m('.brandFilter-sbrand-txt', brand.name),
                m('span.brandFilter-sbrand-close',[
                  m('span.common-icon-brand-close')
                ]),
              ]);
            }))
          ]),
          m('.brandFilter-section',[
            m('.brandFilter-main', {
              style: 'height: 1000px'
            },[
              m('.brandFilter-types', ctrl.types().map(function(type, index){
                var classes = '';
                if(type.typeid == ctrl.typeid()){
                  classes += 'selected';
                }
                if( ctrl.typeIds().indexOf(""+type.typeid) > -1 ){
                  classes += ' selected1';
                }

                return m('.brandFilter-type',{
                  className: classes,
                  honclick: ctrl.selectType.bind(ctrl, type)
                },[
                  type.name, 
                  m('span.brandFilter-type-icon')
                ]);
              })),
            ]),
            m('.brandFilter-sub', {
              style: 'height: 1000px'
            }, ctrl.brands().map(function(brands, index){
              return m('.brandFilter-areas',{
                className: ctrl['type_'+brands.typeid]()?'':'brandFilter-hide'
              }, brands.data.map(function(brand, index){
                  return m('.brandFilter-area',{
                    honclick: ctrl.selectItem.bind(ctrl, brand.brandid),
                    className: (ctrl.ids().indexOf(brand.brandid) > -1)?'selected':''
                  },[
                    m('.brandFilter-area-name', brand.name), 
                    m('.icon.common-icon-selected-blue')
                  ]);
                })
              );
            })),
          ]),
          m('.brandFilter-btn-w',[
            m('.brandFilter-btn-left',[
              m('.brandFilter-btn-clear',{onclick: ctrl.cancel.bind(ctrl)},'清空'),
            ]),
            m('.brandFilter-btn-right',[
              m('.brandFilter-btn-ok',{onclick: ctrl.done.bind(ctrl)},'确定'),
            ]),
          ])
        ])
      ]);
    }
  };


  return brandFilter;

})();