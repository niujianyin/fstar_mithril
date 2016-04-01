##https://www.zybuluo.com/njy/note/327043

# 航班管家伙力五星级新版酒店总结

标签（空格分隔）： 航班管家

---

[TOC]

伙力五星级新版酒店
##项目： 伙力五星级新版酒店

可以在航班管家或者高铁管家APP里底部选项卡(TabBarIOS)第三个旅行服务找到入口： 伙力五星

测试内部地址(http://103.37.151.253:9000/index.html)
正式服务器地址(http://hotel.rsscc.cn/hotel1/index.html)

航班管家NativeAPI(https://www.zybuluo.com/tianfangye/note/105706)

前端是单页面MVVM应用，使用轻量级框架mithril,github文档地址(http://lhorie.github.io/mithril/),用h5页面做的Hybrid App（混合模式移动应用）

##代码地址
1. 前端代码在工程目录的 fstar_mithril(https://github.com/huoli-njy/fstar_mithril.git) 下。

##前端自动化工具
1.使用 FIS3（v3.3.15版本，需要运行 node v4.2.5版本） 作为前端代码管理工具，主要功能包括合并文件、JS 压缩、CSS 压缩、LESS 处理、图片雪碧图自动合并等功能。FIS 配置文件在 fstar_mithril/fis-conf.js(fis-conf_3.js)。FIS3 使用文档，参考：http://fis.baidu.com/fis3/docs/beginning/intro.html。 
2. 使用 FIS（v1.9.14版本，需要运行 node v0.12版本） 作为前端代码管理工具，主要功能包括合并文件、JS 压缩、CSS 压缩、LESS 处理、图片雪碧图自动合并等功能。FIS 配置文件在 fstar_mithril/fis-conf.js(fis-conf_1.js)。FIS 使用文档，参考：http://fex.baidu.com/fis-site/docs/beginning/getting-started.html。
3. fis和fis3安装和插件：
```
npm install -g fis3  
npm install -g fis@1.9.14
npm install -g fis-parser-less
npm install -g fis3-postpackager-loader
根据提示安装缺少的插件
```
4.fis常用命令：
```
cd ~/workspace/github/fstar_mithril
  
<!-- 启动本地服务 -->
sudo fis3 server start -p 15080 
<!-- 清除本地服务器内容 -->
sudo fis3 server clean 
<!-- 编译本地文件 -->
sudo fis3 release -w
<!-- 停止本地服务 -->
sudo fis3 server stop

<!-- 启动本地服务 -->
sudo fis server start -p 15080 
<!-- 清除本地服务器内容 -->
sudo fis server clean 
<!-- 编译本地文件 -->
sudo fis release -wp
```

4.浏览器同源策略的绕过
旧版 chrome  开启跨越服务
可以本地起两个服务,后台(nginx)提供接口,fis的node服务器换一个port访问页面实现自动化

```
njy@localhost:~$cd /Applications/
njy@localhost:/Applications$ls
njy@localhost:/Applications$open Google\ Chrome.app/ --args --disable-web-security

```
新版 chrome --args --disable-web-security失效，用
nginx服务器转发
```
sudo nginx
sudo nginx -s reload
sudo nginx -s stop

cd /usr/local/etc/nginx
nginx.conf
<!-- 访问地址 -->
http://localhost/index.html
```

nginx.conf 内容
```

location / {
    proxy_pass http://127.0.0.1:15080/;
    proxy_redirect          off;
    proxy_set_header        X-Real-IP $remote_addr;
    proxy_set_header        Host $host;
    proxy_set_header        X-Forwarded-Host $server_name;
    proxy_set_header        X-Real-IP  $remote_addr;
    proxy_set_header        X-Forwarded-For $remote_addr;
    #root   html;
    #index  index.html index.htm;
}

location /hotel/{
    #proxy_pass http://hotel.rsscc.cn/hotel/;
    proxy_pass http://103.37.151.253:9000/hotel/;
    proxy_redirect          off;
    proxy_set_header        X-Real-IP $remote_addr;
    proxy_set_header        Host $host;
    proxy_set_header        X-Forwarded-Host $server_name;
    proxy_set_header        X-Real-IP  $remote_addr;
    proxy_set_header        X-Forwarded-For $remote_addr;
}

location /rest/{
    proxy_pass http://hotel.huoli.com/rest/;
    #proxy_pass http://hotel-test.rsscc.com/rest/;
    proxy_redirect          off;
    proxy_set_header        X-Real-IP $remote_addr;
    proxy_set_header        Host $host;
    proxy_set_header        X-Forwarded-Host $server_name;
    proxy_set_header        X-Real-IP  $remote_addr;
    proxy_set_header        X-Forwarded-For $remote_addr;
}
```

5.前端源码下面放了几个shell 脚本，用来更加快捷的运行 FIS 命令。如:
> * debug_new.sh(发布到 search@103.37.151.253服务器)(测试服务器)
> * pb.sh(发布到search@43.241.208.207服务器)(正式服务器)
> * publish.sh(发布到本地当前目录的外层目录)
> * debug.sh(发布到 dev0服务器)
> * debug2.sh(发布到 43.241.208.237服务器)

##前端项目详情
###航班管家[NativeAPI](https://www.zybuluo.com/tianfangye/note/105706)
1. Web App 是嵌在航班管家和高铁管家中的，两个管家均采用了 WebViewJSBridge 的方式，为前端提供了一系列的 NativeAPI，赋予了 HTML 一些 Native 的能力。要使用 NativeAPI，首先必须要把 HTML 的域名放在两个管家的白名单中，其次需要引入 fstar_mithril/lib/native-api.js。NativeAPI 的文档在：https://www.zybuluo.com/tianfangye/note/105706。 文档由公司的包义德维护，他的 QQ 是：516990345。

###选用[Mithril](http://lhorie.github.io/mithril/)：
 1. 轻量级,松耦合,压缩后3kb
 2. API 提供一个模板引擎,带 DOM diff实现,支持路由和组合,路由选择上提供了三种(search,hash,pathname),开始选用search(?),为了兼容微信支付(不能占用？),所以选用了hash(#),格式如(http://dev0.xiayizhan.mobi/#list?checkIn=1445996500336&checkOut=1446082900336&city=%E5%8E%A6%E9%97%A8&keyword=&resetCircles=yes)
 ```
 m.route.mode = 'hash';
 
 ```
 3. 声明式的绑定,将大量代码逻辑、状态转到ViewModel
 4. 比avalon和angularJS更轻量,与Vue.js相当
 5. 前端使用了 Mithril的前端MVVM(数据驱动) 框架，与react原理类似，渲染建立在 Virtual DOM 上——一种在内存中描述 DOM 树状态的数据结构。当状态发生变化时， Mithril 重新渲染 Virtual DOM，比较计算之后给真实 DOM 打补丁。
Virtual DOM 提供了一个函数式的方法描述视图，这真的很棒。因为它不使用数据观察机制，每次更新都会重新渲染整个应用，因此从定义上保证了视图与数据的同步。它也开辟了 JavaScript 同构应用的可能性。
 6. 整个 Web App 是单页的，只有部分与主体逻辑关系不大的模块采用了新页面，如地图，选择城市页面。

##前端js详解

```
project(fstar_mithril)
  ├─ htmls   (统一头部配置)  
  │  ├─ commonHead.html (头部文件) 
  ├─ images   (图片)  
  │  ├─ more
  ├─ less   (less) 
  │  ├─ more
  ├─ scripts    (工程模块)
  │  ├─ common  (公共模块)
  │  │  └─ actionSheet.js  (列表星级价格筛选)
  │  │  └─ alert.js  (弹出框 确定)
  │  │  └─ base64.js  (忽略:base64解析)
  │  │  └─ common.js  (代码集成)
  │  │  └─ confirm.js  (弹出框 确定 取消)
  │  │  └─ CONSTANT.js  (公共不变的变量)
  │  │  └─ lazyLoad.js  (图片惰性加载)
  │  │  └─ messageBox.js  (弹出框容器)
  │  │  └─ scrollEnd.js  (分页)
  │  │  └─ toast.js  (日期提示)
  │  │  └─ userCenter.js  (登录控件)
  │  │  └─ util.intro.js  (util初始化)
  │  │  └─ util.js  (util 公共方法)
  │  │  └─ more
  │  ├─ lib     (基础模块)
  │  │  └─ lib.js  (代码集成)
  │  │  └─ mithril.js  (mvvm基础库)
  │  │  └─ mithril.loader.js  (模块加载)
  │  │  └─ native-api.js  (nativeAPI)
  │  │  └─ swiper.min.js  (图片滚动模块)
  │  │  └─ more
  │  ├─ account.js  (忽略:账户信息)
  │  ├─ accountPhoneApp.js  (忽略:验证新手机号)
  │  ├─ activityListApp.js  (忽略:优惠活动)
  │  ├─ brandFilter.js  (品牌筛选)
  │  ├─ circleFilter.js  (位置筛选)
  │  ├─ cityFilter.js  (选择城市)
  │  ├─ cityFilterbat.js  (忽略:备份选择城市)
  │  ├─ citySelector.js  (忽略:老版本选择城市)
  │  ├─ comment.js  (详情评论)
  │  ├─ danpin.js  (忽略:旧版活动页面)
  │  ├─ dateSelector.js  (选择日期)
  │  ├─ demandApp.js  (下订单页面床型选择)
  │  ├─ detail.js  (供应商源)
  │  ├─ detailProduct.js  (床型显示)
  │  ├─ gtOrderList.js  (忽略:旧版高铁订单红包)
  │  ├─ hotelDetail.js  (忽略:酒店介绍)
  │  ├─ hotelDetail2.js  (忽略:酒店介绍)
  │  ├─ indexApp.js  (首页面)
  │  ├─ invoiceApp.js  (发票信息)
  │  ├─ invoiceInfo.js  (发票状态)
  │  ├─ listApp.js  (列表)
  │  ├─ modifyOrderApp.js  (忽略:修改订单)
  │  ├─ nativeOrderPreview.js  (支付显示)
  │  ├─ order.js  (下订单)
  │  ├─ orderPre.js  (航班管家下单页面中间页)
  │  ├─ pay.js  (忽略:微信支付)
  │  ├─ priceFilter.js  (忽略:旧版价格筛选)
  │  ├─ run.js  (Web App入口，定义了Mithril 的各个路由对应关系)
  │  ├─ searchApp.js  (搜索酒店)
  │  ├─ sortFilter.js  (忽略:旧版排序)
  │  ├─ userAddress.js  (常用地址)
  │  ├─ userAddressForm.js  (新增常用地址)
  │  ├─ userBill.js  (常用发票抬头)
  │  ├─ userBillForm.js  (新增常用发票抬头)
  │  ├─ userHome.js  (忽略:我的账户)
  │  ├─ userOrder.js  (我的订单)
  │  ├─ userOrderDetail.js  (订单状态)
  │  ├─ userPassengerForm.js  (新增常用入住人)
  │  ├─ userPassengers.js  (常用入住人)
  │  ├─ verify.js  (忽略:网页版登录)
  │  ├─ voucher.js  (忽略:代金券明细)
  ├─ 0.html    (改变标题页面)
  ├─ ad.html    (广告页面)
  ├─ cityFilter.html    (城市选择页面)
  ├─ debug.sh    (发布到 dev0服务器)
  ├─ debug2.sh    (发布到 43.241.208.237服务器)
  ├─ debug_new.sh    (发布到 search@103.37.151.253服务器)
  ├─ fis-conf.js    (fis编译配置)
  ├─ fis-conf_1.js    (备份:fis@1.9.14编译配置)
  ├─ fis-conf_3.js    (备份:fis3编译配置)
  ├─ gjHotelRecommend.html    (忽略:旧版本行程跳转中间页面)
  ├─ gtgj_ad1.html    (忽略:高铁广告页面)
  ├─ gtOrderList.html    (忽略:订单红包页面)
  ├─ gtxcGoList.html    (行程跳转中间页面)
  ├─ index.html    (首页面)
  ├─ map.html    (地图页面)
  ├─ map.jsp    (忽略:旧版本地图页面)
  ├─ nativeOrderPreview.html    (支付显示页面)
  ├─ orderDetailButton.html    (忽略:旧版本页面)
  ├─ pb.sh    (发布到search@43.241.208.207正式服务器)
  ├─ publish.sh    (忽略:发布到本地当前目录的外层目录)
  ├─ step.html    (快捷步骤页面)
  ├─ test.html    (忽略:测试页面)
  ├─ test.sh    (忽略:测试脚本)
  ...
```
###html文件
1.  0.hmtl 空文件 用来改变微信ipone标题
```
case util.PLATFORM.WEIXIN:
  if (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) {
    document.title = title;
    
    var iframeTmp = document.createElement('iframe');
    iframeTmp.style.display = 'none';
    iframeTmp.src = window.domainName + '/0.html';
    iframeTmp.onload = function() {
      setTimeout(function() {
        iframeTmp.onload = null;
        document.body.removeChild(iframeTmp);
      }, 0);
    };
    document.body.appendChild(iframeTmp);
  } else {
    document.title = title;
  }
```
2.index.html 单页面应用首页
#####在html中嵌入统一头部资源
```
<link rel="import" href="htmls/commonHead.html?__inline">
```
设置全局变量的window.domainName，window.apiRootPath，解决在不同服务器部署的需求
```
<script>
  (function() {
    window.domainName = location.origin;
    window.apiRootPath = domainName;
    window.defaultMain = '';
  })();
  </script>
```
#####引入公共样式
```
<link rel="stylesheet" href="less/common.less" type="text/css">
```
#####引入基础库lib.js 公共common.js 入口路由run.js  图片滚动第三方swiper.min.js  所有其他样式app.less
样式一开始和js一样 是按需加载的  考虑到每个css样式都较小，所以合并所有的样式文件，统一加载
```
<script src="scripts/lib/lib.js"></script>
<script src="scripts/common/common.js"></script>
<script src="scripts/run.js"></script>
<script src="scripts/lib/swiper.min.js"></script>

<link rel="stylesheet" href="less/app.less" type="text/css">
```
主dom容器，根据hash路由在#main里渲染各个模块
```
<div class="main" id="main"></div>
```
3.cityFilter.html 城市选择(城市数据量较多2K+，新开一个页面)
```
var url = './cityFilter.html#cityFilter' +flag;
location.href = url;
```
4.gtxcGoList.html 行程跳转中间页面
5.nativeOrderPreview.html  支付预览
6.htmls/commonHead.html 统一头部

###images
相关图片和雪碧图(图片会被发布为绝对路径)
```
.common-icon-search-city{
  width: 19px;
  height: 20px;
  background: url(../images/searchIconCity@2x.png?__sprite) no-repeat;
}
```
###Less
样式文件才用less  发布为css
```
@import url('./constant.less');
```
通过@import 集成为  common.less 和 app.less

###Script
#### scripts/lib/lib.js 包括mithril.js 和mithril.loader.js
> * mithril.js 让全局有了m函数
> * mithril.loader.js 模块按需加载

#### scripts/common/common.js
设置了全局变量util方法,在common文件夹查阅
```
";util.HOTEL_SUGGEST_TYPE;util.HOTEL_SEARCH_TYPE;util.HOTEL_TYPE_ID;util.HOTEL_NEARBYTYPE;util.HOTEL_PLATFORM_TYPE;util.NCOMMON_PARAMS;util.INTERFACE_GETHOTELDATA;util.INTERFACE_GETHOTELMENUDATA;util.INTERFACE_ADDORDERDATA;util.PS;util.PRICESRC;util.ADDBED;util.PAYTYPE;util.PHONE_REG;util.IMAGE_DIR;util.SCREEN_WIDTH;util.WEEK_NAME;util.CURRENT_CITY;util.ORDER_MAIL_TYPE;util.BREAKFASE_TYPE;util.PAYMENT_METHOD;util.HOTEL_STAR;util.HOTEL_STAR_SIMPLE;util.HOTEL_STAR_OFFICIALSTAR;util.CUSTOMER_PHONE;util.VOUCHER_STATUS;util.STAR_TYPES;util.STAR_TYPES_VALUES;util.SEARCH_PRICE_RANGES;util.SEARCH_PRICE_RANGES_VALUES;util.SORT_TYPES;util.SORT_TYPE_VALUES;util.NO_PAY_NOTICE_NATIVE;util.ACTIVITY_MAIN;util.ACTIVITY_DETAIL;util.PRODUCT_TYPES;util.OS;util.COMMON_PARAMS;util.debug;util.log;util.showLoading;util.hideLoading;util.formatDate;util.dateCount;util.isSameDay;util.getCurrentWeek;util.secretNumber;util.nextDate;util.dateFormatFmt;util.extend;util.extendProp;util.extendCommon;util.readableNum;util.viewData;util.cookie;util.storage;util.sessionStorage;util.updateTitle;util.adjustImage;util.redraw;util.calMaxVoucher;util.calUseableVoucher;util.speedUpNativeAPI;util.openWindow;util.closeWindow;util.closeWebView;util.reload;util.reloadByTime;util.reloadByTimeLocal;util.isPlatform;util.lastestDate;util.rightButtonText;util.showToast;util.hideToast;util.messageBox;util.alert;util.confirm;util.notice;util.stopPropagation;util.actionSheet;util.DEVICE_INFO;util._getDeviceInfo;util.userCenter;util.lazyLoad;util.scrollEnd;util.startApp;util.PLATFORM;util.localTime;util.isReload;util.hasCurPos;util.currentPosition;util.header;util.HUOLIUSER_INFO"
```

#### scripts/run.js（单页面逻辑入口文件）
由于indexApp.js 较小，所以直接嵌入到run.js
```
// util 全局变量 会提前载入  
util.startApp = function(){
__inline('indexApp.js');
}
```
在app中打开webView，都会在cookie里写入appName
```
var appName = util.cookie.getItem('appName');
```
根据util.PLATFORM.CURRENT平台的不同，都调用run()函数，会生成一个全局的虚拟dom对象window.fstar（真实的路由） 和 window.__realRoutes（默认的路由）
```
function run() {
    m.route.mode = 'hash';  //用hash作为路由
    m.route2(document.getElementById('main'), window.defaultMain, {
      '': {
        name: 'indexApp',
        path: __uri('./indexApp.js')
      },
      'cityFilter': { //m.route('cityFilter')
        name: 'cityFilter', // fstar.cityFilter
        path: __uri('./cityFilter.js') //文件的位置
      },
      ...
    }, {
      'namespace': 'fstar' //命名空间
    });
  }
```
调用方法有：
```
m.loadRoute('list').then(function(listApp) {
    m.route('list', {
      checkIn: self.currentDate().getTime(),
      checkOut: checkOut.getTime(),
      city: util.NCOMMON_PARAMS.city
    }, true);
});
```

#### scripts/lib/swiper.min.js调用初始化：
```
var swiper = new Swiper('.swiper-container', {
  pagination: '.swiper-pagination',
  paginationClickable: true
});
```

#### 按需加载indexApp.js：
所有的文件写法固定：
1.命名空间上加路由name函数，函数内部加同名对象，返回这个对象。
```
fstar.indexApp= (function() {
    var indexApp = {};
    return indexApp;
})();
```
2.mvvm 分为三层：
```
//控制层
indexApp.controller=function(){
    //返回数据层对象
    return indexApp.viewModel;
}
//视图层
indexApp.view=function(ctrl){ //ctrl就是数据层对象
    return m('.indexApp',{},[]);
}
//数据层对象
indexApp.viewModel = {

}
```

3.mithril 内部方法实现：
```
//跳转首页  ‘’对应run.js 的路由key
m.route(''); 
//dom容器#main  虚拟dom对象indexApp
m.module(document.getElementById('main'), fstar.indexApp);
//dom容器#main  虚拟dom对象indexApp
m.render(
    document.getElementById('main'),
    indexApp.view( //视图层
        indexApp.controller() //调用controller() 对数据层对象viewModule的数据进行处理 返回数据层对象ctrl
    )
);
```
4.闭包赋值取值
```
city: m.prop(''), //默认m.prop('')初始化
vm.ctiy() //取值
vm.city('北京') //赋值
```
5.文件第一次加载进入会执行一次init().
``` 
if (!indexApp.isInitialized) {
  indexApp.init();
}
```
6.view 视图模板层
```
m(
    '.indexApp', //类名
    {honclick: ctrl.selectCity.bind(ctrl)},//属性
    []//子dom虚拟对象
)

todo.view = function() {
    return m("html", [
        m("body", [
            m("input"),
            m("button", "Add"),
            m("table", [
                m("tr", [
                    m("td", [
                        m("input[type=checkbox]")
                    ]),
                    m("td", "task description"),
                ])
            ])
        ])
    ]);
};
m.render(document, todo.view());

<html>
    <body>
        <input />
        <button>Add</button>
        <table>
            <tr>
                <td><input type="checkbox" /></td>
                <td>task description</td>
            </tr>
        </table>
    </body>
</html>
```
6.具体代码解释如下：
```
fstar.indexApp = (function() {
  var indexApp = {
    isInitialized: false, //首次加载为false
    viewModel: { //viewModel 数据层
      city: m.prop(''), //初始化变量名
      cityid: m.prop(''),
      cityLoc: m.prop(false),
      checkIn: m.prop(''),
      checkOut: m.prop(''),
      priceStar: m.prop(''),
      starLevel: m.prop(['不限']),
      priceRange: m.prop('不限'),
      keyword: m.prop(''),
      type: m.prop('q'),
      sid: m.prop(''),
      sids: m.prop(''),
      lat: m.prop(''),
      lon: m.prop(''),
      typeid: m.prop(''),
      unreadMessageCount: m.prop(0),
      checkTime: function(){}, //添加方法
      selectCity: function() {},
      selectDate: function() {},
      searchKeyword: function() {},
      goToList: function() {},
      cancelKeyword: function() { },
      checkNewMessage: function() { },
      goToDetail: function(hotelId, name) {},
      goToOrder: function() {},
      getCoorByAPI: function(){},
      getAddressByCoor: function(currentPlatName){},
      priceFilter: function() {},
      cancelPriceStar: function() {},
      reloadTime: function(){},
      onunload: function(){} //路由跳转会执行
    },

    init: function() {
      this.isInitialized = true;
    }
  };


  indexApp.controller = function() { //控制器
    var vm = indexApp.viewModel;
    // 同步日期
    vm.reloadTime();
    
    vm.city(util.NCOMMON_PARAMS.city);
    vm.cityid(util.NCOMMON_PARAMS.cityid);
    var cityLoc = util.cookie.getItem("fstar_cityLoc");
    
    if(cityLoc && cityLoc!=="0"){
      cityLoc = JSON.parse(cityLoc);
      vm.cityLoc(cityLoc || false);
    } else {
      vm.cityLoc(false);
    }
    
    
    if (!indexApp.isInitialized) {
      indexApp.init();
    }

    util.updateTitle('伙力特惠五星');
    util.hideLoading();
    vm.unreadMessageCount(0);
    util.userCenter._checkLogin();
    // indexApp.viewModel.checkNewMessage();

    return indexApp.viewModel;
  };

  indexApp.view = function(ctrl) { //view  视图层
    return m('.indexApp', [
      indexApp.searchView(ctrl),
      m('.common-border'),
      indexApp.myBillView(ctrl),
      indexApp.redPacketsView(ctrl),
    ]);
  };

  indexApp.searchView = function(ctrl) {
    ...
  };
  indexApp.myBillView = function(ctrl) {
    ...
  };
  indexApp.redPacketsView = function(ctrl) {
    ...
  };
  return indexApp;

})();
```



###在使用中也遇到一些问题
 1. mithril的事件绑定自动渲染问题autoredraw,它通过绑定 "onhashchange" 或 "onpopstate"事件 来检测变化后redirect(path)来加载js渲染页面, 而onclick后它会自动渲染一次本页面,所以onclick是一个route重定向的命令, 在内存较小的手机,有可能会本页面的render比重定向的render慢,导致本页面不跳转, 目前解决方案自己新添加util.redraw()方法里延时处理
```
util.redraw = function(){
  setTimeout(function(){
    m.redraw();
  },100);
};
```
增加了honclick事件，点击不重新渲染redraw本页面

2.auto focus问题, 在做搜索功能时,进入搜索页面,手机键盘自动弹出,异步加载文件或者延时el.focus()后只获取焦点,键盘不弹出,页面是按需加载模块js的,所以导致第一次进入搜索页面键盘不能弹出, 解决方案：把serachApp.js 这个模块合并到indexApp.js这个文件中,不异步加载解决。

```
m('input.searchApp-input', {
  config: function(el, isInit, context) {
    if(!isInit){
      el.focus();
    }
  },
  type: 'search',
  value: ctrl.typingSearchKey(),
  oninput: ctrl.searchInputInput.bind(ctrl),
  onkeyup: ctrl.searchInputKeyup.bind(ctrl),
  placeholder: '搜索位置/酒店名称'
})
```

3.在定时拉取聊天数据时, 先使用了setInterval, 3s拉取一次, 发现app在实现时,退出打开的聊天webView,回到主页面,聊天webView里的setInterval没有清楚,解决方案,用css3的transition动画代替setInterval

```
html:
<div id="transitionTimeout"></div>
css:
#transitionTimeout{height: 0; overflow: hidden; opacity: 1; -webkit-transition: 3s ease opacity;}
#transitionTimeout.hide{opacity:0;}
js:
/**
 * 每隔 3 秒钟刷新一次消息
 */
function initPullTimer(){
    $('#transitionTimeout').on('webkitTransitionEnd',             function() {
      $(this).toggleClass('hide');
        pull();
    });
  $('#transitionTimeout').addClass('hide');
}
```

4.单页面的拆分：在列表页面做分页后,点击进入详情,然后回退到列表页面,一般浏览器会保留在之前列表页面的位置。但在航班管家的app内发现回直接回退到顶部,无法保留这个位置。解决方案：
单页面的拆分,新建一个createWebView来显示详情,代码结构都不变,只是指定默认的入口文件修改

```
util.openWindow = function(url, flag) {
  if (util.PLATFORM.CURRENT == util.PLATFORM.HBGJ || (flag && util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) ) {
    _nativeAPI.invoke('createWebView', {
      url: url
    });
  } else {
    window.location.href = url;
  }
};

主页面文件入口：
window.defaultMain = '';
详情页面文件入口：
window.defaultMain = 'detail/:hotelId/:currentDate/:stayDayCount';
```

5.http请求文件遭遇拦截问题,在手机移动网络状态下,出现了移动强行插入广告问题。解决方案：改用https的请求文件

6.Promise的使用,越来越多的使用回调了。 mithril使用了大量的闭包,可以使用chrome开发工具Profiles的Collect Javascript CPU Profile 来查看

```
核心代码：
var deferred = m.deferred();
return deferred.promise;

例子：
m.loadRoute = function(route) {
    var deferred = m.deferred();

    if (__realRoutes[route].ctrl === null) {
      loadScript(routesCache[route].path, function() {
        realRoutes[route] = window[namespace][routesCache[route].name];
        deferred.resolve(window[namespace][routesCache[route].name]);
      });
    } else {
      deferred.resolve(window[namespace][routesCache[route].name]);
    }

    return deferred.promise;
  };
  调用：
  m.loadRoute('cityFilter').then(function(cityFilter) {});
```



##Mithril载入页面的3个方法
默认:m.route(dom, home, realRoutes);
单页面:m.module(document.getElementById('login'), fstar.verifyApp);
m.render(document.getElementById('main2'), myActivity.view(myActivity.controller()));

##版本控制gitHub
https://github.com/huoli-njy/fstar_mithril.git


##Worktile
团队协作办公工具选用了Worktile(https://worktile.com/teams/ff731115e7274c7f81de22493a42c690)
##sketch
UI交互使用sketch(http://www.sketchcn.com/)来制作

##七牛云存储
服务器储存选用了 七牛云存储(http://www.qiniu.com/),有windows版自动化上传工具
##.sh命令行
前端使用debug.sh 和 publish.sh 执行命令行文件 来在测试服务器和七牛上发布文件
##nproxy代理
前端使用nproxy(如windows的Fiddler)来调试线上前端代码

##studdy 做模拟JSON数据
```
- request:
    method: GET
    url: ^/rest/mash?$
  response:
    headers:
      content-type: application/json
    file: mash.json
    latency : 300
- request:
    method: GET
    url: ^/rest/messages?$
  response:
    headers:
      content-type: application/json
    file: messages.json
    latency : 3400
# sudo stubby -d rest/config.yaml
# http://localhost:8882/rest/messages
```







