util.debug = false;
util.log = function(){
  if(util.debug){
    console.log.apply(console, arguments);
  }
}
util.showLoading = function() {
  document.getElementById('loading').style.display = 'block';
};

util.hideLoading = function() {
  document.getElementById('loading').style.display = 'none';
};

util.formatDate = function(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = month < 10 ? '0' + month : month;
  var day = date.getDate();
  day = day < 10 ? '0' + day : day;
  return [year, month, day].join('-');
};

util.dateCount = function(beginDate, endDate) {
  var date1 = new Date(util.dateFormatFmt(beginDate, 'yyyy/MM/dd'));


  // date1.setYear(beginDate.getFullYear());
  // date1.setMonth(beginDate.getMonth());
  // date1.setDate(beginDate.getDate());

  var date2 = new Date(util.dateFormatFmt(endDate, 'yyyy/MM/dd'));
  // date2.setYear(endDate.getFullYear());
  // date2.setMonth(endDate.getMonth());
  // date2.setDate(endDate.getDate());
  
  return Math.ceil((date2.getTime() - date1.getTime()) / MILLSECONDS_PER_DAY);
};

// util.dateCountFloor = function(beginDate, endDate) {
//   return Math.floor((endDate.getTime() - beginDate.getTime()) / MILLSECONDS_PER_DAY);
// };

util.isSameDay = function(date1, date2, isTime) {
  if(isTime){ date1 = new Date(date1); date2 = new Date(date2); }
  return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
};

util.getCurrentWeek = function(time){
    var curTime = new Date().getTime();
    var finalText = '';
    if( util.isSameDay(curTime, time, true) ){
      finalText = '今天';
    } else if( util.isSameDay( curTime+ MILLSECONDS_PER_DAY , time, true) ){
      finalText = '明天';
    } else if ( util.isSameDay( curTime+ MILLSECONDS_PER_DAY * 2 , time, true) ) {
      finalText = '后天';
    } else {
      finalText = util.WEEK_NAME[(new Date(time)).getDay()];
    }
    return finalText;
};

util.secretNumber = function(phone) {
  if(!phone){ return '--';}
  if (phone.length === 11) {
    return phone.substring(0, 3) + '****' + phone.substring(7);
  } else {
    return phone;
  }
};


var MILLSECONDS_PER_DAY = 24 * 60 * 60 * 1000;

util.nextDate = function(date, dayCount) {
  var nextDate = new Date(date.getTime() + MILLSECONDS_PER_DAY * dayCount);
  return nextDate;
};



/**
 * 将 Date 转化为指定格式的String
 * @param date Object
 * @param fmt String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符 
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
 * date = date.replace(/-/g,"/"); util.dateFormatFmt(new Date(date),"MM月dd日")
 * util.dateFormatFmt( new Date(), "yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
 * util.dateFormatFmt( new Date(), "yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
 */

