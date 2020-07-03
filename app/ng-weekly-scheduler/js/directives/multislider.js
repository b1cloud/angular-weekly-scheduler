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