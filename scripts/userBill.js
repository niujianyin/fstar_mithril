__inline('userBillForm.js');

fstar.userBill = (function() {

  var userBill = {

    isInitialized: false,

    viewModel: {

      bills: m.prop([]),
      billToAdd: m.prop(''),
      showSelectBill: m.prop(false),
      resultBill: m.prop(false),
      resultBillId: m.prop(''),

      back: function() {
        window.history.back();
      },

      loadBills: function() {
        // util.showLoading();

        var self = this;

        var dataReq = {};
        dataReq.handler="queryUsedInfoiceInfos";
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
            self.bills(data.usedInvoiceInfos || []);
            
            if( self.bills().length === 0 && !self.resultBill() ){
              fstar.userBillForm.config({
                title: '新增常用发票抬头'
              });
              m.route('userBillForm',{
                single: true,
                source: m.route.param('source')
              }, true);
            } else {
              /**
               *发票抬头 状态 @param Boolean selectBill_0 
               *发票抬头 姓名 @param String dataBill_0
               */
              var hasBill = false;
              // 后台排重是在添加的时候做的   以前数据库有重数据排除不了  所有增加onceSelect
              var onceSelect = true;
              self.bills().map(function(bill, index){

                if( ( bill.name.trim() == self.resultBill() ) && onceSelect ){
                  hasBill = true;
                  onceSelect = false;
                  self['selectBill_'+bill.id] = m.prop(true);
                  // self.resultBill( bill.name );
                } else {
                  self['selectBill_'+bill.id] = m.prop(false);
                }
                self['dataBill_'+bill.id] = m.prop(bill.name);
              });

              if(!hasBill){
                if( self.resultBill() ) {
                  self.bills().unshift({
                    id: 'bid1',
                    name: self.resultBill()
                  });
                  self['selectBill_bid1'] = m.prop(true);
                  self['dataBill_bid1'] = m.prop(self.resultBill());
                } else {
                  self['selectBill_'+self.bills()[0].id] = m.prop(true);
                  self.resultBill( self.bills()[0].name );
                }
              }
              
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

        fstar.userBillForm.config({
          title: '新增常用发票抬头'
        });
        m.route('userBillForm');
      },

      goToEdit: function(bill, editIndex) {
        var self = this;

        fstar.userBillForm.config({
          title: '编辑常用发票抬头',
          id: bill.id,
          name: bill.name
        });

        m.route('userBillForm');
      },

      doComplete: function(){
        var self = this;
        var result = self.resultBill();
        // var id = self.resultBillId();
        if(!result){ 
          util.alert({title:'请选择发票抬头'});
          return;
        }
        userBill.deferred.resolve({
          "result": result
        });
        setTimeout(function(){
          window.history.back();
        },300);
      },
      resetBills: function(){
        var self = this;
        self.bills().map(function(bill,index){
          self['selectBill_'+bill.id] = m.prop(false);
        });
      },
      selectBill: function(key){
        var self = this;
        self.resetBills();
        self['selectBill_'+key](true);
        // util.log( self['dataBill_'+key]() );
        self.resultBill( self['dataBill_'+key]() );
        // self.resultBillId( key );
        // self[key]()? self[key](false): self[key](true);
      },

      onunload: function() {
        var self = this;
        util.log('userBill unload');
        self.bills([]);
        self.billToAdd('');
        self.showSelectBill(false);
        self.resultBill('');
        // self.resultBillId('');

        document.querySelectorAll('body')[0].style.backgroundColor = '';
      }
    },

    init: function() {
      util.log('userBill init');

      window.__realRoutes.userBillForm = fstar.userBillForm;

      this.isInitialized = true;
    }
  };

  userBill.config = function(opt,opt1) {
    this.deferred = m.deferred();
    // if( opt.id ){
    //   userBill.viewModel.resultBillId(opt.id);
    // }

    // if( !!opt.bill ){
    //   userBill.viewModel.resultBill(opt.bill.trim());
    // } else {
    //   userBill.viewModel.resultBill(false);
    // }
    
    return this.deferred.promise;
  };

  userBill.controller = function() {
    if (!userBill.isInitialized) {
      userBill.init();
    }

    util.updateTitle('常用发票抬头');


    var from = m.route.param('from');
    if(from === 'order'){
      userBill.viewModel.showSelectBill(true);
      var bill = util.storage.getItem('fstar_bill');
      if( !!bill ){
        userBill.viewModel.resultBill(bill.trim());
      } else {
        userBill.viewModel.resultBill(false);
      }
    } else {
      userBill.viewModel.showSelectBill(false);
      userBill.viewModel.resultBill(false);
      // util.storage.removeItem('fstar_bill');
    }

    

    userBill.viewModel.loadBills();

    document.querySelectorAll('body')[0].style.backgroundColor = '#fff';

    // _czc.push(﻿['_trackEvent', '发票页','发票页:进入', util.COMMON_PARAMS.comm_cityName +':'+util.PLATFORM.CURRENT_STR+':'+util.OS]);

    return userBill.viewModel;
  };

  userBill.view = function(ctrl) {
    return m('.userBill-w', [
      // m('.common-header', [
      //   m('.left.common-header-back', {onclick: ctrl.back.bind(ctrl)}),
      //   m('.tit', '常用发票抬头'),
      //   ctrl.showSelectBill()? m('.common-btn-complete', {onclick: ctrl.doComplete.bind(ctrl)}, '完成') : ''
      // ]),
      userBill.listView(ctrl),
      userBill.addView(ctrl),
      ctrl.showSelectBill() ? m('.common-btn-complete1.mt30', {honclick: ctrl.doComplete.bind(ctrl)}, '完成') : '',
      m('.h30')
    ]);
  };

  userBill.listView = function(ctrl) {
    return m('ul.userBill-list', ctrl.bills().map(function(bill, index) {
      return ctrl.showSelectBill()? 
      m('li.userBill-item', {className: ctrl['selectBill_'+bill.id]()? 'userBill-radio-select':'',onclick: ctrl.selectBill.bind(ctrl, bill.id)},[
        m('span.userBill-radio-circle-big'),
        m('span.userBill-radio-circle-small'),
        m('.userBills-name', ctrl['dataBill_'+bill.id]())
      ])
      :m('li', {onclick: ctrl.goToEdit.bind(ctrl, bill, index)}, [
        m('.userBill-name', bill.name),
        m('.userBill-arrow-right.common-icon-more-right')
      ]);
    }));
  };

  userBill.addView = function(ctrl) {
    return m('.common-btn-add', {onclick: ctrl.goToAdd.bind(ctrl)}, '添加常用发票抬头');
    // return m('.userBill-add.common-input-add', [
    //   m('input', {
    //     onchange: m.withAttr('value', ctrl.billToAdd),
    //     value: ctrl.billToAdd(), 
    //     placeholder: '+ 添加发票抬头', 
    //     onblur: ctrl.addBill.bind(ctrl)
    //   })
    // ]);
  };


  return userBill;

})();