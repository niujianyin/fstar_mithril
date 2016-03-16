;(function(win){
  var deferred;
  function actionSheetSure() {
    return function(e) {
      util.actionSheet.asStarLevel = [];
      var $level = document.getElementById('asStarLevel');
      var $levelItem = $level.querySelectorAll('.selected');
      for(var i=0,l=$levelItem.length; i<l; i++){
        util.actionSheet.asStarLevel.push($levelItem[i].getAttribute('data-value'));
      }
      deferred.resolve({
        "level":util.actionSheet.asStarLevel, 
        "range":util.actionSheet.asPriceRange
      });
      document.getElementById('actionSheet').className = 'common-as';
      return false;
    };
  }

  function actionSheetCancelSelected(id) {
    return function(e) {
      deferred.resolve('cancel');
      document.getElementById('actionSheet').className = 'common-as';
      return false;
    };
  }

  util.stopPropagation = function(e){
    e = e || window.event;  
    e.stopPropagation();
    return false;
  }
  util.actionSheet = function( levels, level, priceRange, selectPrice) {
    deferred = m.deferred();
    var commonItems = document.getElementById('actionSheetContent').querySelectorAll('.common-as-items');
    if(commonItems.length <= 0){
      m.request({
        // url: util.INTERFACE_ALLCITY,
        url: util.INTERFACE_GETHOTELMENUDATA,
        method: 'GET',
        data: {
          st:6,
          menu:3,
          cityid: util.NCOMMON_PARAMS.cityid,
          from: util.NCOMMON_PARAMS.from,
          uid: util.NCOMMON_PARAMS.uid
        }
      }).then(function(result) {
        var data = result.data;
        var data1 = data[0].data;
        var data2 = data[1].data;
        var name1 = data[0].name || '星级';
        var name2 = data[1].name || '价格';
        if(data1.length>0){
          util.STAR_TYPES = [];
          util.STAR_TYPES_VALUES={};
          for(var ii=0,leni=data1.length; ii<leni; ii++){
            util.STAR_TYPES.push(data1[ii].name);
            util.STAR_TYPES_VALUES[data1[ii].name]=data1[ii].id;
          }
          levels = util.STAR_TYPES;
        }
        if(data2.length>0){
          util.SEARCH_PRICE_RANGES = [];
          util.SEARCH_PRICE_RANGES_VALUES = {};
          for(var jj=0,lenj=data2.length; jj<lenj; jj++){
            util.SEARCH_PRICE_RANGES.push(data2[jj].name);
            util.SEARCH_PRICE_RANGES_VALUES[data2[jj].name]={
              min: data2[jj].minprice, 
              max: data2[jj].maxprice
            };
          }
          priceRange = util.SEARCH_PRICE_RANGES;
        }

        var html = [];
        html.push('<div class="common-as-items">');
        html.push('<div class="common-as-title common-as-titleInit">'+name1+'</div><div class="common-as-box clearfix" id="asStarLevel">');

        for(var i = 0; i < levels.length; i++) {
          if ( level.indexOf(levels[i]) > -1 ) {
            html.push('<div class="common-as-sbox selected" data-value="' + levels[i] + '">' + levels[i] + '</div>'); 
          } else {
            html.push('<div class="common-as-sbox" data-value="' + levels[i] + '">' + levels[i] + '</div>');
          }
        }

        html.push('</div>');
        html.push('<div class="common-as-title">'+name2+'</div><div class="common-as-box clearfix" id="asPriceRange">');
        for(var j = 0; j < priceRange.length; j++) {
          if ( selectPrice == priceRange[j] ) {
            html.push('<div class="common-as-sbox selected" data-value="' + priceRange[j] + '">' + priceRange[j] + '</div>'); 
          } else {
            html.push('<div class="common-as-sbox" data-value="' + priceRange[j] + '">' + priceRange[j] + '</div>');
          }
        }

        html.push('</div>');
        html.push('</div>');
        html.push('<div id="common-as-btn">确定</div>');

        document.getElementById('actionSheetContent').innerHTML = html.join('');
        document.getElementById('actionSheet').className = 'common-as show';

        util.actionSheet.asStarLevel = level;
        util.actionSheet.asPriceRange = selectPrice;
        var $asStarLevel = document.getElementById('asStarLevel');
        var $asStarLevelItem = $asStarLevel.querySelectorAll('.common-as-sbox');

        $asStarLevel.addEventListener('click', function(e){
          var e = e || window.event;
          var el = e.target;
          var value = el.getAttribute('data-value');
          if(value == '不限'){
            for(var i=0, len=$asStarLevelItem.length; i<len; i++){
              $asStarLevelItem[i].className = 'common-as-sbox';
            }
            el.className = 'common-as-sbox selected';
          } else {
            $asStarLevelItem[0].className = 'common-as-sbox';
            if( el.className.indexOf('selected') > -1 ){
              el.className = 'common-as-sbox';
            } else {
              el.className = 'common-as-sbox selected';
            }
            var selectLen = $asStarLevel.querySelectorAll('.selected').length;
            if( selectLen==0 || $asStarLevelItem.length == (selectLen+1) ){
              for(var i=0, len=$asStarLevelItem.length; i<len; i++){
                $asStarLevelItem[i].className = 'common-as-sbox';
              }
              $asStarLevelItem[0].className = 'common-as-sbox selected';
            }
          }
          $asStarLevel.className = 'common-as-box clearfix';
          return false;
        }, false);

        var $asPriceRange = document.getElementById('asPriceRange');
        var $asPriceRangeItem = $asPriceRange.querySelectorAll('.common-as-sbox');
        document.getElementById('asPriceRange').addEventListener('click', function(e){
          var e = e || window.event;
          var value = e.target.getAttribute('data-value');
          if(value){
            for(var i=0, len=$asPriceRangeItem.length; i<len; i++){
              $asPriceRangeItem[i].className = 'common-as-sbox';
            }
            e.target.className = 'common-as-sbox selected';
            util.actionSheet.asPriceRange = value;
          }
          $asPriceRange.className = 'common-as-box clearfix';
          return false;
        }, false);
        document.getElementById('common-as-btn').addEventListener('click', util.actionSheetSureName = actionSheetSure(), false);
        document.getElementById('actionSheetBg').addEventListener('click', util.actionSheetCancelSelectedName = actionSheetCancelSelected('actionSheetBg'), false);
      });
    } else {
      util.actionSheet.asStarLevel = level;
      util.actionSheet.asPriceRange = selectPrice;
      var $asStarLevel = document.getElementById('asStarLevel');
      var $asStarLevelItem = $asStarLevel.querySelectorAll('.common-as-sbox');
      for(var i = 0; i < $asStarLevelItem.length; i++) {
        var el = $asStarLevelItem[i];
        var val = el.getAttribute('data-value');
        if ( level.indexOf(val) > -1 ) {
          el.className = 'common-as-sbox selected';
        } else {
          el.className = 'common-as-sbox';
        }
      }

      var $asPriceRange = document.getElementById('asPriceRange');
      var $asPriceRangeItem = $asPriceRange.querySelectorAll('.common-as-sbox');
      for(var i = 0; i < $asPriceRangeItem.length; i++) {
        var el = $asPriceRangeItem[i];
        var val = el.getAttribute('data-value');
        if ( selectPrice == val ) {
          el.className = 'common-as-sbox selected';
        } else {
          el.className = 'common-as-sbox';
        }
      }

      document.getElementById('actionSheet').className = 'common-as show';
    }
    return deferred.promise;
  };

})(window)
