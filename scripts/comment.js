fstar.commentApp = (function() {

  var commentApp = {
    isInitialized: false,

    viewModel: {
      commentList: m.prop([]),
      commentTotal: m.prop(0),
      commentPercent: m.prop(0),
      isFirstLoading: m.prop(false),
      noData: m.prop(false),
      isFirstLoadError: m.prop(false),
      currentPage: m.prop(0),
      isLoadingMore: m.prop(false),
      isLoadingMoreError: m.prop(false),
      isLoadingMoreNo: m.prop(false),
      isLoading: m.prop(false),
      hotelId: m.prop(''),

      loadFirstPage: function() {
        var self = this;
        window.scrollTo(0, 0);
        util.showLoading();
        self.currentPage(0);
        self.isFirstLoading(true);
        if(self.isLoading()){ util.log('正在请求。。。'); return;}
        self.isLoading(true);
        var loadTimer = setTimeout(function(){
          self.isLoading(false);
          util.hideLoading();
        },3000)

        self.loadData().then(function(result) {
          clearTimeout(loadTimer);
          self.isLoading(false);
          self.isFirstLoading(false);
          self.commentTotal(0);
          var comments = [];
          if (result.code == 1) {
            var data = result.data;
            comments = data.datas || [];
            var total = data.total;
            
            self.isFirstLoadError(false);
            if ( total >= util.PS ) {
              self.isLoadingMoreNo(false);
            } else {
              self.isLoadingMoreNo(true);
            }
            self.commentTotal(data.search_total || 0);
            self.commentList(comments);
          } else {
            self.commentList([]);
            self.isLoadingMoreNo(true);
            self.isFirstLoadError(true);
          }

          if( !comments || (comments.length == 0) ){
            self.noData(true);
            // util.scrollEnd(function() {}, true);
          } else {
            self.noData(false);
          }
          // 评分
          self.percent();
          util.hideLoading();
          util.redraw();
        });
      },

      loadMorePage: function() {
        var self = this;
        self.isLoadingMore(true);
        self.loadData().then(function(result) {
          self.isLoadingMore(false);
          
          if (result.code == 1) {
            var data = result.data;
            var comments = data.datas || [];
            var total = data.total;
            self.isLoadingMoreError(false);
            if ( total >= util.PS ) {
              self.isLoadingMoreNo(false);
            } else {
              self.isLoadingMoreNo(true);
            }
            var oldcommentList = self.commentList();
            Array.prototype.push.apply(oldcommentList, comments);
            self.commentList(oldcommentList);
          } else {
            self.isLoadingMoreNo(true);
            self.isLoadingMoreError(true);
          }

          util.redraw();
        });
      },

      loadData: function(result) {
        var self = this;
        var deferred = m.deferred();

        var dataReq = {
          st: 8,
          hotelcode: self.hotelId(),
          ps: util.PS,
          from: util.NCOMMON_PARAMS.from,
          uid: util.NCOMMON_PARAMS.uid
        };
        dataReq.pn = self.currentPage();
        // http://43.241.208.207:9000/hotel/s?st=8&hotelcode=347308&pn=0&ps=10
        m.request({
          url: util.INTERFACE_GETHOTELDATA,
          method: 'GET',
          data: dataReq,
          background: true
        }).then(function(result) {
          util.log(result);
          if (result && (result.status === 0) ) {
            deferred.resolve({
              code: 1,
              data: result
            });
          } else {
            util.alert({content:result.msg});
            deferred.resolve({
              code: -1
            });
          }
        }, function() {
          util.alert({
            content: '网络不给力，请稍后再试试吧',
            ok: '知道了'
          });
          deferred.resolve({
            code: -1
          });
          util.hideLoading();
        });
        
        return deferred.promise;
      },

      percent: function(){
        var self = this;
        var pie1 = document.querySelector('#commentApp-pie1');
        var pie2 = document.querySelector('#commentApp-pie2');
        var percent = self.commentPercent()*20;
        var pn1=180,pn2 =180;
        if(percent>50){
          pn1=0;
          pn2= Math.ceil((1-(percent-50)/50)*180);
        } else {
          pn1=Math.ceil((1-(percent)/50)*180);
          pn2= 180;
        }

        pie1.style.webkitTransform = 'rotate('+pn1+'deg)';
        pie1.style.transform='rotate('+pn1+'deg)';
        pie2.style.webkitTransform = 'rotate('+pn2+'deg)';
        pie2.style.transform='rotate('+pn2+'deg)';
      },

      onunload: function() {
        var self = this;
        util.lazyLoad(false);
        util.scrollEnd(null, false);
        self.commentList([]);
      }
    },

    init: function() {
      var self = this;
      self.isInitialized = true;
    }
  };

  commentApp.controller = function() {
    var vm = commentApp.viewModel;

    // 只需初始化一次即可
    if (!commentApp.isInitialized ) {
      commentApp.init();
    }
    vm.hotelId(m.route.param('hotelId'));
    util.updateTitle(m.route.param('hotelName'));
    vm.commentPercent(m.route.param('userScore'));
    vm.loadFirstPage();

    util.lazyLoad(true);
    util.scrollEnd(function() {
      if (vm.isFirstLoading()) {
        return;
      }
      if (vm.isLoadingMore()) {
        return;
      }
      if (vm.isLoadingMoreNo()) {
        return;
      }
      vm.currentPage(vm.currentPage() + 1);
      vm.loadMorePage();
    }, true);

    return commentApp.viewModel;
  };

  commentApp.view = function(ctrl) {
    return m('.commentApp-w',[
      commentApp.headView(ctrl),
      commentApp.listView(ctrl),
      commentApp.loadMoreView(ctrl),
    ]);
  };

  commentApp.headView = function(ctrl) {
    if (ctrl.isFirstLoading()) {
      return m('.commentApp-head',[
        m('.commentApp-ratetotal',[
          m('.commentApp-hold.commentApp-hold1',[
            m('.commentApp-pie#commentApp-pie1'),
          ]),
          m('.commentApp-hold.commentApp-hold2',[
            m('.commentApp-pie#commentApp-pie2'),
          ]),
          m('.commentApp-total'),
        ])
      ]);
    }
    return m('.commentApp-head',[
      m('.commentApp-ratetotal',[
        m('.commentApp-hold.commentApp-hold1',[
          m('.commentApp-pie#commentApp-pie1'),
        ]),
        m('.commentApp-hold.commentApp-hold2',[
          m('.commentApp-pie#commentApp-pie2'),
        ]),
        m('.commentApp-total', [
          m('span.numFont',ctrl.commentPercent()),
          '分'
        ]),
      ]),
      m('.commentApp-searchtotal',[
        m('span.numFont',ctrl.commentTotal()),
        '条评论'
      ])
    ]);
  };

  commentApp.listView = function(ctrl) {
    if (ctrl.isFirstLoading()) {
      return null;
    }
    if (ctrl.isFirstLoadError()) {
      return commentApp.noHotelView(ctrl);
    }
    if (ctrl.commentList().length == 0) {
      document.body.style.overflow = 'hidden';
      return commentApp.noHotelView(ctrl);
    }
    document.body.style.overflow = 'auto';
    return m('ul.commentApp-list', ctrl.commentList().map(function(comment, index) {
      
      return m('li', [
        m('.commentApp-item-top',[
          m('span.commentApp-item-score', [
            m('span.numFont',comment.ratetotal),
            '分'
          ]),
          m('span.commentApp-item-time', comment.postdate),
          m('span.commentApp-item-roomtype', comment.roomtypename),
        ]),
        m('.commentApp-item-txt', comment.comment),
        m('.commentApp-item-bottom',[
          '来自',
          m('span.numFont',comment.userid.slice(0,7) ),
          '****'
        ]),
      ]);

    }));
  };

  commentApp.noHotelView = function(ctrl) {
    return [
      m('.commentApp-noHotel', '暂无评论')
    ];
  };

  commentApp.loadMoreView = function(ctrl) {
    if (ctrl.isFirstLoading() || ctrl.noData() ) {
      return null;
    }
    if (ctrl.isLoadingMoreNo()) {
      return m('.common-more', [
        '没有更多评论了'
      ]);
    } else if (ctrl.isLoadingMoreError()){
      return m('.common-more', [
        'error'
      ]);
    } else {
      return m('.common-more', [
        m('img', {className: 'loading', src: __uri('../images/loading.gif')}),
        '加载中...'
      ]);
    }
  };

  return commentApp;

})();