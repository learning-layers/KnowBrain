/**
* Code contributed to the Learning Layers project
* http://www.learning-layers.eu
* Development is partly funded by the FP7 Programme of the European Commission under
* Grant Agreement FP7-ICT-318209.
* Copyright (c) 2014, Graz University of Technology - KTI (Knowledge Technologies Institute).
* For a list of contributors see the AUTHORS file at the top-level directory of this distribution.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// Encoding: UTF-8
'use strict';

/**
* AUTHORISATION MODULE 
*/
angular.module('module.activities',[]);

angular.module('module.activities').constant("ACTIVITY_TYPES", {disc:'discussEntity', newDisc:"newDiscussionByDiscussEntity", addDiscComm: "addDiscussionComment", share:'share', link:'entity'});

/**
* CONFIG
*/
angular.module('module.activities').config(function($stateProvider) {

    $stateProvider
        .state('app.activities', {
             url:'/activities',
            controller: 'ActivitiesController',
            templateUrl: MODULES_PREFIX + '/activities/activities.tpl.html'
        });
});

angular.module('module.activities').directive('ngActivity', function() {
    return {
        restrict:"E",
        transclude:true,
        templateUrl: MODULES_PREFIX + "/activities/activity.tpl.html"
      };
});

/**
* CONTROLLER
*/
angular.module('module.activities').controller("ActivitiesController", ['$scope', '$q','UserService', 'UserModel', 'Activity', 'ACTIVITY_TYPES', function($scope, $q, UserSrv, UserModel, Activity, ACTIVITY_TYPES){
    
    $scope.activities = [];
    
    var defer = $q.defer();
    var self = this;
    
    var promises = [];

    new SSActivitiesGet(function(result){
            defer.resolve(result);
        },
        function(error){
            console.log(error);
        },
        UserSrv.getUser(),
        UserSrv.getKey(),
        null, //types
        null, //users
        null, //entities 
        null, //startTime
        null //endTime
    );
    
    promises.push(defer.promise);
    
    var promise = UserModel.getAllUsers();
    promises.push(promise);
    
    $q.all(promises).then(function(results) {
        
        console.log(results[0].activities);
        for(var i = 0; i < results[0].activities.length; i++) {
            var act = results[0].activities[i];
            
            var user = "";
            
            for(var j = 0; j < results[1].users.length; j++) {
                var curUser = results[1].users[j];
                
                if(curUser.id == act.author+'/') {
                    user = curUser.label;
                }
            }
            
            var activity = new Activity(user, act.type, act.creationTime);
            $scope.activities.push(activity);
            
        }
        
        console.log($scope.activities);
    });
    
}]);

angular.module('module.activities').factory('Activity', [function() {
    function Activity(user, type, time){
        this.user = user;
        this.type = type;
        this.time = parseTime(time);
        this.date = parseDate(time);
      }
    
    var parseTime = function(time) {
        var myDate = new Date(time);
       // var myDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
        //myDate.setUTCSeconds(time);
        console.log(myDate);
        console.log(time);
        var hours = myDate.getHours(); //returns 0-23
        var minutes = myDate.getMinutes(); //returns 0-59
        var seconds = myDate.getSeconds(); //returns 0-59
        
        if (hours < 10) hours = '0' + hours;
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;
        
        return hours + ":" + minutes + ":" + seconds;
    }
    
    var months = [ "January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December" ];
    
    var parseDate = function(time) {
        var myDate = new Date(1000*time);
        
        var day = myDate.getDate();
        var month = myDate.getMonth();

        return day + ". " + months[month];
    }
    return (Activity);
}]);
