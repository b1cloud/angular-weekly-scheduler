;(function( window, undefined ){ 
 'use strict';

angular.module('weeklyScheduler', ['ngWeeklySchedulerTemplates']);

/* jshint -W098 */
var GRID_TEMPLATE = angular.element('<div class="grid-item"></div>');

var isCtrl;

function ctrlCheck(e) {
  if (e.which === 17) {
    isCtrl = e.type === 'keydown';
  }
}

function mouseScroll(el, delta) {

  window.addEventListener('keydown', ctrlCheck);
  window.addEventListener('keyup', ctrlCheck);

  el.addEventListener('mousewheel', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (isCtrl) {
      var style = el.firstChild.style, currentWidth = parseInt(style.width);
      if ((e.wheelDelta || e.detail) > 0) {
        style.width = (currentWidth + 2 * delta) + '%';
      } else {
        var width = currentWidth - 2 * delta;
        style.width = (width > 100 ? width : 100) + '%';
      }
    } else {
      if ((e.wheelDelta || e.detail) > 0) {
        el.scrollLeft -= delta;
      } else {
        el.scrollLeft += delta;
      }
    }
    return false;
  });
}
/*jshint +W098 */
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
/*global GRID_TEMPLATE */
angular.module('weeklyScheduler')
    .directive('monthlyGrid', ['weeklySchedulerTimeService', function (timeService) {

      function doGrid(element, attrs, model) {
        // Clean element
        element.empty();

        // Calculation month distribution
        var months = timeService.monthDistribution(model.minDate, model.maxDate);
        // Deploy the grid system on element
        months.forEach(function (month) {
          var child = GRID_TEMPLATE.clone().css({width: month.width + '%'});
          if (angular.isUndefined(attrs.noText)) {
            child.text(timeService.dF(month.start.toDate(), 'MMM yyyy'));
          }
          element.append(child);
        });
      }

      return {
        restrict: 'E',
        require: '^weeklyScheduler',
        link: function (scope, element, attrs, schedulerCtrl) {
          schedulerCtrl.$modelChangeListeners.push(function (newModel) {
            doGrid(element, attrs, newModel);
          });
        }
      };
    }]);
/*global GRID_TEMPLATE */
angular.module('weeklyScheduler')
    .directive('weeklyGrid', [function () {

      function doGrid(element, attrs, model) {
        var i;
        // Calculate week width distribution
        var tickcount = model.nbWeeks;
        var ticksize = 100 / tickcount;
        var gridItemEl = GRID_TEMPLATE.css({width: ticksize + '%'});
        var now = model.minDate.clone().startOf('week');

        // Clean element
        element.empty();

        for (i = 0; i < tickcount; i++) {
          var child = gridItemEl.clone();
          if (angular.isUndefined(attrs.noText)) {
            child.text(now.add(i && 1, 'week').week());
          }
          element.append(child);
        }
      }

      return {
        restrict: 'E',
        require: '^weeklyScheduler',
        link: function (scope, element, attrs, schedulerCtrl) {
          if (schedulerCtrl.config) {
            debugger;
            doGrid(element, attrs, schedulerCtrl.config);
          }
          schedulerCtrl.$modelChangeListeners.push(function (newModel) {
            doGrid(element, attrs, newModel);
          });
        }
      };
    }]);
angular.module('weeklyScheduler')
    .directive('handle', ['$document', function ($document) {
      return {
        restrict: 'A',
        scope: {
          ondrag: '=',
          ondragstop: '=',
          ondragstart: '='
        },
        link: function (scope, element) {

          var x = 0;

          element.on('mousedown', function (event) {
            // Prevent default dragging of selected content
            event.preventDefault();

            x = event.pageX;

            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);

            if (scope.ondragstart) {
              scope.ondragstart();
            }
          });

          function mousemove(event) {
            var delta = event.pageX - x;
            if (scope.ondrag) {
              scope.ondrag(delta);
            }
          }

          function mouseup() {
            $document.unbind('mousemove', mousemove);
            $document.unbind('mouseup', mouseup);

            if (scope.ondragstop) {
              scope.ondragstop();
            }
          }
        }
      };
    }]);
angular.module('weeklyScheduler')
    .directive('inject', [function () {

        return {
            link: function ($scope, $element, $attrs, controller, $transclude) {
                if (!$transclude) {
                    throw 'Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found.';
                }
                var innerScope = $scope.$new();
                $transclude(innerScope, function (clone) {
                    $element.empty();
                    $element.append(clone);
                    $element.on('$destroy', function () {
                        innerScope.$destroy();
                    });
                });
            }
        };
    }]);
