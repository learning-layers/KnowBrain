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

angular.module('module.activities').constant("ACTIVITY_TYPES", {disc:'discussEntity', addDisc:"addDiscEntry", removeDisc: "removeDisc",});

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
angular.module('module.activities').controller("ActivitiesController", ['$scope', 'Activity', 'ACTIVITY_TYPES', 'ActivityFetchService', function($scope, Activity, ACTIVITY_TYPES, ActivityFetchService){
    
    $scope.ACTIVITY_TYPES = ACTIVITY_TYPES;
    $scope.activities = [];
    
    var activities = [];
    var users = [];

    var promise = ActivityFetchService.getActivities();
    
    promise.then(function(result) {
        console.log(result.activities);
        
        for(var i = 0; i < result.activities.length; i++) {
            var act = result.activities[i];
            
            var activity = new Activity("", act.type, act.creationTime, act.entities, act.users);
            activities.push(activity);
        }
        
        var promise = ActivityFetchService.getUsers(result.activities);
        
        
        promise.then(function(results) {
            
            for(var i = 0; i < results.length; i++) {
                activities[i].user = results[i].desc.label;
                console.log(results[i].desc.label);
            }
            $scope.activities = activities;
            console.log(activities);
        });
    });
    
}]);

angular.module('module.activities').factory('Activity', [function() {
    function Activity(user, type, time, entities, users){
        this.user = user;
        this.type = type;
        this.time = parseTime(time);
        this.date = parseDate(time);
        this.entities = entities;
        this.users = users;
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

angular.module('module.activities').service('ActivityFetchService', ['$q','UserService', function($q, UserSrv) {
    
    this.getActivities = function() {
        
        var defer = $q.defer();
        var self = this;
        
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
        
        return defer.promise;
    };
    
    this.getUsers = function(activities) {
        
        var defer = $q.defer();
        var self = this;
        
        var promises = [];
        
        for(var i = 0; i < activities.length; i++) {
            
            
            var promise = getEntity(activities[i].author);
            promises.push(promise);
        }
        
        return $q.all(promises);
    };
    
    var getEntity = function(entity) {
        console.log("Get: " + entity);
        
        var defer = $q.defer();
        var self = this;
        
        new SSEntityDescGet(
                function(result) {
                    console.log(result);
                    return defer.resolve(result);
                },
                function(error) {
                    
                },
                UserSrv.getUser(),
                UserSrv.getKey(),
                entity,
                false,
                false,
                false,
                false,
                false,
                false
        );
        
        return defer.promise;
    }
    
}]);