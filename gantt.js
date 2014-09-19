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
            'assigned_employee.rec_name', 'state']
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

        if( task.type == 'milestone' ){
            t.type = gantt.config.types.milestone
        } else if( task.type == 'project'){
            t.type = gantt.config.types.project
        }

        t.progres = 0;
        if(t.state = 'closed'){
            t.progres=1;
        }

        t.start_date = task.planned_start_date || new Date();
        t.parent = task.parent;
        if(task.type == 'task'){
            t.duration = task.effort || 0;
            t.end_date = task.planned_end_date;
            t.users = [task["assigned_employee.rec_name"]];
        }
        $scope.tasks.data.push(t);
    };

    $scope.add_link=function(link){
        var l = {}
        l.id = link.id;
        l.source=link.predecessor;
        l.target=link.successor;
        l.type="1";
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