angular.module('weeklyScheduler')

    .filter('byIndex', [function () {
        return function (input, index) {
            var ret = [];
            angular.forEach(input, function (el) {
                if (el.index === index) {
                    ret.push(el);
                }
            });
            return ret;
        };
    }])

    .directive('multiSlider', ['weeklySchedulerTimeService', function (timeService) {
        return {
            restrict: 'E',
            require: '^weeklyScheduler',
            templateUrl: 'ng-weekly-scheduler/views/multi-slider.html',
            scope: {
                onAdd: '&',
                onDelete: '&',
                onClick: '&',
                item: '='
            },
            link: function (scope, element, attrs, schedulerCtrl) {
                var conf = schedulerCtrl.config;

                // The default scheduler block size when adding a new item
                var defaultNewScheduleSize = parseInt(attrs.size) || 1;

                var valToPixel = function (val) {
                    var percent = val / (conf.nbDays);
                    return Math.floor(percent * element[0].clientWidth);
                };
                var pixelToVal = function (pixel) {
                    var percent = pixel / element[0].clientWidth;
                    return Math.floor(percent * (conf.nbDays));
                };
                scope.clicked = function (item, schedule) {
                    scope.onClick({item: item, schedule: schedule});
                }
                var addSlot = function (start, end) {
                    start = start >= 0 ? start : 0;
                    end = end <= conf.nbDays ? end : conf.nbDays;

                    var startDate = timeService.addDay(conf.minDate, start);
                    var endDate = timeService.addDay(conf.minDate, end);
                    if (scope.onAdd && scope.onAdd({label: scope.item.label, slot: {start: startDate, end: endDate}})) {
                        scope.$apply(function () {
                            var item = scope.item;
                            if (!item.schedules) {
                                item.schedules = [];
                            }
                            console.log('pushing', JSON.stringify(item.schedules));
                            item.schedules.push({start: startDate.toDate(), end: endDate.toDate()});
                        });
                    }
                };

                var hoverElement = angular.element(element.find('div')[0]);
                var hoverElementWidth = valToPixel(defaultNewScheduleSize);

                hoverElement.css({
                    width: hoverElementWidth + 'px'
                });

                element.on('mousemove', function (e) {
                    var elOffX = element[0].getBoundingClientRect().left;

                    hoverElement.css({
                        left: e.pageX - elOffX - hoverElementWidth / 2 + 'px'
                    });
                });

                hoverElement.on('click', function (event) {
                    if (!element.attr('no-add')) {
                        var elOffX = element[0].getBoundingClientRect().left;
                        var pixelOnClick = event.pageX - elOffX;
                        var valOnClick = pixelToVal(pixelOnClick);

                        var start = Math.round(valOnClick - defaultNewScheduleSize / 2);
                        var end = start + defaultNewScheduleSize;

                        addSlot(start, end);
                    }
                });
            }
        };
    }]);
