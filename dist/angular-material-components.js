(function () {
  angular.module("ngMaterial.components.templates", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("date-picker/date-picker-dialog.html", "<md-dialog class=\"mdc-date-picker\">\r\n    <!-- Date picker -->\r\n    <div md-theme=\"{{mdTheme}}\">\r\n      <!-- Current day of week -->\r\n      <md-toolbar class=\"md-hue-2 mdc-date-picker__current-day-of-week\">\r\n        <span>{{ moment(selected.date).format(\'dddd\') }}</span>\r\n      </md-toolbar>\r\n\r\n      <!-- Current date -->\r\n      <md-toolbar class=\"mdc-date-picker__current-date\">\r\n        <span>{{ moment(selected.date).format(\'MMM\') }}</span>\r\n        <strong>{{ moment(selected.date).format(\'DD\') }}</strong>\r\n        <a ng-click=\"displayYearSelection()\">{{ moment(selected.date).format(\'YYYY\') }}</a>\r\n      </md-toolbar>\r\n\r\n      <!-- Calendar -->\r\n      <div class=\"mdc-date-picker__calendar\" ng-if=\"!yearSelection\">\r\n        <div class=\"mdc-date-picker__nav\">\r\n          <md-button class=\"md-fab md-primary\" aria-label=\"Previous month\" ng-click=\"previousMonth()\">\r\n            <i class=\"mdi mdi-chevron-left\"></i>\r\n          </md-button>\r\n\r\n          <span>{{ activeDate.format(\'MMMM YYYY\') }}</span>\r\n\r\n          <md-button class=\"md-fab md-primary\" arial-label=\"Next month\" ng-click=\"nextMonth()\">\r\n            <i class=\"mdi mdi-chevron-right\"></i>\r\n          </md-button>\r\n        </div>\r\n\r\n        <div class=\"mdc-date-picker__days-of-week\">\r\n          <span ng-repeat=\"day in daysOfWeek\">{{ day }}</span>\r\n        </div>\r\n\r\n        <div class=\"mdc-date-picker__days\">\r\n                    <span class=\"mdc-date-picker__day mdc-date-picker__day--is-empty\"\r\n                          ng-repeat=\"x in emptyFirstDays\">&nbsp;</span><!--\r\n\r\n                 --><div class=\"mdc-date-picker__day\"\r\n                         ng-class=\"{ \'mdc-date-picker__day--is-selected\': day.selected,\r\n                                     \'mdc-date-picker__day--is-today\': day.today }\"\r\n                         ng-repeat=\"day in days\">\r\n          <a ng-click=\"select(day)\">{{ day ? day.format(\'D\') : \'\' }}</a>\r\n        </div><!--\r\n\r\n                 --><span class=\"mdc-date-picker__day mdc-date-picker__day--is-empty\"\r\n                          ng-repeat=\"x in emptyLastDays\">&nbsp;</span>\r\n        </div>\r\n      </div>\r\n\r\n      <!-- Year selection -->\r\n      <div class=\"mdc-date-picker__year-selector\" ng-show=\"yearSelection\">\r\n        <a class=\"mdc-date-picker__year\"\r\n           ng-class=\"{ \'mdc-date-picker__year--is-active\': year == activeDate.format(\'YYYY\') }\"\r\n           ng-repeat=\"year in years\"\r\n           ng-click=\"selectYear(year)\"\r\n           ng-if=\"yearSelection\">\r\n          <span>{{year}}</span>\r\n        </a>\r\n      </div>\r\n\r\n      <!-- Actions -->\r\n      <div class=\"md-actions mdc-date-picker__actions\" layout=\"row\" layout-align=\"end\">\r\n        <md-button class=\"md-primary\" ng-click=\"cancel()\">Cancel</md-button>\r\n        <md-button class=\"md-primary\" ng-click=\"closePicker()\">Ok</md-button>\r\n      </div>\r\n    </div>\r\n</md-dialog>\r\n");
    $templateCache.put("date-picker/date-picker-input.html", "<md-input-container ng-click=\"openPicker($event)\">\r\n  <label>{{label}}</label>\r\n  <input type=\"text\" ng-model=\"selected.model\" ng-disabled=\"true\" ng-click=\"openPicker($event)\">\r\n</md-input-container>\r\n");
  }]);
})();
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

        $scope.activeDate = moment($scope.model, dateFormat);
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
        model: moment($scope.model, $scope.dateFormat).format($scope.dateFormat),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi50bXAvdGVtcGxhdGVzL3RlbXBsYXRlcy5qcyIsInNyYy9kYXRlLXBpY2tlci9kYXRlLXBpY2tlci5qcyIsInNyYy9jb21wb25lbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFuZ3VsYXItbWF0ZXJpYWwtY29tcG9uZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKFwibmdNYXRlcmlhbC5jb21wb25lbnRzLnRlbXBsYXRlc1wiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7JHRlbXBsYXRlQ2FjaGUucHV0KFwiZGF0ZS1waWNrZXIvZGF0ZS1waWNrZXItZGlhbG9nLmh0bWxcIixcIjxtZC1kaWFsb2cgY2xhc3M9XFxcIm1kYy1kYXRlLXBpY2tlclxcXCI+XFxyXFxuICAgIDwhLS0gRGF0ZSBwaWNrZXIgLS0+XFxyXFxuICAgIDxkaXYgbWQtdGhlbWU9XFxcInt7bWRUaGVtZX19XFxcIj5cXHJcXG4gICAgICA8IS0tIEN1cnJlbnQgZGF5IG9mIHdlZWsgLS0+XFxyXFxuICAgICAgPG1kLXRvb2xiYXIgY2xhc3M9XFxcIm1kLWh1ZS0yIG1kYy1kYXRlLXBpY2tlcl9fY3VycmVudC1kYXktb2Ytd2Vla1xcXCI+XFxyXFxuICAgICAgICA8c3Bhbj57eyBtb21lbnQoc2VsZWN0ZWQuZGF0ZSkuZm9ybWF0KFxcJ2RkZGRcXCcpIH19PC9zcGFuPlxcclxcbiAgICAgIDwvbWQtdG9vbGJhcj5cXHJcXG5cXHJcXG4gICAgICA8IS0tIEN1cnJlbnQgZGF0ZSAtLT5cXHJcXG4gICAgICA8bWQtdG9vbGJhciBjbGFzcz1cXFwibWRjLWRhdGUtcGlja2VyX19jdXJyZW50LWRhdGVcXFwiPlxcclxcbiAgICAgICAgPHNwYW4+e3sgbW9tZW50KHNlbGVjdGVkLmRhdGUpLmZvcm1hdChcXCdNTU1cXCcpIH19PC9zcGFuPlxcclxcbiAgICAgICAgPHN0cm9uZz57eyBtb21lbnQoc2VsZWN0ZWQuZGF0ZSkuZm9ybWF0KFxcJ0REXFwnKSB9fTwvc3Ryb25nPlxcclxcbiAgICAgICAgPGEgbmctY2xpY2s9XFxcImRpc3BsYXlZZWFyU2VsZWN0aW9uKClcXFwiPnt7IG1vbWVudChzZWxlY3RlZC5kYXRlKS5mb3JtYXQoXFwnWVlZWVxcJykgfX08L2E+XFxyXFxuICAgICAgPC9tZC10b29sYmFyPlxcclxcblxcclxcbiAgICAgIDwhLS0gQ2FsZW5kYXIgLS0+XFxyXFxuICAgICAgPGRpdiBjbGFzcz1cXFwibWRjLWRhdGUtcGlja2VyX19jYWxlbmRhclxcXCIgbmctaWY9XFxcIiF5ZWFyU2VsZWN0aW9uXFxcIj5cXHJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcIm1kYy1kYXRlLXBpY2tlcl9fbmF2XFxcIj5cXHJcXG4gICAgICAgICAgPG1kLWJ1dHRvbiBjbGFzcz1cXFwibWQtZmFiIG1kLXByaW1hcnlcXFwiIGFyaWEtbGFiZWw9XFxcIlByZXZpb3VzIG1vbnRoXFxcIiBuZy1jbGljaz1cXFwicHJldmlvdXNNb250aCgpXFxcIj5cXHJcXG4gICAgICAgICAgICA8aSBjbGFzcz1cXFwibWRpIG1kaS1jaGV2cm9uLWxlZnRcXFwiPjwvaT5cXHJcXG4gICAgICAgICAgPC9tZC1idXR0b24+XFxyXFxuXFxyXFxuICAgICAgICAgIDxzcGFuPnt7IGFjdGl2ZURhdGUuZm9ybWF0KFxcJ01NTU0gWVlZWVxcJykgfX08L3NwYW4+XFxyXFxuXFxyXFxuICAgICAgICAgIDxtZC1idXR0b24gY2xhc3M9XFxcIm1kLWZhYiBtZC1wcmltYXJ5XFxcIiBhcmlhbC1sYWJlbD1cXFwiTmV4dCBtb250aFxcXCIgbmctY2xpY2s9XFxcIm5leHRNb250aCgpXFxcIj5cXHJcXG4gICAgICAgICAgICA8aSBjbGFzcz1cXFwibWRpIG1kaS1jaGV2cm9uLXJpZ2h0XFxcIj48L2k+XFxyXFxuICAgICAgICAgIDwvbWQtYnV0dG9uPlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuXFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJfX2RheXMtb2Ytd2Vla1xcXCI+XFxyXFxuICAgICAgICAgIDxzcGFuIG5nLXJlcGVhdD1cXFwiZGF5IGluIGRheXNPZldlZWtcXFwiPnt7IGRheSB9fTwvc3Bhbj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcblxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwibWRjLWRhdGUtcGlja2VyX19kYXlzXFxcIj5cXHJcXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJfX2RheSBtZGMtZGF0ZS1waWNrZXJfX2RheS0taXMtZW1wdHlcXFwiXFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1yZXBlYXQ9XFxcInggaW4gZW1wdHlGaXJzdERheXNcXFwiPiZuYnNwOzwvc3Bhbj48IS0tXFxyXFxuXFxyXFxuICAgICAgICAgICAgICAgICAtLT48ZGl2IGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJfX2RheVxcXCJcXHJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XFxcInsgXFwnbWRjLWRhdGUtcGlja2VyX19kYXktLWlzLXNlbGVjdGVkXFwnOiBkYXkuc2VsZWN0ZWQsXFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcJ21kYy1kYXRlLXBpY2tlcl9fZGF5LS1pcy10b2RheVxcJzogZGF5LnRvZGF5IH1cXFwiXFxyXFxuICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXJlcGVhdD1cXFwiZGF5IGluIGRheXNcXFwiPlxcclxcbiAgICAgICAgICA8YSBuZy1jbGljaz1cXFwic2VsZWN0KGRheSlcXFwiPnt7IGRheSA/IGRheS5mb3JtYXQoXFwnRFxcJykgOiBcXCdcXCcgfX08L2E+XFxyXFxuICAgICAgICA8L2Rpdj48IS0tXFxyXFxuXFxyXFxuICAgICAgICAgICAgICAgICAtLT48c3BhbiBjbGFzcz1cXFwibWRjLWRhdGUtcGlja2VyX19kYXkgbWRjLWRhdGUtcGlja2VyX19kYXktLWlzLWVtcHR5XFxcIlxcclxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmctcmVwZWF0PVxcXCJ4IGluIGVtcHR5TGFzdERheXNcXFwiPiZuYnNwOzwvc3Bhbj5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICAgIDwvZGl2PlxcclxcblxcclxcbiAgICAgIDwhLS0gWWVhciBzZWxlY3Rpb24gLS0+XFxyXFxuICAgICAgPGRpdiBjbGFzcz1cXFwibWRjLWRhdGUtcGlja2VyX195ZWFyLXNlbGVjdG9yXFxcIiBuZy1zaG93PVxcXCJ5ZWFyU2VsZWN0aW9uXFxcIj5cXHJcXG4gICAgICAgIDxhIGNsYXNzPVxcXCJtZGMtZGF0ZS1waWNrZXJfX3llYXJcXFwiXFxyXFxuICAgICAgICAgICBuZy1jbGFzcz1cXFwieyBcXCdtZGMtZGF0ZS1waWNrZXJfX3llYXItLWlzLWFjdGl2ZVxcJzogeWVhciA9PSBhY3RpdmVEYXRlLmZvcm1hdChcXCdZWVlZXFwnKSB9XFxcIlxcclxcbiAgICAgICAgICAgbmctcmVwZWF0PVxcXCJ5ZWFyIGluIHllYXJzXFxcIlxcclxcbiAgICAgICAgICAgbmctY2xpY2s9XFxcInNlbGVjdFllYXIoeWVhcilcXFwiXFxyXFxuICAgICAgICAgICBuZy1pZj1cXFwieWVhclNlbGVjdGlvblxcXCI+XFxyXFxuICAgICAgICAgIDxzcGFuPnt7eWVhcn19PC9zcGFuPlxcclxcbiAgICAgICAgPC9hPlxcclxcbiAgICAgIDwvZGl2PlxcclxcblxcclxcbiAgICAgIDwhLS0gQWN0aW9ucyAtLT5cXHJcXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJtZC1hY3Rpb25zIG1kYy1kYXRlLXBpY2tlcl9fYWN0aW9uc1xcXCIgbGF5b3V0PVxcXCJyb3dcXFwiIGxheW91dC1hbGlnbj1cXFwiZW5kXFxcIj5cXHJcXG4gICAgICAgIDxtZC1idXR0b24gY2xhc3M9XFxcIm1kLXByaW1hcnlcXFwiIG5nLWNsaWNrPVxcXCJjYW5jZWwoKVxcXCI+Q2FuY2VsPC9tZC1idXR0b24+XFxyXFxuICAgICAgICA8bWQtYnV0dG9uIGNsYXNzPVxcXCJtZC1wcmltYXJ5XFxcIiBuZy1jbGljaz1cXFwiY2xvc2VQaWNrZXIoKVxcXCI+T2s8L21kLWJ1dHRvbj5cXHJcXG4gICAgICA8L2Rpdj5cXHJcXG4gICAgPC9kaXY+XFxyXFxuPC9tZC1kaWFsb2c+XFxyXFxuXCIpO1xuJHRlbXBsYXRlQ2FjaGUucHV0KFwiZGF0ZS1waWNrZXIvZGF0ZS1waWNrZXItaW5wdXQuaHRtbFwiLFwiPG1kLWlucHV0LWNvbnRhaW5lciBuZy1jbGljaz1cXFwib3BlblBpY2tlcigkZXZlbnQpXFxcIj5cXHJcXG4gIDxsYWJlbD57e2xhYmVsfX08L2xhYmVsPlxcclxcbiAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIG5nLW1vZGVsPVxcXCJzZWxlY3RlZC5tb2RlbFxcXCIgbmctZGlzYWJsZWQ9XFxcInRydWVcXFwiIG5nLWNsaWNrPVxcXCJvcGVuUGlja2VyKCRldmVudClcXFwiPlxcclxcbjwvbWQtaW5wdXQtY29udGFpbmVyPlxcclxcblwiKTt9XSk7IiwiLyogZ2xvYmFsIGFuZ3VsYXIgKi9cbi8qIGdsb2JhbCBtb21lbnQgKi9cbi8qIGdsb2JhbCBuYXZpZ2F0b3IgKi9cbid1c2Ugc3RyaWN0JzsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG5cblxuYW5ndWxhci5tb2R1bGUoJ25nTWF0ZXJpYWwuY29tcG9uZW50cy5kYXRlUGlja2VyJywgWyduZ01hdGVyaWFsJ10pXG4gIC5jb250cm9sbGVyKCdtZGNEYXRlUGlja2VyQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICR0aW1lb3V0LCAkbWREaWFsb2csICRkb2N1bWVudCwgbW9kZWwsIGxvY2FsZSwgbWRUaGVtZSwgZGF0ZUZvcm1hdCkge1xuICAgIGZ1bmN0aW9uIGNoZWNrTG9jYWxlKGxvY2FsZSkge1xuICAgICAgaWYgKCFsb2NhbGUpIHtcbiAgICAgICAgcmV0dXJuIChuYXZpZ2F0b3IubGFuZ3VhZ2UgIT09IG51bGwgPyBuYXZpZ2F0b3IubGFuZ3VhZ2UgOiBuYXZpZ2F0b3IuYnJvd3Nlckxhbmd1YWdlKS5zcGxpdCgnXycpWzBdLnNwbGl0KCctJylbMF0gfHwgJ2VuJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb2NhbGU7XG4gICAgfVxuXG4gICAgJHNjb3BlLm1vZGVsID0gbW9kZWw7XG4gICAgJHNjb3BlLm1kVGhlbWUgPSBtZFRoZW1lID8gbWRUaGVtZSA6ICdkZWZhdWx0JztcblxuICAgIHZhciBhY3RpdmVMb2NhbGU7XG5cbiAgICB0aGlzLmJ1aWxkID0gZnVuY3Rpb24gKGxvY2FsZSkge1xuICAgICAgYWN0aXZlTG9jYWxlID0gbG9jYWxlO1xuXG4gICAgICBtb21lbnQubG9jYWxlKGFjdGl2ZUxvY2FsZSk7XG5cbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCgkc2NvcGUubW9kZWwpKSB7XG4gICAgICAgICRzY29wZS5zZWxlY3RlZCA9IHtcbiAgICAgICAgICBtb2RlbDogbW9tZW50KCRzY29wZS5tb2RlbCwgZGF0ZUZvcm1hdCkuZm9ybWF0KGRhdGVGb3JtYXQpLFxuICAgICAgICAgIGRhdGU6IG1vbWVudCgkc2NvcGUubW9kZWwsIGRhdGVGb3JtYXQpLnRvRGF0ZSgpXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmFjdGl2ZURhdGUgPSBtb21lbnQoJHNjb3BlLm1vZGVsLGRhdGVGb3JtYXQpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICRzY29wZS5zZWxlY3RlZCA9IHtcbiAgICAgICAgICBtb2RlbDogdW5kZWZpbmVkLFxuICAgICAgICAgIGRhdGU6IG5ldyBEYXRlKClcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuYWN0aXZlRGF0ZSA9IG1vbWVudCgpO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUubW9tZW50ID0gbW9tZW50O1xuXG4gICAgICAkc2NvcGUuZGF5cyA9IFtdO1xuICAgICAgLy9UT0RPOiBVc2UgbW9tZW50IGxvY2FsZSB0byBzZXQgZmlyc3QgZGF5IG9mIHdlZWsgcHJvcGVybHkuXG4gICAgICAkc2NvcGUuZGF5c09mV2VlayA9IFttb21lbnQud2Vla2RheXNNaW4oMSksIG1vbWVudC53ZWVrZGF5c01pbigyKSwgbW9tZW50LndlZWtkYXlzTWluKDMpLCBtb21lbnQud2Vla2RheXNNaW4oNCksIG1vbWVudC53ZWVrZGF5c01pbig1KSwgbW9tZW50LndlZWtkYXlzTWluKDYpLCBtb21lbnQud2Vla2RheXNNaW4oMCldO1xuXG4gICAgICAkc2NvcGUueWVhcnMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgeSA9IG1vbWVudCgpLnllYXIoKSAtIDEwMDsgeSA8PSBtb21lbnQoKS55ZWFyKCkgKyAxMDA7IHkrKykge1xuICAgICAgICAkc2NvcGUueWVhcnMucHVzaCh5KTtcbiAgICAgIH1cblxuICAgICAgZ2VuZXJhdGVDYWxlbmRhcigpO1xuICAgIH07XG4gICAgdGhpcy5idWlsZChjaGVja0xvY2FsZShsb2NhbGUpKTtcblxuICAgICRzY29wZS5wcmV2aW91c01vbnRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgJHNjb3BlLmFjdGl2ZURhdGUgPSAkc2NvcGUuYWN0aXZlRGF0ZS5zdWJ0cmFjdCgxLCAnbW9udGgnKTtcbiAgICAgIGdlbmVyYXRlQ2FsZW5kYXIoKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLm5leHRNb250aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5hY3RpdmVEYXRlID0gJHNjb3BlLmFjdGl2ZURhdGUuYWRkKDEsICdtb250aCcpO1xuICAgICAgZ2VuZXJhdGVDYWxlbmRhcigpO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2VsZWN0ID0gZnVuY3Rpb24gKGRheSkge1xuICAgICAgJHNjb3BlLnNlbGVjdGVkID0ge1xuICAgICAgICBtb2RlbDogZGF5LmZvcm1hdChkYXRlRm9ybWF0KSxcbiAgICAgICAgZGF0ZTogZGF5LnRvRGF0ZSgpXG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUubW9kZWwgPSBkYXkudG9EYXRlKCk7XG5cbiAgICAgIGdlbmVyYXRlQ2FsZW5kYXIoKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNlbGVjdFllYXIgPSBmdW5jdGlvbiAoeWVhcikge1xuICAgICAgJHNjb3BlLnllYXJTZWxlY3Rpb24gPSBmYWxzZTtcblxuICAgICAgJHNjb3BlLnNlbGVjdGVkLm1vZGVsID0gbW9tZW50KCRzY29wZS5zZWxlY3RlZC5kYXRlKS55ZWFyKHllYXIpLmZvcm1hdChkYXRlRm9ybWF0KTtcbiAgICAgICRzY29wZS5zZWxlY3RlZC5kYXRlID0gbW9tZW50KCRzY29wZS5zZWxlY3RlZC5kYXRlKS55ZWFyKHllYXIpLnRvRGF0ZSgpO1xuICAgICAgJHNjb3BlLm1vZGVsID0gbW9tZW50KCRzY29wZS5zZWxlY3RlZC5kYXRlKS50b0RhdGUoKTtcbiAgICAgICRzY29wZS5hY3RpdmVEYXRlID0gJHNjb3BlLmFjdGl2ZURhdGUuYWRkKHllYXIgLSAkc2NvcGUuYWN0aXZlRGF0ZS55ZWFyKCksICd5ZWFyJyk7XG5cbiAgICAgIGdlbmVyYXRlQ2FsZW5kYXIoKTtcbiAgICB9O1xuICAgICRzY29wZS5kaXNwbGF5WWVhclNlbGVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjYWxlbmRhckhlaWdodCA9ICRkb2N1bWVudFswXS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtZGMtZGF0ZS1waWNrZXJfX2NhbGVuZGFyJylbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgdmFyIHllYXJTZWxlY3RvckVsZW1lbnQgPSAkZG9jdW1lbnRbMF0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbWRjLWRhdGUtcGlja2VyX195ZWFyLXNlbGVjdG9yJylbMF07XG4gICAgICB5ZWFyU2VsZWN0b3JFbGVtZW50LnN0eWxlLmhlaWdodCA9IGNhbGVuZGFySGVpZ2h0ICsgJ3B4JztcblxuICAgICAgJHNjb3BlLnllYXJTZWxlY3Rpb24gPSB0cnVlO1xuXG4gICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhY3RpdmVZZWFyRWxlbWVudCA9ICRkb2N1bWVudFswXS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtZGMtZGF0ZS1waWNrZXJfX3llYXItLWlzLWFjdGl2ZScpWzBdO1xuICAgICAgICB5ZWFyU2VsZWN0b3JFbGVtZW50LnNjcm9sbFRvcCA9IHllYXJTZWxlY3RvckVsZW1lbnQuc2Nyb2xsVG9wICsgYWN0aXZlWWVhckVsZW1lbnQub2Zmc2V0VG9wIC0geWVhclNlbGVjdG9yRWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyICsgYWN0aXZlWWVhckVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMjtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUNhbGVuZGFyKCkge1xuICAgICAgdmFyIGRheXMgPSBbXSxcbiAgICAgICAgcHJldmlvdXNEYXkgPSBhbmd1bGFyLmNvcHkoJHNjb3BlLmFjdGl2ZURhdGUpLmRhdGUoMCksXG4gICAgICAgIGZpcnN0RGF5T2ZNb250aCA9IGFuZ3VsYXIuY29weSgkc2NvcGUuYWN0aXZlRGF0ZSkuZGF0ZSgxKSxcbiAgICAgICAgbGFzdERheU9mTW9udGggPSBhbmd1bGFyLmNvcHkoZmlyc3REYXlPZk1vbnRoKS5lbmRPZignbW9udGgnKSxcbiAgICAgICAgbWF4RGF5cyA9IGFuZ3VsYXIuY29weShsYXN0RGF5T2ZNb250aCkuZGF0ZSgpO1xuXG4gICAgICAkc2NvcGUuZW1wdHlGaXJzdERheXMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IGZpcnN0RGF5T2ZNb250aC5kYXkoKSA9PT0gMCA/IDYgOiBmaXJzdERheU9mTW9udGguZGF5KCkgLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgICRzY29wZS5lbXB0eUZpcnN0RGF5cy5wdXNoKHt9KTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtYXhEYXlzOyBqKyspIHtcbiAgICAgICAgdmFyIGRhdGUgPSBhbmd1bGFyLmNvcHkocHJldmlvdXNEYXkuYWRkKDEsICdkYXlzJykpO1xuXG4gICAgICAgIGRhdGUuc2VsZWN0ZWQgPSBhbmd1bGFyLmlzRGVmaW5lZCgkc2NvcGUuc2VsZWN0ZWQubW9kZWwpICYmIGRhdGUuaXNTYW1lKCRzY29wZS5zZWxlY3RlZC5kYXRlLCAnZGF5Jyk7XG4gICAgICAgIGRhdGUudG9kYXkgPSBkYXRlLmlzU2FtZShtb21lbnQoKSwgJ2RheScpO1xuXG4gICAgICAgIGRheXMucHVzaChkYXRlKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmVtcHR5TGFzdERheXMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgayA9IDcgLSAobGFzdERheU9mTW9udGguZGF5KCkgPT09IDAgPyA3IDogbGFzdERheU9mTW9udGguZGF5KCkpOyBrID4gMDsgay0tKSB7XG4gICAgICAgICRzY29wZS5lbXB0eUxhc3REYXlzLnB1c2goe30pO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuZGF5cyA9IGRheXM7XG4gICAgfVxuXG4gICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJG1kRGlhbG9nLmhpZGUoKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNsb3NlUGlja2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgJG1kRGlhbG9nLmhpZGUoJHNjb3BlLnNlbGVjdGVkKTtcbiAgICB9O1xuICB9KVxuLmNvbnRyb2xsZXIoJ21kY0RhdGVQaWNrZXJJbnB1dENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkYXR0cnMsICR0aW1lb3V0LCAkbWREaWFsb2cpIHtcbiAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoJHNjb3BlLm1vZGVsKSkge1xuICAgICAgJHNjb3BlLnNlbGVjdGVkID0ge1xuICAgICAgICBtb2RlbDogbW9tZW50KCRzY29wZS5tb2RlbCwkc2NvcGUuZGF0ZUZvcm1hdCkuZm9ybWF0KCRzY29wZS5kYXRlRm9ybWF0KSxcbiAgICAgICAgZGF0ZTogJHNjb3BlLm1vZGVsXG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICRzY29wZS5zZWxlY3RlZCA9IHtcbiAgICAgICAgbW9kZWw6IHVuZGVmaW5lZCxcbiAgICAgICAgZGF0ZTogbmV3IERhdGUoKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICAkc2NvcGUub3BlblBpY2tlciA9IGZ1bmN0aW9uIChldikge1xuICAgICAgJHNjb3BlLnllYXJTZWxlY3Rpb24gPSBmYWxzZTtcblxuICAgICAgJG1kRGlhbG9nLnNob3coe1xuICAgICAgICB0YXJnZXRFdmVudDogZXYsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnZGF0ZS1waWNrZXIvZGF0ZS1waWNrZXItZGlhbG9nLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbWRjRGF0ZVBpY2tlckNvbnRyb2xsZXInLFxuICAgICAgICBsb2NhbHM6IHttb2RlbDogJHNjb3BlLm1vZGVsLCBsb2NhbGU6ICRhdHRycy5sb2NhbGUsIG1kVGhlbWU6ICRhdHRycy5kaWFsb2dNZFRoZW1lLCBkYXRlRm9ybWF0OiAkc2NvcGUuZGF0ZUZvcm1hdH1cbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHNlbGVjdGVkKSB7XG4gICAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICAgICRzY29wZS5zZWxlY3RlZCA9IHNlbGVjdGVkO1xuICAgICAgICAgICRzY29wZS5tb2RlbCA9IHNlbGVjdGVkLm1vZGVsO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9KVxuLmRpcmVjdGl2ZSgnbWRjRGF0ZVBpY2tlcicsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICBjb250cm9sbGVyOiAnbWRjRGF0ZVBpY2tlcklucHV0Q29udHJvbGxlcicsXG4gICAgICBzY29wZToge1xuICAgICAgICBtb2RlbDogJz0nLFxuICAgICAgICBsYWJlbDogJ0AnLFxuICAgICAgICBkYXRlRm9ybWF0OiAnQCdcbiAgICAgIH0sXG4gICAgICB0ZW1wbGF0ZVVybDogJ2RhdGUtcGlja2VyL2RhdGUtcGlja2VyLWlucHV0Lmh0bWwnXG4gICAgfTtcbiAgfSk7XG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnbmdNYXRlcmlhbC5jb21wb25lbnRzJywgW1xyXG4gICduZ01hdGVyaWFsJyxcclxuICAnbmdNYXRlcmlhbC5jb21wb25lbnRzLnRlbXBsYXRlcycsXHJcbiAgJ25nTWF0ZXJpYWwuY29tcG9uZW50cy5kYXRlUGlja2VyJ1xyXG5dKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
