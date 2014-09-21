'use strict';

var scripts = document.getElementsByTagName("script");
var currentScriptPath = scripts[scripts.length-1].src;

angular.module('myApp.gantt.gantt_view', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/gantt_view', {
    templateUrl: currentScriptPath.substring(0, currentScriptPath.lastIndexOf('/') + 1)
        + 'gantt.html',
    controller: 'GanttViewCtrl'
  });
}])

.controller('GanttViewCtrl', [
  '$scope',
  'tryton',
  'session',
  '$sessionStorage',
  '$rootScope',
  function($scope, tryton, session, $sessionStorage, $rootScope) {
    $scope.tasks = {
        data:[],
        links:[],
    };

    $scope.error=function(data){
        console.log(data)
    }

    $scope._tasks=function(domain){
        var fields=['id', 'work.name','type', 'planned_start_date',
            'planned_end_date', 'effort', 'parent','predecessors',
            'assigned_employee.rec_name', 'state', 'planned_start_date_project',
            'planned_end_date_project']

        var offset=undefined
        var limit=undefined
        var order=undefined
        session.rpc('model.project.work.search_read', [domain, offset, limit, order, fields] , {})
        .success(function(data){
            for(var x in data){
                $scope.add_task(data[x])
            }
        })
        .error(function(data){
            $scope.error(data);
        });
    };

    $scope.add_task=function(task){
        var t = {};
        t.id = task.id;
        t.text = task["work.name"];

        t.progress = 0;
        if(t.state = 'closed'){
            t.progress=1;
        }

        t.parent = task.parent;
        if(task.type == 'task'){
            t.start_date = new Date();
            console.log( typeof t.start_date)
            if(task.planned_start_date !== undefined && task.planned_start_date !== null){
                var d = task.planned_start_date;
                t.start_date = new Date(d.year, d.month, d.day);
            }

            t.duration = task.effort || 0;
            if(task.planned_end_date !== undefined && task.planned_end_date !== null){
                console.log(task.planned_start_date);
                var d = task.planned_end_date;
                t.end_date = new Date(d.year, d.month, d.day);
            }
            t.users = [task["assigned_employee.rec_name"]];
        }
        $scope.tasks.data.push(t);
    };

    $scope.add_link=function(link){
        var l = {}
        l.id = link.id;
        l.source=link.predecessor;
        l.target=link.successor;
        l.type="0";
        $scope.tasks.links.push(l);
    }

    $scope._links=function(domain){
        var fields=['id', 'predecessor', 'successor']
        var offset=undefined
        var limit=undefined
        var order=undefined
        session.rpc('model.project.predecessor_successor.search_read', [domain, offset, limit, order, fields] , {})
        .success(function(data){
            for(var x in data){
                $scope.add_link(data[x])
            }
        })
        .error(function(data){
            $scope.error(data);
        });
    };



    $scope.error=function(data){
        console.log("error");
        console.log(data);
    };

    $scope.get_tasks=function(){
        var domain=[('helpdesk','=',false)];
        $scope._tasks(domain);
    };

    $scope.get_links=function(){
        var domain=[('helpdesk','=',false),('helpdesk','=',null)];
        $scope._links(domain);
    }

    $scope.get_tasks();
    $scope.get_links();
}]);


