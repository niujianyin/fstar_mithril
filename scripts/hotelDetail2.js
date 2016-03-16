fstar.hotelDetailApp2 = (function() {

  var hotelDetailApp2 = {
    
    isInitialized: false,

    viewModel: {

      roomServices: m.prop([]),
      commonServices: m.prop([]),
      serveServices: m.prop([]),
      activityServices: m.prop([]),

      phone: m.prop(''),

      isFetching: m.prop(true),

      onunload: function(){
      },

      showAllInfo: function(type){
        var self = this;
        self[type](true);
      },

      init: function() {
        var self = this;
        this.isInitialized = true;

        var hotelInfo = JSON.parse(m.route.param('info'));

        util.log(hotelInfo);

        var vm = hotelDetailApp2.viewModel;

        if (hotelInfo.s1 && hotelInfo.s1 != 'null' && hotelInfo.s1.length > 0) {
          vm.activityServices(hotelInfo.s1);
          self.showActivityServices = m.prop(false);
        } else {
          vm.activityServices([]);
        }

        if (hotelInfo.s2 && hotelInfo.s2 != 'null' && hotelInfo.s2.length > 0) {
          vm.commonServices(hotelInfo.s2);
          self.showCommonServices = m.prop(false);
        } else {
          vm.commonServices([]);
        }

        if (hotelInfo.s3 && hotelInfo.s3 != 'null' && hotelInfo.s3.length > 0) {
          vm.roomServices(hotelInfo.s3);
          self.showRoomServices = m.prop(false);
        } else {
          vm.roomServices([]);
        }

        if (hotelInfo.s4 && hotelInfo.s4 != 'null' && hotelInfo.s4.length > 0) {
          vm.serveServices(hotelInfo.s4);
          self.showServeServices = m.prop(false);
        } else {
          vm.serveServices([]);
        }

        if (hotelInfo.s5 && hotelInfo.s5 != 'null') {
          vm.phone(hotelInfo.s5);
        } else {
          vm.phone('');
        }
      }
    },

    

  };

  hotelDetailApp2.controller = function() {
    util.hideLoading();

    hotelDetailApp2.viewModel.init();

    // _czc.push(﻿['_trackEvent', '酒店详情设施页','酒店详情设施页:进入', util.COMMON_PARAMS.comm_cityName +':'+util.PLATFORM.CURRENT_STR+':'+util.OS]);


    return hotelDetailApp2.viewModel; 
  };

  hotelDetailApp2.view = function(ctrl) {

    return m('.hotelDApp2', [
      ctrl.commonServices().length > 0 ?
      m('.hotelDApp2-group', [
        m('.hotelDApp2-group-h', '通用设施'),
        m('.hotelDApp2-group-c.clearfix',[ 
          ( ctrl.commonServices().length <= 6 || ctrl.showCommonServices() )?
          ctrl.commonServices().map(function(item) {
            return m('.hotelDApp2-item', item);
          }):
          [
            ctrl.commonServices().slice(0,5).map(function(item) {
              return m('.hotelDApp2-item', item);
            }),
            m('.hotelDApp2-item', {
              onclick: ctrl.showAllInfo.bind(ctrl, 'showCommonServices')
            },[
              m('.hotelDApp2-item-blue','查看更多')
            ]) 
          ],
        ])
      ]):'',
      ctrl.serveServices().length > 0 ?
      m('.hotelDApp2-group', [
        m('.hotelDApp2-group-h', '服务项目'),
        m('.hotelDApp2-group-c.clearfix', [ 
          ( ctrl.serveServices().length <= 6 || ctrl.showServeServices() )?
          ctrl.serveServices().map(function(item) {
            return m('.hotelDApp2-item', item);
          }):
          [
            ctrl.serveServices().slice(0,5).map(function(item) {
              return m('.hotelDApp2-item', item);
            }),
            m('.hotelDApp2-item', {
              onclick: ctrl.showAllInfo.bind(ctrl, 'showServeServices')
            },[
              m('.hotelDApp2-item-blue','查看更多')
            ]) 
          ],
        ])
      ]):'',
      ctrl.activityServices().length > 0 ?
      m('.hotelDApp2-group', [
        m('.hotelDApp2-group-h', '活动设施'),
        m('.hotelDApp2-group-c.clearfix', [ 
          ( ctrl.activityServices().length <= 6 || ctrl.showActivityServices() )?
          ctrl.activityServices().map(function(item) {
            return m('.hotelDApp2-item', item);
          }):
          [
            ctrl.activityServices().slice(0,5).map(function(item) {
              return m('.hotelDApp2-item', item);
            }),
            m('.hotelDApp2-item', {
              onclick: ctrl.showAllInfo.bind(ctrl, 'showActivityServices')
            },[
              m('.hotelDApp2-item-blue','查看更多')
            ]) 
          ],
        ])
      ]):'',
      ctrl.roomServices().length > 0 ?
      m('.hotelDApp2-group', [
        m('.hotelDApp2-group-h', '客房设施'),
        m('.hotelDApp2-group-c.clearfix', [ 
          ( ctrl.roomServices().length <= 6 || ctrl.showRoomServices() )?
          ctrl.roomServices().map(function(item) {
            return m('.hotelDApp2-item', item);
          }):
          [
            ctrl.roomServices().slice(0,5).map(function(item) {
              return m('.hotelDApp2-item', item);
            }),
            m('.hotelDApp2-item', {
              onclick: ctrl.showAllInfo.bind(ctrl, 'showRoomServices')
            },[
              m('.hotelDApp2-item-blue','查看更多')
            ]) 
          ],
        ])
      ]):'',
      ctrl.phone()?
      m('.hotelDApp2-contact', {onclick: function() {
        window.location.href = 'tel://' + ctrl.phone();
      }}, '联系酒店')
      :'',
    ]);
    
  };

  return hotelDetailApp2;

})();