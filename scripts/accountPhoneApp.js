fstar.accountPhoneApp = (function() {

  var accountPhoneApp = {

    viewModel: {
      pageTitle: m.prop(''),

      phoneNumber: m.prop(''),
      verifyCode: m.prop(''),
      phoneNumberExist: m.prop(false),
      verifyCodeExist: m.prop(false),
      phoneNumberWrong: m.prop(false),
      verifyCodeWrong: m.prop(false),
      countdown: m.prop(false),
      countdownTimer: m.prop(false),

      back: function() {
        window.history.back();
      },

      dismissWrong: function(input) {
        if (input === 1) {
          this.phoneNumberWrong(false);
        } else if (input === 2) {
          this.verifyCodeWrong(false);
        }
      },

      checkInputValue: function() {
        if (this.phoneNumber().trim()) {
          if (util.PHONE_REG.test(this.phoneNumber().trim())) {
            this.phoneNumberWrong(false);
          } else {
            this.phoneNumberWrong(true);
          }
        } else {
          this.phoneNumberWrong(true);
        }

        if (this.verifyCode().trim()) {
          this.verifyCodeWrong(false);
        } else {
          this.verifyCodeWrong(true);
          return false;
        }

        return true;
      },

      doVerify: function() {
        var self = this;

        if (!self.checkInputValue()) {
          return;
        }

        util.showLoading();

        var dataReq = {
            phone: self.phoneNumber(),
            verificationCode: self.verifyCode()
          };
        util.extendProp(dataReq, util.COMMON_PARAMS);

        m.request({
          method: 'POST',
          // url: window.apiRootPath + '/rest/user/updatePhone',
          url: util.INTERFACE_UPDATEPHONE,
          data: dataReq,
          background: true
        }).then(function(data) {
          util.hideLoading();

          if (data.code >= 100 && data.code < 200) {
            // if (data.code == 101) {
            //   util.alert({
            //     title: '首次登录',
            //     content: data.msg
            //   });
            // } 
            self.verifySuccess();
            
            util.userCenter._getWebUserInfo();
            
          } else {
            util.alert({
              title: '错误',
              content: data.msg
            });
          }

        }, function() {
          util.alert({
            content: '网络不给力，请稍后再试试吧',
            ok: '知道了'
          });
          util.hideLoading();
        });
      },
      verifySuccess: function() {
        // m.route('user',{},true);
        window.history.back();
      },
      doCountdown: function(element, isInit, context){
        var self = this;
        if( self.countdownTimer() ){ return ;}
        self.countdownTimer(true);
        var count = 60;
        var countdownTimer = setInterval(function(){
          count--;
          if(count < 1){
            clearInterval(countdownTimer);
            self.countdown(false);
            self.countdownTimer(false);
            m.redraw();
          }
          element.innerHTML = (count + 's后重发');
        },1000)
      },
      sendVerifyCode: function() {
        var self = this;

        if (self.phoneNumber().trim()) {
          if (util.PHONE_REG.test(self.phoneNumber().trim())) {
            self.phoneNumberWrong(false);
          } else {
            self.phoneNumberWrong(true);
            return false;
          }
        } else {
          self.phoneNumberWrong(true);
          return false;
        }
        
        self.countdown(true);

        var dataReq = {
            phone: self.phoneNumber()
          };
        util.extendProp(dataReq, util.COMMON_PARAMS);

        m.request({
          method: 'POST',
          // url: window.apiRootPath + '/rest/user/getVerifyCode',
          url: util.INTERFACE_GETVERIFYCODE,
          data: dataReq
        });
      },
      deleteInput: function(key){
        var self = this;
        self[key]('');
        self[key + 'Exist']( false );
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
      onunload: function() {
        util.log('accountPhoneApp unload');
        this.phoneNumber('');
        this.verifyCode('');
        this.phoneNumberExist(false);
        this.verifyCodeExist(false);
        this.phoneNumberWrong(false);
        this.verifyCodeWrong(false);
        this.countdown(false);
        this.countdownTimer(false);
      }
    },

    config: function(opt) {
      if(opt.title){
        accountPhoneApp.viewModel.pageTitle(opt.title);
      } else {
        accountPhoneApp.viewModel.pageTitle('验证新手机号');
      }
      
    },

    controller: function() {
      util.updateTitle(accountPhoneApp.viewModel.pageTitle());

      util.hideLoading();
      return accountPhoneApp.viewModel;
    },
    view: function(ctrl) {
      return m('.userAddress-w', [
        accountPhoneApp.mainView(ctrl)
      ]);
    },

    mainView: function(ctrl) {
      return m('.verifyApp-mv', [
        m('.verifyApp-row.clearfix', [
          m('.common-form-box1.verifyApp-number-box',[
            m('input.verifyApp-number', {
              className: ctrl.phoneNumberWrong() ? 'wrong' : '',
              type: 'tel', placeholder: '请输入您的手机号', 
              value: ctrl.phoneNumber(),
              oninput: ctrl.writeChange.bind(ctrl, 'value', 'phoneNumber'),
              // onchange: m.withAttr('value', ctrl.phoneNumber),
              onfocus: ctrl.dismissWrong.bind(ctrl, 1)
            }),
            ctrl.phoneNumberExist()?
            m('.common-icon-input-cancel', {
              onclick: ctrl.deleteInput.bind(ctrl,'phoneNumber')
            }):''
          ]),
          
          ctrl.countdown()?
          m('button.verifyApp-countdown', { 
            config: ctrl.doCountdown.bind(ctrl)
          }, '60s后重新获取')
          :m('button.verifyApp-send', {
            onclick: ctrl.sendVerifyCode.bind(ctrl)
          }, '发送验证码')
        ]),
        m('.verifyApp-row.common-form-box1', [
          m('input.verifyApp-code', {
            className: ctrl.verifyCodeWrong() ? 'wrong' : '',
            type: 'tel', placeholder: '验证码',
            value: ctrl.verifyCode(),
            oninput: ctrl.writeChange.bind(ctrl, 'value', 'verifyCode'),
            // onchange: m.withAttr('value', ctrl.verifyCode),
            onfocus: ctrl.dismissWrong.bind(ctrl, 2)
          }),
          ctrl.verifyCodeExist()?
          m('.common-icon-input-cancel', {
            onclick: ctrl.deleteInput.bind(ctrl,'verifyCode')
          }):''
        ]),
        m('button.verifyApp-ok', {onclick: ctrl.doVerify.bind(ctrl)}, '确定')
        // m('.verifyApp-row.verifyApp-footer', [
        //   '点击确定，表示同意',
        //   m('a', {href: ''}, '《酒店预订服务协议》')
        // ])
      ]);
    }
  };

  return accountPhoneApp;

})();