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

angular.module('module.activities').directive('ngPost', function() {
    return {
        restrict:"E",
        transclude:true,
        templateUrl: MODULES_PREFIX + "/activities/activityStreamPost.tpl.html"
      };
});

/**
* CONTROLLER
*/
angular.module('module.activities').controller("ActivitiesController", ['$scope', 'Activity', 'ACTIVITY_TYPES', 'ActivityFetchService', function($scope, Activity, ACTIVITY_TYPES, ActivityFetchService){
    
    $scope.ACTIVITY_TYPES = ACTIVITY_TYPES;
    $scope.activities = [];

    var promise = ActivityFetchService.getActivities(null, null, null, null, null, null);
    
    promise.then(function(result) {
        
        for(var i = 0; i < result.activities.length; i++) {
            var act = result.activities[i];
            
            var activity = new Activity(act.author, act.type, act.creationTime, act.entities, act.users);
            $scope.activities.unshift(activity);
        }
    }); 
}]);

