;(function(win) {

  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function loadCSS(src) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.href = src;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    head.appendChild(link);
  }

  function getComponent(path) {
    var index = path.lastIndexOf('/');
    var fileWidthJS = path.substring(index + 1);
    return fileWidthJS.substring(0, fileWidthJS.length - 3);
  }

  // 路由加载启动器
  function moduleLoader(key) {
    var toLoadModule = {
      ctrl: null,

      controller: function() {
        // mithril的redraw机制
        m.startComputation();

        // 加载真实路由
        util.showLoading();
        loadScript(routesCache[key].path, function() {
          // 保留真是路由，当第二次使用到该路由的时候，不会再次加载，而是直接使用保存好的路由
          realRoutes[key] = window[namespace][routesCache[key].name];
          
          toLoadModule.ctrl = realRoutes[key].controller();
          m.controllers[0] = toLoadModule.ctrl;
          m.modules[0] = realRoutes[key];

          // mithril的redraw机制
          m.endComputation();
        });
      },
      view: function() {
        // 手动启动路由模块（该方法只会调用一次）
        // var ctrl = realRoutes[key].controller();
        // console.log('::::::::'+JSON.stringify(toLoadModule.ctrl) );
        // 不能写下面的这句，可能会造成循环调用  造成的原因是 m.redraw()调用是异步的
        // return realRoutes[key].view(toLoadModule.ctrl);
      }
    };
    return toLoadModule;
  }

  // 记录定义的路由
  var routesCache = null;
  // 真正的路由
  var realRoutes = __realRoutes = {};
  // 命名空间
  var namespace = null;

  // 入口
  m.route2 = function(dom, home, routes, config) {
    routesCache = routes;
    namespace = config.namespace;

    // 创建命名空间
    win[namespace] = win[namespace] || {};

    // 加载默认路由
    // loadScript(routes[home].path, function() {
      
      // 把默认路由 直接写入run.js 的startApp中 减少请求数和请求这个单文件的阻塞时间
      util.startApp();
      // 保留默认路由
      realRoutes[home] = win[namespace][routes[home].name];

      // 为路由指定路由加载启动器
      for(var key in routes) {
        if(key === home) {
          continue;
        } else {
          realRoutes[key] = moduleLoader(key);
        }
      }

      // 启动mithril（在此时，只有默认路由是真实路由，剩余都是路由加载启动器，在真正使用到的时候才会加载。）
      m.route(dom, home, realRoutes);
    // });
  };

  m.loadScript = loadScript;
  m.loadCSS = loadCSS;

  m.loadRoute = function(route) {
    var deferred = m.deferred();
    var module = win[namespace][routesCache[route].name];
    if (__realRoutes[route].ctrl === null) {
      if(module && module.viewModel){
        realRoutes[route] = module;
        deferred.resolve(module);
      } else {
        loadScript(routesCache[route].path, function() {
          realRoutes[route] = win[namespace][routesCache[route].name];
          deferred.resolve(win[namespace][routesCache[route].name]);
        });
      }
    } else {
      deferred.resolve(module);
    }
    return deferred.promise;
  };

})(window);