/*global mouseScroll */
angular.module('weeklyScheduler')

    .directive('weeklyScheduler', ['$parse', 'weeklySchedulerTimeService', '$log', function ($parse, timeService, $log) {

      var defaultOptions = {
        monoSchedule: false,
        selector: '.schedule-area-container'
      };

      /**
       * Configure the scheduler.
       * @param schedules
       * @param options
       * @returns {{minDate: *, maxDate: *, nbWeeks: *}}
       */
      function config(options) {
        var now = moment();

        // Calculate min date of all scheduled events
        // var minDate = (schedules ? schedules.reduce(function (minDate, slot) {
        //   return timeService.compare(slot.start, 'isBefore', minDate);
        // }, now) : now).startOf('week');
        var minDate = moment(options.minDate);
        // Calculate max date of all scheduled events
        // var maxDate = (schedules ? schedules.reduce(function (maxDate, slot) {
        //   return timeService.compare(slot.end, 'isAfter', maxDate);
        // }, now) : now).clone().add(1, 'week').endOf('week');
        // Calculate nb of weeks covered by minDate => maxDate
        var maxDate = moment(options.maxDate);
        var nbWeeks = timeService.weekDiff(minDate, maxDate);

        var result = angular.extend(options, {minDate: minDate, maxDate: maxDate, nbWeeks: nbWeeks, nbDays: maxDate.diff(minDate, 'days')});
        // Log configuration
        $log.debug('Weekly Scheduler configuration:', result);

        return result;
      }

      return {
        restrict: 'E',
        require: 'weeklyScheduler',
        transclude: true,
        templateUrl: 'ng-weekly-scheduler/views/weekly-scheduler.html',
        controller: ['$injector', function ($injector) {
          // Try to get the i18n service
          var name = 'weeklySchedulerLocaleService';
          if ($injector.has(name)) {
            $log.info('The I18N service has successfully been initialized!');
            var localeService = $injector.get(name);
            defaultOptions.labels = localeService.getLang();
          } else {
            $log.info('No I18N found for this module, check the ng module [weeklySchedulerI18N] if you need i18n.');
          }

          // Will hang our model change listeners
          this.$modelChangeListeners = [];
        }],
        controllerAs: 'schedulerCtrl',
        link: function (scope, element, attrs, schedulerCtrl) {

          var optionsFn = $parse(attrs.options),
              options = angular.extend(defaultOptions, optionsFn(scope) || {});

          var onAdd = $parse(attrs.onAdd)(scope);
          scope.onAdd = onAdd;

          var onDelete = $parse(attrs.onDelete)(scope);
          scope.onDelete = onDelete;

          var onClick = $parse(attrs.onClick)(scope);
          scope.onClick = onClick;

          var filters = $parse(attrs.filters)(scope);
          scope.filters = filters;

          // Get the schedule container element
          var el = element[0].querySelector(defaultOptions.selector);

          function onOptionChange(options) {
            var optionsFn = $parse(attrs.options),
                options = angular.extend(defaultOptions, optionsFn(scope) || {});
            schedulerCtrl.config = config(options);
          }
          function onModelChange(items) {
            // Check items are present
            if (items) {

              // Check items are in an Array
              if (!angular.isArray(items)) {
                throw 'You should use weekly-scheduler directive with an Array of items';
              }

              // Keep track of our model (use it in template)
              schedulerCtrl.items = items;

              var optionsFn = $parse(attrs.options),
                  options = angular.extend(defaultOptions, optionsFn(scope) || {});

              schedulerCtrl.config = config(options);
              // First calculate configuration
              // schedulerCtrl.config = config(items.reduce(function (result, item) {
              //   var schedules = item.schedules;

              //   return result.concat(schedules && schedules.length ?
              //     // If in multiSlider mode, ensure a schedule array is present on each item
              //     // Else only use first element of schedule array
              //     (options.monoSchedule ? item.schedules = [schedules[0]] : schedules) :
              //     item.schedules = []
              //   );
              // }, []),
              // options);

              // Then resize schedule area knowing the number of weeks in scope
              el.firstChild.style.width = schedulerCtrl.config.nbDays / 53 * 100 + '%';

              // Finally, run the sub directives listeners
              schedulerCtrl.$modelChangeListeners.forEach(function (listener) {
                listener(schedulerCtrl.config);
              });
            }
          }

          if (el) {
            // Install mouse scrolling event listener for H scrolling
            mouseScroll(el, 20);

            schedulerCtrl.on = {
              change: function (itemIndex, scheduleIndex, scheduleValue) {
                var onChangeFunction = $parse(attrs.onChange)(scope);
                if (angular.isFunction(onChangeFunction)) {
                  return onChangeFunction(itemIndex, scheduleIndex, scheduleValue);
                }
              }
            };

            /**
             * Watch the model items
             */
            scope.$watchCollection(attrs.items, onModelChange);

            scope.$watchCollection(attrs.options, onOptionChange);

            /**
             * Listen to $locale change (brought by external module weeklySchedulerI18N)
             */
            scope.$on('weeklySchedulerLocaleChanged', function (e, labels) {
              if (schedulerCtrl.config) {
                schedulerCtrl.config.labels = labels;
              }
              onModelChange(angular.copy($parse(attrs.items)(scope), []));
            });
          }
        }
      };
    }]);
