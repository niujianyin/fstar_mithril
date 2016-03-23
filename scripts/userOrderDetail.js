// 填写发票header与其他接口一样，data传发票的详细实体json字符串
// {\"flyorderid\":\"012356565\",\"invoicetitle\":\"个人\",\"phone\":\"18910798946\",\"address\":\"北京市望京SOHO\",\"receiver\":\"谢恩德\"}

// 还有一个handler改为addInvoice
// 查看发票接口，handler为queryInvoice；header还是一样设置，data只用传个flyOrderId
// 和详情是一样，只有一个地方不一样，"method\":\"detail\"   将detail改为cancel



fstar.userOrderDetail = (function() {

  var userOrderDetail = {

    isInitialized: false,

    viewModel: {
      orderInfo: m.prop(false),
      beginTime: m.prop((new Date()).getTime()),
      orderStatusTxt: m.prop(''),
      status: m.prop(false),
      producttype: m.prop(false),
      isInGJ: m.prop(false),
      showDetails: m.prop(false),
      orderId: m.prop(false),
      // 管家订单号
      flyOrderId: m.prop(false),
      // 第三方订单号
      gdsOrderId: m.prop(false),
      // 第三方源id
      gdsId: m.prop(false),
      // 订单历史
      orderHistoryInfos: m.prop([]),
      invoiceInfo: m.prop(false),
      isSameOrder: m.prop(false),
      hasUnreadMsg: m.prop(false),
      unreadMsgCount: m.prop(0),

      // 是否为到付模式
      isArrivePay: m.prop(false),

      // 是否订单修改过
      isModifyOrder: m.prop(false),

      // 修改入住人  0: 不可操作 1:直接修改  2:申请修改
      modifyStatus: m.prop(0),

      // 显示发票信息
      hasInvoice: m.prop(false),
      // "0"查看发票  "1"开发票
      addInvoice: m.prop("0"),

      loadTimeout: null,
      gjPayType: m.prop(false),
      // 是否显示开发票的按钮，低于50服务费订单，页面不显示开发票按钮 true:不显示
      hideBtnInvoice: m.prop(false),

      hotelroomNum: m.prop(1),
      onlineprice: m.prop(200),
      offlineprice: m.prop(1200),
      isPayDetail:m.prop(false),
      isPaying: m.prop(false),
      showDelay: m.prop(false),
      hasRedPackets: m.prop(false),
      redPacketsData: m.prop(false),

      hidePayDetail: function(){
        var self = this;
        self.isPayDetail(false);
      },
      togglePayDetail: function(){
        var self = this;
        var curPayDetail = self.isPayDetail();
        self.isPayDetail(!curPayDetail);
      },

      back: function() {
        window.history.back();
      },

      loadOrderDetail: function() {
        util.showLoading();
        var self = this;
        var dataReq = {};
        var gdsOrderId = ''+self.gdsOrderId();
        if( gdsOrderId == '-10001'){
          gdsOrderId='';
        }
        detailData = {
          method:'detail',
          flyOrderId: ''+self.flyOrderId(),
          gdsOrderId: gdsOrderId,
          gdsId: ''+self.gdsId()
        };
        dataReq.handler='detail';
        dataReq.header=JSON.stringify(util.header);
        dataReq.data=JSON.stringify(detailData);
        util.log(dataReq);
        // alert(JSON.stringify(dataReq));
        m.request({
          method: 'get',
          url: util.INTERFACE_ADDORDERDATA,
          data: dataReq,
          background: true
        }).then(function(result) {
          // alert(JSON.stringify(result));
          if (result.code == 100) {
            var data = result.data;
            self.orderInfo(data);
            self.orderHistoryInfos(data.statuslist || []);

            // matchStatus：0 临时订单（待支付） 1 确认中 2 已确认 3 已入驻 4 已结账 5 已取消 6内部取消
            self.status(data.matchStatus);
            // 1-到付酒店    4-预付酒店（下单进入支付流程） 6-部分付
            self.producttype(data.producttype);
            // "0"查看发票  "1"开发票
            self.addInvoice(data.addInvoice);
            if(self.showDelay() && data.matchStatus == '0'){
              util.confirm({
                title: '支付可能会有延迟',
                content: '尚未收到您的支付信息，如已支付，请过一段时间刷新订单。',
                'ok': '确定',
                'cancel': '联系客服'
              }).then(function(msg){
                if(msg === 'cancel'){
                  window.open('tel://' + util.CUSTOMER_PHONE);
                }
              });
            }
            if(data.redenvelopeid){
              self.getRedPacket(data.redenvelopeid);
            } else {
              self.hasRedPackets(false);
            }
            util.hideLoading();
            util.redraw();
          } else {
            util.alert({
              title: '错误',
              content: result.msg
            }).then(function(){
              history.back();
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

      getRedPacket: function(redenvelopeid){
        /*
          红包详情查询：
          rest/redenvelope/getRedEnvelopeDetail?&huoliUserId=xxxx&redEnvelopeId=xxx GET
          参数：huoLiUserId：管家用户ID
            redEnvelopeId :红包ID
          返回JSON对象:
          code:100 为成功    其它为失败
          {"code":100,"content":null,"redEnvelope":{"id":18,"userId":766302,"status":1,"expire":"2016-05-15","orderId":null,"type":"XRCLHB","price":0.03,"availableOrder":2,"modifyTime":"2016-02-15 10:54:25.0","source":null,"backPrice":null,"review":0,"start":"2016-02-15"}}
        */ 
        var self = this;
        m.request({
          method: 'get',
          url: window.domainName+'/rest/redenvelope/getRedEnvelopeDetail?&huoliUserId='+util.header.phoneid+'&redEnvelopeId='+redenvelopeid,
        }).then(function(result) {
          util.log(result);
          if (result.code == 100) {
            self.hasRedPackets(true);
            self.redPacketsData(result.redEnvelope);
          } else {
            self.hasRedPackets(false);
            self.redPacketsData(false);
          }
          util.redraw();
        }, function() {
          util.alert({
            content: '网络不给力，请稍后再试试吧',
            ok: '知道了'
          });
          util.hideLoading();
        });

      },

      // hh:mm
      dateFormat: function(date,status) {
        if(date === ""){ return;}
        var rdate = status ? util.dateFormatFmt(new Date(date),"MM-dd hh:mm") : util.dateFormatFmt(new Date(date),"hh:mm");
        return rdate;
      },

      goToHotelDetail: function() {
        var orderInfo = this.orderInfo();
        if (this.orderInfo().orderEntry == 1) {
          m.route(['detail', orderInfo.hotelId, Date.now(), 1, true].join('/'));
        } else {
          m.route(['detail', orderInfo.hotelId, Date.now(), 1].join('/'));
        }
      },

      goToHotelDetailDirect: function(hotelcode,leavedate) {
        util.showLoading();
        m.loadRoute('detailProduct').then(function(detailApp) {
          detailApp.isInitialized = false;
          var outtime = (new Date(leavedate)).getTime();
          var nowtime = (new Date()).getTime();
          if(outtime<nowtime){
            outtime = nowtime;
          }
          m.route(['detail', hotelcode, outtime, 1].join('/'));
        });
      },

      /**
        *1.直接取消订单（支付之前）  /rest/order/cancelOrder     
        *2.直接取消订单（支付之后  供应商确认之前）   /rest/order/cancelOrderAfterPay  
        *3.申请取消订单（供应商确认订单）     /rest/order/cancelOrderApply     
        *4.撤回取消   /rest/order/undoCancelOrderApply
       */ 
      //1.直接取消订单（支付之前）  /rest/order/cancelOrder
      cancelOrder: function() {
        var self = this;
        util.confirm({
          title: '要取消订单吗？',
          ok: '取消订单',
          cancel: '点错了'
        }).then(function(msg) {
          if (msg === 'ok') {
            util.showLoading();
            var dataReq = {};
            var gdsOrderId = ''+self.gdsOrderId();
            if( gdsOrderId == '-10001'){
              gdsOrderId='';
            }
            detailData = {
              method:'cancel',
              flyOrderId: ''+self.flyOrderId(),
              gdsOrderId: gdsOrderId,
              gdsId: ''+self.gdsId()
            };
            dataReq.handler='cancel';
            dataReq.header=JSON.stringify(util.header);
            dataReq.data=JSON.stringify(detailData);
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
                self.loadOrderDetail();
              } else {
                util.alert({
                  title: '错误',
                  content: result.msg
                }).then(function(){
                  history.back();
                });
              } 
            }, function() {
              util.alert({
                title: '未连接到互联网',
                content: '请检查网络是否通畅'
              });
              util.hideLoading();
            });
          }
        });
      },

      goMap: function(hotelname,address,lat,lon){
        // var self = this;
        // self.orderInfo().lat=39.914539;
        // self.orderInfo().lon=116.413392;
        // self.orderInfo().address="王府井东街8号";
        // var lat = self.orderInfo().lat, lon =self.orderInfo().lon, hotelname=self.orderInfo().hotelname, address=self.orderInfo().address;
        if(lat && (lat > 90) ){
          lat = lon;
          lon = lat;
        }
        var origin = window.apiRootPath.replace('https','http');
        var mapUrl = origin + '/' + 'map.html?lat=' + encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lon) + '&name=' + encodeURIComponent(hotelname) + '&desc=' + encodeURIComponent(address);
        
        switch(util.PLATFORM.CURRENT) {
          case util.PLATFORM.BROWSER:
          case util.PLATFORM.WEIXIN:
          window.location.href = mapUrl;
          break;
          case util.PLATFORM.HBGJ:
          case util.PLATFORM.GTGJ:
          _nativeAPI.invoke('createWebView', {url: mapUrl});
          break;
        }
      },

      showOrderInfo: function(){
        var self = this;
        self.showDetails(true);
      },

      hideOrderInfo: function() {
        var self = this;
        self.showDetails(false);
      },
      // 开发票
      goInvoice: function(){
        var self = this;
        var payPrice = self.orderInfo().realpayprice;
        // 1-到付酒店    4-预付酒店（下单进入支付流程） 6-部分付  到付不显示发票
        if(self.producttype()=='1'){return;}
        var isArrivePay = self.producttype()=="6";
        m.loadRoute('invoice').then(function(invoice){
          // 1-到付酒店    4-预付酒店（下单进入支付流程） 6-部分付
          invoice.config({
            payPrice: payPrice
          }).then(function(msg){
            // self.invoiceInfo(msg);
          });
          m.route('invoice',{
            from: 'userOrderDetail',
            orderId: self.flyOrderId(),
            isArrivePay: (isArrivePay? 2:1)
          });
        });
      },
      // 查看发票
      showInvoice: function(){
        util.showLoading();
        var self = this;
        // self.invoiceInfo({"comm_from":1,"comm_cityName":null,"comm_imei":"","comm_product":"","comm_entry":"","orderId":6123,"mailType":2,"invoiceName":"活力世纪","consignee":"牛云","consigneeAddress":"望京","consigneePhone":"15210298454","type":0,"status":"未处理","sendTime":"2016-01-22","sendOverTime":"2016-01-31","invoiceDetail":"代订房费","invoicePostNo":null})

        // 查看发票接口，handler为queryInvoice；header还是一样设置，data只用传个flyOrderId
        var dataReq = {};
        var invoiceData = {
          flyOrderId: ''+self.flyOrderId(),
        };
        dataReq.handler='queryInvoice';
        dataReq.header=JSON.stringify(util.header);
        dataReq.data=JSON.stringify(invoiceData);
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
            util.log(result);
            /*
             * 发票状态 status  预计配送时间  sendTime 预计送达时间 sendOverTime  发票明细 invoiceDetail
             */
            var invoiceInfo = result.data;
            // self.producttype()=="6"  部分付
            invoiceInfo.payType = self.producttype()=="6"?2:1;
            invoiceInfo.status = '未处理';

            // invoiceInfo.orderNo = self.orderInfo().orderNo;
            m.route('invoiceInfo',{
              info: JSON.stringify(invoiceInfo)
            });
          } else {
            util.hideLoading();
            util.alert({
              title: '错误',
              content: result.msg
            }).then(function(){
              
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

      // 隐藏发票
      hideInvoice: function(){
        var self = this;
        self.hasInvoice(false);
      },

      goCsp: function(key){
        // 联系客服
        // var self = this;
        // util.confirm({
        //   content: '拨打客服电话，取消酒店订单',
        //   ok: '拨打',
        //   cancel: '点错了'
        // }).then(function(msg) {
        //   if (msg === 'ok') {
            window.open('tel://' + util.CUSTOMER_PHONE);
        //   }
        // });
      },

      goPhoneHotel: function(phone){
        // 联系酒店
        var self = this;
        // util.confirm({
        //   title: '酒店电话',
        //   content: phone,
        //   ok: '拨打',
        //   cancel: '取消'
        // }).then(function(msg) {
        //   if (msg === 'ok') {
            window.open('tel://' + phone);
        //   }
        // });
      },

      goPay: function() {
        var self = this;
        util.showLoading();
        self.isPaying(true);
        clearTimeout(userOrderDetail.timer);
        userOrderDetail.timer = setTimeout(function(){
          util.hideLoading();
          self.isPaying(false);
        }, 10000);
        if (self.isInGJ()) {
          self.nativePay();
        } else {
          self.isPaying(false);
          util.hideLoading();
          util.alert({
            title: util.HOTEL_PLATFORM_TYPE[util.PLATFORM.CURRENT] + '无法提交订单',
            content: '请到航班管家或高铁管家提交订单'
          });
          return;
        }   
      },

      nativePay: function() {
        var self = this;
        var orderInfo = self.orderInfo();
        var breakfast = orderInfo.breakfast>3?4:orderInfo.breakfast;
        _nativeAPI.invoke('startPay', {
          quitpaymsg: util.NO_PAY_NOTICE_NATIVE,
          title: '支付 - ' + orderInfo.hotelname,
          price: orderInfo.realpayprice,
          orderid: orderInfo.hotelorderid,
          productdesc: '伙力五星级酒店',
          subdesc: '支付 - ' + orderInfo.hotelname,
          // canceltype: 1,
          url: window.apiRootPath + '/nativeOrderPreview.html?orderInfo=' + encodeURIComponent(JSON.stringify({
            n: orderInfo.hotelname,
            ci: orderInfo.arrivedate,
            co: orderInfo.leavedate,
            r: orderInfo.roomtypename,
            b: util.BREAKFASE_TYPE[breakfast],
            rc: orderInfo.roomcount,
            // id: orderInfo.status == 13 ? orderInfo.orderId : null
            pt: orderInfo.producttype, //1-到付酒店 4-预付酒店（下单进入支付流程） 6-部分付（p2p到付）  7-担保到付
            rp: orderInfo.realpayprice,// 付款价格
            olp: orderInfo.offlineprice //到付
          }))
        }, function(err, nativeData) {
          // alert(JSON.stringify(nativeData));
          setTimeout(function(){
            self.isPaying(false);
            if (nativeData.value === nativeData.SUCC) {
              self.showDelay(true);
              self.loadOrderDetail();
            } else if(nativeData.value === nativeData.FAIL) {
              self.loadOrderDetail();
            } else if (nativeData.value === nativeData.CANCEL) {
              self.loadOrderDetail();
            } else {
              self.loadOrderDetail();
            }
          }, 2000);
        });
      },

      autoLogin: function(){
        util.userCenter._doLogin().then(function(isLogin){
          if(isLogin){
            var flyOrderId=m.route.param('flyOrderId'),gdsOrderId=m.route.param('gdsOrderId'),gdsId=m.route.param('gdsId');
            m.route(['myOrderDetail', flyOrderId, gdsOrderId, gdsId].join('/'),{},true);
          } else {
            util.alert({
              title:'用户登录失败',
              content:'请退出重新登录'
            });
          }
        });
      },

      onunload: function() {
        // util.log('userOrderDetail unload');
        // this.orderInfo(false);
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }
        this.orderStatusTxt('');
        this.status(false);
        this.isInGJ(false);
        this.hasUnreadMsg(false);
        this.orderHistoryInfos([]);
      }
    },

    init: function() {
      // util.log('userOrderDetail init');
      // m.loadCSS(__uri('../less/userOrderDetail.less'));
      this.isInitialized = true;
    }
  };

  userOrderDetail.controller = function() {
    if (!userOrderDetail.isInitialized) {
      userOrderDetail.init();
    }
    util.updateTitle('订单状态');
    util.showLoading();
    var vm = userOrderDetail.viewModel;
    vm.orderInfo(false);
    vm.beginTime((new Date()).getTime());
    vm.orderHistoryInfos([]);

    var flyOrderId=m.route.param('flyOrderId'),gdsOrderId=m.route.param('gdsOrderId'),gdsId=m.route.param('gdsId');
    if(m.route.param('nativesucc')==1 && (vm.flyOrderId() != flyOrderId)){
      vm.showDelay(true);
    } else {
      vm.showDelay(false);
    }
    if( (vm.flyOrderId() == flyOrderId)&&(vm.gdsOrderId() == gdsOrderId)&&(vm.gdsId() == gdsId) ){
      vm.isSameOrder(true);
    } else {
      vm.flyOrderId(flyOrderId);
      vm.gdsOrderId(gdsOrderId);
      vm.gdsId(gdsId);
      vm.isSameOrder(false);
      vm.invoiceInfo(false);
    }

    vm.showDetails(false);
    vm.hasInvoice(false);

    util.userCenter._checkLogin().then(function(isLogin) {
      if(isLogin){
        vm.loadOrderDetail();
      } else {
        vm.autoLogin();
      }
    });

    if(util.PLATFORM.CURRENT == util.PLATFORM.HBGJ || util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) {
      vm.isInGJ(true);
      // util.userCenter._nativeAutoLogin().then(function() {
      //   vm.loadOrderDetail();
      // });
    } else {
      vm.isInGJ(false);
      // util.userCenter._checkLogin().then(function(isLogin) {
      //   vm.loadOrderDetail();
      // })
    }

    document.querySelectorAll('body')[0].style.backgroundColor = '';
    return userOrderDetail.viewModel;
  };

  userOrderDetail.view = function(ctrl) {
    return m('.userOrderDetail-w', [
      userOrderDetail.mainView(ctrl),
      userOrderDetail.redpacketView(ctrl),
      // userOrderDetail.historyView(ctrl),
    ]);
  };

  userOrderDetail.mainView = function(ctrl) {
    var orderInfo = ctrl.orderInfo();
    if(!orderInfo){
      return '';
    }
    // orderInfo.hotelPhone = orderInfo.hotelPhone && orderInfo.hotelPhone.replace(/\s*/g,'');
    return [
      m('.userOrderDetail-status',{
        className: 'userOrderDetail-status'+orderInfo.matchStatus
      },[
        m('span.userOrderDetail-status-box',[
          m('span.userOrderDetail-status-icon',{
            className: 'common_status'+orderInfo.matchStatus
          })
        ]),
        orderInfo.gdsdesc || '进行中'
      ]),
      m('.userOrderDetail-infor',[
        m('.userOrderDetail-infor-main-name',{
          honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
        }, [
          orderInfo.hotelname,
          m('.common-icon-more-right'),
        ]),
        m('.userOrderDetail-infor-main',[
          m('.userOrderDetail-infor-main-p', [
            orderInfo.roomtypename
          ]),
          m('.userOrderDetail-infor-main-p', [
            '房间数量:',
            m('span.numFont',orderInfo.roomcount),
            '间'
          ]),
          orderInfo.bedtype?
          m('.userOrderDetail-infor-main-p', [
            '床型:',
            orderInfo.bedtype,
          ]):'',
          m('.userOrderDetail-infor-main-p', [
            '早餐:',
            orderInfo.breakfast>3?util.BREAKFASE_TYPE[4]:util.BREAKFASE_TYPE[orderInfo.breakfast],
          ]),
          m('.userOrderDetail-infor-main-p', [
            m('.userOrderDetail-infor-main-datetxt','入住时间')
          ]),
          m('.userOrderDetail-infor-main-p', [
            m('.userOrderDetail-infor-main-datetxt','离店时间')
          ]),
          m('.userOrderDetail-infor-main-p',[
            m('span.numFont',util.dateFormatFmt( new Date(orderInfo.arrivedate), 'yyyy/MM/dd'))
          ]),
          m('.userOrderDetail-infor-main-p',[
            m('span.numFont',util.dateFormatFmt( new Date(orderInfo.leavedate), 'yyyy/MM/dd'))
          ]),
        ]),
      ]),
      userOrderDetail.hotelView(ctrl),
      userOrderDetail.orderInfoView(ctrl),
      userOrderDetail.operationView(ctrl),
      
      userOrderDetail.payView(ctrl),
      // userOrderDetail.payDetailView(ctrl),
      
    ];
    
  };
  userOrderDetail.hotelView = function(ctrl) {
    // matchStatus：0 临时订单（待支付） 1 待确认 2 已确认 3 已入驻 4 已结账 5 已取消 6内部取消 10支付成功
    if(ctrl.status() == 6){ return '';}
    var orderInfo = ctrl.orderInfo();
    var hotelphone = orderInfo.hotelphone;
    var hotelname = orderInfo.hotelname;
    var hoteladdress = orderInfo.hoteladdress;
    var lat,lon;
    if(hoteladdress){
      hoteladdress = JSON.parse(hoteladdress);
      if(hoteladdress.coordinates){
        lat = hoteladdress.coordinates[1];
        lon = hoteladdress.coordinates[0];
      }
    }
    var hotelposition = orderInfo.hotelposition;
    if( !lat && !hotelphone){ return '';}
    return m('.userOrderDetail-operation',[
      m('.userOrderDetail-menu', [
        hotelphone? m('.userOrderDetail-menu-item',[
          m('.userOrderDetail-flex', [
            m('.userOrderDetail-linkCSP', {
              honclick: ctrl.goPhoneHotel.bind(ctrl,hotelphone)
            },'联系酒店')
          ])
        ]):'',
        lat?
        m('.userOrderDetail-menu-item',[
          m('.userOrderDetail-flex', {
            onclick: ctrl.goMap.bind(ctrl,hotelname,hotelposition, lat, lon)
          }, '导航到酒店')
        ]):'',
      ])
    ]);
  };

  userOrderDetail.orderInfoView = function(ctrl) {
    var orderInfo = ctrl.orderInfo();
    var status = ctrl.status();
    var producttype = ctrl.producttype();
    return m('.userOrderDetail-order-detail',[
      m('.userOrderDetail-order-detail-box',[
        m('ul.userOrderDetail-order-detail-list', [
          m('li.clearfix', [
            m('.userOrderDetail-order-detail-label', '入住人'),
            m('.userOrderDetail-order-detail-content', orderInfo.guestname)
          ]),
          m('li.clearfix', [
            m('.userOrderDetail-order-detail-label', '联系电话'),
            m('.userOrderDetail-order-detail-content', orderInfo.contactphone)
          ]),
          m('li.clearfix', [
            m('.userOrderDetail-order-detail-label', '订单号'),
            m('.userOrderDetail-order-detail-content', orderInfo.flyorderid)
          ]),
          orderInfo.bedtypeprefer?
          m('li.clearfix', [
            m('.userOrderDetail-order-detail-label', '特殊要求'),
            m('.userOrderDetail-order-detail-content', orderInfo.bedtypeprefer)
          ]):'',
        ])
      ]),
      m('.userOrderDetail-order-price',[
        m('.userOrderDetail-order-totalprice', [
          '订单总价:',
          m('span.userOrderDetail-order-priceicon','¥'),
          m('span.userOrderDetail-order-pricenum.numFont', 
            ctrl.producttype()==6?(parseInt(orderInfo.realpayprice)+parseInt(orderInfo.offlineprice)):orderInfo.realpayprice ),
        ]),
        (function(ctrl){
          if( producttype=="1" ){
            return m('.userOrderDetail-infor-detail',[
              '到店支付¥',
              m('span.numFont',orderInfo.realpayprice),
            ]);
          } else if(producttype=="4"){
            switch(status){
              case '0':
                return m('.userOrderDetail-infor-detail',[
                  '需在线支付¥',
                  m('span.numFont',orderInfo.realpayprice),
                ]);
                break;
              default:
                return m('.userOrderDetail-infor-detail',[
                  '已在线支付¥',
                  m('span.numFont',orderInfo.realpayprice),
                ]);
                break;
            }
          } else if(producttype=="6") {
            switch(status){
              case '0':
                return m('.userOrderDetail-infor-detail',[
                  '包括：服务费（待支付）¥',
                  m('span.numFont',orderInfo.realpayprice),
                  '，房费（到店支付）¥',
                  m('span.numFont',orderInfo.offlineprice),
                ]);
                break;
              default:
                return m('.userOrderDetail-infor-detail',[
                  '包括：服务费（已支付）¥',
                  m('span.numFont',orderInfo.realpayprice),
                  '，房费（到店支付）¥',
                  m('span.numFont',orderInfo.offlineprice),
                ]);
                break;
            }
          } else if(producttype=="7") {
            return m('.userOrderDetail-infor-detail',[
              '包括：担保¥',
              m('span.numFont',orderInfo.realpayprice),
              '，房费（到店支付）¥',
              m('span.numFont',orderInfo.realpayprice),
            ]);
          }
          // ctrl.producttype()==1?
          // m('.userOrderDetail-infor-detail',[
          //   '到店支付¥',
          //   m('span.numFont',orderInfo.realpayprice),
          // ]):'',
          // ctrl.producttype()==4?
          // m('.userOrderDetail-infor-detail',[
          //   '已在线支付¥',
          //   m('span.numFont',orderInfo.realpayprice),
          // ]):'',
          // ctrl.producttype()==6?
          // m('.userOrderDetail-infor-detail',[
          //   '包括：服务费（待支付）¥',
          //   m('span.numFont',orderInfo.realpayprice),
          //   '，房费（到店支付）¥',
          //   m('span.numFont',orderInfo.offlineprice),
          // ]):'',
          // ctrl.producttype()==7?
          // m('.userOrderDetail-infor-detail',[
          //   '包括：担保¥',
          //   m('span.numFont',orderInfo.realpayprice),
          //   '，房费（到店支付）¥',
          //   m('span.numFont',orderInfo.realpayprice),
          // ]):'',
        })(ctrl)
      ])
    ]);
  };
  userOrderDetail.operationView = function(ctrl) {
    // matchStatus：0 临时订单（待支付） 1 确认中 2 已确认 3 已入驻 4 已结账 5 已取消6内部取消  10 支付成功 第三方未支付成功

    // 0 临时订单（待支付）申请取消 +联系客服+开/看发票    
    // 1 确认中 申请取消 +联系客服+开/看发票     
    // 2 已确认 联系客服+开/看发票   到付有申请取消 续住  
    // 3 已入驻  联系客服+开/看发票  续住   
    // 4 已结账    联系客服+开/看发票  续住  
    // 5 已取消   联系客服   
    // 6 内部取消 联系客服
    // 10 支付成功 第三方未支付成功
    // 1--到付没有 开/看发票  4--预付没有 取消订单 7--担保没有 开/看发票 （目前走的是预付） <50  开/看发票
    var orderInfo = ctrl.orderInfo();
    var hasInvoice = (ctrl.orderInfo().realpayprice>=50);
    var producttype = ctrl.producttype();
    var status = ctrl.status();
    return m('.userOrderDetail-operation',[
      m('.userOrderDetail-menu', (function(ctrl){
        // 1-到付酒店 4-预付酒店（下单进入支付流程） 6-部分付（p2p到付）  7-担保到付
        if( producttype=="1" ){
          switch(status){
            case '0':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.cancelOrder.bind(ctrl)
                  }, '申请取消')
                ]),
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
              ];
              break;
            case '1':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.cancelOrder.bind(ctrl)
                  }, '申请取消')
                ]),
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
              ];
              break;
            case '2':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.cancelOrder.bind(ctrl)
                  }, '申请取消')
                ]),
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
            case '3':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
            case '4':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
            case '5':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
              ];
              break;
            case '6':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
              ];
              break;
            case '10':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
          }
        } else if(producttype=="4"){
          switch(status){
            case '0':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                (hasInvoice && ctrl.addInvoice() == "1")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goInvoice.bind(ctrl)
                  }, '开发票')
                ]):'',
                (hasInvoice && ctrl.addInvoice() == "0")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.showInvoice.bind(ctrl)
                  }, '查看发票')
                ]):'',
              ];
              break;
            case '1':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                (hasInvoice && ctrl.addInvoice() == "1")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goInvoice.bind(ctrl)
                  }, '开发票')
                ]):'',
                (hasInvoice && ctrl.addInvoice() == "0")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.showInvoice.bind(ctrl)
                  }, '查看发票')
                ]):'',
              ];
              break;
            case '2':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                (hasInvoice && ctrl.addInvoice() == "1")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goInvoice.bind(ctrl)
                  }, '开发票')
                ]):'',
                (hasInvoice && ctrl.addInvoice() == "0")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.showInvoice.bind(ctrl)
                  }, '查看发票')
                ]):'',
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
            case '3':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                (hasInvoice && ctrl.addInvoice() == "1")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goInvoice.bind(ctrl)
                  }, '开发票')
                ]):'',
                (hasInvoice && ctrl.addInvoice() == "0")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.showInvoice.bind(ctrl)
                  }, '查看发票')
                ]):'',
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
            case '4':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                (hasInvoice && ctrl.addInvoice() == "1")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goInvoice.bind(ctrl)
                  }, '开发票')
                ]):'',
                (hasInvoice && ctrl.addInvoice() == "0")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.showInvoice.bind(ctrl)
                  }, '查看发票')
                ]):'',
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
            case '5':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
              ];
              break;
            case '6':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
              ];
              break;
            case '10':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                (hasInvoice && ctrl.addInvoice() == "1")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goInvoice.bind(ctrl)
                  }, '开发票')
                ]):'',
                (hasInvoice && ctrl.addInvoice() == "0")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.showInvoice.bind(ctrl)
                  }, '查看发票')
                ]):'',
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
          }
        } else if(producttype=="6") {
          switch(status){
            case '0':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                (hasInvoice && ctrl.addInvoice() == "1")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goInvoice.bind(ctrl)
                  }, '开发票')
                ]):'',
                (hasInvoice && ctrl.addInvoice() == "0")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.showInvoice.bind(ctrl)
                  }, '查看发票')
                ]):'',
              ];
              break;
            case '1':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                (hasInvoice && ctrl.addInvoice() == "1")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goInvoice.bind(ctrl)
                  }, '开发票')
                ]):'',
                (hasInvoice && ctrl.addInvoice() == "0")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.showInvoice.bind(ctrl)
                  }, '查看发票')
                ]):'',
              ];
              break;
            case '2':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                (hasInvoice && ctrl.addInvoice() == "1")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goInvoice.bind(ctrl)
                  }, '开发票')
                ]):'',
                (hasInvoice && ctrl.addInvoice() == "0")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.showInvoice.bind(ctrl)
                  }, '查看发票')
                ]):'',
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
            case '3':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                (hasInvoice && ctrl.addInvoice() == "1")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goInvoice.bind(ctrl)
                  }, '开发票')
                ]):'',
                (hasInvoice && ctrl.addInvoice() == "0")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.showInvoice.bind(ctrl)
                  }, '查看发票')
                ]):'',
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
            case '4':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                (hasInvoice && ctrl.addInvoice() == "1")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goInvoice.bind(ctrl)
                  }, '开发票')
                ]):'',
                (hasInvoice && ctrl.addInvoice() == "0")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.showInvoice.bind(ctrl)
                  }, '查看发票')
                ]):'',
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
            case '5':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
              ];
              break;
            case '6':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
              ];
              break;
            case '10':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                (hasInvoice && ctrl.addInvoice() == "1")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goInvoice.bind(ctrl)
                  }, '开发票')
                ]):'',
                (hasInvoice && ctrl.addInvoice() == "0")?m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.showInvoice.bind(ctrl)
                  }, '查看发票')
                ]):'',
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
          }
        } else if(producttype=="7") {
          switch(status){
            case '0':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
              ];
              break;
            case '1':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
              ];
              break;
            case '2':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
            case '3':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
            case '4':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
            case '5':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
              ];
              break;
            case '6':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
              ];
              break;
            case '10':
              return [
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goCsp.bind(ctrl)
                  }, '联系客服')
                ]),
                m('.userOrderDetail-menu-item',[
                  m('.userOrderDetail-flex', {
                    honclick: ctrl.goToHotelDetailDirect.bind(ctrl, orderInfo.hotelcode, orderInfo.leavedate)
                  }, '续住')
                ])
              ];
              break;
          }
        }
      })(ctrl))
    ]);
  };

  userOrderDetail.invoiceInfoView = function(ctrl) {
    var orderInfo = ctrl.orderInfo();
    return ctrl.hasInvoice()?
      m('.userOrderDetail-order-info', {
        className: 'show'
      },[
        m('.userOrderDetail-order-info-top'),
        m('.userOrderDetail-order-info-content', [
          m('.userOrderDetail-order-info-main', [
            m('.userOrderDetail-order-info-close', {onclick: ctrl.hideInvoice.bind(ctrl)}, [
              m('.common-icon-closeGray'),
            ]),
            m('.userOrderDetail-order-info-title', '发票信息'),
            m('.common-table2', [
              m('ul.common-table2-list', [
                m('li.userOrderDetail-noBorder', [
                  m('span.label', '发票抬头'),
                  m('span.content', [
                    m('.content1',ctrl.invoiceInfo().invoiceName)
                  ])
                ]),
                m('li', [
                  m('span.label', '收件人'),
                  m('span.content', [
                    m('.content1',ctrl.invoiceInfo().consignee)
                  ])
                ]),
                m('li', [
                  m('span.label', '联系手机'),
                  m('span.content', [
                    m('.content1',ctrl.invoiceInfo().consigneePhone)
                  ])
                ]),
                m('li', [
                  m('span.label', '地址'),
                  m('span.content', [
                    m('.content1',ctrl.invoiceInfo().consigneeAddress)
                  ])
                ]),
              ]), 
            ]),
            m('.common-border'),
            m('.invoiceApp-ul',[
              ctrl.isArrivePay()?
              m('.invoiceApp-li','仅开具服务费的发票。房费由酒店提供发票，请到酒店前台索要。'):'',
              m('.invoiceApp-li','发票信息提交后，不可修改。如有特殊需求，请联系客服。'),
              m('.invoiceApp-li','发票将在离店后，以挂号信寄出。')
            ]),
          ])
        ]),
        m('.userOrderDetail-order-info-bottom')
      ])
    : m('.userOrderDetail-order-info');
  };

  userOrderDetail.historyView = function(ctrl) {
    // ctrl.orderHistoryInfos([
    //   {"orderId":6123,"description":"支付成功，等待卖家（慧慧）确认。","time":"2016/01/20 16:47:36","status":20,"statusDesc":"已支付"},
    //   {"orderId":6123,"description":"需支付￥1050。请在今天 17:16 前支付，超时订单将自动取消。","time":"2016/01/20 16:46:10","status":10,"statusDesc":"待支付"}
    //   ]);
    if(ctrl.orderHistoryInfos().length <= 0){
      return '';
    }

    return m('.userOrderHistory-box',[
      m('.common-border'),
      m('.userOrderHistory-box1',[
        m('.userOrderHistory-line'),
        m('ul.userOrderHistory-list', ctrl.orderHistoryInfos().map(function(order,index){
           return m('li.clearfix',[
            // ((index+1) == ctrl.orderHistoryInfos().length) && ( index !=0 )? m('.userOrderHistory-line-bottom') : '',
            m('span.userOrderHistory-list-box',[
              (function(idx){
                if(idx == 0){
                  return [
                    // m('.userOrderHistory-line-top'),
                    m('span.userOrderHistory-circle-big'),
                    m('span.userOrderHistory-circle-small'),
                    m('span.userOrderHistory-list-txt.userOrderHistory-list-txt-light',order.statusdesc),
                    m('span.userOrderHistory-list-txt1.userOrderHistory-list-txt-light',
                      m.trust(
                        (function(){
                          var orderArr = order.description.split('\n');
                          var orderStr = '';
                          if(orderArr.length>1){
                            for(var i=1,len=orderArr.length; i<= len; i++){
                              orderStr+= (orderArr[i-1]+'<br />');
                            }
                            return orderStr;
                          } else {
                            return order.description;
                          }
                        })()
                      ) 
                    ),
                  ];
                } else if ( (idx+1) == ctrl.orderHistoryInfos().length ){
                  return [
                    m('.userOrderHistory-line-bottom-top'),
                    m('span.userOrderHistory-list-circle'),
                    m('span.userOrderHistory-list-txt',order.statusdesc),
                    m('span.userOrderHistory-list-txt1', 
                      m.trust(
                        (function(){
                          var orderArr = order.description.split('\n');
                          var orderStr = '';
                          if(orderArr.length>1){
                            for(var i=1,len=orderArr.length; i<= len; i++){
                              orderStr+= (orderArr[i-1]+'<br />');
                            }
                            return orderStr;
                          } else {
                            return order.description;
                          }
                        })()
                      ) 
                    ),
                  ];
                } else {
                  return [
                    m('span.userOrderHistory-list-circle'),
                    m('span.userOrderHistory-list-txt',order.statusdesc),
                    m('span.userOrderHistory-list-txt1',
                      m.trust(
                        (function(){
                          var orderArr = order.description.split('\n');
                          var orderStr = '';
                          if(orderArr.length>1){
                            for(var i=1,len=orderArr.length; i<= len; i++){
                              orderStr+= (orderArr[i-1]+'<br />');
                            }
                            return orderStr;
                          } else {
                            return order.description;
                          }
                        })()
                      ) 
                    ),
                  ];
                }
              })(index)
            ]),
            m('span.userOrderHistory-list-time',{
              className: index == 0 ? 'userOrderHistory-list-txt-light':''
            }, util.dateFormatFmt( new Date(order.createtime), "yyyy.MM.dd hh:mm") )
          ]);
        })),
      ]),
      m('.common-border'),
    ]);
  };

  userOrderDetail.payView = function(ctrl) {
    if(ctrl.status() !== '0'){ return '';}
    // 1-到付酒店    4-预付酒店（下单进入支付流程） 6-部分付 ctrl.producttype() 7-到付担保
    var orderInfo = ctrl.orderInfo();
    var typeTxt = '预付', btnTxt='去支付', payTxt = '总额',finalRealPay=0;
    var onlineprice=0,offlineprice=0;
    if (ctrl.producttype() == 7) {
      finalRealPay = orderInfo.realpayprice;
      typeTxt = '担保';
      btnTxt = '去担保';
    } else if(ctrl.producttype() == 4) {
      // 预付
      finalRealPay = orderInfo.realpayprice;
    } else if(ctrl.producttype() == 6) {
      // 3-部分付
      onlineprice = orderInfo.realpayprice;
      offlineprice = orderInfo.offlineprice;
      finalRealPay = onlineprice+offlineprice;
    }

    return m('.orderApp-pay', [
      m('.orderApp-pay-total', [
        m('.orderApp-pay-total-price',{
          // className: ctrl.isPayDetail()?'show':'',
          // onclick: ctrl.togglePayDetail.bind(ctrl)
        }, [
          m('span.order-pay-total-txt',payTxt),
          m('i', '￥'), 
          m('span.numFont', finalRealPay ),
          // m('span.order-pay-detail-arrow')
        ]),
        (ctrl.producttype() == 6)?
        m('.orderApp-pay-type',[
          m('.orderApp-pay-type-item',[
            '在线付¥',
            m('span.numFont', onlineprice)
          ]),
          m('.orderApp-pay-type-item.orderApp-pay-type-item1',[
            '到店付¥',
            m('span.numFont', offlineprice)
          ])
        ]):
        m('.orderApp-pay-type',[
          typeTxt+'¥',
          m('span.numFont', finalRealPay)
        ])
      ]),
      m('.orderApp-pay-next',{
        onclick: ctrl.goPay.bind(ctrl) 
      }, btnTxt)
    ]);
  };

  userOrderDetail.payDetailView = function(ctrl){
    if(ctrl.producttype() == 3) {
      // 3-部分付
      var num = ctrl.hotelroomNum();
      var onlineprice = Math.ceil(ctrl.onlineprice());
      var offlineprice = Math.ceil(ctrl.offlineprice());
      return m('.common-as#payDetail',{
        className: ctrl.isPayDetail()?'show':''
      },[
        m('.common-as-bg#payDetailBg',{
          onclick: ctrl.hidePayDetail.bind(ctrl)
        }),
        m('#payDetailContent',[
          m('.orderApp-payDetail',[
            m('.orderApp-payDetail-item',[
              m('.orderApp-payDetail-item-txt','在线付:'),
              m('.orderApp-payDetail-item-num',[
                '¥',
                m('span.numFont', onlineprice*num )
              ]),
            ]),
            m('.orderApp-payDetail-item',[
              m('.orderApp-payDetail-item-txt','到店付:'),
              m('.orderApp-payDetail-item-num',[
                '¥',
                m('span.numFont', offlineprice*num )
              ]),
            ]),
            m('.orderApp-payDetail-item',[
              m('.orderApp-payDetail-item-txt','总价:'),
              m('.orderApp-payDetail-item-num',[
                '¥',
                m('span.numFont', (onlineprice+offlineprice)*num )
              ]),
            ]),
            m('.orderApp-payDetail-item',[
              m('.orderApp-payDetail-item-txt','房间数:'),
              m('.orderApp-payDetail-item-num',[
                m('.numFont', num )
              ]),
            ]),
          ]),
        ])
      ]);
    } else {
      return m('.common-as#payDetail',{
        className: ctrl.isPayDetail()?'show':''
      },[
        m('.common-as-bg#payDetailBg',{
          onclick: ctrl.hidePayDetail.bind(ctrl)
        }),
        m('#payDetailContent',[
          m('.orderApp-payDetail',[
            m('.orderApp-payDetail-item',[
              m('.orderApp-payDetail-item-txt','单价:'),
              m('.orderApp-payDetail-item-num',[
                '¥',
                m('span.numFont', ctrl.cprice() )
              ]),
            ]),
            m('.orderApp-payDetail-item',[
              m('.orderApp-payDetail-item-txt','房间数:'),
              m('.orderApp-payDetail-item-num',[
                m('.numFont', ctrl.hotelroomNum() )
              ]),
            ]),
          ]),
        ])
      ]);
    }
  };

  userOrderDetail.redpacketView = function(ctrl){
    var redPacketsData = ctrl.redPacketsData();
    var orderInfo = ctrl.orderInfo();
    alert(JSON.stringify(orderInfo));

    return ctrl.hasRedPackets()?
    m('.orderApp-redpacket', [
      m('span.orderApp-redpacket-icon.common_icon_packet'),
      m('.orderApp-redpacket-txt', [
        m('.orderApp-redpacket-top', '已申请返现'),
        m('.orderApp-redpacket-bottom', [
          util.dateFormatFmt(redPacketsData.expire, 'MM月dd日'),
          '前￥',
          orderInfo.packetBackPrice||0,
          '现金将返入您的高铁账号'
        ]),
      ]),
      // m('.orderApp-arrow-right.common-icon-more-right')
    ]):'';
  };

  return userOrderDetail;

})();