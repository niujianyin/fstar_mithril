fstar.activityListApp = (function() {

  var activityListApp = {
    
    isInitialized: false,

    viewModel: {
      activityList: m.prop([]),

      loadData: function() {
        util.showLoading();

        var self = this;

        var dataReq = {};
        util.extendProp(dataReq, util.COMMON_PARAMS);

        m.request({
          method: 'GET',
          // url: window.apiRootPath + '/rest/activity/getActivities',
          url: util.INTERFACE_GETACTIVITIES,
          data: {param: JSON.stringify(dataReq)},
          background: true
        }).then(function(data) {
          util.hideLoading();

          if (data && data.code == 100 ) {
            if (data.activityInfo && data.activityInfo.length > 0) {
              self.activityList(data.activityInfo);
              util.redraw();
            } else {
              util.alert({
                title: '对不起',
                content: '没有相关的活动'
              });
            }
          } else {
            util.alert({
              title: '对不起',
              content: data.content
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

      onunload: function() {
        util.log('activityListApp unload');
        this.activityList([]);
      }
    },

    init: function() {

      // 只初始化了一次，所以css文件只加载了一次
      this.isInitialized = true;
    }
  };


  


  activityListApp.controller = function() {

    // 只需初始化一次即可
    if (!activityListApp.isInitialized) {
      util.log('activityListApp is initialized');
      activityListApp.init();
    }

    util.updateTitle('优惠活动');

    util.hideLoading();
    activityListApp.viewModel.loadData();

    return activityListApp.viewModel;
  };

  activityListApp.view = function(ctrl) {
    return [
      activityListApp.listView(ctrl)
    ];
  };

  activityListApp.listView = function(ctrl) {
    var from = '';
    if (util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) {
      from = 'gtgj';
    } else if (util.PLATFORM.CURRENT == util.PLATFORM.HBGJ) {
      from = 'hbgj';
    }
    return m('ul.activityListApp-list', ctrl.activityList().map(function(activity, index) {
      var toRoute = m.route.param('toRoute');
      var finalUrl = activity.url
        + (activity.url.indexOf("?") > 0 ? "&" : "?")
        + 'from=' + from
        + '&redirectUrl=' + window.encodeURIComponent(window.domainName)
        + '&v=' + (new Date).getTime();
        

      return m('li', [
        m('a', {
          className: 'activityListApp-bgColor'+index%4,
          onclick: function() {
            util.openWindow(finalUrl);
          }
        }, [
          m('.activityListApp-icon',[
            m('img',{
              src: activity.image
            })
          ]),
          m('.activityListApp-title', activity.name),
          m('.activityListApp-desc', activity.subName)
        ])
      ]);

    }));
  };


  return activityListApp;

})();