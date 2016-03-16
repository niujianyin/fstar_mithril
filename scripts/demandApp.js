fstar.demandApp = (function() {

  var demandApp = {

    isInitialized: false,

    viewModel: {

      type: m.prop('对床型无要求'),
      typeResult: m.prop('对床型无要求'),
      bedTypes: m.prop(['对床型无要求','尽量双床','尽量大床']),
      supplierName: m.prop(false),

      back: function() {
        window.history.back();
      },

      doComplete: function(){
        var self = this;
        self.typeResult(self.type());

        demandApp.deferred.resolve({
          "type": self.typeResult()
        });
      },
      selectType: function(type){
        var self = this;
        // self.type(type);
        // self.typeResult(self.type());

        demandApp.deferred.resolve({
          "type": type
        });
      },

      onunload: function() {
        var self = this;
        util.log('userBill unload');
        self.type('对床型无要求');
        self.typeResult('对床型无要求');

        document.querySelectorAll('body')[0].style.backgroundColor = '';
      }
    },

    init: function() {
      util.log('demandApp init');
      this.isInitialized = true;
    }
  };

  demandApp.config = function(opt) {
    this.deferred = m.deferred();
    if( opt.type ){
      demandApp.viewModel.type(opt.type);
      demandApp.viewModel.typeResult(opt.type);
    } else {
      demandApp.viewModel.type('对床型无要求');
      demandApp.viewModel.typeResult('对床型无要求');
    }
    
    return this.deferred.promise;
  };

  demandApp.controller = function() {
    if (!demandApp.isInitialized) {
      demandApp.init();
    }

    util.updateTitle('特殊要求');
    util.hideLoading();
    // demandApp.viewModel.supplierName(m.route.param('supplierName'));
    document.querySelectorAll('body')[0].style.backgroundColor = '';

    // _czc.push(﻿['_trackEvent', '床型选择页','床型选择页:进入', util.COMMON_PARAMS.comm_cityName +':'+util.PLATFORM.CURRENT_STR+':'+util.OS]);

    return demandApp.viewModel;
  };

  demandApp.view = function(ctrl) {
    return m('.demandApp-w', [
      demandApp.headView(ctrl),
      demandApp.listView(ctrl),
      // m('.common-btn-complete1.demandApp-mt100', {onclick: ctrl.doComplete.bind(ctrl)}, '确认')
    ]);
  };

  demandApp.headView = function(ctrl) {
    return m('.demandApp-head',[
      m('.demandApp-head-title','床型偏好'),
      m('.demandApp-head-explain','会尽力和酒店沟通，但无法保证酒店会满足你的特殊要求。'),
      m('.common-border')
    ]);
  };

  demandApp.listView = function(ctrl) {
    return m('.demandApp-box',[
      m('.common-border'),
      m('ul.demandApp-list', ctrl.bedTypes().map(function(type, index) {
        return m('li.demandApp-item', {className: (type == ctrl.type())? 'demandApp-select':'',honclick: ctrl.selectType.bind(ctrl, type)},[
          m('span.demandApp-radio-circle-big'),
          m('span.demandApp-radio-circle-small'),
          m('span.demandApp-name', type)
        ])
      }))
    ]);
  };


  return demandApp;

})();