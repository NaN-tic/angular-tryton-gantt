'use strict';

angular.module('myApp.gantt.gantt_view', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/gantt_view', {
    templateUrl: 'gantt/gantt.html',
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
        task_ids:[],
    };

    $scope.error=function(data){
        console.log(data)
    }

    $scope._search_read=function(domain){
        var fields=['id', 'rec_name', 'planned_start_date','planned_end_date',
            'effort', 'parent','predecessors','assigned_employee']
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
        var t = {}
        t.id = task.id;
        t.text = task.rec_name;
        t.start_date = task.planned_start_date || new Date();
        t.duration = task.effort || 0;
        t.parent = task.parent;
        t.end_date = task.planned_end_date;
        t.users = [task.assigned_employee];
        $scope.tasks.data.push(t);

        if (task.predecessors > 0 ){
            var l = {}
            l.source=task.predecessors;
            l.target=task.id;
            l.type='0';
            $scope.tasks.links.push(l);
        }
    };

    $scope.error=function(data){
        console.log("error");
        console.log(data);
    };

    $scope.get_tasks=function(){
        var domain=[('helpdesk','=',false)];
        var read = true;
        $scope._search_read(domain);
    };
    $scope.get_tasks();
}]);


