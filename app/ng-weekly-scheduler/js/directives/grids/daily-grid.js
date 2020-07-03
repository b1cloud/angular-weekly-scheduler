/*global GRID_TEMPLATE */
angular.module('weeklyScheduler')
    .directive('dailyGrid', ['weeklySchedulerTimeService', function (timeService) {

      function doGrid(element, attrs, model) {
        var i;
        var days = timeService.dayPreciseDiff(model.minDate, model.maxDate);
        // Calculate week width distribution
        var tickcount = days;
        var ticksize = 100 / tickcount;
        var gridItemEl = GRID_TEMPLATE.css({width: ticksize + '%'});
        var now = model.minDate.clone().startOf('day');

        // Clean element
        element.empty();

        for (i = 0; i < tickcount; i++) {
          var child = gridItemEl.clone();
          if (angular.isUndefined(attrs.noText)) {
            child.text(now.add(i && 1, 'day').format('D'));
            if (moment().isSame(now, "day")) {
              child.addClass("today");
            }
            var d2 = new Date(now);

            if (d2.getDay() === 6) {
              child.addClass("saturday");
            }
            if (d2.getDay() === 0) {
              child.addClass("sunday");
            }
            model.holidays.forEach(function (date) {
              if (moment(date).isSame(now, "day")) {
                child.addClass("holiday");
              }
            });
          } else {
            now.add(i && 1, 'day').format('D');
            var d2 = new Date(now);
            if (moment().isSame(now, "day")) {
              child.addClass("today");
            }
            if (d2.getDay() === 6) {
              child.addClass("saturday");
            }
            if (d2.getDay() === 0) {
              child.addClass("sunday");
            }
            model.holidays.forEach(function (date) {
              if (moment(date).isSame(now, "day")) {
                child.addClass("holiday");
              }
            });
          }
          element.append(child);
        }
      }

      return {
        restrict: 'E',
        require: '^weeklyScheduler',
        link: function (scope, element, attrs, schedulerCtrl) {
          if (schedulerCtrl.config) {
            doGrid(element, attrs, schedulerCtrl.config);
          }
          schedulerCtrl.$modelChangeListeners.push(function (newModel) {
            doGrid(element, attrs, newModel);

          });
        }
      };
    }]);