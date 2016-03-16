fstar.modifyOrderApp = (function() {

  var modifyOrderApp = {

    isInitialized: false,

    viewModel: {

      /**
       *入住人姓名集合
       */
      names: m.prop([]),
      originalNames: m.prop([]),
      pageTitle: m.prop(''),
      isApply: m.prop(true),

      back: function() {
        window.history.back();
      },
      
      done: function() {
        var self = this;
        var names = self.names();
        var length = names.length;
        var resultNames = [];
        var errorNum = 0;
        var orderId = m.route.param('orderId');
        var sameError = length;

        for(var i=1; i<=length; i++){
          var name = self['dataName_'+i]().trim();
          if(self.validateIsNull( name )){
            self['validateName_'+i](false);
            errorNum++;
          } else {
            if(name == self.originalNames()[i-1]){ sameError--; }

            resultNames.push( { "name": name} );
            self['validateName_'+i](true);
          }
        }

        if( errorNum == 0 ){
          if(sameError == 0){
            util.alert({
              title: '入住人姓名没有修改',
              content: '入住人姓名和原订单一致，没有向卖家提交修改申请'
            }).then(function(message) {
              window.history.back();
            });
            return;
          }
 
          if( self.isApply() ){
            var data = {
              "orderId": orderId,
              "passengers":resultNames
            };

            var dataReq = data;
            util.extendProp(dataReq, util.COMMON_PARAMS);

            m.request({
              method: 'POST',
              // url: window.apiRootPath + '/rest/order/modifyOrderGuest',
              url: util.INTERFACE_MODIFYORDERGUEST,
              data: dataReq,
              background: true
            }).then(function(data) {
              if (data.code == 100) {
                self.blurForm();
                setTimeout(function(){
                  window.history.back();
                },200);
              } else {
                util.alert({
                  title: '错误',
                  content: data.content
                });
              }
            }, function() {
              util.alert({
                title: '未连接到互联网',
                content: '请检查网络是否通畅'
              });
            });
          } else {
            var data = {
              "orderId": orderId,
              "passengers":resultNames
            };

            var dataReq = data;
            util.extendProp(dataReq, util.COMMON_PARAMS);

            m.request({
              method: 'POST',
              // url: window.apiRootPath + '/rest/order/modifyOrderGuestNoApply',
              url: util.INTERFACE_MODIFYORDERGUESTNOAPPLY,
              data: dataReq,
              background: true
            }).then(function(data) {
              if (data.code == 100) {
                self.blurForm();
                setTimeout(function(){
                  window.history.back();
                },200);
              } else {
                util.alert({
                  title: '错误',
                  content: data.content
                });
              }
            }, function() {
              util.alert({
                title: '未连接到互联网',
                content: '请检查网络是否通畅'
              });
            });
          }
        } else {
          util.alert({title:'信息填写错误',content: '入住人填写错误。请填写入住人。'});
        }       
      },

      blurForm: function(){
        var inputs = document.querySelectorAll('input');
        for(var i=0,len=inputs.length; i < len; i++){
          inputs[i].blur();
        }
      },

      validateIsNull: function(val){
        return !val;
      },

      getFocus: function(key){
        var self = this;
        self[key](true);
      },
      getBlur: function(key, e){
        var self = this;
        var value = e.target.value;
        self[key]( value.replace(/\s*/g,'').replace(/-/g,'') );
      },
      onKeyDown: function(key, existKey, e) {
        var self = this;
        self[key](e.target.value);

        if( e.target.value.trim() ){
          self[existKey]( true );
        } else {
          self[existKey]( false );
        }
      },

      deleteInput: function(key,existKey){
        var self = this;
        self[key]('');
        self[existKey](false);
      },

      onunload: function(){
        var self = this;
        self.pageTitle('');
        self.names([]);
        self.isApply(true);
        document.querySelectorAll('body')[0].style.backgroundColor = '';
      }
    },

    init: function() {
      util.log('modifyOrderApp init');
      this.isInitialized = true;
    }
  };

  modifyOrderApp.config = function(opt) {
    this.deferred = m.deferred();
    this.viewModel.names(opt.names?opt.names.split('、'):['']);
    this.viewModel.originalNames(opt.names?opt.names.split('、'):['']);
    this.viewModel.pageTitle(opt.title?opt.title:'提交修改申请');
    return this.deferred.promise;
  };

  modifyOrderApp.controller = function() {
    if (!modifyOrderApp.isInitialized) {
      modifyOrderApp.init();
    }

    util.updateTitle(modifyOrderApp.viewModel.pageTitle());
    util.hideLoading();

    modifyOrderApp.viewModel.isApply( m.route.param('type') == 'apply' );

    var names = modifyOrderApp.viewModel.names();
    var length = names.length || names.push('');

    for(var i=1; i<=length; i++){
      modifyOrderApp.viewModel['validateName_'+i]= m.prop(true);
      modifyOrderApp.viewModel['dataName_'+i]= m.prop(names[i-1]);
      modifyOrderApp.viewModel['existName_'+i]= m.prop(!!names[i-1]);
    }
    
    document.querySelectorAll('body')[0].style.backgroundColor = '#f8f8f8';

    // _czc.push(﻿['_trackEvent', '修改订单页','修改订单页:进入', '修改用户名:' + util.COMMON_PARAMS.comm_cityName +':'+util.PLATFORM.CURRENT_STR+':'+util.OS]);

    return modifyOrderApp.viewModel;
  };

  modifyOrderApp.view = function(ctrl) {
    return m('.modifyOrderApp-w', [
      modifyOrderApp.addView(ctrl),
      modifyOrderApp.inforView(ctrl),
      modifyOrderApp.saveView(ctrl),
      modifyOrderApp.cancelView(ctrl),
      m('.h30')
    ]);
  };
  modifyOrderApp.addView = function(ctrl) {
    return m('.modifyOrderApp-form.common-form-box', [
      m('span.modifyOrderApp-label', '入住人'),
      m('span.modifyOrderApp-names', 
        (function(ctrl){
          var result = [];
          for(var i=1,len = (ctrl.names().length||1); i <= len; i++){
            result.push(
              m('.modifyOrderApp-item',{
                className: i==1? 'modifyOrderApp-noBorder':''
              },[
                m('.modifyOrderApp-add.common-input-add', {
                  className: ctrl['validateName_'+i]()? '': 'common-form-error'
                }, [
                  m('input', {
                    type: 'text',
                    autocomplete:"off",
                    value: ctrl['dataName_'+i](), 
                    placeholder: '中文姓名',
                    onfocus: ctrl.getFocus.bind(ctrl, 'validateName_'+i),
                    onkeyup: ctrl.onKeyDown.bind(ctrl, 'dataName_'+i, 'existName_'+i),
                    onblur: ctrl.getBlur.bind(ctrl, 'dataName_'+i)
                  })
                ]),
                ctrl['existName_'+i]()?
                m('.common-icon-input-cancel',{
                  onclick: ctrl.deleteInput.bind(ctrl,'dataName_'+i,'existName_'+i)
                }):''
              ])
            );
          }
          return result;
        })(ctrl)
      ),
    ]);
  };
  modifyOrderApp.inforView = function(ctrl){
    return [
      m('.common-border'),
      m('.modifyOrderApp-ul',[
        ctrl.isApply() ? m('.modifyOrderApp-li','卖家已经开始处理订单。卖家同意后，才能修改成功。'):'',
        // m('.modifyOrderApp-li','修改房型、房间数等，请返回订单页，给卖家留言。')
      ])
    ];
  };

  modifyOrderApp.saveView = function(ctrl){
    var btnTxt = ctrl.isApply()? '提交修改申请' : '保存';
    return m('.common-btn-complete1.mt30', {onclick: ctrl.done.bind(ctrl)}, btnTxt);
  };
  modifyOrderApp.cancelView = function(ctrl) {
    return m('.common-btn-del', {
      onclick: ctrl.back.bind(ctrl)
    }, '取消');
  };
  
  return modifyOrderApp;

})();