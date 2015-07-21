(function(){angular.module("ngMaterial.components.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("date-picker/date-picker-dialog.html","<md-dialog class=\"mdc-date-picker\">\n    <!-- Date picker -->\n    <div md-theme=\"{{mdTheme}}\">\n      <!-- Current day of week -->\n      <md-toolbar class=\"md-hue-2 mdc-date-picker__current-day-of-week\">\n        <span>{{ moment(selected.date).format(\'dddd\') }}</span>\n      </md-toolbar>\n\n      <!-- Current date -->\n      <md-toolbar class=\"mdc-date-picker__current-date\">\n        <span>{{ moment(selected.date).format(\'MMM\') }}</span>\n        <strong>{{ moment(selected.date).format(\'DD\') }}</strong>\n        <a ng-click=\"displayYearSelection()\">{{ moment(selected.date).format(\'YYYY\') }}</a>\n      </md-toolbar>\n\n      <!-- Calendar -->\n      <div class=\"mdc-date-picker__calendar\" ng-if=\"!yearSelection\">\n        <div class=\"mdc-date-picker__nav\">\n          <md-button class=\"md-fab md-primary\" aria-label=\"Previous month\" ng-click=\"previousMonth()\">\n            <i class=\"mdi mdi-chevron-left\"></i>\n          </md-button>\n\n          <span>{{ activeDate.format(\'MMMM YYYY\') }}</span>\n\n          <md-button class=\"md-fab md-primary\" arial-label=\"Next month\" ng-click=\"nextMonth()\">\n            <i class=\"mdi mdi-chevron-right\"></i>\n          </md-button>\n        </div>\n\n        <div class=\"mdc-date-picker__days-of-week\">\n          <span ng-repeat=\"day in daysOfWeek\">{{ day }}</span>\n        </div>\n\n        <div class=\"mdc-date-picker__days\">\n                    <span class=\"mdc-date-picker__day mdc-date-picker__day--is-empty\"\n                          ng-repeat=\"x in emptyFirstDays\">&nbsp;</span><!--\n\n                 --><div class=\"mdc-date-picker__day\"\n                         ng-class=\"{ \'mdc-date-picker__day--is-selected\': day.selected,\n                                     \'mdc-date-picker__day--is-today\': day.today }\"\n                         ng-repeat=\"day in days\">\n          <a ng-click=\"select(day)\">{{ day ? day.format(\'D\') : \'\' }}</a>\n        </div><!--\n\n                 --><span class=\"mdc-date-picker__day mdc-date-picker__day--is-empty\"\n                          ng-repeat=\"x in emptyLastDays\">&nbsp;</span>\n        </div>\n      </div>\n\n      <!-- Year selection -->\n      <div class=\"mdc-date-picker__year-selector\" ng-show=\"yearSelection\">\n        <a class=\"mdc-date-picker__year\"\n           ng-class=\"{ \'mdc-date-picker__year--is-active\': year == activeDate.format(\'YYYY\') }\"\n           ng-repeat=\"year in years\"\n           ng-click=\"selectYear(year)\"\n           ng-if=\"yearSelection\">\n          <span>{{year}}</span>\n        </a>\n      </div>\n\n      <!-- Actions -->\n      <div class=\"md-actions mdc-date-picker__actions\" layout=\"row\" layout-align=\"end\">\n        <md-button class=\"md-primary\" ng-click=\"cancel()\">Cancel</md-button>\n        <md-button class=\"md-primary\" ng-click=\"closePicker()\">Ok</md-button>\n      </div>\n    </div>\n</md-dialog>\n");
$templateCache.put("date-picker/date-picker-input.html","<md-input-container ng-click=\"openPicker($event)\">\n  <label>{{label}}</label>\n  <input type=\"text\" ng-model=\"selected.model\" ng-disabled=\"true\" ng-click=\"openPicker($event)\">\n</md-input-container>\n");}]);})();
(function(){/* global angular */
/* global moment */
/* global navigator */
'use strict'; // jshint ignore:line


angular.module('ngMaterial.components.datePicker', ['ngMaterial'])
  .controller('mdcDatePickerController', function ($scope, $timeout, $mdDialog, $document, model, locale, mdTheme, dateFormat) {
    function checkLocale(locale) {
      if (!locale) {
        return (navigator.language !== null ? navigator.language : navigator.browserLanguage).split('_')[0].split('-')[0] || 'en';
      }
      return locale;
    }

    $scope.model = model;
    $scope.mdTheme = mdTheme ? mdTheme : 'default';

    var activeLocale;

    this.build = function (locale) {
      activeLocale = locale;

      moment.locale(activeLocale);

      if (angular.isDefined($scope.model)) {
        $scope.selected = {
          model: moment($scope.model, dateFormat).format(dateFormat),
          date: moment($scope.model, dateFormat).toDate()
        };

        $scope.activeDate = moment($scope.model);
      }
      else {
        $scope.selected = {
          model: undefined,
          date: new Date()
        };

        $scope.activeDate = moment();
      }

      $scope.moment = moment;

      $scope.days = [];
      //TODO: Use moment locale to set first day of week properly.
      $scope.daysOfWeek = [moment.weekdaysMin(1), moment.weekdaysMin(2), moment.weekdaysMin(3), moment.weekdaysMin(4), moment.weekdaysMin(5), moment.weekdaysMin(6), moment.weekdaysMin(0)];

      $scope.years = [];

      for (var y = moment().year() - 100; y <= moment().year() + 100; y++) {
        $scope.years.push(y);
      }

      generateCalendar();
    };
    this.build(checkLocale(locale));

    $scope.previousMonth = function () {
      $scope.activeDate = $scope.activeDate.subtract(1, 'month');
      generateCalendar();
    };

    $scope.nextMonth = function () {
      $scope.activeDate = $scope.activeDate.add(1, 'month');
      generateCalendar();
    };

    $scope.select = function (day) {
      $scope.selected = {
        model: day.format(dateFormat),
        date: day.toDate()
      };

      $scope.model = day.toDate();

      generateCalendar();
    };

    $scope.selectYear = function (year) {
      $scope.yearSelection = false;

      $scope.selected.model = moment($scope.selected.date).year(year).format(dateFormat);
      $scope.selected.date = moment($scope.selected.date).year(year).toDate();
      $scope.model = moment($scope.selected.date).toDate();
      $scope.activeDate = $scope.activeDate.add(year - $scope.activeDate.year(), 'year');

      generateCalendar();
    };
    $scope.displayYearSelection = function () {
      var calendarHeight = $document[0].getElementsByClassName('mdc-date-picker__calendar')[0].offsetHeight;
      var yearSelectorElement = $document[0].getElementsByClassName('mdc-date-picker__year-selector')[0];
      yearSelectorElement.style.height = calendarHeight + 'px';

      $scope.yearSelection = true;

      $timeout(function () {
        var activeYearElement = $document[0].getElementsByClassName('mdc-date-picker__year--is-active')[0];
        yearSelectorElement.scrollTop = yearSelectorElement.scrollTop + activeYearElement.offsetTop - yearSelectorElement.offsetHeight / 2 + activeYearElement.offsetHeight / 2;
      });
    };

    function generateCalendar() {
      var days = [],
        previousDay = angular.copy($scope.activeDate).date(0),
        firstDayOfMonth = angular.copy($scope.activeDate).date(1),
        lastDayOfMonth = angular.copy(firstDayOfMonth).endOf('month'),
        maxDays = angular.copy(lastDayOfMonth).date();

      $scope.emptyFirstDays = [];

      for (var i = firstDayOfMonth.day() === 0 ? 6 : firstDayOfMonth.day() - 1; i > 0; i--) {
        $scope.emptyFirstDays.push({});
      }

      for (var j = 0; j < maxDays; j++) {
        var date = angular.copy(previousDay.add(1, 'days'));

        date.selected = angular.isDefined($scope.selected.model) && date.isSame($scope.selected.date, 'day');
        date.today = date.isSame(moment(), 'day');

        days.push(date);
      }

      $scope.emptyLastDays = [];

      for (var k = 7 - (lastDayOfMonth.day() === 0 ? 7 : lastDayOfMonth.day()); k > 0; k--) {
        $scope.emptyLastDays.push({});
      }

      $scope.days = days;
    }

    $scope.cancel = function() {
      $mdDialog.hide();
    };

    $scope.closePicker = function () {
      $mdDialog.hide($scope.selected);
    };
  })
.controller('mdcDatePickerInputController', function ($scope, $attrs, $timeout, $mdDialog) {
    if (angular.isDefined($scope.model)) {
      $scope.selected = {
        model: moment($scope.model).format($scope.dateFormat),
        date: $scope.model
      };
    }
    else {
      $scope.selected = {
        model: undefined,
        date: new Date()
      };
    }

    $scope.openPicker = function (ev) {
      $scope.yearSelection = false;

      $mdDialog.show({
        targetEvent: ev,
        templateUrl: 'date-picker/date-picker-dialog.html',
        controller: 'mdcDatePickerController',
        locals: {model: $scope.model, locale: $attrs.locale, mdTheme: $attrs.dialogMdTheme, dateFormat: $scope.dateFormat}
      }).then(function (selected) {
        if (selected) {
          $scope.selected = selected;
          $scope.model = selected.model;
        }
      });
    };
  })
.directive('mdcDatePicker', function () {
    return {
      restrict: 'AE',
      controller: 'mdcDatePickerInputController',
      scope: {
        model: '=',
        label: '@',
        dateFormat: '@'
      },
      templateUrl: 'date-picker/date-picker-input.html'
    };
  });
})();
(function(){'use strict';

angular.module('ngMaterial.components', [
  'ngMaterial',
  'ngMaterial.components.templates',
  'ngMaterial.components.datePicker'
]);
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi50bXAvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyIsInNyYy9kYXRlLXBpY2tlci9kYXRlLXBpY2tlci5qcyIsInNyYy9jb21wb25lbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFuZ3VsYXItbWF0ZXJpYWwtY29tcG9uZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKFwibmdNYXRlcmlhbC5jb21wb25lbnRzLnRlbXBsYXRlc1wiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7JHRlbXBsYXRlQ2FjaGUucHV0KFwiZGF0ZS1waWNrZXIvZGF0ZS1waWNrZXItZGlhbG9nLmh0bWxcIixcIjxtZC1kaWFsb2cgY2xhc3M9XFxcIm1kYy1kYXRlLXBpY2tlclxcXCI+XFxuICAgIDwhLS0gRGF0ZSBwaWNrZXIgLS0+XFxuICAgIDxkaXYgbWQtdGhlbWU9XFxcInt7bWRUaGVtZX19XFxcIj5cXG4gICAgICA8IS0tIEN1cnJlbnQgZGF5IG9mIHdlZWsgLS0+XFxuICAgICAgPG1kLXRvb2xiYXIgY2xhc3M9XFxcIm1kLWh1ZS0yIG1kYy1kYXRlLXBpY2tlcl9fY3VycmVudC1kYXktb2Ytd2Vla1xcXCI+XFxuICAgICAgICA8c3Bhbj57eyBtb21lbnQoc2VsZWN0ZWQuZGF0ZSkuZm9ybWF0KFxcJ2RkZGRcXCcpIH19PC9zcGFuPlxcbiAgICAgIDwvbWQtdG9vbGJhcj5cXG5cXG4gICAgICA8IS0tIEN1cnJlbnQgZGF0ZSAtLT5cXG4gICAgICA8bWQtdG9vbGJhciBjbGFzcz1cXFwibWRjLWRhdGUtcGlja2VyX19jdXJyZW50LWRhdGVcXFwiPlxcbiAgICAgICAgPHNwYW4+e3sgbW9tZW50KHNlbGVjdGVkLmRhdGUpLmZvcm1hdChcXCdNTU1cXCcpIH19PC9zcGFuPlxcbiAgICAgICAgPHN0cm9uZz57eyBtb21lbnQoc2VsZWN0ZWQuZGF0ZSkuZm9ybWF0KFxcJ0REXFwnKSB9fTwvc3Ryb25nPlxcbiAgICAgICAgPGEgbmctY2xpY2s9XFxcImRpc3BsYXlZZWFyU2VsZWN0aW9uKClcXFwiPnt7IG1vbWVudChzZWxlY3RlZC5kYXRlKS5mb3JtYXQoXFwnWVlZWVxcJykgfX08L2E+XFxuICAgICAgPC9tZC10b29sYmFyPlxcblxcbiAgICAgIDwhLS0gQ2FsZW5kYXIgLS0+XFxuICAgICAgPGRpdiBjbGFzcz1cXFwibWRjLWRhdGUtcGlja2VyX19jYWxlbmRhclxcXCIgbmctaWY9XFxcIiF5ZWFyU2VsZWN0aW9uXFxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcIm1kYy1kYXRlLXBpY2tlcl9fbmF2XFxcIj5cXG4gICAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cXFwibWQtZmFiIG1kLXByaW1hcnlcXFwiIGFyaWEtbGFiZWw9XFxcIlByZXZpb3VzIG1vbnRoXFxcIiBuZy1jbGljaz1cXFwicHJldmlvdXNNb250aCgpXFxcIj5cXG4gICAgICAgICAgICA8aSBjbGFzcz1cXFwibWRpIG1kaS1jaGV2cm9uLWxlZnRcXFwiPjwvaT5cXG4gICAgICAgICAgPC9tZC1idXR0b24+XFxuXFxuICAgICAgICAgIDxzcGFuPnt7IGFjdGl2ZURhdGUuZm9ybWF0KFxcJ01NTU0gWVlZWVxcJykgfX08L3NwYW4+XFxuXFxuICAgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XFxcIm1kLWZhYiBtZC1wcmltYXJ5XFxcIiBhcmlhbC1sYWJlbD1cXFwiTmV4dCBtb250aFxcXCIgbmctY2xpY2s9XFxcIm5leHRNb250aCgpXFxcIj5cXG4gICAgICAgICAgICA8aSBjbGFzcz1cXFwibWRpIG1kaS1jaGV2cm9uLXJpZ2h0XFxcIj48L2k+XFxuICAgICAgICAgIDwvbWQtYnV0dG9uPlxcbiAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJfX2RheXMtb2Ytd2Vla1xcXCI+XFxuICAgICAgICAgIDxzcGFuIG5nLXJlcGVhdD1cXFwiZGF5IGluIGRheXNPZldlZWtcXFwiPnt7IGRheSB9fTwvc3Bhbj5cXG4gICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwibWRjLWRhdGUtcGlja2VyX19kYXlzXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJfX2RheSBtZGMtZGF0ZS1waWNrZXJfX2RheS0taXMtZW1wdHlcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1yZXBlYXQ9XFxcInggaW4gZW1wdHlGaXJzdERheXNcXFwiPiZuYnNwOzwvc3Bhbj48IS0tXFxuXFxuICAgICAgICAgICAgICAgICAtLT48ZGl2IGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJfX2RheVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XFxcInsgXFwnbWRjLWRhdGUtcGlja2VyX19kYXktLWlzLXNlbGVjdGVkXFwnOiBkYXkuc2VsZWN0ZWQsXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcJ21kYy1kYXRlLXBpY2tlcl9fZGF5LS1pcy10b2RheVxcJzogZGF5LnRvZGF5IH1cXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXJlcGVhdD1cXFwiZGF5IGluIGRheXNcXFwiPlxcbiAgICAgICAgICA8YSBuZy1jbGljaz1cXFwic2VsZWN0KGRheSlcXFwiPnt7IGRheSA/IGRheS5mb3JtYXQoXFwnRFxcJykgOiBcXCdcXCcgfX08L2E+XFxuICAgICAgICA8L2Rpdj48IS0tXFxuXFxuICAgICAgICAgICAgICAgICAtLT48c3BhbiBjbGFzcz1cXFwibWRjLWRhdGUtcGlja2VyX19kYXkgbWRjLWRhdGUtcGlja2VyX19kYXktLWlzLWVtcHR5XFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmctcmVwZWF0PVxcXCJ4IGluIGVtcHR5TGFzdERheXNcXFwiPiZuYnNwOzwvc3Bhbj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDwhLS0gWWVhciBzZWxlY3Rpb24gLS0+XFxuICAgICAgPGRpdiBjbGFzcz1cXFwibWRjLWRhdGUtcGlja2VyX195ZWFyLXNlbGVjdG9yXFxcIiBuZy1zaG93PVxcXCJ5ZWFyU2VsZWN0aW9uXFxcIj5cXG4gICAgICAgIDxhIGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJfX3llYXJcXFwiXFxuICAgICAgICAgICBuZy1jbGFzcz1cXFwieyBcXCdtZGMtZGF0ZS1waWNrZXJfX3llYXItLWlzLWFjdGl2ZVxcJzogeWVhciA9PSBhY3RpdmVEYXRlLmZvcm1hdChcXCdZWVlZXFwnKSB9XFxcIlxcbiAgICAgICAgICAgbmctcmVwZWF0PVxcXCJ5ZWFyIGluIHllYXJzXFxcIlxcbiAgICAgICAgICAgbmctY2xpY2s9XFxcInNlbGVjdFllYXIoeWVhcilcXFwiXFxuICAgICAgICAgICBuZy1pZj1cXFwieWVhclNlbGVjdGlvblxcXCI+XFxuICAgICAgICAgIDxzcGFuPnt7eWVhcn19PC9zcGFuPlxcbiAgICAgICAgPC9hPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDwhLS0gQWN0aW9ucyAtLT5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJtZC1hY3Rpb25zIG1kYy1kYXRlLXBpY2tlcl9fYWN0aW9uc1xcXCIgbGF5b3V0PVxcXCJyb3dcXFwiIGxheW91dC1hbGlnbj1cXFwiZW5kXFxcIj5cXG4gICAgICAgIDxtZC1idXR0b24gY2xhc3M9XFxcIm1kLXByaW1hcnlcXFwiIG5nLWNsaWNrPVxcXCJjYW5jZWwoKVxcXCI+Q2FuY2VsPC9tZC1idXR0b24+XFxuICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVxcXCJtZC1wcmltYXJ5XFxcIiBuZy1jbGljaz1cXFwiY2xvc2VQaWNrZXIoKVxcXCI+T2s8L21kLWJ1dHRvbj5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuPC9tZC1kaWFsb2c+XFxuXCIpO1xuJHRlbXBsYXRlQ2FjaGUucHV0KFwiZGF0ZS1waWNrZXIvZGF0ZS1waWNrZXItaW5wdXQuaHRtbFwiLFwiPG1kLWlucHV0LWNvbnRhaW5lciBuZy1jbGljaz1cXFwib3BlblBpY2tlcigkZXZlbnQpXFxcIj5cXG4gIDxsYWJlbD57e2xhYmVsfX08L2xhYmVsPlxcbiAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIG5nLW1vZGVsPVxcXCJzZWxlY3RlZC5tb2RlbFxcXCIgbmctZGlzYWJsZWQ9XFxcInRydWVcXFwiIG5nLWNsaWNrPVxcXCJvcGVuUGlja2VyKCRldmVudClcXFwiPlxcbjwvbWQtaW5wdXQtY29udGFpbmVyPlxcblwiKTt9XSk7IiwiLyogZ2xvYmFsIGFuZ3VsYXIgKi9cbi8qIGdsb2JhbCBtb21lbnQgKi9cbi8qIGdsb2JhbCBuYXZpZ2F0b3IgKi9cbid1c2Ugc3RyaWN0JzsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG5cblxuYW5ndWxhci5tb2R1bGUoJ25nTWF0ZXJpYWwuY29tcG9uZW50cy5kYXRlUGlja2VyJywgWyduZ01hdGVyaWFsJ10pXG4gIC5jb250cm9sbGVyKCdtZGNEYXRlUGlja2VyQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICR0aW1lb3V0LCAkbWREaWFsb2csICRkb2N1bWVudCwgbW9kZWwsIGxvY2FsZSwgbWRUaGVtZSwgZGF0ZUZvcm1hdCkge1xuICAgIGZ1bmN0aW9uIGNoZWNrTG9jYWxlKGxvY2FsZSkge1xuICAgICAgaWYgKCFsb2NhbGUpIHtcbiAgICAgICAgcmV0dXJuIChuYXZpZ2F0b3IubGFuZ3VhZ2UgIT09IG51bGwgPyBuYXZpZ2F0b3IubGFuZ3VhZ2UgOiBuYXZpZ2F0b3IuYnJvd3Nlckxhbmd1YWdlKS5zcGxpdCgnXycpWzBdLnNwbGl0KCctJylbMF0gfHwgJ2VuJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb2NhbGU7XG4gICAgfVxuXG4gICAgJHNjb3BlLm1vZGVsID0gbW9kZWw7XG4gICAgJHNjb3BlLm1kVGhlbWUgPSBtZFRoZW1lID8gbWRUaGVtZSA6ICdkZWZhdWx0JztcblxuICAgIHZhciBhY3RpdmVMb2NhbGU7XG5cbiAgICB0aGlzLmJ1aWxkID0gZnVuY3Rpb24gKGxvY2FsZSkge1xuICAgICAgYWN0aXZlTG9jYWxlID0gbG9jYWxlO1xuXG4gICAgICBtb21lbnQubG9jYWxlKGFjdGl2ZUxvY2FsZSk7XG5cbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCgkc2NvcGUubW9kZWwpKSB7XG4gICAgICAgICRzY29wZS5zZWxlY3RlZCA9IHtcbiAgICAgICAgICBtb2RlbDogbW9tZW50KCRzY29wZS5tb2RlbCwgZGF0ZUZvcm1hdCkuZm9ybWF0KGRhdGVGb3JtYXQpLFxuICAgICAgICAgIGRhdGU6IG1vbWVudCgkc2NvcGUubW9kZWwsIGRhdGVGb3JtYXQpLnRvRGF0ZSgpXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmFjdGl2ZURhdGUgPSBtb21lbnQoJHNjb3BlLm1vZGVsKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAkc2NvcGUuc2VsZWN0ZWQgPSB7XG4gICAgICAgICAgbW9kZWw6IHVuZGVmaW5lZCxcbiAgICAgICAgICBkYXRlOiBuZXcgRGF0ZSgpXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmFjdGl2ZURhdGUgPSBtb21lbnQoKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLm1vbWVudCA9IG1vbWVudDtcblxuICAgICAgJHNjb3BlLmRheXMgPSBbXTtcbiAgICAgIC8vVE9ETzogVXNlIG1vbWVudCBsb2NhbGUgdG8gc2V0IGZpcnN0IGRheSBvZiB3ZWVrIHByb3Blcmx5LlxuICAgICAgJHNjb3BlLmRheXNPZldlZWsgPSBbbW9tZW50LndlZWtkYXlzTWluKDEpLCBtb21lbnQud2Vla2RheXNNaW4oMiksIG1vbWVudC53ZWVrZGF5c01pbigzKSwgbW9tZW50LndlZWtkYXlzTWluKDQpLCBtb21lbnQud2Vla2RheXNNaW4oNSksIG1vbWVudC53ZWVrZGF5c01pbig2KSwgbW9tZW50LndlZWtkYXlzTWluKDApXTtcblxuICAgICAgJHNjb3BlLnllYXJzID0gW107XG5cbiAgICAgIGZvciAodmFyIHkgPSBtb21lbnQoKS55ZWFyKCkgLSAxMDA7IHkgPD0gbW9tZW50KCkueWVhcigpICsgMTAwOyB5KyspIHtcbiAgICAgICAgJHNjb3BlLnllYXJzLnB1c2goeSk7XG4gICAgICB9XG5cbiAgICAgIGdlbmVyYXRlQ2FsZW5kYXIoKTtcbiAgICB9O1xuICAgIHRoaXMuYnVpbGQoY2hlY2tMb2NhbGUobG9jYWxlKSk7XG5cbiAgICAkc2NvcGUucHJldmlvdXNNb250aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5hY3RpdmVEYXRlID0gJHNjb3BlLmFjdGl2ZURhdGUuc3VidHJhY3QoMSwgJ21vbnRoJyk7XG4gICAgICBnZW5lcmF0ZUNhbGVuZGFyKCk7XG4gICAgfTtcblxuICAgICRzY29wZS5uZXh0TW9udGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUuYWN0aXZlRGF0ZSA9ICRzY29wZS5hY3RpdmVEYXRlLmFkZCgxLCAnbW9udGgnKTtcbiAgICAgIGdlbmVyYXRlQ2FsZW5kYXIoKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNlbGVjdCA9IGZ1bmN0aW9uIChkYXkpIHtcbiAgICAgICRzY29wZS5zZWxlY3RlZCA9IHtcbiAgICAgICAgbW9kZWw6IGRheS5mb3JtYXQoZGF0ZUZvcm1hdCksXG4gICAgICAgIGRhdGU6IGRheS50b0RhdGUoKVxuICAgICAgfTtcblxuICAgICAgJHNjb3BlLm1vZGVsID0gZGF5LnRvRGF0ZSgpO1xuXG4gICAgICBnZW5lcmF0ZUNhbGVuZGFyKCk7XG4gICAgfTtcblxuICAgICRzY29wZS5zZWxlY3RZZWFyID0gZnVuY3Rpb24gKHllYXIpIHtcbiAgICAgICRzY29wZS55ZWFyU2VsZWN0aW9uID0gZmFsc2U7XG5cbiAgICAgICRzY29wZS5zZWxlY3RlZC5tb2RlbCA9IG1vbWVudCgkc2NvcGUuc2VsZWN0ZWQuZGF0ZSkueWVhcih5ZWFyKS5mb3JtYXQoZGF0ZUZvcm1hdCk7XG4gICAgICAkc2NvcGUuc2VsZWN0ZWQuZGF0ZSA9IG1vbWVudCgkc2NvcGUuc2VsZWN0ZWQuZGF0ZSkueWVhcih5ZWFyKS50b0RhdGUoKTtcbiAgICAgICRzY29wZS5tb2RlbCA9IG1vbWVudCgkc2NvcGUuc2VsZWN0ZWQuZGF0ZSkudG9EYXRlKCk7XG4gICAgICAkc2NvcGUuYWN0aXZlRGF0ZSA9ICRzY29wZS5hY3RpdmVEYXRlLmFkZCh5ZWFyIC0gJHNjb3BlLmFjdGl2ZURhdGUueWVhcigpLCAneWVhcicpO1xuXG4gICAgICBnZW5lcmF0ZUNhbGVuZGFyKCk7XG4gICAgfTtcbiAgICAkc2NvcGUuZGlzcGxheVllYXJTZWxlY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY2FsZW5kYXJIZWlnaHQgPSAkZG9jdW1lbnRbMF0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbWRjLWRhdGUtcGlja2VyX19jYWxlbmRhcicpWzBdLm9mZnNldEhlaWdodDtcbiAgICAgIHZhciB5ZWFyU2VsZWN0b3JFbGVtZW50ID0gJGRvY3VtZW50WzBdLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21kYy1kYXRlLXBpY2tlcl9feWVhci1zZWxlY3RvcicpWzBdO1xuICAgICAgeWVhclNlbGVjdG9yRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBjYWxlbmRhckhlaWdodCArICdweCc7XG5cbiAgICAgICRzY29wZS55ZWFyU2VsZWN0aW9uID0gdHJ1ZTtcblxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYWN0aXZlWWVhckVsZW1lbnQgPSAkZG9jdW1lbnRbMF0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbWRjLWRhdGUtcGlja2VyX195ZWFyLS1pcy1hY3RpdmUnKVswXTtcbiAgICAgICAgeWVhclNlbGVjdG9yRWxlbWVudC5zY3JvbGxUb3AgPSB5ZWFyU2VsZWN0b3JFbGVtZW50LnNjcm9sbFRvcCArIGFjdGl2ZVllYXJFbGVtZW50Lm9mZnNldFRvcCAtIHllYXJTZWxlY3RvckVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMiArIGFjdGl2ZVllYXJFbGVtZW50Lm9mZnNldEhlaWdodCAvIDI7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVDYWxlbmRhcigpIHtcbiAgICAgIHZhciBkYXlzID0gW10sXG4gICAgICAgIHByZXZpb3VzRGF5ID0gYW5ndWxhci5jb3B5KCRzY29wZS5hY3RpdmVEYXRlKS5kYXRlKDApLFxuICAgICAgICBmaXJzdERheU9mTW9udGggPSBhbmd1bGFyLmNvcHkoJHNjb3BlLmFjdGl2ZURhdGUpLmRhdGUoMSksXG4gICAgICAgIGxhc3REYXlPZk1vbnRoID0gYW5ndWxhci5jb3B5KGZpcnN0RGF5T2ZNb250aCkuZW5kT2YoJ21vbnRoJyksXG4gICAgICAgIG1heERheXMgPSBhbmd1bGFyLmNvcHkobGFzdERheU9mTW9udGgpLmRhdGUoKTtcblxuICAgICAgJHNjb3BlLmVtcHR5Rmlyc3REYXlzID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSBmaXJzdERheU9mTW9udGguZGF5KCkgPT09IDAgPyA2IDogZmlyc3REYXlPZk1vbnRoLmRheSgpIC0gMTsgaSA+IDA7IGktLSkge1xuICAgICAgICAkc2NvcGUuZW1wdHlGaXJzdERheXMucHVzaCh7fSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWF4RGF5czsgaisrKSB7XG4gICAgICAgIHZhciBkYXRlID0gYW5ndWxhci5jb3B5KHByZXZpb3VzRGF5LmFkZCgxLCAnZGF5cycpKTtcblxuICAgICAgICBkYXRlLnNlbGVjdGVkID0gYW5ndWxhci5pc0RlZmluZWQoJHNjb3BlLnNlbGVjdGVkLm1vZGVsKSAmJiBkYXRlLmlzU2FtZSgkc2NvcGUuc2VsZWN0ZWQuZGF0ZSwgJ2RheScpO1xuICAgICAgICBkYXRlLnRvZGF5ID0gZGF0ZS5pc1NhbWUobW9tZW50KCksICdkYXknKTtcblxuICAgICAgICBkYXlzLnB1c2goZGF0ZSk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5lbXB0eUxhc3REYXlzID0gW107XG5cbiAgICAgIGZvciAodmFyIGsgPSA3IC0gKGxhc3REYXlPZk1vbnRoLmRheSgpID09PSAwID8gNyA6IGxhc3REYXlPZk1vbnRoLmRheSgpKTsgayA+IDA7IGstLSkge1xuICAgICAgICAkc2NvcGUuZW1wdHlMYXN0RGF5cy5wdXNoKHt9KTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmRheXMgPSBkYXlzO1xuICAgIH1cblxuICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICRtZERpYWxvZy5oaWRlKCk7XG4gICAgfTtcblxuICAgICRzY29wZS5jbG9zZVBpY2tlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRtZERpYWxvZy5oaWRlKCRzY29wZS5zZWxlY3RlZCk7XG4gICAgfTtcbiAgfSlcbi5jb250cm9sbGVyKCdtZGNEYXRlUGlja2VySW5wdXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJGF0dHJzLCAkdGltZW91dCwgJG1kRGlhbG9nKSB7XG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKCRzY29wZS5tb2RlbCkpIHtcbiAgICAgICRzY29wZS5zZWxlY3RlZCA9IHtcbiAgICAgICAgbW9kZWw6IG1vbWVudCgkc2NvcGUubW9kZWwpLmZvcm1hdCgkc2NvcGUuZGF0ZUZvcm1hdCksXG4gICAgICAgIGRhdGU6ICRzY29wZS5tb2RlbFxuICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAkc2NvcGUuc2VsZWN0ZWQgPSB7XG4gICAgICAgIG1vZGVsOiB1bmRlZmluZWQsXG4gICAgICAgIGRhdGU6IG5ldyBEYXRlKClcbiAgICAgIH07XG4gICAgfVxuXG4gICAgJHNjb3BlLm9wZW5QaWNrZXIgPSBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICRzY29wZS55ZWFyU2VsZWN0aW9uID0gZmFsc2U7XG5cbiAgICAgICRtZERpYWxvZy5zaG93KHtcbiAgICAgICAgdGFyZ2V0RXZlbnQ6IGV2LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2RhdGUtcGlja2VyL2RhdGUtcGlja2VyLWRpYWxvZy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ21kY0RhdGVQaWNrZXJDb250cm9sbGVyJyxcbiAgICAgICAgbG9jYWxzOiB7bW9kZWw6ICRzY29wZS5tb2RlbCwgbG9jYWxlOiAkYXR0cnMubG9jYWxlLCBtZFRoZW1lOiAkYXR0cnMuZGlhbG9nTWRUaGVtZSwgZGF0ZUZvcm1hdDogJHNjb3BlLmRhdGVGb3JtYXR9XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChzZWxlY3RlZCkge1xuICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICAkc2NvcGUuc2VsZWN0ZWQgPSBzZWxlY3RlZDtcbiAgICAgICAgICAkc2NvcGUubW9kZWwgPSBzZWxlY3RlZC5tb2RlbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfSlcbi5kaXJlY3RpdmUoJ21kY0RhdGVQaWNrZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgY29udHJvbGxlcjogJ21kY0RhdGVQaWNrZXJJbnB1dENvbnRyb2xsZXInLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgbW9kZWw6ICc9JyxcbiAgICAgICAgbGFiZWw6ICdAJyxcbiAgICAgICAgZGF0ZUZvcm1hdDogJ0AnXG4gICAgICB9LFxuICAgICAgdGVtcGxhdGVVcmw6ICdkYXRlLXBpY2tlci9kYXRlLXBpY2tlci1pbnB1dC5odG1sJ1xuICAgIH07XG4gIH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnbmdNYXRlcmlhbC5jb21wb25lbnRzJywgW1xuICAnbmdNYXRlcmlhbCcsXG4gICduZ01hdGVyaWFsLmNvbXBvbmVudHMudGVtcGxhdGVzJyxcbiAgJ25nTWF0ZXJpYWwuY29tcG9uZW50cy5kYXRlUGlja2VyJ1xuXSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=