angular.module('weeklyScheduler')

    .directive('weeklySlot', ['weeklySchedulerTimeService', function (timeService) {
      return {
        restrict: 'E',
        require: ['^weeklyScheduler', 'ngModel'],
        templateUrl: 'ng-weekly-scheduler/views/weekly-slot.html',
        scope: {
          onDelete: '&',
          schedule: '=',
          item: '=',
          onClick: '&',
        },
        link: function (scope, element, attrs, ctrls) {
          var schedulerCtrl = ctrls[0], ngModelCtrl = ctrls[1];
          var conf = schedulerCtrl.config;
          var index = scope.$parent.$index;
          var containerEl = element.parent();
          var resizeDirectionIsStart = true;
          var valuesOnDragStart = {start: scope.schedule.start, end: scope.schedule.end};

          var pixelToVal = function (pixel) {
            var percent = pixel / containerEl[0].clientWidth;
            return Math.floor(percent * conf.nbDays + 0.5);
          };

          scope.clicked = function () {
            scope.onClick({item: scope.item, schedule: scope.schedule});
          };
          var mergeOverlaps = function () {
            var schedule = scope.schedule;
            var schedules = scope.item.schedules;
            // schedules.forEach(function (el) {
            //   if (el !== schedule) {
            //     // model is inside another slot
            //     if (el.end >= schedule.end && el.start <= schedule.start) {
            //       schedules.splice(schedules.indexOf(el), 1);
            //       schedule.end = el.end;
            //       schedule.start = el.start;
            //     }
            //     // model completely covers another slot
            //     else if (schedule.end >= el.end && schedule.start <= el.start) {
            //       schedules.splice(schedules.indexOf(el), 1);
            //     }
            //     // another slot's end is inside current model
            //     else if (el.end >= schedule.start && el.end <= schedule.end) {
            //       schedules.splice(schedules.indexOf(el), 1);
            //       schedule.start = el.start;
            //     }
            //     // another slot's start is inside current model
            //     else if (el.start >= schedule.start && el.start <= schedule.end) {
            //       schedules.splice(schedules.indexOf(el), 1);
            //       schedule.end = el.end;
            //     }
            //   }
            // });
          };

          /**
           * Delete on right click on slot
           */
          var deleteSelf = function () {
            if (scope.onDelete && scope.onDelete({item: scope.item, schedule: scope.schedule})) {
              containerEl.removeClass('dragging');
              containerEl.removeClass('slot-hover');
              scope.item.schedules.splice(scope.item.schedules.indexOf(scope.schedule), 1);
              containerEl.find('weekly-slot').remove();
              scope.$apply();
            }

          };

          element.find('span').on('click', function (e) {
            e.preventDefault();
            deleteSelf();
          });

          element.on('mouseover', function () {
            containerEl.addClass('slot-hover');
          });

          element.on('mouseleave', function () {
            containerEl.removeClass('slot-hover');
          });


          if (scope.item.editable !== false) {
            scope.startResizeStart = function () {
              resizeDirectionIsStart = true;
              scope.startDrag();
            };

            scope.startResizeEnd = function () {
              resizeDirectionIsStart = false;
              scope.startDrag();
            };

            scope.startDrag = function () {
              element.addClass('active');

              containerEl.addClass('dragging');
              containerEl.attr('no-add', true);

              valuesOnDragStart = {start: ngModelCtrl.$viewValue.start, end: ngModelCtrl.$viewValue.end};
            };

            scope.endDrag = function () {

              // this prevents user from accidentally
              // adding new slot after resizing or dragging
              setTimeout(function () {
                containerEl.removeAttr('no-add');
              }, 500);

              element.removeClass('active');
              containerEl.removeClass('dragging');

              mergeOverlaps();
              scope.$apply();
            };

            scope.resize = function (d) {
              var ui = ngModelCtrl.$viewValue;
              var delta = pixelToVal(d);
              if (resizeDirectionIsStart) {
                var newStart = Math.round(valuesOnDragStart.start + delta);

                if (ui.start !== newStart && newStart <= ui.end - 1 && newStart >= 0) {
                  ngModelCtrl.$setViewValue({
                    start: newStart,
                    end: ui.end
                  });
                  ngModelCtrl.$render();
                }
              } else {
                var newEnd = Math.round(valuesOnDragStart.end + delta);

                if (ui.end !== newEnd && newEnd >= ui.start + 1 && newEnd <= conf.nbDays) {
                  ngModelCtrl.$setViewValue({
                    start: ui.start,
                    end: newEnd
                  });
                  ngModelCtrl.$render();
                }
              }
            };

            scope.drag = function (d) {
              var ui = ngModelCtrl.$viewValue;
              var delta = pixelToVal(d);
              var duration = valuesOnDragStart.end - valuesOnDragStart.start;

              var newStart = Math.round(valuesOnDragStart.start + delta);
              var newEnd = Math.round(newStart + duration);

              if (ui.start !== newStart && newStart >= 0 && newEnd <= conf.nbDays) {
                ngModelCtrl.$setViewValue({
                  start: newStart,
                  end: newEnd
                });
                ngModelCtrl.$render();
              }
            };
          }

          // on init, merge overlaps
          mergeOverlaps(true);

          //// UI -> model ////////////////////////////////////
          ngModelCtrl.$parsers.push(function onUIChange(ui) {
            ngModelCtrl.$modelValue.start = timeService.addDay(conf.minDate, ui.start).toDate();
            ngModelCtrl.$modelValue.end = timeService.addDay(conf.minDate, ui.end).toDate();
            //$log.debug('PARSER :', ngModelCtrl.$modelValue.$$hashKey, index, scope.$index, ngModelCtrl.$modelValue);
            schedulerCtrl.on.change(index, scope.$index, ngModelCtrl.$modelValue);
            return ngModelCtrl.$modelValue;
          });

          //// model -> UI ////////////////////////////////////
          ngModelCtrl.$formatters.push(function onModelChange(model) {
            var ui = {
              start: timeService.dayPreciseDiff(conf.minDate, moment(model.start), true),
              end: timeService.dayPreciseDiff(conf.minDate, moment(model.end), true)
            };
            //$log.debug('FORMATTER :', index, scope.$index, ui);
            return ui;
          });

          ngModelCtrl.$render = function () {
            var ui = ngModelCtrl.$viewValue;
            var css = {
              left: ui.start / conf.nbDays * 100 + '%',
              width: (ui.end - ui.start + 1) / conf.nbDays * 100 + '%'
            };
            //$log.debug('RENDER :', index, scope.$index, css);
            element.css(css);
          };

          scope.$on('weeklySchedulerLocaleChanged', function () {
            // Simple change object reference so that ngModel triggers formatting & rendering
            scope.schedule = angular.copy(scope.schedule);
          });
        }
      };
    }]);
