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
             url:'/social',
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
angular.module('module.social').controller("SocialController", ['$scope', function($scope){

}]);

angular.module('module.social').controller("GroupsController", ['$scope', '$dialogs', 'GroupFetchService', function($scope, $dialogs, GroupFetchService){
    
    $scope.groups = [];
    
    var promise = GroupFetchService.getUserGroups();
    
    promise.then(function(result){
        $scope.groups = result.circles;
    });

    this.createGroup = function() {
        $dialogs.newModal([], "modal-huge", MODULES_PREFIX+"/group/newGroupWizzard.tpl.html");
        
//        var newGroupDialog = $dialogs.createNewGroup($scope.groups);
//        
//        newGroupDialog.result.then(function(result) {
//            var promise = GroupFetchService.getUserGroups();
//            promise.then(function(result){
//                $scope.groups = result.circles;
//            });
//        });

    };

}]);

angular.module('module.social').controller("FriendsController", ['$scope',function($scope){
    this.groups = "To be implemented";
}]);

