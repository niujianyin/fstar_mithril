fstar.priceFilter = (function() {

  var priceFilter = {
    isInitialized: false,

    viewModel: {
      range: m.prop('all'),


      config: function(opt) {
        var deferred = m.deferred();

        this.deferred = deferred;

        this.range(opt.range);

        return deferred.promise;
      },

      selectRange: function(range) {
        if (this.deferred) {
          this.deferred.resolve(range == 'all' ? 'all' : 'range' + range);
        }
      }
    },
    controller: function() {
      util.updateTitle('价格筛选');

      util.hideLoading();
      document.body.style.overflow = 'auto';

      return priceFilter.viewModel;
    },
    view: function(ctrl) {

      return m('.priceFilter-w', [
        m('.priceFilter-item', {className: ctrl.range() == 'all' ? 'selected' : '', onclick: ctrl.selectRange.bind(ctrl, 'all')}, '全部'),
        m('.common-border'),
        util.SEARCH_PRICE_RANGES.ranges.map(function(key) {
          return [
            m('.priceFilter-item', {className: ctrl.range() == 'range' + key ? 'selected' : '', onclick: ctrl.selectRange.bind(ctrl, key)}, priceFilter.rangeText(util.SEARCH_PRICE_RANGES['range' + key])),
            m('.common-border')
          ];
        })
      ]);
    },
    rangeText: function(range) {
      if (range.min == -1) {
        return '￥' + range.max + '以下';
      } else if (range.max == -1) {
        return '￥' + range.min + '以上';
      } else {
        return '￥' + range.min + ' - ￥' + range.max;
      }
    }
  };


  return priceFilter;

})();