angular.module('weeklySchedulerI18N', ['tmh.dynamicLocale']);

angular.module('weeklySchedulerI18N')
    .provider('weeklySchedulerLocaleService', ['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {

      var defaultConfig = {
        doys: {'de-de': 4, 'en-gb': 4, 'en-us': 6, 'fr-fr': 4},
        lang: {
          'de-de': {month: 'Monat', weekNb: 'Wochenummer', addNew: 'Hinzufügen'},
          'en-gb': {month: 'Month', weekNb: 'Week #', addNew: 'Add'},
          'en-us': {month: 'Month', weekNb: 'Week #', addNew: 'Add'},
          'fr-fr': {month: 'Mois', weekNb: 'N° de semaine', addNew: 'Ajouter'}
        }
      };

      this.configure = function (config) {

        if (config && angular.isObject(config)) {
          angular.merge(defaultConfig, config);

          if (defaultConfig.localeLocationPattern) {
            tmhDynamicLocaleProvider.localeLocationPattern(defaultConfig.localeLocationPattern);
          }
        }
      };

      this.$get = ['$rootScope', '$locale', 'tmhDynamicLocale', function ($rootScope, $locale, tmhDynamicLocale) {

        var momentLocaleCache = {};

        function getLang() {
          var key = $locale.id;
          if (!momentLocaleCache[key]) {
            momentLocaleCache[key] = getMomentLocale(key);
            moment.locale(momentLocaleCache[key].id, momentLocaleCache[key].locale);
          } else {
            moment.locale(momentLocaleCache[key].id);
          }
          return defaultConfig.lang[key];
        }

        // We just need few moment local information
        function getMomentLocale(key) {
          return {
            id: key,
            locale: {
              week: {
                // Angular monday = 0 whereas Moment monday = 1
                dow: ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 1) % 7,
                doy: defaultConfig.doys[key]
              }
            }
          };
        }

        $rootScope.$on('$localeChangeSuccess', function () {
          $rootScope.$broadcast('weeklySchedulerLocaleChanged', getLang());
        });

        return {
          $locale: $locale,
          getLang: getLang,
          set: function (key) {
            return tmhDynamicLocale.set(key);
          }
        };
      }];
    }]);
