fstar.detailApp = (function() {

  var detailApp = {
    
    isInitialized: false,

    viewModel: {
      hotelInfo: m.prop(false),
      hotelId: m.prop(''),
      currentDate: m.prop(''),
      stayDayCount: m.prop(''),
      isSoldOut: m.prop(false),

      hideActivity: m.prop(false),
      timer: null,
      picList: m.prop([]),

      ptimer1: null,
      ptimer2: null,
      ptimer3: null,
      p0:m.prop(true),
      p1:m.prop(false),
      p2:m.prop(false),
      p3:m.prop(false),

      checkTime: function(){
        var self = this;
        util.reloadByTimeLocal(self.currentDate());
        if(util.isReload){
          self.currentDate( new Date() );
          return true;
        }
      },

      getloadData: function() {
        var self = this;
        self.p1(false);
        self.p2(false);
        self.p3(false);
        self.checkTime();
        util.showLoading();

        var dataReq = {
          startdate: util.dateFormatFmt(self.currentDate(), 'yyyyMMdd'), 
          enddate: util.dateFormatFmt(util.nextDate(self.currentDate(), self.stayDayCount()), 'yyyyMMdd'),
          st: 3,
          hotelcode: self.hotelId(),
          from: util.NCOMMON_PARAMS.from,
          uid: util.NCOMMON_PARAMS.uid
        };
        // 追加城市参数
        util.extendCommon(dataReq);

        m.request({
          url: util.INTERFACE_GETHOTELDATA,
          method: 'GET',
          data: dataReq,
          background: true
        }).then(function(result) {
          util.log(result);
          if (result && (result.status === 0) ) {
            var data = result.datas;
            self.hotelInfo(data);
            if(!data.srcPrice || data.srcPrice.length == 0){
              self.isSoldOut(true);
            } else {
              self.isSoldOut(false);
            }
            // swiper
            var imageRatio = 1 / 2;
            var imageHeight = parseInt(util.SCREEN_WIDTH * imageRatio, 10);
            var imageInfo = null;
            var hotelInfo = self.hotelInfo().hotelInfo;
            var imgArr = [];
            if(hotelInfo&& hotelInfo.albums&&hotelInfo.albums[0]&&hotelInfo.albums[0].photos){
              var len = hotelInfo.albums[0].photos.length;
              if(len > 3){ len = 4;}
              for(var i=0; i<len; i++){
                try{
                  imageInfo = {
                    imageUrl: hotelInfo.albums[0].photos[i].url,
                    width: 750,
                    height: 375
                  }
                }catch(e){
                  imageInfo = {
                    imageUrl: null,
                    width: util.SCREEN_WIDTH, 
                    height: imageHeight
                  };
                }
                imgArr.push(imageInfo);
              }
              
            }
            self.picList(imgArr);
            self.swiper();
            self.showProductPrice();
            util.hideLoading();
            util.redraw();
          } else {
            util.alert({content:result.msg});
          }
        }, function() {
          util.alert({
            content: '网络不给力，请稍后再试试吧',
            ok: '知道了'
          });
          util.hideLoading();
        });
      },
      showProductPrice: function(){
        var self = this;
        var s1=100,s2=300,s3=500;
        var second = Math.ceil(Math.random()*3);
        if(second == 1){
          s1=100;
          s2=300;
          s3=500;
          second = Math.ceil(Math.random()*2)+1;
          if(second == 3){
            s2=500;
            s3=300;
          }
        } else if(second == 2){
          s1=300;
          s2=100;
          s3=500;
          second = Math.ceil(Math.random()*2)+1;
          if(second == 3){
            s1=500;
            s3=300;
          }
        } else {
          s1=300;
          s2=500;
          s3=100;
          second = Math.ceil(Math.random()*2)+1;
          if(second == 3){
            s1=500;
            s2=300;
          }
        }
        self.ptimer1 = setTimeout(function(){
          self.p1(true);
          util.redraw();
        },s1);
        self.ptimer2 = setTimeout(function(){
          self.p2(true);
          util.redraw();
        },s2);
        self.ptimer3 = setTimeout(function(){
          self.p3(true);
          util.redraw();
        },s3);
      },
      clearProductPrice: function(){
        var self = this;
        self.p1(false);
        self.p2(false);
        self.p3(false);
        clearTimeout(self.ptimer1);
        clearTimeout(self.ptimer2);
        clearTimeout(self.ptimer3);
      },

      swiper: function() {
        var self = this;
        if(document.querySelectorAll('.detailApp-hotel-img')[0]){
          clearTimeout(detailApp.timer);
          detailApp.timer = null;
          if(self.picList().length>1){
            var swiper = new Swiper('.swiper-container', {
              pagination: '.swiper-pagination',
              paginationClickable: true
            });
          }
        } else {
          detailApp.timer = setTimeout(function(){
            self.swiper();
          },200);
        }
      },

      goIndex: function() {
        var self = this;
        self.checkTime();
        if (util.PLATFORM.CURRENT == util.PLATFORM.HBGJ || (util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) ) {
          util.closeWebView();
        } else {
          m.loadRoute('list').then(function(listApp) {
            // 是否使用url的参数 flase 为使用
            listApp.isInitialized = false;

            var checkOut = util.nextDate(self.currentDate(), self.stayDayCount());
            m.route('list', {
              checkIn: self.currentDate().getTime(),
              checkOut: checkOut.getTime(),
              city: util.NCOMMON_PARAMS.city
            }, true);
          });
        }
      },

      selectDate: function() {
        var self = this;
        self.checkTime();
        m.loadRoute('selectDate').then(function(dateSelector) {
          dateSelector.viewModel.config({
            beginDate: self.currentDate().getTime(),
            dayCount: self.stayDayCount()
          }).then(function(newDate) {
            self.currentDate(newDate.beginDate);
            self.stayDayCount(newDate.dayCount);
            window.scrollTo(0, 0);
            // 供首页使用
            util.storage.setItem('fstar_hotelDateInfo', JSON.stringify({
              checkIn: newDate.beginDate,
              checkOut: util.nextDate(newDate.beginDate, newDate.dayCount),
              stayDayCount: newDate.dayCount
            }));
            // m.loadRoute('list').then(function(listApp) {  
            //   listApp.viewModel.checkIn(newDate.beginDate);
            //   listApp.viewModel.stayDayCount(newDate.dayCount);
            // });
            history.back();
          });
          window.scrollTo(0, 0);
          m.route('selectDate');
        });
      },
      goMap: function(){
        var self = this;
        self.checkTime();
        var location = self.hotelInfo().hotelInfo.location.split(',');
        var lat = location[0];
        var lon = location[1];
        var origin = window.apiRootPath.replace('https','http');
        var mapUrl = origin + '/' + 'map.html?lat=' + encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lon) + '&name=' + encodeURIComponent(self.hotelInfo().hotelInfo.hotelname) + '&desc=' + encodeURIComponent(self.hotelInfo().hotelInfo.address);
        
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

      goHotelDetail: function() {
        var self = this;
        self.checkTime();
        util.alert({
          title: '酒店信息',
          content: '尚未开通，尽请期待'
        });
        // m.route('hotelDetail', {info: JSON.stringify({
        //   s1: self.hotelInfo().activityFacilities,
        //   s2: self.hotelInfo().generalFacilities,
        //   s3: self.hotelInfo().roomFacilities,
        //   s4: self.hotelInfo().services,
        //   s5: self.hotelInfo().phone
        // })});
      },

      goComment: function() {
        var self = this;
        var hotelcode = self.hotelInfo().hotelInfo.hotelcode;
        var hotelname = self.hotelInfo().hotelInfo.hotelname;
        var score = self.hotelInfo().hotelInfo.userscore;
        var userscore = (score-0).toFixed(1);
        self.checkTime();
        window.scrollTo(0,0);

        // if (util.PLATFORM.CURRENT == util.PLATFORM.HBGJ || (util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) ) {
        //   var flag = '';
        //   if (util.PLATFORM.CURRENT = util.PLATFORM.HBGJ) {
        //     flag='?from=hbgj'
        //   }
        //   if (util.PLATFORM.CURRENT = util.PLATFORM.GTGJ) {
        //     flag='?from=gtgj'
        //   }

        //   var url = window.apiRootPath + '/index.html'+flag+'#' + ['comment', hotelcode, hotelname, userscore].join('/');
        //   // alert(url);
        //   _nativeAPI.invoke('createWebView', {url: url});
        //   util.openWindow( url , true);
        // } else {
          util.showLoading();
          m.loadRoute('comment/:hotelId/:hotelName/:userScore').then(function(commentApp) {
            m.route(['comment', hotelcode, hotelname, userscore].join('/'));
          });
        // }
      },

      goProduct: function(bigsrc) {
        var self = this;
        self.checkTime();
        m.loadRoute('detailProduct').then(function(detailProduct) {
          window.scrollTo(0, 0);
          detailProduct.viewModel.confirm(false);
          detailProduct.viewModel.freecancel(false);
          m.route('detailProduct',{
            bigsrc: bigsrc,
            hotelcode: self.hotelId(),
            currentDate: self.currentDate(),
            stayDayCount: self.stayDayCount(),
            name: self.hotelInfo().hotelInfo.hotelname
          });
        });
      },

      reloadTime: function(){
        var self = this;
        var hotelDateInfo = JSON.parse(util.storage.getItem('fstar_hotelDateInfo') || "{}");
        var checkIn = hotelDateInfo.checkIn;
        var checkOut = hotelDateInfo.checkOut;
        var stayDayCount = hotelDateInfo.stayDayCount;

        util.reloadByTimeLocal(checkIn);
        if(util.isReload){
          self.currentDate( new Date() );
          self.stayDayCount(1);
        } else {
          self.currentDate( (checkIn && new Date(checkIn)) || new Date() );
          self.stayDayCount(stayDayCount || 1);
        }
      },

      onunload: function(){
        util.log('detailApp unload');
        var self = this;
        self.hotelInfo(false);
        self.isSoldOut(false);
        self.clearProductPrice();
      }
    },

    init: function() {
      var vm = detailApp.viewModel;
      var checkIn = new Date(parseInt(m.route.param('currentDate'), 10));
      // 判断时间是否已经过今日
      util.reloadByTimeLocal(checkIn);
      if(util.isReload){
        checkIn = new Date();
      }
      vm.currentDate(checkIn);
      vm.stayDayCount(parseInt(m.route.param('stayDayCount'),10));
      vm.hotelInfo(false);

      util.storage.setItem('fstar_hotelDateInfo', JSON.stringify({
        checkIn: new Date(checkIn),
        checkOut: util.nextDate(new Date(checkIn), vm.stayDayCount()),
        stayDayCount: vm.stayDayCount()
      }));
      this.isInitialized = true;
    }

  };

  detailApp.controller = function() {
    util.showLoading();
    // 同步日期
    detailApp.viewModel.reloadTime();
    if (!detailApp.isInitialized) {
      util.log('detailApp is initialized');
      detailApp.init();
    }
    detailApp.viewModel.hotelId(m.route.param('hotelId'));
    util.updateTitle('酒店详情');

    util.userCenter._checkLogin().then(function(isLogin) {
      detailApp.viewModel.getloadData();
    });

    return detailApp.viewModel;
  };

  detailApp.view = function(ctrl) {
    if( ctrl.hotelInfo() ){
      return [
        detailApp.swiperView(ctrl),
        detailApp.hotelDetailView(ctrl),
        detailApp.hotelAddressView(ctrl),
        // detailApp.commentView(ctrl),
        detailApp.dateView(ctrl),

        ctrl.isSoldOut() ? detailApp.soldOutView(ctrl) : detailApp.productsView(ctrl)
      ];
    } else {
      return '';
    }
    
  };


  detailApp.imageView = function(ctrl) {
    var imageRatio = 1 / 2;
    var imageHeight = parseInt(util.SCREEN_WIDTH * imageRatio, 10);
    var imageInfo = null;
    try{
      var hotelInfo = ctrl.hotelInfo().hotelInfo;
      imageInfo = {
        imageUrl: hotelInfo.albums[0].photos[0].url,
        width: 750,
        height: 375
      }
    }catch(e){
      imageInfo = {
        imageUrl: null,
        width: util.SCREEN_WIDTH, 
        height: imageHeight
      };
    }

    var imageSize = util.adjustImage(imageInfo, {width: util.SCREEN_WIDTH, height: imageHeight});

    return m('.detailApp-image-view', {style: 'height: ' + imageHeight + 'px'}, [
      m('img.detailApp-hotel-img.common-img', {
        border: 0,
        src: imageInfo.imageUrl,
        height: Math.floor(imageSize.height),
        width: Math.floor(imageSize.width),
        style: 'margin-top:-' + Math.ceil(imageSize.height / 2) + 'px; margin-left:-' + (imageSize.width / 2) + 'px'
      }),
      m('.detailApp-hotel-name', ctrl.hotelInfo().hotelInfo.hotelname)
    ]);
  };

  detailApp.swiperView = function(ctrl) {
    var imageRatio = 1 / 2;
    var imageHeight = parseInt(util.SCREEN_WIDTH * imageRatio, 10);
    var imageSize = util.adjustImage({ width: 750, height: 375}, {width: util.SCREEN_WIDTH, height: imageHeight});

    return m('.detailApp-image-view', {style: 'height: ' + imageHeight + 'px'}, [
      m('.swiper-container',[
        m('.swiper-wrapper',[
          ctrl.picList().map(function(elem) {
            return m('.swiper-slide',[
              m('img.detailApp-hotel-img.common-img', {
                border: 0,
                src: elem.imageUrl,
                height: Math.floor(imageSize.height),
                width: Math.floor(imageSize.width)
              }),
            ]);
          })
        ]),
        m('.swiper-pagination'),
        m('.detailApp-hotel-name', ctrl.hotelInfo().hotelInfo.hotelname)
      ]),
      //   <div class="swiper-wrapper">
      //       <div class="swiper-slide">Slide 1</div>
      //       <div class="swiper-slide">Slide 2</div>
      //       <div class="swiper-slide">Slide 3</div>
      //       <div class="swiper-slide">Slide 4</div>
      //       <div class="swiper-slide">Slide 5</div>
      //       <div class="swiper-slide">Slide 6</div>
      //       <div class="swiper-slide">Slide 7</div>
      //       <div class="swiper-slide">Slide 8</div>
      //       <div class="swiper-slide">Slide 9</div>
      //       <div class="swiper-slide">Slide 10</div>
      //   </div>
      //   <!-- Add Pagination -->
      //   <div class="swiper-pagination"></div>
      // </div>
      
    ]);
  };

  // detailApp.hotelDetailView = function(ctrl) {
  //   var sheshi = ctrl.hotelInfo().hotelInfo.sheshi || [];
  //   var parking = sheshi.indexOf('parking') > -1? 'detailApp-hotel-parking':'';
  //   var wifi = sheshi.indexOf('wifi') > -1? 'detailApp-hotel-wifi':'';
  //   var existIcon = parking || wifi;
  //   return m('.detailApp-hotel-detail', {
  //     // onclick: ctrl.goHotelDetail.bind(ctrl)
  //   }, [
  //     m('.detailApp-hotel-detail-t',{
  //       className: existIcon? '':'detailApp-hotel-t-only'
  //     }, util.HOTEL_STAR_SIMPLE[ctrl.hotelInfo().hotelInfo.star]),
  //     // m('.detailApp-hotel-detail-icon'),
  //     existIcon? m('.detailApp-hotel-pos',{
  //       className: wifi + ' ' +parking
  //     },[
  //       m('span.common-icon-wifi'),
  //       m('span.common-icon-parking')
  //     ]):'',
  //     // m('.common-icon-more-right'),
  //     m('.common-border')
  //   ]);
  // };

  detailApp.hotelDetailView = function(ctrl) {
    var hotelInfo = ctrl.hotelInfo().hotelInfo;
    var sheshi = hotelInfo.sheshi || [];
    var parking = sheshi.indexOf('parking') > -1? 'detailApp-hotel-parking':'';
    var wifi = sheshi.indexOf('wifi') > -1? 'detailApp-hotel-wifi':'';
    // return m('.detailApp-hotel-detail', {
    //   // onclick: ctrl.goHotelDetail.bind(ctrl)
    // }, [
    //   m('.detailApp-hotel-detail-t',{
    //     className: wifi + ' ' +parking
    //   },[
    //     util.HOTEL_STAR_SIMPLE[ctrl.hotelInfo().hotelInfo.star],
    //     m('span.common-icon-wifi'),
    //     m('span.common-icon-parking')
    //   ]),
    //   m('.common-border')
    // ]);

    var score = hotelInfo.userscore;
    var commentnum = hotelInfo.commentnum;
    var noComment = commentnum<1;

    var officialstar = hotelInfo.officialstar || '0';
    // console.log(officialstar);
    var star = util.HOTEL_STAR_OFFICIALSTAR[officialstar];
    if( officialstar == '0' || officialstar > 5){
      star = util.HOTEL_STAR_SIMPLE[hotelInfo.star];
    }

    return m('.detailApp-hotel-comment', {
      honclick: noComment?'': ctrl.goComment.bind(ctrl)
    }, [
      m('.detailApp-hotel-detail-t.detailApp-hotel-detail-tt',{
        className: wifi + ' ' +parking
      },[
        star,
        m('span.common-icon-wifi'),
        m('span.common-icon-parking')
      ]),
      m('.detailApp-hotel-comment-score', [
        m('span.numFont', (score-0).toFixed(1) ),
        '分'
      ]),
      m('.detailApp-hotel-comment-label', commentnum+'条评论'),
      noComment?'':m('.common-icon-more-right'),
      m('.common-border')
    ]);
  };

  detailApp.hotelAddressView = function(ctrl) {
    var hotelInfo = ctrl.hotelInfo().hotelInfo;
    var nearbyArr = false;
    var distance = hotelInfo.commercial;
    var isSubway = false;
    if(hotelInfo.tosubway){
      nearbyArr = hotelInfo.tosubway.split(":");
      if(nearbyArr[1]){
        var neardis = nearbyArr[1];
        // <100   100-1000  每50米一个单位四舍五入    >1000 每0.1公里四舍五入
        if(neardis<=100){
          neardis = Math.round(neardis)+'米'
        } else if( neardis < 975){
          neardis = Math.round(neardis/50)*50 +'米'
        } else if( neardis <= 1000){
          neardis = '1公里';
        } else {
          neardis = Math.round(neardis/100)/10 +'公里'
        }

        distance = neardis + '距' + nearbyArr[0]+'站';
        isSubway=true;
      }
    }
    // var nearSubway = false;
    // if(util.HOTEL_NEARBYTYPE[hotelInfo.nearbytype]){
    //   nearSubway = util.HOTEL_NEARBYTYPE[hotelInfo.nearbytype];
    // }
    return m('.detailApp-hotel-loc', {
      onclick: ctrl.goMap.bind(ctrl)
    }, [
      m('.detailApp-hotel-address', ctrl.hotelInfo().hotelInfo.address),
      m('.detailApp-hotel-circle', [
        isSubway?
        m('.common-icon-tag',{
          className: 'common-icon-tag'
        }):'',
        distance
      ]),
      m('.detailApp-hotel-loc-label', '地图'),
      m('.common-icon-more-right'),
      m('.common-border')
    ]);
  };

  detailApp.commentView = function(ctrl) {
    var score = ctrl.hotelInfo().hotelInfo.userscore;
    var commentnum = ctrl.hotelInfo().hotelInfo.commentnum;
    var noComment = commentnum<1;
    return m('.detailApp-hotel-comment', {
      honclick: noComment?'': ctrl.goComment.bind(ctrl)
    }, [
      m('.detailApp-hotel-comment-score', [
        m('span.numFont', (score-0).toFixed(1) ),
        '分'
      ]),
      m('.detailApp-hotel-comment-label', commentnum+'条评论'),
      noComment?'':m('.common-icon-more-right'),
      m('.common-border')
    ]);
  };

  detailApp.dateView = function(ctrl) {
    var checkOut = util.nextDate(ctrl.currentDate(), ctrl.stayDayCount());
    return m('.detailApp-check-date', {honclick: ctrl.selectDate.bind(ctrl)}, [
      m('.common-border.border-top'),

      m('.detailApp-check-date-c', [
        '入住',
        m('span.numFont',util.dateFormatFmt(ctrl.currentDate(), 'MM/dd')),
        m('span.detailApp-check-week','（'+util.getCurrentWeek(ctrl.currentDate())+'）'),
        ' - 离店',
        m('span.numFont',util.dateFormatFmt(checkOut, 'MM/dd'))
      ]),

      m('.detailApp-check-date-t', '共' + ctrl.stayDayCount() + '晚'),

      m('.common-icon-more-right'),
      m('.common-border.border-bottom')
    ]);
  };

  detailApp.soldOutView = function(ctrl) {
    return m('.detailApp-souldout', [
      m('.common-border'),
      m('span', '很抱歉，暂时没有相关房态呢'),
      m('.detailApp-souldout-a', {honclick: ctrl.goIndex.bind(ctrl)}, '查看其他酒店'),
      m('.common-border')
    ]);
  };

  detailApp.productsView = function(ctrl) {
    var products = ctrl.hotelInfo().srcPrice;
    return m('.detailApp-supplier', products.map(function(product, index) {
      var productSource = util.PRICESRC[product.bigsrc] || '其他供应商';
      var isOwnerGJ = productSource=='管家自营';
      if(product.soldout==1){
        return m('.detailApp-supplier-item.detailApp-supplier-item-no', [
          m('.detailApp-supplier-label', productSource),
          isOwnerGJ || ctrl['p'+index]()?m('.detailApp-supplier-main', [
            m('span.detailApp-supplier-subprice', '￥'),
            m('span.detailApp-supplier-price.numFont', Math.ceil(product.price)),
            m('i', '起'),
            m('span.common_icon_full_room.detailApp-supplier-full-room'),
          ]):m('.detailApp-supplier-main', [
            m('.detailApp-supplier-loading')
          ]),
        ])
      }
      return m('.detailApp-supplier-item', {
        honclick: ctrl['p'+index]()?ctrl.goProduct.bind(ctrl, product.bigsrc):''
      }, [
        m('.detailApp-supplier-label', productSource),
        isOwnerGJ || ctrl['p'+index]()?m('.detailApp-supplier-main', {
          className: (product.youhui == '返现')? 'detailApp-supplier-main1':''
        },[
          m('span.detailApp-supplier-subprice', '￥'),
          m('span.detailApp-supplier-price.numFont', Math.ceil(product.price)),
          m('i', '起'),
          m('em.common_icon_package')
        ]):m('.detailApp-supplier-main', [
          m('.detailApp-supplier-loading')
        ]),
        isOwnerGJ || ctrl['p'+index]()?m('.common-icon-more-right'):''
      ])
    }));
  };

  return detailApp;

})();