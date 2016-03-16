fstar.userAddressForm = (function() {

  var userAddressForm = {

    viewModel: {

      pageTitle: m.prop(''),
      name: m.prop(''),
      phone: m.prop(''),
      address: m.prop(''),
      id: m.prop(''),

      nameExist: m.prop(false),
      phoneExist: m.prop(false),
      addressExist: m.prop(false),

      showDeleteButton: m.prop(false),
      validateName: m.prop(true),
      validatePhone: m.prop(true),
      validateAddress: m.prop(true),
      // autoFocusReady: m.prop(true),

      back: function() {
        window.history.back();
      },
      validateIsNull: function(val){
        return !val;
      },
      validateIsNotTel: function(tel){
        var telephone = tel.replace(/-/g,"");
        return !telephone || !(/^((\+?86)|(\+86))?1[3|4|5|7|8][0-9]\d{8}$/.test(telephone)); 
      },

      getFocus: function(key){
        this[key](true);
      },

      blurForm: function(){
        var inputs = document.querySelectorAll('input');
        for(var i=0,len=inputs.length; i < len; i++){
          inputs[i].blur();
        }
        document.querySelector('textarea').blur();
      },

      done: function() {
        var self = this;
        var name = self.name().trim();
        var phone = self.phone().trim();
        var address = self.address().trim();
        var userAddressError = 0;
        var errorMsg = '';
        
        if(self.validateIsNull( name )){
          self.validateName(false);
          userAddressError++;
          errorMsg += '收件人姓名、';
        } else{
          self.validateName(true);
        };
        if(self.validateIsNotTel( phone )){
          self.validatePhone(false);
          userAddressError++;
          errorMsg += '联系手机、';
        } else{
          self.validatePhone(true);
        };
        if(self.validateIsNull( address )){
          self.validateAddress(false);
          userAddressError++;
          errorMsg += '详细地址、';
        } else{
          self.validateAddress(true);
        };

        if( userAddressError == 0 ){
          self.updateAddress().then(function(data) {
            if (data.code == 100) {
              self.blurForm();

              if( m.route.param('single') ){
                fstar.userAddress.deferred.resolve( {
                  "result": JSON.stringify(data.contacts[0]),
                  "id": data.contacts[0].id
                } );
              } else {
                fstar.userAddress.viewModel.resultAddressId( data.contacts[0].id );
              }

              if(m.route.param('source') == 'userHome'){
                m.route('userAddress',{},true);
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

      deleteInput: function(key){
        var self = this;
        self[key]('');
        self[key+'Exist'](false);
        // m.redraw();
      },

      deleteAddress: function() {
        var self = this;

        self.blurForm();
        setTimeout(function(){
          util.confirm({
            title:'删除常用地址',
            ok:'删除',
            cancel:'取消',
            status: 'delete'
          }).then(function(msg){
            if(msg == 'ok'){

              var dataReq = {
                  id: self.id(),
                  type: 1
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


      updateAddress: function() {
        // var data = {};
        // data.name = this.name();
        // data.address = this.address();
        // data.phone = this.phone();
        // if (this.id() !== '') {
        //   data.id = this.id();
        // }

        // var dataReq = data;
        // util.extendProp(dataReq, util.COMMON_PARAMS);

        // return m.request({
        //   method: 'POST',
        //   // url: window.apiRootPath + '/rest/user/saveOrUpdateContact',
        //   url: util.INTERFACE_SAVEORUPDATECONTACT,
        //   data: dataReq,
        //   background: true
        // });

        var self = this;
        var dataReq = {};
        dataReq.handler="saveInvoiceContact";
        dataReq.header=JSON.stringify(util.header);
        dataReq.data=JSON.stringify({
          "name":self.name(),
          "phone":self.phone(),
          "address":self.address()
        });
        util.log(dataReq);
        return m.request({
          method: 'get',
          // url: 'http://43.241.208.207:9000/hotel/order?handler=saveLiveInPerson&header={p:"hbgj",Authorization:"FCB15CEA57CCF82A29DA5A6745079B1D",phoneid:"10235"}&data={"name":"丰从越"}',
          url: util.INTERFACE_ADDORDERDATA,
          data: dataReq,
          background: true
        });
      },

      autoFocus: function(element, isInit, context){
        var self = this;
        if(!isInit){
          element.focus(); 
          // self.autoFocusReady(false);
        }
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
        self.phone('');
        self.address('');
        self.id('');

        self.nameExist('');
        self.phoneExist('');
        self.addressExist('');

        self.showDeleteButton(false);
        self.validateName(true);
        self.validatePhone(true);
        self.validateAddress(true);
        // self.autoFocusReady(true);

        document.querySelectorAll('body')[0].style.backgroundColor = '';
      }


    },

    config: function(opt) {
      userAddressForm.viewModel.pageTitle(opt.title);

      if (opt.name) {
        userAddressForm.viewModel.name(opt.name);
        userAddressForm.viewModel.nameExist(true);
      } else {
        userAddressForm.viewModel.name('');
        userAddressForm.viewModel.nameExist(false);
      }
      if (opt.phone) {
        userAddressForm.viewModel.phone(opt.phone);
        userAddressForm.viewModel.phoneExist(true);
      } else {
        userAddressForm.viewModel.phone('');
        userAddressForm.viewModel.phoneExist(false);
      }
      if (opt.address) {
        userAddressForm.viewModel.address(opt.address);
        userAddressForm.viewModel.addressExist(true);
      } else {
        userAddressForm.viewModel.address('');
        userAddressForm.viewModel.addressExist(false);
      }

      if (opt.id != undefined) {
        userAddressForm.viewModel.id(opt.id);
        userAddressForm.viewModel.showDeleteButton(true);
      } else {
        userAddressForm.viewModel.id('');
        userAddressForm.viewModel.showDeleteButton(false);
      }
    },

    controller: function() {

      util.updateTitle(userAddressForm.viewModel.pageTitle());


      userAddressForm.viewModel.validateName(true);
      userAddressForm.viewModel.validatePhone(true);
      userAddressForm.viewModel.validateAddress(true);
      // userAddressForm.viewModel.autoFocusReady(true);

      document.querySelectorAll('body')[0].style.backgroundColor = '#fff';
      util.hideLoading();
      return userAddressForm.viewModel;
    },
    view: function(ctrl) {
      return m('.userAddress-w', [
        // m('.common-header', [
        //   m('.left.common-header-back', {onclick: ctrl.back.bind(ctrl)}),
        //   m('.right.userAddress-ok', {onclick: ctrl.done.bind(ctrl)}, '完成'),
        //   m('.tit', ctrl.pageTitle())
        // ]),
        m('.h30'),
        userAddressForm.addView(ctrl),
        userAddressForm.saveView(ctrl),
        userAddressForm.deleteView(ctrl),
        m('.h30')
      ]);
    },
    addView: function(ctrl) {
      return m('.userAddress-form', [

        m('.userAddress-form-i.common-form-box', [
          m('.userAddress-form-label', '收件人'),
          m('.userAddress-form-input', {
            className: ctrl.validateName() ? '':'common-form-error'
          }, [
            m('input', {
              placeholder: '至少两个汉字',
              oninput: ctrl.writeChange.bind(ctrl, 'value', 'name'),
              value: ctrl.name(),
              onfocus: ctrl.getFocus.bind(ctrl,'validateName'),
              config: ctrl.autoFocus.bind(ctrl)
            })
          ]),
          ctrl.nameExist()?
          m('.common-icon-input-cancel',{
            onclick: ctrl.deleteInput.bind(ctrl,'name')
          }):''
        ]),

        m('.userAddress-form-i.common-form-box', [
          m('.userAddress-form-label', '联系手机'),
          m('.userAddress-form-input', {
            className: ctrl.validatePhone() ? '':'common-form-error'
          }, [
            m('input', {
              placeholder: '用于接收通知',
              oninput: ctrl.writeChange.bind(ctrl, 'value', 'phone'),
              value: ctrl.phone(),
              type: 'tel',
              onfocus: ctrl.getFocus.bind(ctrl, 'validatePhone')
            })
          ]),
          ctrl.phoneExist()?
          m('.common-icon-input-cancel',{
            onclick: ctrl.deleteInput.bind(ctrl,'phone')
          }):''
        ]),

        m('.userAddress-form-i.common-form-box', [
          m('.userAddress-form-label', '地址'),
          m('.userAddress-form-input', {
            className: ctrl.validateAddress() ? '':'common-form-error'
          }, [
            m('textarea', {
              placeholder: '城市、街道、门牌号',
              oninput: ctrl.writeChange.bind(ctrl, 'value', 'address'),
              value: ctrl.address(),
              onfocus: ctrl.getFocus.bind(ctrl, 'validateAddress')
            })
          ]),
          ctrl.addressExist()?
          m('.common-icon-input-cancel',{
            onclick: ctrl.deleteInput.bind(ctrl,'address')
          }):''
        ])

      ]);
    },
    saveView: function(ctrl){
      return m('.common-btn-complete1', {honclick: ctrl.done.bind(ctrl)}, '保存');
    },
    deleteView: function(ctrl) {
      if (ctrl.showDeleteButton()) {
        return m('.common-btn-del', {
          onclick: ctrl.deleteAddress.bind(ctrl)
        }, '删除');
      } else {
        return '';
      }
    }
  };

  return userAddressForm;

})();