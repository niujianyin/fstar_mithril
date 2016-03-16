util.HOTEL_SUGGEST_TYPE = ['', '品牌', '酒店', '商圈', '地铁', '地标'];
util.HOTEL_SEARCH_TYPE = {
  '热词':'q',
  '特色':'feature',
  '品牌':'brand',
  '商圈':'commercial',
  '热门商圈':'commercial',
  '机场车站':'commercial',
  '地铁站':'commercial',
  '行政区域':'district',
  'q':'q',
  'feature':'feature',
  'brand':'brand',
  'commercial':'commercial',
  'district':'district'
};

util.HOTEL_TYPE_ID = {
  '1':'commercial', //commercial 机场车站
  '2':'brand', //brand 品牌
  '4':'commercial', //commercial 商圈
  '5':'district', //district 行政区
  '7':'commercial', //commercial 地铁站
  '8':'sheshi', //设施
  '9':'feature' //feature 特色
};

util.HOTEL_NEARBYTYPE = ['','火车站','地铁站','机场'];
util.HOTEL_PLATFORM_TYPE = ['', '普通浏览器', '微信', '航班管家','高铁管家'];
/*新版酒店搜索接口公共参数*/ 
util.NCOMMON_PARAMS ={

}
/*新版酒店统一接口*/ 
/*http://43.241.208.207:9000/ */
// util.INTERFACE_GETHOTELDATA = 'http://hotel-test.rsscc.com/hotel/s';
// util.INTERFACE_GETHOTELMENUDATA = 'http://hotel-test.rsscc.com/hotel/menu?cityid=1&menu=1';

// util.INTERFACE_GETHOTELDATA = 'http://43.241.208.207:9000/hotel/s';
// util.INTERFACE_GETHOTELMENUDATA = 'http://43.241.208.207:9000/hotel/menu';
// util.INTERFACE_ADDORDERDATA = 'http://43.241.208.207:9000/hotel/order';

util.INTERFACE_GETHOTELDATA = window.domainName+'/hotel/s';
util.INTERFACE_GETHOTELMENUDATA = window.domainName+'/hotel/menu';
util.INTERFACE_ADDORDERDATA = window.domainName+'/hotel/order';


util.PS = 10;
util.PRICESRC = {
  'ctrip-api-hotel':'携程',
  'qunar-api-hotel':'去哪儿',
  'elong-api-hotel':'艺龙',
  'p2p':'管家自营',
  'guanjia':'管家自营'
}
util.ADDBED = ['不可加床', '收费加床', '免费加床'];
util.PAYTYPE = ['', '预付', '到付', '到付(部分预付)'];

util.PHONE_REG = /^((\+?86)|(\+86))?1[3|4|5|7|8][0-9]\d{8}$/;

util.IMAGE_DIR = 'http://7xisl9.com1.z0.glb.clouddn.com/';
util.SCREEN_WIDTH = document.body.clientWidth > 500 ? 500 : document.body.clientWidth;
util.WEEK_NAME = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

util.CURRENT_CITY = '北京';

util.ORDER_MAIL_TYPE = ['挂号信','挂号信','免费快递'];

util.BREAKFASE_TYPE = ['无早', '单早', '双早', '三早','多早'];

util.PAYMENT_METHOD = ['未知', '预付', '现付'];

util.HOTEL_STAR = ['', '', '', '', '四星/高档', '五星/豪华'];
util.HOTEL_STAR_SIMPLE = ['', '', '二星级', '三星级', '四星级', '五星级'];

util.CUSTOMER_PHONE = '400-811-3390';

util.VOUCHER_STATUS = {
  '15': '新用户注册赠送',
  '16': '订酒店赠送',
  '17': '订酒店-支付',
  '18' : '订酒店-修改订单-退回',
  '19' : '订酒店-确认失败-退回',
  '20' : '订酒店-取消订单-退回'
};


util.STAR_TYPES = ['不限','二星级及以下/经济','三星级/舒适','四星级/高档','五星级/豪华'];
util.STAR_TYPES_VALUES = {
  '不限': 0,
  '二星级及以下/经济': 3,
  '三星级/舒适': 4,
  '四星级/高档': 8,
  '五星级/豪华': 16
};

util.SEARCH_PRICE_RANGES = [
  '不限',
  '￥150元以下',
  '￥150-￥300',
  '￥301-￥450',
  '￥451-￥600',
  '￥601-￥1000',
  '￥1000以上'
];
util.SEARCH_PRICE_RANGES_VALUES = {
  '不限': {min: 0, max: 0},
  '￥150元以下': {min: 0, max: 150},
  '￥150-￥300': {min: 150, max: 300},
  '￥301-￥450': {min: 301, max: 450},
  '￥451-￥600': {min: 451, max: 600},
  '￥601-￥1000': {min: 601, max: 1000},
  '￥1000以上': {min: 1000, max: 0}
};


