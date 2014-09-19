'use strict'
angular.module('myApp.gantt.dhxgantt-directive', [])
.directive('dhxgantt', function() {
  return {
    restrict: 'A',
    scope: false,
    transclude: true,
    template: '<div ng-transclude></div>',

    link:function ($scope, $element, $attrs, $controller){
      //watch data collection, reload on changes
      $scope.$watch($attrs.data, function(collection){
        gantt.clearAll();
        gantt.parse(collection, "json");
      }, true);

      //size of gantt
      $scope.$watch(function() {
        return $element[0].offsetWidth + "." + $element[0].offsetHeight;
      }, function() {
        gantt.setSizes();
      });

      //init gantt
      gantt.config.columns = [
        {name:"text",       label:"Task name",  width:"250px", tree:true },
        {name:"start_date", label:"Start time", align: "center" },
        {name:"end_date",   label:"End date",   align: "center" },
        {name:"duration",   label:"Duration",   align: "center" },
        {name:"assigned",   label:"Assigned to", align: "center", width:100,
            template: function(item) {
                if (!item.users) return "Nobody";
                return item.users.join(", ");
            }
        }
      ];

      gantt.templates.scale_cell_class = function(date){
            if(date.getDay()==0||date.getDay()==6){
                return "weekend";
            }
        };
      gantt.templates.task_cell_class = function(item,date){
            if(date.getDay()==0||date.getDay()==6){
                return "weekend"
            }
      };


      gantt.config.scale_unit = "month";
      gantt.config.step = 1;
      gantt.config.date_scale = "%F, %Y";
      gantt.config.min_column_width = 50;
      gantt.config.duration_unit = "hour";

      gantt.config.scale_height = 80;

      var weekScaleTemplate = function(date){
        var dateToStr = gantt.date.date_to_str("%d %M");
        var endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
        return dateToStr(date) + " - " + dateToStr(endDate);
      };

      gantt.config.subscales = [
        {unit:"week", step:1, template:weekScaleTemplate},
        {unit:"day", step:1, date:"%D" }
      ];

        gantt.config.grid_width = 580;
        gantt.init($element[0]);
    }
  }
});
