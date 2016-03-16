fstar.userBillForm = (function() {

  var userBillForm = {

    viewModel: {

      pageTitle: m.prop(''),
      name: m.prop(''),
      id: m.prop(''),
      nameExist: m.prop(false),

      showDeleteButton: m.prop(false),
      validateName: m.prop(true),

      back: function() {
        window.history.back();
      },
      validateIsNull: function(val){
        return !val;
      },

      getFocus: function(key){
        this[key](true);
      },

      blurForm: function(){
        var inputs = document.querySelectorAll('input');
        for(var i=0,len=inputs.length; i < len; i++){
          inputs[i].blur();
        }
      },

      done: function() {
        var self = this;
        var name = self.name().trim();
        var userError = 0;
        var errorMsg = '';
        
        if(self.validateIsNull( name )){
          self.validateName(false);
          userError++;
          errorMsg += '常用发票抬头';
        } else{
          self.validateName(true);
        };

        if( userError == 0 ){
          self.updateBill().then(function(data) {
            if (data.code == 100) {
              self.blurForm();

              if( m.route.param('single') ){
                fstar.userBill.deferred.resolve( {
                  "result": data.usedInvoiceInfos[0].name
                } );
              } else {
                // fstar.userBill.viewModel.resultBillId( data.usedInvoiceInfos.id );
                util.storage.setItem('fstar_bill', data.usedInvoiceInfos[0].name);
              }

              if(m.route.param('source') == 'userHome'){
                m.route('userBill',{},true);
              } else {
                // setTimeout(function(){
                  window.history.back();
                // },100);
              }
              
            } else {
              util.alert({
                title: '错误',
                content: data.msg
              });
            }
          }, function() {
            util.alert({
              title: '未连接到互联网',
              content: '请检查网络是否通畅'
            });
          });
        } else {
          errorMsg = errorMsg.replace(/、$/,"");
          util.alert({title:'信息填写错误',content: errorMsg+'填写错误。请填写'+errorMsg+'。'});
        }
        
      },

      deleteBill: function() {
        var self = this;
        self.blurForm();
        setTimeout(function(){
          util.confirm({
            title:'删除常用发票抬头',
            ok:'删除',
            cancel:'取消',
            status: 'delete'
          }).then(function(msg){
            if(msg == 'ok'){

              var dataReq = {
                  id: self.id(),
                  type: 2
                };
              util.extendProp(dataReq, util.COMMON_PARAMS);

              m.request({
                method: 'POST',
                // url: window.apiRootPath + '/rest/user/delData',
                url: util.INTERFACE_DELDATA,
                data: dataReq
              }).then(function(data) {
                if (data == null || data.code == 100) {
                  setTimeout(function() {
                    window.history.back();
                  }, 100);
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
          });
        },200);
      },

      updateBill: function() {
        var self = this;
        var dataReq = {};
        dataReq.handler="saveUsedInvoiceInfo";
        dataReq.header=JSON.stringify(util.header);
        dataReq.data=JSON.stringify({"name":self.name()});
        util.log(dataReq);
        return m.request({
          method: 'get',
          // url: 'http://43.241.208.207:9000/hotel/order?handler=saveLiveInPerson&header={p:"hbgj",Authorization:"FCB15CEA57CCF82A29DA5A6745079B1D",phoneid:"10235"}&data={"name":"丰从越"}',
          url: util.INTERFACE_ADDORDERDATA,
          data: dataReq,
          background: true
        });
      },

      deleteInput: function(key){
        var self = this;
        self[key]('');
        self[key+'Exist'](false);
        // m.redraw();
      },

      autoFocus: function(element, isInit, context){
        var self = this;
        if(!isInit) element.focus();
      },

      writeChange: function(prop, withAttrCallback, e){
        var self = this;
        e = e || event;
        var currentTarget = e.currentTarget || this;
        self[withAttrCallback]( prop in currentTarget ? currentTarget[prop] : currentTarget.getAttribute(prop));
        
        if( self[withAttrCallback]().trim() ){
          self[withAttrCallback + 'Exist']( true );
        } else {
          self[withAttrCallback + 'Exist']( false );
        }
      },

      onunload: function(){
        var self = this;
        self.pageTitle('');
        self.name('');
        self.nameExist(false);
        self.id('');

        self.showDeleteButton(false);
        self.validateName(true);

        document.querySelectorAll('body')[0].style.backgroundColor = '';
      }
    },

    config: function(opt) {
      userBillForm.viewModel.pageTitle(opt.title);

      if (opt.name) {
        userBillForm.viewModel.name(opt.name);
        userBillForm.viewModel.nameExist(true);
      } else {
        userBillForm.viewModel.name('');
        userBillForm.viewModel.nameExist(false);
      }

      if (opt.id != undefined) {
        userBillForm.viewModel.id(opt.id);
        userBillForm.viewModel.showDeleteButton(true);
      } else {
        userBillForm.viewModel.id('');
        userBillForm.viewModel.showDeleteButton(false);
      }
      util.hideLoading();
    },

    controller: function() {

      util.updateTitle(userBillForm.viewModel.pageTitle());

      userBillForm.viewModel.validateName(true);
      document.querySelectorAll('body')[0].style.backgroundColor = '#fff';
      return userBillForm.viewModel;
    },
    view: function(ctrl) {
      return m('.user-w', [
        // m('.common-header', [
        //   m('.left.common-header-back', {onclick: ctrl.back.bind(ctrl)}),
        //   m('.right.user-ok', {onclick: ctrl.done.bind(ctrl)}, '完成'),
        //   m('.tit', ctrl.pageTitle())
        // ]),
        m('.h30'),
        userBillForm.addView(ctrl),
        userBillForm.saveView(ctrl),
        userBillForm.deleteView(ctrl),
        m('.h30')
      ]);
    },
    addView: function(ctrl) {
      return m('.user-form.common-form-box', [
        m('.user-add.common-input-add', {
          className: ctrl.validateName()? '': 'common-form-error'
        }, [
          m('input', {
            oninput: ctrl.writeChange.bind(ctrl, 'value', 'name'),
            value: ctrl.name(), 
            placeholder: '个人姓名或者公司名称',
            onfocus: ctrl.getFocus.bind(ctrl, 'validateName'),
            config: ctrl.autoFocus.bind(ctrl)
          })
        ]),
        ctrl.nameExist()?
        m('.common-icon-input-cancel',{
          onclick: ctrl.deleteInput.bind(ctrl,'name')
        }):''
      ]);
    },
    saveView: function(ctrl){
      return m('.common-btn-complete1', {honclick: ctrl.done.bind(ctrl)}, '保存');
    },
    deleteView: function(ctrl) {
      if (ctrl.showDeleteButton()) {
        return m('.common-btn-del', {
          onclick: ctrl.deleteBill.bind(ctrl)
        }, '删除');
      } else {
        return '';
      }
    }
  };

  return userBillForm;

})();