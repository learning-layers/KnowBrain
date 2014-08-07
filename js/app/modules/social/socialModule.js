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
angular.module('module.social',['module.entity']);

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

angular.module('module.social').controller("GroupsController", ['$scope', '$state', '$dialogs', 'GroupFetchService', function($scope, $state, $dialogs, GroupFetchService){
    
    $scope.groups = [];
    
    var promise = GroupFetchService.getUserGroups($scope.profileId);
    
    promise.then(function(result){
        console.log(result);
        $scope.groups = result.circles;
        console.log(result);
    });

    this.createGroup = function() {
        $dialogs.newModal([], "modal-huge", MODULES_PREFIX+"/group/newGroupWizzard.tpl.html");

    };
    
    $scope.handleEntryClick = function(entry) {
        if(entry.type == "group") {
            $state.go("app.group.members", {groupId: entry.id});
        }
    };

}]);

angular.module('module.social').controller("FriendsController", ['$scope',function($scope){
    this.groups = "To be implemented";
}]);

//angular.module('module.social').service("UserFetchService", ['$q', 'UserService', function($q, UserSrv) {
//    this.getUser = function(userId){
//        var defer = $q.defer();
//        
//        new SSEntityDescGet(function(result) {
//            defer.resolve(result);
//        }, function(error) {
//            
//        },
//        UserSrv.getUser(),
//        UserSrv.getKey(),
//        userId,
//        null,
//        null,
//        null,
//        null,
//        null,
//        null
//        );
//        
//        return defer.promise;
//    },
//    
//    this.getAllUsers = function(){
//        var defer = $q.defer();
//        
//        new SSUserAll(function(result) {
//            defer.resolve(result);
//        }, function(error) {
//            
//        },
//        UserSrv.getUser(),
//        UserSrv.getKey()
//        );
//        
//        return defer.promise;
//    }
//    
//
//}]);