util.SORT_TYPES = ['推荐排序', '低价优先', '高价优先', '好评优先', '距离优先'];
util.SORT_TYPE_VALUES = {
  '推荐排序': 'score',
  '低价优先': 'minprice',
  '高价优先': 'maxprice',
  '好评优先': 'uscore',
  '距离优先': 'dis',
  '-1':'score'
};

util.NO_PAY_NOTICE_NATIVE = '您尚未完成支付，如现在退出，可稍后进入“个人中心->酒店订单”完成支付。确认退出吗？';

util.ACTIVITY_MAIN = 2;
// util.ACTIVITY_USERCENTER = 2;
util.ACTIVITY_DETAIL = 3;

// util.ACTIVITY_USERCENTER = 0;
// util.ACTIVITY_DETAIL = 0;


util.PRODUCT_TYPES = ['', '伙力管家自营', '由携程提供'];

util.OS = (function() {
  var ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf('ipad') >= 0 || ua.indexOf('iphone') >= 0 || ua.indexOf('ipod') >= 0) {
    return 'iOS';
  } else if (ua.indexOf('android') >= 0) {
    return 'Android';
  } else {
    return 'PC';
  }
})();


/*接口共同的参数*/ 
util.COMMON_PARAMS = {
  comm_from: 1
};
/*listApp*/ 
util.INTERFACE_GETHOTELLIST = window.apiRootPath + '/rest/hotel/getHotelList';
util.INTERFACE_GETHOTELLISTDANPIN = window.apiRootPath + '/rest/hotel/getMarketingHotelList';

/*detailApp*/ 

util.INTERFACE_GETHOTELINFO = window.apiRootPath + '/rest/hotel/getHotelInfoForP2P';
// util.INTERFACE_GETHOTELINFO = window.apiRootPath + '/rest/hotel/getHotelInfo';
util.INTERFACE_GETHOTELINFODANPIN = window.apiRootPath + '/rest/hotel/getMarketingHotelInfo';
/*accountPhoneApp.js*/ 
util.INTERFACE_UPDATEPHONE = window.apiRootPath + '/rest/user/updatePhone';
/*accountPhoneApp.js verifyApp.js*/ 
util.INTERFACE_GETVERIFYCODE = window.apiRootPath + '/rest/user/getVerifyCode';
/*activityListApp.js*/ 
util.INTERFACE_GETACTIVITIES = window.apiRootPath + '/rest/activity/getActivities';
/*common--activityRouter.js activity.js*/ 
// util.INTERFACE_GETACTIVITY = window.apiRootPath + '/rest/activity/getActivity';
/*common--userCenter.js  activity.js*/ 
util.INTERFACE_GETACCOUNTINFO = window.apiRootPath + '/rest/user/getAccountInfo';
/*common--userCenter.js  activity.js*/ 
util.INTERFACE_HUOLILOGIN = window.apiRootPath + '/rest/user/huoliLogin';
/*activity.js*/ 
util.INTERFACE_REWARDVOUCHERS = window.apiRootPath + '/rest/activity/rewardVouchers';
/*hotelInfoApp.js*/ 
util.INTERFACE_GETHOTELDETAIL = window.apiRootPath + '/rest/hotel/getHotelDetail';
/*orderApp.js*/ 
util.INTERFACE_ADDORDERINFO = window.apiRootPath + '/rest/order/addOrderInfo';
/*orderApp.js  userOrderDetail.js*/ 
util.INTERFACE_ORDERPAYNATIVE = window.apiRootPath + '/rest/order/orderPayNative';
util.INTERFACE_MODIFYHOTELORDER = window.apiRootPath + '/rest/order/modifyHotelOrder';

/*payApp.js*/ 
util.INTERFACE_PAYCONFIG = window.apiRootPath + '/rest/wx/pay/payConfig';
/*payApp.js*/
util.INTERFACE_GETPREORDER = window.apiRootPath + '/rest/wx/pay/getPreOrder';
/*payApp.js*/
util.INTERFACE_GETORDERPAYMSG = window.apiRootPath + '/rest/order/getOrderPayMsg';

/*userHome.js*/ 
util.INTERFACE_QUITLOGIN = window.apiRootPath + '/rest/user/quitLogin';
/*userAddress.js*/ 
util.INTERFACE_GETCONTACT = window.apiRootPath + '/rest/user/getContact';
/*userAddressForm.js userBillForm.js userPassengersForm.js*/ 
util.INTERFACE_DELDATA = window.apiRootPath + '/rest/user/delData';
/*userAddressForm.js*/ 
util.INTERFACE_SAVEORUPDATECONTACT = window.apiRootPath + '/rest/user/saveOrUpdateContact';

/*userBill.js*/ 
util.INTERFACE_GETINVOICE = window.apiRootPath + '/rest/user/getInvoice';
/*userBillForm.js*/ 
util.INTERFACE_SAVEORUPDATEINVOICE = window.apiRootPath + '/rest/user/saveOrUpdateInvoice';