angular.module('weeklyScheduler')
    .service('weeklySchedulerTimeService', ['$filter', function ($filter) {

      var MONTH = 'month';
      var WEEK = 'week';
      var DAY = 'day';

      return {
        const: {
          MONTH: MONTH,
          WEEK: WEEK,
          FORMAT: 'YYYY-MM-DD'
        },
        dF: $filter('date'),
        compare: function (date, method, lastMin) {
          if (date) {
            var dateAsMoment;
            if (angular.isDate(date)) {
              dateAsMoment = moment(date);
            } else if (date._isAMomentObject) {
              dateAsMoment = date;
            } else {
              throw 'Could not parse date [' + date + ']';
            }
            return dateAsMoment[method](lastMin) ? dateAsMoment : lastMin;
          }
        },
        addWeek: function (moment, nbWeek) {
          return moment.clone().add(nbWeek, WEEK);
        },
        addDay: function (moment, nbDay) {
          return moment.clone().add(nbDay, DAY);
        },
        dayPreciseDiff: function (start, end) {
          return end.clone().diff(start.clone(), DAY, true);
        },
        weekPreciseDiff: function (start, end) {
          return end.clone().diff(start.clone(), WEEK, true);
        },
        weekDiff: function (start, end) {
          return end.clone().endOf(WEEK).diff(start.clone().startOf(WEEK), WEEK) + 1;
        },
        monthDiff: function (start, end) {
          return end.clone().endOf(MONTH).diff(start.clone().startOf(MONTH), MONTH) + 1;
        },
        monthDistribution: function (minDate, maxDate) {
          var i, result = [];
          var startDate = minDate.clone();
          var endDate = maxDate.clone();
          var monthDiff = this.monthDiff(startDate, endDate);
          var dayDiff = endDate.diff(startDate, DAY);

          //var total = 0, totalDays = 0;
          // console.log(startDate.toDate(), endDate.toDate(), monthDiff, dayDiff);
          for (i = 0; i < monthDiff; i++) {
            var startOfMonth = i === 0 ? startDate : startDate.add(1, MONTH).startOf(MONTH);
            var endOfMonth = i === monthDiff - 1 ? endDate : startDate.clone().endOf(MONTH);
            var dayInMonth = endOfMonth.diff(startOfMonth, DAY) + (i !== monthDiff - 1 && 1);
            var width = Math.floor(dayInMonth / dayDiff * 1E8) / 1E6;


            result.push({start: startOfMonth.clone(), end: endOfMonth.clone(), width: width});


            // totalDays += dayInMonth; total += width;
            // console.log(startOfMonth, endOfMonth, dayInMonth, dayDiff, width, total, totalDays);
          }
          return result;
        }
      };
    }]);
angular.module('ngWeeklySchedulerTemplates', ['ng-weekly-scheduler/views/multi-slider.html', 'ng-weekly-scheduler/views/weekly-scheduler.html', 'ng-weekly-scheduler/views/weekly-slot.html']);

angular.module('ng-weekly-scheduler/views/multi-slider.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-weekly-scheduler/views/multi-slider.html',
    '<div class="slot ghost" ng-show="item.editable !== false && (!schedulerCtrl.config.monoSchedule || !item.schedules.length)">{{schedulerCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class=slot ng-class="{\'{{schedule.className}}\': schedule.className}" ng-repeat="schedule in item.schedules" ng-model=schedule schedule=schedule item=item on-delete="onDelete(item, schedule)" on-click="clicked(item, schedule)" ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }"></weekly-slot>');
}]);

angular.module('ng-weekly-scheduler/views/weekly-scheduler.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-weekly-scheduler/views/weekly-scheduler.html',
    '<div class=labels><div class="srow text-right">{{schedulerCtrl.config.labels.month }}</div><div class="srow text-right">{{schedulerCtrl.config.labels.days}}</div><div class=schedule-animate ng-repeat="item in schedulerCtrl.items | filter: filters" inject></div></div><div class=schedule-area-container><div class=schedule-area><div class="srow timestamps"><monthly-grid class=grid-container></monthly-grid></div><div class="srow timestamps"><daily-grid class=grid-container></daily-grid></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items | filter : filters"><daily-grid class=grid-container no-text></daily-grid><multi-slider index={{$index}} on-add=onAdd(label,slot) item=item on-delete="onDelete(item, schedule)" on-click="onClick(item, schedule)"></multi-slider></div></div></div>');
}]);

angular.module('ng-weekly-scheduler/views/weekly-slot.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-weekly-scheduler/views/weekly-slot.html',
    '<div title="{{schedule.start | date }} - {{schedule.end | date }}" ng-style="" ng-click=clicked()><div ng-show="item.editable !== false" class="handle left" ondrag=resize ondragstart=startResizeStart ondragstop=endDrag handle></div><div ondrag=drag ondragstart=startDrag ondragstop=endDrag handle>{{schedule.label}}<br>{{schedule.start | date:"dd MMM"}} - {{schedule.end | date:"dd MMM"}}</div><div ng-show="item.editable !== false" class="handle right" ondrag=resize ondragstart=startResizeEnd ondragstop=endDrag handle></div></div>');
}]);
}( window ));