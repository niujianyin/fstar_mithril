fstar.verifyApp = (function() {

  var verifyApp = {

    isInitialized: false,

    viewModel: {
      phoneNumber: m.prop(''),
      verifyCode: m.prop(''),
      phoneNumberExist: m.prop(false),
      verifyCodeExist: m.prop(false),
      phoneNumberWrong: m.prop(false),
      verifyCodeWrong: m.prop(false),
      countdown: m.prop(false),
      countdownTimer: m.prop(false),
      mode: m.prop('login'),

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
        if (this.phoneNumber().trim() || util.PHONE_REG.test(this.phoneNumber().trim())) {
          this.phoneNumberWrong(false);
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
          // url: window.apiRootPath + '/rest/user/login',
          url: self.mode() == 'update' ? util.INTERFACE_UPDATEPHONE : util.INTERFACE_LOGIN,
          data: dataReq,
          background: true
        }).then(function(data) {
          util.hideLoading();

          if (data.code >= 100 && data.code < 200) {
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
        // var param = {
        //     data: m.route.param('data')
        //   };

        if (m.route.param('toRoute')) {
          // if(m.route.param('toRoute') == 'order'){

            // m.request({
            //   method: 'GET',
            //   url: window.apiRootPath + '/rest/user/getAccountInfo',
            //   background: true
            // }).then(function(data) {
              // param['userMoney'] = (data && data.vouchers) || 0;
            // util.storage.setItem('fstar_hotelInfo',m.route.param('data') || '{}' );
            m.route(m.route.param('toRoute'), JSON.parse( m.route.param('data') ), m.route.param('replaceHistory') === 'true');

            // }, function() {
            //   util.alert({
            //     title: '错误',
            //     content: '您的网络出现问题了！'
            //   });
            //   util.hideLoading();
            // });
          // } else {
          //   m.route(m.route.param('toRoute'), JSON.parse( m.route.param('data') ), m.route.param('replaceHistory') === 'true');
          // }
        } else {
          window.history.back();
        }
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
        util.log('verifyApp unload');
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

    init: function() {
      // 只初始化了一次，所以css文件只加载了一次
      this.isInitialized = true;
    },

    controller: function() {
      // 只需初始化一次即可
      if (!verifyApp.isInitialized) {
        util.log('verifyApp is initialized');
        verifyApp.init();
      }

      util.updateTitle(m.route.param('title') || '登录');

      verifyApp.viewModel.mode(m.route.param('mode') || 'login');

      util.hideLoading();

      // _czc.push(﻿['_trackEvent', '登录页','登录页:进入', util.COMMON_PARAMS.comm_cityName +':'+util.PLATFORM.CURRENT_STR+':'+util.OS]);

      return verifyApp.viewModel;
    },

    view: function(ctrl) {
      return [
        // m('.xct', '宣传图，暂缺'),
        verifyApp.mainView(ctrl)
      ]
    },

    mainView: function(ctrl) {
      return m('.verifyApp-mv', [

        m.route.param('info') ? m('.verifyApp-title', m.route.param('info')) : null,

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
          }, '60s后重发')
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


  return verifyApp;

})();