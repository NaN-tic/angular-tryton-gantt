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

      //init gantt
      gantt.config.columns = [
        {name:"text",       label:"Task",  width: 300, tree:true },
        {name:"start_date", label:"Start", align: "center" },
        {name:"end_date",   label:"Finish",   align: "center" },
        {name:"assigned",   label:"Assigned to", align: "center",
            template: function(item) {
                if (!item.users) return "Nobody";
                return item.users.join(", ");
            }
        }
      ];

      function setScaleConfig(value){
        switch (value) {
          case "1":
            gantt.config.scale_unit = "day";
            gantt.config.step = 1;
            gantt.config.date_scale = "%d %M";
            gantt.config.subscales = [];
            gantt.config.scale_height = 27;
            gantt.templates.date_scale = null;
            break;
          case "2":
            var weekScaleTemplate = function(date){
              var dateToStr = gantt.date.date_to_str("%d %M");
              var endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
              return dateToStr(date) + " - " + dateToStr(endDate);
            };

            gantt.config.scale_unit = "week";
            gantt.config.step = 1;
            gantt.templates.date_scale = weekScaleTemplate;
            gantt.config.subscales = [
              {unit:"day", step:1, date:"%D" }
            ];
            gantt.config.scale_height = 50;
            break;
          case "3":
            gantt.config.scale_unit = "month";
            gantt.config.date_scale = "%F, %Y";
            gantt.config.subscales = [
              {unit:"day", step:1, date:"%j, %D" }
            ];
            gantt.config.scale_height = 50;
            gantt.templates.date_scale = null;
            break;
          case "4":
            gantt.config.scale_unit = "year";
            gantt.config.step = 1;
            gantt.config.date_scale = "%Y";
            gantt.config.min_column_width = 50;

            gantt.config.scale_height = 90;
            gantt.templates.date_scale = null;

            var monthScaleTemplate = function(date){
              var dateToStr = gantt.date.date_to_str("%M");
              var endDate = gantt.date.add(date, 2, "month");
              return dateToStr(date) + " - " + dateToStr(endDate);
            };

            gantt.config.subscales = [
              {unit:"month", step:3, template:monthScaleTemplate},
              {unit:"month", step:1, date:"%M" }
            ];
            break;
        }
      }

      setScaleConfig('1');


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

      gantt.templates.grid_row_class = function(start, end, item){
        return item.$level==0?"gantt_project":""
      }
      gantt.templates.task_row_class = function(start, end, item){
        return item.$level==0?"gantt_project":""
      }
      gantt.templates.task_class = function(start, end, item){
        return item.$level==0?"gantt_project":""
      }
      gantt.config.grid_width = 580;
      gantt.init($element[0]);

    var func = function(e) {
      e = e || window.event;
      var el = e.target || e.srcElement;
      var value = el.value;
      setScaleConfig(value);
      gantt.render();
    };

    var els = document.getElementsByName("scale");
    for (var i = 0; i < els.length; i++) {
      els[i].onclick = func;
    }
  }
  }
});

