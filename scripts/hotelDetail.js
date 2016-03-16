fstar.hotelDetailApp = (function() {

  var hotelDetailApp = {
    
    isInitialized: false,

    viewModel: {

      isFetching: m.prop(true),

      staticData: {

      },

      hotelInfoData: [
        {},
        {},
        {},
        {}
      ],

      fetchHotelDetail: function() {
        var self = this;

        setTimeout(function() {

          self.isFetching(false);
          util.hideLoading();
          util.redraw();

        }, 1);
      },

      onunload: function(){
      }
    },

    init: function() {
      this.isInitialized = true;
    }

  };

  hotelDetailApp.controller = function() {

    hotelDetailApp.viewModel.fetchHotelDetail();

    return hotelDetailApp.viewModel; 
  };

  hotelDetailApp.view = function(ctrl) {
    if (ctrl.isFetching()) {
      return null;
    }


    return m('.hotelDApp', [

      m('.hotelDApp-group', [
        m('.hotelDApp-group-h', '重要信息'),

        m('.hotelDApp-group-c', [
          
          m('.hotelDApp-group-row', [
            m('.hotelDetailApp-item0', [
              m('img', {src: __uri('../images/hotelD_star_4.png')}),
              m('div', '四星级-高档')
            ]),
            m('.hotelDetailApp-item0', [
              m('img', {src: __uri('../images/hotelD_fit.png')}),
              m('div', '2014年装修')
            ]),
            m('.hotelDetailApp-item0', [
              m('img', {src: __uri('../images/hotelD_park.png')}),
              m('div', '无停车场')
            ])
          ]),

          m('.hotelDApp-group-row', [
            m('.hotelDetailApp-item0', [
              m('img', {src: __uri('../images/hotelD_wifi.png')}),
              m('div', '公共区域 WiFi')
            ]),
            m('.hotelDetailApp-item0', [
              m('img', {src: __uri('../images/hotelD_rwifi.png')}),
              m('div', '收费 WiFi（部分房间）')
            ]),
            m('.hotelDetailApp-item0', [
              m('img', {src: __uri('../images/hotelD_band.png')}),
              m('div', '免费宽带（部分房间）')
            ])
          ])

        ])
      ]),



      m('.hotelDApp-group', [
        m('.hotelDApp-group-h', '常用设施'),

        m('.hotelDApp-group-c', [
          
          m('.hotelDApp-group-row', [
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '房间 WiFi')
            ]),
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '房间宽带')
            ]),
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '休闲娱乐')
            ])
          ]),

          m('.hotelDApp-group-row', [
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '停车场')
            ]),
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '餐厅')
            ]),
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '健身房')
            ])
          ]),

          m('.hotelDApp-group-row', [
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '游泳池')
            ]),
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '酒吧')
            ]),
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '行李寄存')
            ])
          ]),

          m('.hotelDApp-group-row', [
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '接机服务')
            ]),
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '机场巴士')
            ]),
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '儿童乐园')
            ])
          ]),

          m('.hotelDApp-group-row', [
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '公共区域 WiFi')
            ])
          ])

        ])
      ]),


      m('.hotelDApp-group', [
        m('.hotelDApp-group-h', '餐厅'),

        m('.hotelDApp-group-c', [

          m('.hotelDApp-group-row', [
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '中餐')
            ]),
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '西餐')
            ]),
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '咖啡')
            ])
          ])

        ])
      ]),


      m('.hotelDApp-group', [
        m('.hotelDApp-group-h', '常用设施'),

        m('.hotelDApp-group-c', [

          m('.hotelDApp-group-row', [
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '按摩室')
            ]),
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '桑拿浴室')
            ]),
            m('.hotelDetailApp-item1', [
              m('img', {src: __uri('../images/hotelD_yes.png')}),
              m('div', '夜总会')
            ])
          ])

        ])
      ]),


      m('.hotelDetailApp-contact', {}, '联系酒店')

    ]);
  };

  return hotelDetailApp;

})();