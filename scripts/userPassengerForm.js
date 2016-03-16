fstar.userPassengersForm = (function() {

  var userPassengersForm = {

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
      validateIsNotName: function(val){
        /**
         *1. 首先会去掉首尾的空格
         *2. 中文名格式 全中文、中间 空格 可有可无，长度2 到20位： 测试、测 试、测试王
         *3. 英文名 长度2 到20位 英文可以包含（非首个字母）/ . 空格  字母和字母中间空格只可包含一个 格式： Last/Frist Middle ，Middle前有空格，长度2到20： qgi/qq  li  aa.bb   a bb 
         *4. 中文和英文不能混合使用   
         *5. 不可包含数字
         */
        val = val.trim();
        if(val.length < 2){ return true};
        return !val || !(/^([\u4e00-\u9fa5\s]{2,20}|([a-zA-Z\/\.]+\s?)+)$/.test(val));
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
        var userPassengersError = 0;
        var errorMsg = '';
        
        if(self.validateIsNotName( name )){
          self.validateName(false);
          userPassengersError++;
          errorMsg += '常用入住人';
        } else{
          self.validateName(true);
        };

        if( userPassengersError == 0 ){
          self.updatePassengers().then(function(data) {
            if (data.code == 100) {
              self.blurForm();
              setTimeout(function(){
                if(m.route.param('source') == 'userHome'){
                  m.route('userPassengers',{},true);
                } else {
                  if( m.route.param('single') && (m.route.param('source') == 'order') ){
                    fstar.userPassengers.deferred.resolve( {
                      "result": [data.passengers[0].name],
                      "id": data.passengers[0].id
                    } );
                  } else {
                    var filterPassengers = (JSON.parse( util.storage.getItem('fstar_passengers') ) || []);
                    
                    if( filterPassengers.indexOf(data.passengers[0].name) == -1 ){
                      filterPassengers.unshift(data.passengers[0].name);
                      util.storage.setItem('fstar_passengers',JSON.stringify( filterPassengers ) );
                    }
                    // fstar.userPassengers.viewModel.resultPassenger( data.passengers[0].name );
                  }
                  window.history.back();

                }
              },200);
              
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

      deletePassengers: function() {
        var self = this;
        self.blurForm();
        setTimeout(function(){
          util.confirm({
            title:'删除常用入住人',
            ok:'删除',
            cancel:'取消',
            status: 'delete'
          }).then(function(msg){
            if(msg == 'ok'){

              var dataReq = {
                  id: self.id(),
                  type: 3
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

      updatePassengers: function() {
        var self = this;
        var dataReq = {};
        dataReq.handler="saveLiveInPerson";
        dataReq.header=JSON.stringify(util.header);
        dataReq.data=JSON.stringify({"name":self.name()});
        util.log(dataReq);
        return m.request({
          method: 'get',
          // url: 'http://43.241.208.207:9000/hotel/order?handler=saveLiveInPerson&header={p:"hbgj",Authorization:"FCB15CEA57CCF82A29DA5A6745079B1D",phoneid:"10235"}&data={"name":"丰从越"}',
          url: util.INTERFACE_ADDORDERDATA,
          data: dataReq,
          background: true
        })



        // var data = {
        //   passengers:[{}]
        // };
        // data.passengers[0].name = this.name();
        // if (this.id() !== '') {
        //   data.passengers[0].id = this.id();
        // }
        // var dataReq = data;
        // util.extendProp(dataReq, util.COMMON_PARAMS);

        // return m.request({
        //   method: 'POST',
        //   // url: window.apiRootPath + '/rest/user/saveOrUpdatePassenger',
        //   url: util.INTERFACE_SAVEORUPDATEPASSENGER,
        //   data: dataReq,
        //   background: true
        // });
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
      userPassengersForm.viewModel.pageTitle(opt.title);

      if (opt.name) {
        userPassengersForm.viewModel.name(opt.name);
        userPassengersForm.viewModel.nameExist(true);
      } else {
        userPassengersForm.viewModel.name('');
        userPassengersForm.viewModel.nameExist(false);
      }

      if (opt.id != undefined) {
        userPassengersForm.viewModel.id(opt.id);
        userPassengersForm.viewModel.showDeleteButton(true);
      } else {
        userPassengersForm.viewModel.id('');
        userPassengersForm.viewModel.showDeleteButton(false);
      }
    },

    controller: function() {
      util.updateTitle(userPassengersForm.viewModel.pageTitle());
      userPassengersForm.viewModel.validateName(true);
      document.querySelectorAll('body')[0].style.backgroundColor = '#fff';
      util.hideLoading();
      return userPassengersForm.viewModel;
    },
    view: function(ctrl) {
      return m('.userPassengers-w', [
        m('.h30'),
        userPassengersForm.addView(ctrl),
        userPassengersForm.saveView(ctrl),
        userPassengersForm.deleteView(ctrl),
        m('.h30')
      ]);
    },
    addView: function(ctrl) {
      return m('.userPassengers-form.common-form-box', [
        m('.userPassengers-add.common-input-add', {
          className: ctrl.validateName()? '': 'common-form-error'
        }, [
          m('input', {
            oninput: ctrl.writeChange.bind(ctrl, 'value', 'name'),
            value: ctrl.name(), 
            placeholder: '姓名',
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
          onclick: ctrl.deletePassengers.bind(ctrl)
        }, '删除');
      } else {
        return '';
      }
    }
  };

  return userPassengersForm;

})();