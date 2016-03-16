__inline('userAddressForm.js');


fstar.userAddress = (function() {

  var userAddress = {

    isInitialized: false,

    viewModel: {

      showSelectAddress: m.prop(false),
      resultAddress: m.prop(''),
      resultAddressId: m.prop(''),

      addresses: m.prop([]),

      back: function() {
        window.history.back();
      },

      loadAddress: function() {
        // util.showLoading();

        var self = this;

        var dataReq = {};
        dataReq.handler="queryInvoiceContacts";
        dataReq.header=JSON.stringify(util.header);
        dataReq.data=JSON.stringify({});
        util.log(dataReq);
        m.request({
          method: 'get',
          // url: 'http://43.241.208.207:9000/hotel/order?handler=queryLiveInPersons&header={p:"hbgj",Authorization:"FCB15CEA57CCF82A29DA5A6745079B1D",phoneid:"10235"}&data={}',
          url: util.INTERFACE_ADDORDERDATA,
          data: dataReq,
          background: true
        }).then(function(data) {
          util.log(data);
          if (data && data.code == '100' ) {
            self.addresses(data.contacts || []);

            if( self.addresses().length === 0 ){
              fstar.userAddressForm.config({
                title: '新增常用地址'
              });
              m.route('userAddressForm',{
                single: true,
                source: m.route.param('source')
              }, true);
            } else {
              /**
               *常用邮寄地址 状态 @param Boolean selectAddress_0 
               *常用邮寄地址 姓名 @param String dataAddress_0
               */
              self.addresses().map(function(address,index){

                if( address.id== self.resultAddressId() || (!self.resultAddressId()&&index===0 ) ){
                  self['selectAddress_'+address.id] = m.prop(true);
                  self.resultAddress( JSON.stringify(address) );
                } else {
                  self['selectAddress_'+address.id] = m.prop(false);
                }
                self['dataAddress_'+address.id] = m.prop( JSON.stringify(address) );
              });
              // m.redraw();
              util.hideLoading();
              util.redraw();
            }
          } else {
            util.alert({
              title: '错误',
              content: data.msg
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

      goToAdd: function() {
        var self = this;

        fstar.userAddressForm.config({
          title: '新增常用地址'
        });
        m.route('userAddressForm');
      },

      goToEdit: function(address, editIndex) {
        var self = this;

        fstar.userAddressForm.config({
          title: '编辑常用地址',
          id: address.id,
          name: address.name,
          phone: address.phone,
          address: address.address
        });

        m.route('userAddressForm');
      },

      doComplete: function(){
        var self = this;
        var result = self.resultAddress();
        var id = self.resultAddressId();
        if(!result){ 
          util.alert({title:'请选择常用地址'});
          return;
        }
        userAddress.deferred.resolve( {
          "result": result,
          "id": id
        } );
        setTimeout(function(){
          window.history.back();
        },300);
      },
      resetAddress: function(){
        var self = this;
        self.addresses().map(function(address,index){
          self['selectAddress_'+address.id] = m.prop(false);
        });
      },
      selectAddress: function(key){
        var self = this;
        self.resetAddress();
        self['selectAddress_'+key](true);
        // util.log( self['dataBill_'+key]() );
        self.resultAddress( self['dataAddress_'+key]() );
        self.resultAddressId( key );
        // self[key]()? self[key](false): self[key](true);
      },

      onunload: function() {
        var self = this;
        util.log('userAddress unload');
        self.showSelectAddress(false);
        self.resultAddress('');
        // self.resultAddressId('');
        self.addresses([]);
        document.querySelectorAll('body')[0].style.backgroundColor = '';
      }
    },

    init: function() {
      util.log('userAddress init');

      window.__realRoutes.userAddressForm = fstar.userAddressForm;

      this.isInitialized = true;
    }
  };

  userAddress.config = function(opt,opt1) {
    this.deferred = m.deferred();
    if( opt.id ){
      userAddress.viewModel.resultAddressId(opt.id);
    }
    return this.deferred.promise;
  };

  userAddress.controller = function() {
    if (!userAddress.isInitialized) {
      userAddress.init();
    }


    util.updateTitle('常用地址');

    var from = m.route.param('from');
    if(from === 'order'){
      userAddress.viewModel.showSelectAddress(true);
    } else {
      userAddress.viewModel.showSelectAddress(false);
    }

    userAddress.viewModel.loadAddress();

    document.querySelectorAll('body')[0].style.backgroundColor = '#fff';

    return userAddress.viewModel;
  };

  userAddress.view = function(ctrl) {
    return m('.userAddress-w', [
      // m('.common-header', [
      //   m('.left.common-header-back', {onclick: ctrl.back.bind(ctrl)}),
      //   m('.tit', '常用邮寄地址'),
      //   ctrl.showSelectAddress()? m('.common-btn-complete', {onclick: ctrl.doComplete.bind(ctrl)}, '完成') : ''
      // ]),
      userAddress.listView(ctrl),
      userAddress.addView(ctrl),
      ctrl.showSelectAddress() ? m('.common-btn-complete1.mt30', {honclick: ctrl.doComplete.bind(ctrl)}, '完成') : '',
      m('.h30')
    ]);
  };

  userAddress.listView = function(ctrl) {
    return m('ul.userAddress-list', ctrl.addresses().map(function(address, index) {
      return ctrl.showSelectAddress()? 
      m('li.userAddress-item', {className: ctrl['selectAddress_'+address.id]()? 'userAddress-radio-select':'',onclick: ctrl.selectAddress.bind(ctrl, address.id)},[
        m('span.userAddress-radio-circle-big'),
        m('span.userAddress-radio-circle-small'),
        m('.userAddress-item-box', [
          m('.userAddress-name', [
            address.name,
            m('span', address.phone)
          ]),
          m('.userAddress-address', address.address)
        ])
      ])
      :m('li', {onclick: ctrl.goToEdit.bind(ctrl, address, index)}, [
        m('.userAddress-name', [
          address.name,
          m('span', address.phone)
        ]),
        m('.userAddress-address', address.address),
        m('.userAddress-arrow-right.common-icon-more-right')
      ]);
    }));
  };

  userAddress.addView = function(ctrl) {
    return m('.common-btn-add', {onclick: ctrl.goToAdd.bind(ctrl)}, '添加常用地址');
  };


  return userAddress;

})();




