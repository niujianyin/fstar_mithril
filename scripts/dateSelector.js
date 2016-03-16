fstar.dateSelector = (function() {

  var regular_days = {
    // '1-1': '元旦',
    // '2-14': '情人节',
    // '3-8': '妇女节',
    // '4-1': '愚人节',
    // '5-1': '劳动节',
    // '5-4': '青年节',
    // '6-1': '儿童节',
    // '7-1': '建党节',
    // '8-1': '建军节',
    // '9-10': '教师节',
    // '10-1': '国庆节',
    // '12-25': '圣诞节'
  };

  var special_days = {
    // '2015-9-27': '中秋节',
    // '2015-10-21': '重阳节',
    // '2015-12-22': '冬至',
    // '2016-1-17': '腊八节',
    // '2016-2-7': '除夕',
    // '2016-2-8': '春节',
    // '2016-2-22': '元宵节',
    // '2016-3-8': '妇女节',
    // '2016-3-20': '春分',
    // '2016-4-1': '愚人节',
    // '2016-4-4': '清明',
    // '2016-5-8': '母亲节',
    // '2016-6-9': '端午节',
    // '2016-6-19': '父亲节',
  };

  var dateSelector = {
    isInitialized: false,

    viewModel: {
      beginDate: m.prop(''),
      endDate: m.prop(''),
      today: m.prop(''),
      firstSelected: m.prop(false),
      config: function(date) {
        var deferred = m.deferred();
        this.deferred = deferred;
        this.beginDate(new Date(date.beginDate));
        this.endDate(util.nextDate(new Date(date.beginDate), date.dayCount));
        return deferred.promise;
      },

      back: function() {
        this.deferred.resolve({
          beginDate: this.beginDate(),
          dayCount: util.dateCount(this.beginDate(), this.endDate())
        });
      },

      selectDate: function(date) {
        var self = this;
        if (self.firstSelected()) {
          var compare = dateSelector.compareDay(date, self.firstSelected());
          if (compare === 0) {
            return;
          } else if (compare < 0) {
            self.beginDate(date);
            self.endDate(self.firstSelected());
          } else {
            self.endDate(date);
            self.beginDate(self.firstSelected());
          }

          if (util.dateCount(self.beginDate(), self.endDate()) > 25) {
            util.alert({
              title: '提示',
              content: '如果需要入住25天以上，请分订单预订'
            });
            return;
          }
          self.back();
        } else {
          util.showToast('请选择离店日期', 1000);
          self.firstSelected(date);
          self.beginDate(date);
          self.endDate(false);
        }
      },
      
      onunload:function(){
        util.hideToast();
      }
    },

    init: function() {
      // 只初始化了一次，所以css文件只加载了一次
      this.isInitialized = true;
    },
    controller: function() {
      // 只需初始化一次即可
      if (!dateSelector.isInitialized) {
        util.log('dateSelector is initialized');
        dateSelector.init();
      }
      
      util.hideLoading();
      dateSelector.viewModel.today(new Date());
      dateSelector.viewModel.firstSelected(false);

      util.updateTitle('请选择日期');
      util.showToast('请选择入住日期', 3000);

      document.body.style.overflow = 'auto';
      return dateSelector.viewModel;
    },
    view: function(ctrl) {
      return m('.dateSelector-w', [
        dateSelector.yearView(ctrl)
      ]);
    },
    yearView: function(ctrl) {
      var view = [];
      var runningDate = new Date();
      runningDate.setDate(1);
      var thisMonth = runningDate.getMonth();
      var thisYear = runningDate.getFullYear();

      while(true) {
        view.push(this.monthView(runningDate, ctrl));
        if( (thisMonth > 5) && (runningDate.getMonth()<=5) && (runningDate.getMonth() >= (5+thisMonth)%11) ){
          break;
        } else if( (runningDate.getMonth()-thisMonth) > 5 ){
          break;
        }
      }

      return view;
    },
    monthView: function(date, ctrl) {
      return m('.dateSelector-month.clearfix', [
        m('.dateSelector-month-header', date.getFullYear() + '年' + (date.getMonth() + 1) + '月'),
        this.weekView(),
        this.monthDays(date, ctrl)
      ]);
    },
    weekView: function() {
      return m('.dateSelector-week-header', ['日', '一', '二', '三', '四', '五', '六'].map(function(w) {
        return m('.dateSelector-week-day', w);
      }));
    },
    monthDays: function(date, ctrl) {
      var days = [];
      date.setDate(1);
      var emptyDayCount = date.getDay();
      var emptyDayCount1 = date.getDay();

      while (emptyDayCount) {
        days.push(this.dayView());
        --emptyDayCount;
      }

      var isFirstLine = emptyDayCount;

      var dateCount = 1;
      while (true) {
        date.setDate(dateCount);
        if (date.getDate() == dateCount) {
          if( emptyDayCount1<7){
            days.push(this.dayView(date, true, dateCount, ctrl));
            emptyDayCount1++;
          } else {
            days.push(this.dayView(date, false, dateCount, ctrl));
          }
          ++dateCount;
        } else {
          break;
        }
      }

      return days;
    },
    dayView: function(date, isFirstLine, dateCount, ctrl) {
      var element = '.dateSelector-day';
      var metaText = '';

      if (!date) {
        return m('.dateSelector-noday', m.trust('&nbsp;'));
      } else {
        var specialDay = '';

        metaText = date.getDate();
        if(isFirstLine){
          element += '.isFirstLine';
        }
        if(dateCount == 1){
          element += '.dateSelector-first';
        }
        if(date.getDay() == 6){
          element += '.dateSelector-end';
        }
        var compare = this.compareDay(date, ctrl.today());
        if (compare === 0) {
          element += '.today';
          // metaText = '今天';
        } else if (compare < 0) {
          element += '.disabled';
        }

        if(ctrl.endDate()) {
          if(this.inDates(date, [ctrl.beginDate(), ctrl.endDate()])) {
            if (this.compareDay(ctrl.beginDate(), date) == 0) {
              element += '.first-selected';
              specialDay = '入住';
            } else if(this.compareDay(ctrl.endDate(), date) == 0) {
              element += '.last-selected';
              specialDay = '离店';
            } else {
              element += '.selected';
            }
          }
        } else {
          if(this.compareDay(date, ctrl.beginDate()) == 0) {
            element += '.only-selected';
            specialDay = '入住';
          }
        }

        // var specialDay = '';
        // if (special_days[this.getDateKey(date).special]) {
        //   specialDay = special_days[this.getDateKey(date).special];
        // } else if (regular_days[this.getDateKey(date).regular]) {
        //   specialDay = regular_days[this.getDateKey(date).regular];
        // }

        if (compare < 0) {
          return m(element, [
            m("div.date", metaText),
            m('div.special', specialDay)
          ]);
        } else {
          return m(element, {
            onclick: ctrl.selectDate.bind(ctrl, new Date(date))
          }, [
            m("div.date", metaText),
            m('div.special', specialDay)
          ]);
        }
      }
    },

    compareDay: function(left, right) {
      if (left.getDate() != right.getDate() ||
        left.getMonth() != right.getMonth() ||
        left.getFullYear() != right.getFullYear()) {
        return left - right;
      }

      return 0;
    },

    inDates: function(left, dates) {
      return (this.compareDay(left, dates[0]) >=0) && (this.compareDay(left, dates[1]) <= 0);
    },

    getDateKey: function(input_date) {
      var year = input_date.getFullYear();
      var month = input_date.getMonth() + 1;
      var date = input_date.getDate();

      var regularKey = month + '-' + date;
      return {
        regular: regularKey,
        special: year + '-' + regularKey
      };
    }

  };


  return dateSelector;

})();