/*userOrder.js*/ 
util.INTERFACE_GETORDERLIST = window.apiRootPath + '/rest/order/getOrderList';
/*userOrderDetail.js*/ 
util.INTERFACE_GETHOTELORDER = window.apiRootPath + '/rest/order/getHotelOrder';
/*userOrderDetail.js*/ 
util.INTERFACE_ADDSPREADORDER = window.apiRootPath + '/rest/order/addSpreadOrder';
/*userOrderDetail.js nativeOrderPreview.js*/ 
util.INTERFACE_GETORDERINFO = window.apiRootPath + '/rest/order/getOrderInfo';
/*userOrderDetail.js*/ 
util.INTERFACE_CANCELORDER = window.apiRootPath + '/rest/order/cancelOrder';
/*userOrderDetail.js*/ 
util.INTERFACE_DELORDER = window.apiRootPath + '/rest/order/delOrder';
/*userOrderHistory.js*/
util.INTERFACE_GETORDERLOG = window.apiRootPath + '/rest/order/getOrderLog';
/*userPassengers.js*/
util.INTERFACE_GETACCOUNTGUESTS = window.apiRootPath + '/rest/user/getAccountGuests';
/*userPassengersForm.js*/
util.INTERFACE_SAVEORUPDATEPASSENGER = window.apiRootPath + '/rest/user/saveOrUpdatePassenger';
/*verifyApp.js*/ 
util.INTERFACE_LOGIN = window.apiRootPath + '/rest/user/login';
/*voucher.js*/ 
util.INTERFACE_GETACCOUNTVOFUCHERLOG = window.apiRootPath + '/rest/user/getAccountVoucherLog';

util.INTERFACE_ALLCITY = window.apiRootPath + '/rest/hotel/getAllCities';
util.INTERFACE_CIRCLESBYCITY = window.apiRootPath + '/rest/hotel/getCirclesByCity';

util.INTERFACE_RECORDBOOKINFO = window.apiRootPath + '/rest/order/recordBookInfo';

/*orderApp.js*/ 
util.INTERFACE_GETLASTORDERCONTACTINFO = window.apiRootPath + '/rest/order/getLastOrderContactInfo';
/*orderApp.js*/ 
util.INTERFACE_GETMODIFYHOTELORDER = window.apiRootPath + '/rest/order/getModifyHotelOrder';

/* userOrderDetail */
util.INTERFACE_GETORDERPRESENTVOUCHER = window.apiRootPath + '/rest/order/getOrderPresentVoucher';
util.INTERFACE_HUOLIPAYCHECK = window.apiRootPath + '/rest/order/huoliPayCheck';


/*userOrderDetail.js*/ 
util.INTERFACE_SAVEORUPDATEORDERINVOICE = window.apiRootPath + '/rest/order/saveOrUpdateOrderInvoice';
util.INTERFACE_HASUNREADMSG = window.apiRootPath + '/rest/order/getUnreadMsgCount';
util.INTERFACE_GETCHATURL = window.apiRootPath + '/rest/order/getChatUrl';

util.INTERFACE_CANCELORDERAFTERPAY = window.apiRootPath + '/rest/order/cancelOrderAfterPay';
util.INTERFACE_CANCELORDERAPPLY = window.apiRootPath + '/rest/order/cancelOrderApply';
util.INTERFACE_UNDOCANCELORDERAPPLY = window.apiRootPath + '/rest/order/undoCancelOrderApply';

/*modifyOrderApp.js*/ 
util.INTERFACE_MODIFYORDERGUEST = window.apiRootPath + '/rest/order/modifyOrderGuest';
util.INTERFACE_MODIFYORDERGUESTNOAPPLY = window.apiRootPath + '/rest/order/modifyOrderGuestNoApply';



util.INTERFACE_SEARCHING = window.apiRootPath + '/rest/hotel/searchTip';

util.INTERFACE_ORDERCHECK = window.apiRootPath + '/rest/order/orderCheck';
/*indexApp.js*/ 
util.INTERFACE_GETRECENTHOTELLIST = window.apiRootPath + '/rest/hotel/getRecentHotelList';
util.INTERFACE_GETADDRESSBYCOOR = window.apiRootPath + '/rest/hotel/getAddressByCoor';

util.INTERFACE_GETSERVERTIME = window.apiRootPath + '/rest/hotel/getServerTime';
util.INTERFACE_GETHOTELINFODATA = window.apiRootPath + '/rest/hotel/getHotelInfoData';

util.INTERFACE_GETLASTBOOKTIME = window.apiRootPath + '/rest/hotel/getLastBookTime';
// 行程中间页面根据城市code获取城市列表
util.INTERFACE_GETCITYBYTRAINCODE = window.apiRootPath + '/rest/hotel/getCityByTrainCode';
util.INTERFACE_GETHUOLIORDERLIST = window.apiRootPath + '/huoli/order/getHuoLiOrderList';



