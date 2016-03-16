fstar.sortFilter = (function() {

  var sortFilter = {
    isInitialized: false,

    viewModel: {
      sortType: m.prop(1),


      config: function(opt) {
        var deferred = m.deferred();

        this.deferred = deferred;

        this.sortType(opt.sortType);

        return deferred.promise;
      },

      selectType: function(sortType) {
        if (this.deferred) {
          this.deferred.resolve(sortType);
        }
      }
    },
    controller: function() {
      util.updateTitle('排序');

      util.hideLoading();
      document.body.style.overflow = 'auto';

      return sortFilter.viewModel;
    },
    view: function(ctrl) {

      return m('.sortFilter-w', [
        m('.common-border'),

        m('.sortFilter-item', {className: ctrl.sortType() == 1 ? 'selected' : '', onclick: ctrl.selectType.bind(ctrl, 1)}, util.SORT_TYPES[1]),
        m('.common-border'),

        m('.sortFilter-item', {className: ctrl.sortType() == 2 ? 'selected' : '', onclick: ctrl.selectType.bind(ctrl, 2)}, util.SORT_TYPES[2]),
        m('.common-border'),

        m('.sortFilter-item', {className: ctrl.sortType() == 3 ? 'selected' : '', onclick: ctrl.selectType.bind(ctrl, 3)}, util.SORT_TYPES[3]),
        m('.common-border')
      ]);
    }
  };


  return sortFilter;

})();