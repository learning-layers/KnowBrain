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
angular.module('module.social',['module.entity', 'module.activities']);

/**
* CONFIG
*/
angular.module('module.social').config(function($stateProvider) {


    $stateProvider
        .state('app.social', {
             url:'/social/*profileId',
            abstract:true,
            controller: 'SocialController',
            templateUrl: MODULES_PREFIX + '/social/social.tpl.html'
        });
    
    $stateProvider.state('app.social.activities', {
        url: '/activities',
        templateUrl: MODULES_PREFIX + '/social/activities.tpl.html',
        controller: "UserActivitiesController"
    });

    $stateProvider.state('app.social.groups', {
        url: '/groups',
        templateUrl: MODULES_PREFIX + '/social/groups.tpl.html',
        controller: "GroupsController as groupCtrl"
    });

    $stateProvider.state('app.social.friends', {
        url: '/friends',
        templateUrl: MODULES_PREFIX + '/social/friends.tpl.html',
        controller: "FriendsController"
    });
});

/**
* CONTROLLER
*/
angular.module('module.social').controller("SocialController", ['$scope', '$stateParams', 'UserService', 'UserFetchService', function($scope, $stateParams, UserSrv, UserFetchService){

    $scope.profileId = $stateParams.profileId;
    
    var promise = UserFetchService.getUser($scope.profileId);
    promise.then(function(result) {
        $scope.label = result.desc.label;
    });
    
    var promise = UserFetchService.getAllUsers();
    promise.then(function(result) {
        console.log(result);
    });
    
    $scope.userId = UserSrv.getUser();
}]);

angular.module('module.social').controller("UserActivitiesController", ['$scope', 'Activity', 'UserActivitiesFetchService', function($scope, Activity, ActivityFetchService){
    
    console.log($scope.profileId);
    var promise = ActivityFetchService.getUserActivities($scope.profileId);
    
    var activities = [];
    
    promise.then(function(result) {
        console.log(result.activities);
        
        for(var i = 0; i < result.activities.length; i++) {
            var act = result.activities[i];
            
            var activity = new Activity("", act.type, act.creationTime, act.entities, act.users);
            activities.push(activity);
        }
        
        var promise = ActivityFetchService.getUsers(result.activities);
        
        
        promise.then(function(results) {
            console.log("Users:");
            console.log(results);
            for(var i = 0; i < results.length; i++) {
                activities[i].user = results[i].desc;
                console.log(activities[i].user);
            }
            $scope.activities = activities;
            console.log(activities);
        });
    });
}]);

angular.module('module.social').controller("GroupsController", ['$scope', '$dialogs', 'GroupFetchService', function($scope, $dialogs, GroupFetchService){
    
    $scope.groups = [];
    
    var promise = GroupFetchService.getUserGroups($scope.profile);
    
    promise.then(function(result){
        $scope.groups = result.circles;
    });

    this.createGroup = function() {
        var newGroupDialog = $dialogs.createNewGroup($scope.groups);
        
        newGroupDialog.result.then(function(result) {
            var promise = GroupFetchService.getUserGroups();
            promise.then(function(result){
                $scope.groups = result.circles;
            });
        });

    };

}]);

angular.module('module.social').controller("FriendsController", ['$scope',function($scope){
    this.groups = "To be implemented";
}]);

angular.module('module.social').service("UserFetchService", ['$q', 'UserService', function($q, UserSrv) {
    this.getUser = function(userId){
        var defer = $q.defer();
        
        new SSEntityDescGet(function(result) {
            defer.resolve(result);
        }, function(error) {
            
        },
        UserSrv.getUser(),
        UserSrv.getKey(),
        userId,
        null,
        null,
        null,
        null,
        null,
        null
        );
        
        return defer.promise;
    },
    
    this.getAllUsers = function(){
        var defer = $q.defer();
        
        new SSUserAll(function(result) {
            defer.resolve(result);
        }, function(error) {
            
        },
        UserSrv.getUser(),
        UserSrv.getKey()
        );
        
        return defer.promise;
    }
    

}]);

angular.module('module.social').service("UserActivitiesFetchService", ['$q', 'UserService', function($q, UserSrv) {


this.getUserActivities = function(userId) {
    
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
        [userId], //users
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
        
        
        var promise = this.getEntity(activities[i].author);
        promises.push(promise);
    }
    
    return $q.all(promises);
};

this.getEntity = function(entity) {
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

