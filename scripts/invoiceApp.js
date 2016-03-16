fstar.invoiceApp = (function() {

  var invoiceApp = {

    isInitialized: false,

    viewModel: {

      /**
       *发票 @param Boolean validateBill
       */
      // validateBill: m.prop(false),

      /**
       *寄送方式 @param {Number} sendType
       */
      sendType: m.prop(0),
      
      /**
       *发票抬头 验证 @param Boolean validateInvoice
       *发票抬头 @param String dataInvoice
       *发票抬头 @param String idInvoice
       */
      validateInvoice: m.prop(true),
      dataInvoice: m.prop(''),
      idInvoice: m.prop(''),

      /**
       *收件人 验证 @param Boolean validateName
       *收件人 @param String dataName
       */
      validateName: m.prop(true),
      dataName: m.prop(''),

      /**
       *发票手机号码 验证 @param Boolean validatePhone
       *发票手机号码 @param String dataPhone
       */
      validatePhone: m.prop(true),
      dataPhone: m.prop(''),

      /**
       *详细地址 验证 @param Boolean validateAddress
       *详细地址 @param String dataAddress
       */
      validateAddress: m.prop(true),
      dataAddress: m.prop(''),

      /**
       *邮寄地址 验证 @param Boolean validateUserAddress
       *邮寄地址 @param String dataUserAddress
       *邮寄地址 @param String idUserAddress
       */
      validateUserAddress: m.prop(true),
      dataUserAddress: m.prop(''),
      idUserAddress: m.prop(''),
      payPrice: m.prop(0),

      doComplete: function(){
        var self = this;
        var dataInvoice,dataName,dataPhone,dataAddress,invoiceInfo;
        var errorMsg = '';

        var inputs = document.querySelectorAll('input');
        for(var i=0,len=inputs.length; i < len; i++){
          inputs[i].blur();
        }

        // 发票
        var billError = 0;
        if(self.validateIsNull( dataInvoice = self.dataInvoice() )){
          self.validateInvoice(false);
          billError++;
        } else{
          self.validateInvoice(true);
        };


        // if(self.validateIsNull( dataName = self.dataName() )){
        //   self.validateUserAddress(false);
        //   billError++;
        // } else{
        //   self.validateUserAddress(true);
        // };

        if(self.validateIsNull( dataName = self.dataName() )){
          self.validateName(false);
          billError++;
        } else{
          self.validateName(true);
        };
        if(self.validateIsNotTel( dataPhone = self.dataPhone() )){
          self.validatePhone(false);
          billError++;
        } else{
          self.validatePhone(true);
        };
        if(self.validateIsNull( dataAddress = self.dataAddress() )){
          self.validateAddress(false);
          billError++;
        } else{
          self.validateAddress(true);
        };

        if(billError>0){
          setTimeout(function(){
            util.alert({title:'信息填写错误',content: '发票信息填写错误。请填写发票信息。'});
          },400);
        } else {
          // 防止键盘未退  延时200ms
          setTimeout(function(){
            
            util.confirm({
              title: '确定要提交吗？',
              content: '提交后将无法修改发票信息。',
              ok: '确定',
              cancel: '取消'
            }).then(function(msg) {
              if (msg === 'ok') {
                dataName = self.dataName();
                dataPhone = self.dataPhone();
                dataAddress = self.dataAddress();

                // {\"flyorderid\":\"012356565\",\"invoicetitle\":\"个人\",\"phone\":\"18910798946\",\"address\":\"北京市望京SOHO\",\"receiver\":\"谢恩德\"}
                // 还有一个handler改为addInvoice

                invoiceInfo = {
                  "flyorderid": ''+m.route.param("orderId"),
                  // "mailType": self.sendType(), //邮寄类型
                  "invoicetitle": dataInvoice, //抬头
                  "receiver": dataName,//联系人 
                  "address": dataAddress,//邮寄地址 
                  "phone": dataPhone,//联系人电话 
                  // "type": 0 //发票类型
                };
                var dataReq = {};
                dataReq.handler='addInvoice';
                dataReq.header=JSON.stringify(util.header);
                dataReq.data=JSON.stringify(invoiceInfo);
                util.log(dataReq);
                // alert(JSON.stringify(dataReq));
                m.request({
                  method: 'get',
                  url: util.INTERFACE_ADDORDERDATA,
                  data: dataReq,
                  background: true
                }).then(function(result) {
                  // alert(JSON.stringify(data));
                  if (result.code == 100) {
                    // 返回发票信息
                    invoiceApp.deferred.resolve(invoiceInfo);

                    setTimeout(function(){
                      window.history.back();
                    },100);
                  } else{
                    util.alert({
                      title: '错误',
                      content: result.msg
                    }).then(function(){
                      window.history.back();
                    });
                  }
                });
              }
            }); 
          },400);
        }
      },
      selectType: function(type){
        var self = this;
        self.type(type);
      },

      getUserBill: function(key, validateKey, idKey){
        var self = this;
        self[validateKey](true);
        m.loadRoute('userBill').then(function(userBill){

          setTimeout(function(){
            util.storage.setItem('fstar_bill', self[key]() );
            userBill.config({},{}).then(function(msg){
              self[key](msg.result);
              // self[idKey](msg.id);
              // m.redraw();
              util.storage.removeItem('fstar_bill');
            });
            m.route('userBill',{
              from:'order'
            });

          }, 200);
        })
      },

      getUserAddress: function(key, validateKey, idKey){
        var self = this;
        self['validateName'](true);
        self['validatePhone'](true);
        self['validateAddress'](true);
        m.loadRoute('userAddress').then(function(userAddress){

          setTimeout(function(){
            userAddress.config({ id:self[idKey]() },{}).then(function(msg){
              self[key](msg.result);
              self[idKey](msg.id);
              var userAddressInfo = JSON.parse(msg.result);
              self.dataName(userAddressInfo.name);
              self.dataPhone(userAddressInfo.phone);
              self.dataAddress(userAddressInfo.address);

              // m.redraw();
            });
            m.route('userAddress',{
              from:'order'
            });
          }, 200);
        })
      },

      getFocus: function(key){
        var self = this;
        self[key](true);
      },
      getBlur: function(key, e){
        var self = this;
        // var value = self[key]();
        var value = e.target.value;
        self[key]( value.replace(/\s*/g,'').replace(/-/g,'') );
      },
      onKeyDown: function(key, e) {
        var self = this;
        self[key](e.target.value);
      },

      validateIsNull: function(val){
        return !val;
      },
      validateIsNotTel: function(tel){
        var telephone = tel && tel.replace(/-/g,"");
        return !telephone || !(/^((\+?86)|(\+86))?1[3|4|5|7|8][0-9]\d{8}$/.test(telephone)); 
      },

      onunload: function() {
        var self = this;
        util.log('invoiceApp unload');
        document.querySelectorAll('body')[0].style.backgroundColor = '';
      }
    },

    init: function() {
      util.log('invoiceApp init');
      this.isInitialized = true;
    }
  };

  invoiceApp.config = function(opt) {
    this.deferred = m.deferred();
    invoiceApp.viewModel.payPrice(opt.payPrice);
    return this.deferred.promise;
  };

  invoiceApp.controller = function() {
    if (!invoiceApp.isInitialized) {
      invoiceApp.init();
    }

    util.updateTitle('发票信息');
    util.hideLoading();
    invoiceApp.viewModel.validateInvoice(true);
    invoiceApp.viewModel.validateUserAddress(true);
    document.querySelectorAll('body')[0].style.backgroundColor = '#fff';

    return invoiceApp.viewModel;
  };

  invoiceApp.view = function(ctrl) {
    return m('.invoiceApp-w', [
      // invoiceApp.headView(ctrl),
      invoiceApp.listView(ctrl),
      m('.invoiceApp-ul',[
        m.route.param('isArrivePay') == 2?
        m('.invoiceApp-li','房费发票:请在酒店前台申请/服务费发票:填写后邮寄'):
        m('.invoiceApp-li','发票在您入住且离店后邮寄，不需要向酒店前台申请'),
        m('.invoiceApp-li','发票信息提交后，不可修改。如有特殊需求，请联系客服。'),
        // m('.invoiceApp-li','发票将在离店后，以挂号信寄出。')
      ]),
      m('.common-btn-complete1.invoiceApp-mt100', {honclick: ctrl.doComplete.bind(ctrl)}, '提交'),
      m('.h30'),
    ]);
  };

  // invoiceApp.headView = function(ctrl) {
  //   return m('.invoiceApp-head',[
  //     m('.invoiceApp-head-title','床型偏好'),
  //     m('.invoiceApp-head-explain','我们无法保证满足你的特殊要求，但会尽力尝试。'),
  //     m('.common-border')
  //   ]);
  // };

  invoiceApp.listView = function(ctrl) {
    return [m('.invoiceApp-box',[
        m('ul.common-table2-list', [
          m('li',[
            m('span.label.invoiceApp-vertical-middle', '发票金额'),
            m('span.content', [
              '¥'+ctrl.payPrice()
            ])
          ]),
          m('li',[
            m('span.label.invoiceApp-vertical-middle', '发票明细'),
            m('span.content', [
              '代订房费',
              m('span.invoiceInfo-explain','由旅行社开具')
            ])
          ]),
          m('li',[
            m('span.label.invoiceApp-vertical-middle', '配送方式'),
            m('span.content', [
              m('span.invoiceApp-mail-type',[
                '免费邮寄',
                m('span.invoiceInfo-explain','预计在您离店后10个工作日内送达')
              ])
            ])
          ]),
          m('li.clearfix', [
            m('span.label.invoiceApp-vertical-middle', '发票抬头'),
            m('span.content', [
              m('span.invoiceApp-form-column-box.invoiceApp-form-invoices',
                { className : ctrl.validateInvoice()?'':'invoiceApp-form-error'},[
                    m('input.invoiceApp-form-invoice',{
                      type:'text', 
                      autocomplete:"off",
                      placeholder: '单位/个人名称',
                      value: ctrl['dataInvoice'](),
                      onfocus: ctrl.getFocus.bind(ctrl, 'validateInvoice'),
                      onkeyup: ctrl.onKeyDown.bind(ctrl, 'dataInvoice'),
                      onblur: ctrl.getBlur.bind(ctrl, 'dataInvoice')
                    })
                  ]
              ),
              m('span.invoiceApp-addition',{
                honclick: ctrl.getUserBill.bind(ctrl,'dataInvoice','validateInvoice','idInvoice')
              },[
                m('span.invoiceApp-addition-txt','选择抬头')
              ])
            ])
          ]),
          m('li.clearfix', [
            m('.invoiceApp-address',[
              m('.invoiceApp-form-i.common-form-box.invoiceApp-form-column-box', [
                m('span.invoiceApp-form-label', '收件人'),
                m('.invoiceApp-form-input.invoiceApp-form-add', {
                  className: ctrl.validateName() ? '':'common-form-error'
                }, [
                  m('input', {
                    type: 'text',
                    autocomplete:'off',
                    placeholder: '至少两个汉字',
                    value: ctrl['dataName'](),
                    onfocus: ctrl.getFocus.bind(ctrl, 'validateName'),
                    onkeyup: ctrl.onKeyDown.bind(ctrl, 'dataName'),
                    onblur: ctrl.getBlur.bind(ctrl, 'dataName')
                  })
                ]),
                m('span.invoiceApp-addition',{
                  honclick: ctrl.getUserAddress.bind(ctrl,'dataUserAddress','validateUserAddress','idUserAddress')
                },[
                  m('span.invoiceApp-addition-txt','选择地址')
                ])
              ]),
              m('.invoiceApp-form-i.common-form-box.invoiceApp-form-column-box', [
                m('span.invoiceApp-form-label', '联系手机'),
                m('.invoiceApp-form-input', {
                  className: ctrl.validatePhone() ? '':'common-form-error'
                }, [
                  m('input', {
                    type: 'text',
                    autocomplete:'off',
                    placeholder: '用于接收通知',
                    value: ctrl['dataPhone'](),
                    onfocus: ctrl.getFocus.bind(ctrl, 'validatePhone'),
                    onkeyup: ctrl.onKeyDown.bind(ctrl, 'dataPhone'),
                    onblur: ctrl.getBlur.bind(ctrl, 'dataPhone')
                  })
                ])
              ]),
              m('.invoiceApp-form-i.common-form-box.invoiceApp-form-column-box', [
                m('span.invoiceApp-form-label', '地址'),
                m('.invoiceApp-form-input', {
                  className: ctrl.validateAddress() ? '':'common-form-error'
                }, [
                  m('textarea', {
                    placeholder: '城市、街道、门牌号',
                    autocomplete:'off',
                    value: ctrl['dataAddress'](),
                    onfocus: ctrl.getFocus.bind(ctrl, 'validateAddress'),
                    onkeyup: ctrl.onKeyDown.bind(ctrl, 'dataAddress'),
                    onblur: ctrl.getBlur.bind(ctrl, 'dataAddress')
                  })
                ])
              ])

            ]),
            // m('span.invoiceApp-addition',{
            //   honclick: ctrl.getUserAddress.bind(ctrl,'dataUserAddress','validateUserAddress','idUserAddress')
            // },[
            //   m('span.common-icon-addition')
            // ])
          ]),
        ])
      ]),
      m('.common-border')
    ];
  };


  return invoiceApp;

})();