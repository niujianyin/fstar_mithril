;(function() {


  var nativeOrder = {

    viewModel: {
      n: m.prop(''), //酒店名称
      ci: m.prop(''), //入住时间
      co: m.prop(''), //离店时间
      r: m.prop(''), //房型
      b: m.prop(''), //单早
      rc: m.prop(''), //1间
      pt: m.prop(''), //1-到付酒店 4-预付酒店（下单进入支付流程） 6-部分付（p2p到付）  7-担保到付
      rp: m.prop(''), //付款价格
      olp: m.prop(''), //到付
      load: function() {
        var self = this;

        var dataReq = {
            orderId: this.id()
          };
        util.extendProp(dataReq, util.COMMON_PARAMS);

        m.request({
          // url: window.apiRootPath + '/rest/order/getOrderInfo',
          url: util.INTERFACE_GETORDERINFO,
          data: {param: JSON.stringify(dataReq)},
          background: true
        }).then(function(data) {

          if (data && data.code == 100) {
            self.n(data.orderInfo.hotelName);
            self.r(data.orderInfo.roomTypeName);
            self.b(util.BREAKFASE_TYPE[data.orderInfo.breakfastQty]);
            self.rc(data.orderInfo.roomCount);
            var checkIn = new Date(data.orderInfo.checkIn.replace(/-/g, '/'));
            var checkOut = new Date(data.orderInfo.checkOut.replace(/-/g, '/'));
            self.ci(util.dateFormatFmt(checkIn, 'MM/dd') + '（' + util.getCurrentWeek(checkIn) + '）');
            self.co(util.dateFormatFmt(checkOut, 'MM/dd') + '（' + util.getCurrentWeek(checkOut) + '）');
            
            m.redraw();
          }

        });
      }
    },

    controller: function() {
      util.hideLoading();
      var vm = nativeOrder.viewModel;
      util.extend(vm, JSON.parse(decodeURIComponent(location.search.substring(11))));


      // if (vm.id && vm.id()) {
      //   vm.load();
      // } else {
        var checkIn = vm.ci();
        var checkOut = vm.co();

        checkIn = new Date(checkIn.replace(/-/g, '/'));
        checkOut = new Date(checkOut.replace(/-/g, '/'));

        vm.ci(util.dateFormatFmt(checkIn, 'MM/dd'));
        vm.co(util.dateFormatFmt(checkOut, 'MM/dd'));
      // }

      return nativeOrder.viewModel;
    },

    view: function(ctrl) {
      return [
        m('h1', ctrl.n()),
        m('p', [
          [ctrl.ci()+'至'+ctrl.co(), ctrl.r(), ctrl.b(), ctrl.rc() + '间'].join('·')
        ]),
        m('p',(function(ctrl){
          //1-到付酒店 4-预付酒店（下单进入支付流程） 6-部分付（p2p到付）  7-担保到付
          var pt = ctrl.pt();
          var paytxt = '在线付';
          var offlinepay = false;
          var olp = ctrl.olp();
          var rp = ctrl.rp();
          if(pt == 4) {

          } else if(pt == 6) {
            offlinepay = true;
          } else if(pt == 7)  {
            paytxt = '担保';
            offlinepay = true;
            olp = rp;
          }

          return [
            m('span',paytxt),
            m('span.onlinepay','¥'+rp),
            offlinepay?[
              m('span.offlinetxt','到店付'),
              m('span.offlinepay','¥'+olp),
            ]:'',
          ];
        })(ctrl))
      ];
    }
  };


  m.module(document.getElementById('main'), nativeOrder);

})();