__inline('userPassengerForm.js');


fstar.userPassengers = (function() {
  var userPassengers = {
    isInitialized: false,
    viewModel: {
      passengers: m.prop([]),
      passengerToAdd: m.prop(''),
      showSelectPassenger: m.prop(false),
      resultPassenger: m.prop(''),

      checkInPersons: m.prop([]),
      selectedPassengers: m.prop([]),
      maxNum: m.prop(1),

      back: function() {
        window.history.back();
      },

      loadPassengers: function() {
        util.showLoading();
        var self = this;
        var dataReq = {};
        dataReq.handler="queryLiveInPersons";
        dataReq.header=JSON.stringify(util.header);
        dataReq.data=JSON.stringify({});
        util.log(dataReq);
        m.request({
          method: 'get',
          // url: 'http://43.241.208.207:9000/hotel/order?handler=queryLiveInPersons&header={p:"hbgj",Authorization:"FCB15CEA57CCF82A29DA5A6745079B1D",phoneid:"10235"}&data={}',
          url: util.INTERFACE_ADDORDERDATA,
          data: dataReq
        }).then(function(data) {
          util.log(data);
          if (data && data.code == '100' ) {
            self.passengers([]);
            var allPassengers = [], passenger, filterPassengers = [];
            allPassengers = data.passengers || [];

            // 来源于 order
            if( self.showSelectPassenger() ){
              for(var i=0,len= self.checkInPersons().length; i<len; i++){
                var name = self.checkInPersons()[i];
                self.selectedPassengers().push({
                  id: ('aa'+i)
                });
                self['selectCustomer_aa'+i] = m.prop(true);
                self['dataCustomer_aa'+i] = m.prop(name);
              }
             
              var hasPassenger = true;
              for(var i=0,len= allPassengers.length; i<len; i++){
                passenger = allPassengers[i];
                if( self.checkInPersons().indexOf(passenger.name) != -1 ){
                  continue;
                }
                filterPassengers.push(passenger);
                self['dataCustomer_'+passenger.id] = m.prop(passenger.name.trim());
                if( hasPassenger && !self.checkInPersons().length ){
                  hasPassenger = false;
                  self['selectCustomer_'+passenger.id] = m.prop(true);
                } else {
                  self['selectCustomer_'+passenger.id] = m.prop(false);
                }
              }
            } else {
              filterPassengers = allPassengers;
            }

            self.passengers(filterPassengers);

            if( self.passengers().length === 0 && self.checkInPersons().length === 0 ){
              fstar.userPassengersForm.config({
                title: '新增常用入住人'
              });
              m.route('userPassengersForm',{
                single: true,
                source: m.route.param('source') || 'order'
              }, true);
            } else {
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

        var result = [];
        var list = document.getElementById('userPassengers-list');
        var elesBlue = list.querySelectorAll('.common-icon-square-blue');
        for(var i = 0, len = elesBlue.length; i<len; i++){
          result.push(elesBlue[i].getAttribute('dataValue').trim());
        } 
        var max = self.maxNum();
        if( result.length >= max ){
          result.splice(max-1);
        }
        util.storage.setItem('fstar_passengers',JSON.stringify( result ) );

        fstar.userPassengersForm.config({
          title: '新增常用入住人'
        });
        m.route('userPassengersForm');
      },

      goToEdit: function(passenger, editIndex) {
        var self = this;

        fstar.userPassengersForm.config({
          title: '编辑常用入住人',
          id: passenger.id,
          name: passenger.name
        });

        m.route('userPassengersForm');
      },

      doComplete: function(){
        var self = this;

        var result = [];
        var list = document.getElementById('userPassengers-list');
        // var elesGray = list.querySelectorAll('.common-icon-square-gray');
        var elesBlue = list.querySelectorAll('.common-icon-square-blue');

        // for(var i = 0, len = elesGray.length; i<len; i++){
        //   result.push(elesGray[i].getAttribute('dataValue').trim());
        // } 
        for(var i = 0, len = elesBlue.length; i<len; i++){
          result.push(elesBlue[i].getAttribute('dataValue').trim());
        } 

        if(!result.length){ 
          util.alert({title:'请选择入住人'});
          return;
        }

        if( result.length > self.maxNum() ){ 
          util.alert({title:'请选择'+self.maxNum()+'名入住人',content: '每个房间只填写1名入住人。你预定了'+self.maxNum()+'个房间。'});
          return;
        }
        // self.resultPassenger()
        userPassengers.deferred.resolve( {
          "result": result
        } );

        setTimeout(function(){
          window.history.back();
        },300);
      },
      resetPassengers: function(){
        var self = this;
        self.passengers().map(function(passenger,index){
          self['selectCustomer_'+passenger.id] = m.prop(false);
        });
      },
      selectPassenger: function(key){
        var self = this;
        self[key]()?self[key](false):self[key](true);

        var max = self.maxNum();
        var passengers = self.passengers();
        var selectpassengers = self.selectedPassengers();
        var curSelect = 0;

        if(max==1){
          for(var j=0,jl=selectpassengers.length; j<jl; j++){
            self['selectCustomer_'+selectpassengers[j].id](false);
          }
          for(var i=0,len=passengers.length; i<len; i++){
            self['selectCustomer_'+passengers[i].id](false);
          }
          self[key](true);
        } else { 
          
          for(var j=0,jl=selectpassengers.length; j<jl; j++){
            if(self['selectCustomer_'+selectpassengers[j].id]()){
              curSelect++;
            }
          }
          for(var i=0,len=passengers.length; i<len; i++){
            if(self['selectCustomer_'+passengers[i].id]()){
              curSelect++;
            }
          }
          if( curSelect > max ){
            util.alert({title:'最多选择'+self.maxNum()+'名入住人',content: '每个房间只填写1名入住人。你预定了'+self.maxNum()+'个房间。'});
            self[key](false);
            return;
          }
        }
      },

      onunload: function() {
        var self = this;
        // util.log('userPassengers unload');
        self.passengers([]);
        self.passengerToAdd('');
        self.showSelectPassenger(false);
        self.resultPassenger('');
        self.selectedPassengers([]);
        document.querySelectorAll('body')[0].style.backgroundColor = '';
      }
    },

    init: function() {
      // util.log('userPassengers init');
      window.__realRoutes.userPassengersForm = fstar.userPassengersForm;
      this.isInitialized = true;
    }
  };

  userPassengers.config = function(opt,opt1) {
    this.deferred = m.deferred();

    if( opt.maxNum ){
      userPassengers.viewModel.maxNum(opt.maxNum);
    } else {
      userPassengers.viewModel.maxNum(1);
    }
    
    return this.deferred.promise;
  };

  userPassengers.controller = function() {
    if (!userPassengers.isInitialized) {
      userPassengers.init();
    }
    util.updateTitle('常用入住人');

    var from = m.route.param('from');
    if(from === 'order'){
      userPassengers.viewModel.showSelectPassenger(true);
      userPassengers.viewModel.checkInPersons( (JSON.parse( util.storage.getItem('fstar_passengers') ) || []) );
    } else {
      userPassengers.viewModel.showSelectPassenger(false);
      userPassengers.viewModel.checkInPersons([]);
    }

    userPassengers.viewModel.loadPassengers();
    document.querySelectorAll('body')[0].style.backgroundColor = '#fff';
    return userPassengers.viewModel;
  };

  userPassengers.view = function(ctrl) {
    return m('.userPassengers-w', [
      userPassengers.listView(ctrl),
      userPassengers.addView(ctrl),
      m('.h152'),
      m('.userPassengers-fixed',[
        ctrl.showSelectPassenger() ? m('.common-btn-complete1.mt20', {honclick: ctrl.doComplete.bind(ctrl)}, '完成') : '',
        m('.h20')
      ]),
    ]);
  };

  userPassengers.listView = function(ctrl) {
    return m('ul.userPassengers-list#userPassengers-list', [
      ctrl.selectedPassengers().map(function(passenger, index) {
        return m('li.userPassengers-list-item.userPassengers-radio-select', {onclick: ctrl.selectPassenger.bind(ctrl, 'selectCustomer_'+passenger.id)}, [
          m('span.userPassengers-checkbox-square', {
            className: ctrl['selectCustomer_'+passenger.id]()? 'common-icon-square-blue':'common-icon-square-default',
            dataValue: ctrl['dataCustomer_'+passenger.id]()
          }),
          m('.userPassengers-name', ctrl['dataCustomer_'+passenger.id]() )
        ])
      }),

      ctrl.passengers().map(function(passenger, index) {
      return ctrl.showSelectPassenger()? 
        m('li.userPassengers-list-item', {onclick: ctrl.selectPassenger.bind(ctrl, 'selectCustomer_'+passenger.id)},[
          m('span.userPassengers-checkbox-square',{
            className: ctrl['selectCustomer_'+passenger.id]()? 'common-icon-square-blue':'common-icon-square-default',
            dataValue: ctrl['dataCustomer_'+passenger.id]()
          }),
          m('.userPassengers-name', ctrl['dataCustomer_'+passenger.id]())
        ])
        :m('li',{onclick: ctrl.goToEdit.bind(ctrl, passenger, index)}, [
          m('.userPassengers-name', passenger.name),
          m('.userPassengers-arrow-right.common-icon-more-right')
        ])
      }),
    ]);
  };

  userPassengers.addView = function(ctrl) {
    return m('.common-btn-add', {honclick: ctrl.goToAdd.bind(ctrl)}, '添加常用入住人');
  };

  return userPassengers;
})();