util.dateFormatFmt = function (date, fmt) { 
  if(Object.prototype.toString.call(date) == "[object String]"){
    date = date.replace(/-/g, '/');
  }
  date = new Date(date);
  var o = {
    "M+": date.getMonth() + 1, //月份 
    "d+": date.getDate(), //日 
    "h+": date.getHours(), //小时 
    "m+": date.getMinutes(), //分 
    "s+": date.getSeconds(), //秒 
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
    "S": date.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

/**
 * util.extend(target, source)
 * 对象属性拷贝
 * @param {object} target
 * @param {object} source
 * @return {object}
 */
util.extend = function (target, source) {
  for (var p in source) {
    if (source.hasOwnProperty(p)) {
      target[p] = m.prop(source[p]);
    }
  }
  return target;
}

util.extendProp = function (target, source) {
  for (var p in source) {
    if (source.hasOwnProperty(p)) {
      target[p] = source[p];
    }
  }
  return target;
}

util.extendCommon = function (target) {
  for (var p in util.NCOMMON_PARAMS) {
    if (!target.hasOwnProperty(p) && util.NCOMMON_PARAMS.hasOwnProperty(p)) {
      target[p] = util.NCOMMON_PARAMS[p];
    }
  }
  return target;
}

util.readableNum = function(num) {
  if (num < 1000) {
    return num;
  } else {
    num = parseInt(num, 10);
    var numStr = num + '';
    var firstIndex = numStr.length % 3;
    var result = [];
    if (firstIndex != 0) {
      result.push(numStr.substring(0, firstIndex));
    }
    for (var i = firstIndex; i < numStr.length; i += 3) {
      result.push(numStr.substring(i, i + 3));
    }
    return result.join(',');
  }
};


util.viewData = function() {
  var e = 0, l = 0, i = 0, g = 0, f = 0, m = 0;
  var j = window, h = document, k = h.documentElement;
  e = k.clientWidth || h.body.clientWidth || 0;
  l = j.innerHeight || k.clientHeight || h.body.clientHeight || 0;
  g = h.body.scrollTop || k.scrollTop || j.pageYOffset || 0;
  i = h.body.scrollLeft || k.scrollLeft || j.pageXOffset || 0;
  f = Math.max(h.body.scrollWidth, k.scrollWidth || 0);
  m = Math.max(h.body.scrollHeight, k.scrollHeight || 0, l);
  return {scrollTop: g,scrollLeft: i,documentWidth: f,documentHeight: m,viewWidth: e,viewHeight: l};
};


util.cookie = (function(doc, win){
  return {
    getItem: function(key){
      var cookieKey = key + '=';
      var result = '';
      if(doc.cookie.length > 0){
        var index = doc.cookie.indexOf(cookieKey);
        if(index != -1){
          index += cookieKey.length;
          var lastIndex = doc.cookie.indexOf(';', index);
          if(lastIndex == -1){
            lastIndex = doc.cookie.length;
          }
          result = win.decodeURIComponent(doc.cookie.substring(index, lastIndex));
        }
      }
      return result;
    },
    setItem: function(key, value, expiresDays){
      var time = new Date();
      if(expiresDays){
        //将time设置为 expiresDays 天以后的时间 
        time.setTime(time.getTime()+expiresDays*24*3600*1000); 
      } else {
        time.setFullYear(time.getFullYear() + 1);
      }

      if (expiresDays == 0) {

        doc.cookie = key + '=' + win.encodeURIComponent(value) + ';';
      } else {

        doc.cookie = key + '=' + win.encodeURIComponent(value) + '; expires=' + time.toGMTString() + ';';
      }
      
    },
    removeItem: function(key){
      // alert(key);
      var time = new Date();
      time.setDate(time.getDate()-1); 
      doc.cookie = key + '=0; expires=' + time.toGMTString();
      // alert(util.cookie.getItem("fstar_cityLoc"));
    //   var self = this;
    //   var exp = new Date();
    //   exp.setTime(exp.getTime() + (-1 * 24 * 60 * 60 * 1000));
    //   var cval = self.getItem(key);
    //   alert(cval);
    //   document.cookie = key + "=" + cval + "; expires=" + exp.toGMTString();
      // alert(key);
      // alert(util.cookie.getItem(key));
      var cval = util.cookie.getItem(key);
      if(cval){
        util.cookie.setItem(key, "0");
      }
    }
  };
})(document, window);

util.storage = (function(doc, win){
  var localStorage = window.localStorage;
  // 优先使用localStorage
  if(localStorage){
    return {
      getItem: function(key){
        return localStorage.getItem(key);
      },
      setItem: function(key, value){
        // 在一些设备下, setItem之前必须调用removeItem
        localStorage.removeItem(key);
        localStorage.setItem(key, value);
      },
      removeItem: function(key){
        localStorage.removeItem(key);
      }
    };
  } else {
    return {
      getItem: util.cookie.getItem,
      setItem: util.cookie.setItem,
      removeItem: util.cookie.removeItem
    };
  }
})(document, window);

util.sessionStorage = (function(doc, win){
  var sessionStorage = window.sessionStorage;
  // 优先使用localStorage
  if(sessionStorage){
    return {
      getItem: function(key){
        return sessionStorage.getItem(key);
      },
      setItem: function(key, value){
        // 在一些设备下, setItem之前必须调用removeItem
        sessionStorage.removeItem(key);
        sessionStorage.setItem(key, value);
      },
      removeItem: function(key){
        sessionStorage.removeItem(key);
      }
    };
  } else {
    return {
      getItem: util.storage.getItem,
      setItem: util.storage.setItem,
      removeItem: util.storage.removeItem
    };
  }
})(document, window);

util.updateTitle = function(title) {
  switch(util.PLATFORM.CURRENT) {
    case util.PLATFORM.BROWSER:
      document.title = title;
    break;
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
    break;
    case util.PLATFORM.HBGJ:
    case util.PLATFORM.GTGJ:
      _nativeAPI.invoke('updateTitle', {text: title});
    break;
  }
};

util.adjustImage = function(srcSize, destSize) {
  var result = {};
  if(!srcSize.width || !srcSize.height){
    srcSize.width = destSize.width;
    srcSize.height = destSize.height;
  }
  if (srcSize.width / srcSize.height >= destSize.width / destSize.height) {
    result.height = destSize.height;
    result.width = srcSize.width / srcSize.height * destSize.height;
  } else {
    result.width = destSize.width;
    result.height = destSize.width / (srcSize.width / srcSize.height);
  }
  return result;
};

util.redraw = function(){
  setTimeout(function(){
    m.redraw();
  },100);
};

/** trim() method for String */
if(!String.prototype.trim){
  String.prototype.trim=function() {  
    return this.replace(/(^\s*)|(\s*$)/g,'');  
  }; 
}


// 计算某个酒店的最大可用券
util.calMaxVoucher = function(maxVoucher) {
  return window.parseInt(maxVoucher / 10) * 10;
};

// 计算用户最大可用券
util.calUseableVoucher = function(myVoucher, maxVoucher) {
  if(myVoucher <= 0){ return 0;}
  if (myVoucher >= maxVoucher) {
    return maxVoucher;
  } else {
    return window.parseInt(myVoucher / 10) * 10;
  }
};

util.speedUpNativeAPI = function() {
  var appName = util.cookie.getItem("appName");
  if ( /hbgj/i.test(appName) ) {
    window.location.href = "openetjs://start?type=nativeapi";
  } else if ( /gtgj/i.test(appName) ) {
    window.location.href = "gtgj://start?type=nativeapi";
  }
};

util.openWindow = function(url, flag) {
  if (util.PLATFORM.CURRENT == util.PLATFORM.HBGJ || (flag && util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) ) {
    _nativeAPI.invoke('createWebView', {
      url: url
    });
  } else {
    window.location.href = url;
  }
};

util.closeWindow = function(url) {
  if (util.PLATFORM.CURRENT == util.PLATFORM.HBGJ) {
    if (url && url !== 'undefined') {
      _nativeAPI.invoke('webViewCallback', {
        url: url
      });
    } else {
      _nativeAPI.invoke('close');
    }
  } else {
    window.location.replace(url);
  }
};

util.closeWebView = function() {
  if (util.PLATFORM.CURRENT == util.PLATFORM.HBGJ  || (util.PLATFORM.CURRENT == util.PLATFORM.GTGJ) ) {
    _nativeAPI.invoke('close');
  }
};

util.reload = function(){
  location.reload( true );
}

util.reloadByTime = function( checkIn ){
  var deferred = m.deferred();
  var dataReq = {};
  util.extendProp(dataReq, util.COMMON_PARAMS);
  m.request({
    method: 'GET',
    url: util.INTERFACE_GETSERVERTIME,
    data: {param: JSON.stringify(dataReq)}
  }).then(function(data) {
    if( data && data.code == 100 ){
      // util.hideLoading();
      var timeNow = new Date(data.msg.replace(/-/g,'/')).getTime();
      var checkInTime = new Date(checkIn).getTime();

      util.serverTime = timeNow;
      if(checkInTime < timeNow){
        util.isReload = true;
      } else {
        util.isReload = false;
      }
      deferred.resolve(util.isReload);
    } else {
      util.alert({content:data.content});
      deferred.resolve(null);
    }

  }, function() {
    util.alert({
      title: '未连接到互联网',
      content: '请检查网络是否通畅'
    });
    util.hideLoading();
    deferred.resolve(null);
    return;
  });

  return deferred.promise;
}

util.reloadByTimeLocal = function( checkIn ){
  if(!checkIn){ checkIn = new Date();}
  var timeNow = new Date(util.dateFormatFmt(new Date(), 'yyyy/MM/dd')).getTime();
  var checkInTime = new Date(checkIn).getTime();

  util.localTime = timeNow;
  if(checkInTime < timeNow){
    util.isReload = true;
  } else {
    util.isReload = false;
  }
}

util.isPlatform = function(){
  util.isGJ = false;
  util.isWX = false;
  util.isOther = false;
  switch(util.PLATFORM.CURRENT) {
    case util.PLATFORM.HBGJ:
    case util.PLATFORM.GTGJ:
      util.isGJ = true;
      break;
    case util.PLATFORM.WEIXIN:
      util.isWX = true;
      break;
    default:
      util.isOther = true;
  }
}
util.lastestDate = function(num){
  var dnum = num%24;
  if(dnum < 10){
    return '0'+dnum+':00' 
  } else {
    return dnum+':00'
  }
}
