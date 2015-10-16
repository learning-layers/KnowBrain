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
* Constants
*/
angular.module('module.social').constant('SETTINGS_CONSTANTS', { 
    collectionViewModeCookieName: 'kbCollViewMode'
});

/**
* CONFIG
*/
angular.module('module.social').config(function($stateProvider) {


    $stateProvider
        .state('app.social', {
            url:'/social/*profileId',
            controller: 'SocialController',
            templateUrl: MODULES_PREFIX + '/social/social.tpl.html'
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
angular.module('module.social').controller("SocialController", ['$modal', '$scope', '$state', '$stateParams', 'UserService', 'UserFetchService', 'ActivityFetchService', '$dialogs', 'UriToolbox', function($modal, $scope, $state, $stateParams, UserSrv, UserFetchService, ActivityFetchService, $dialogs, UriToolbox){

    $scope.profileId = $stateParams.profileId;
    $scope.userId = UserSrv.getUser();
    $scope.profileIsMyself = $scope.profileId == $scope.userId;
    $scope.tags = new Array();

    $scope.uploadProfilePicture = function() {
        if ($scope.profileIsMyself) {
            var dialog = $dialogs.uploadProfilePicture($scope.profileId);
            dialog.result.finally(function() {
                updateUser();
            });
        }
    } 
    
    var updateUser = function() {
        var promise = UserFetchService.getUser($scope.profileId);
        promise.then(function(result) {
            $scope.user = result;

            $scope.editedDescription = result.description;
            //set tags
            angular.forEach(result.tags, function(tag, key) {
                $scope.tags.push({text: tag.label});
            })
        });
    };
    updateUser();

    var promise = ActivityFetchService.getActivities(null, [$scope.profileId], null, null, null, null);
    promise.then(function(result) {
        $scope.activities = result;
    });
    
    $scope.isFriend = false;

    var promise = UserFetchService.getFriends();
    promise.then(function(result) {
        if(result.friends) {
            for (var i = 0; i < result.friends.length; i++) {
                if (result.friends[i].id == $scope.profileId) {
                    $scope.isFriend = true;
                }
            }
        }
    });
    
    $scope.addAsFriend = function() {
        var promise = UserFetchService.addFriend($scope.profileId);
        promise.then(function(result) {
            $scope.isFriend = true;
        });
    }

    $scope.saveDescription = function(description) {
        if (this.editingDescription) {
            var promise = $scope.user.setDescription(description);
            promise.then(function(result) {
                $scope.user.description = description;
            }, function(error) {
                console.log(error);
            });
        }
    };

    $scope.tagAdded = function(tag) {
        // Passed variable is an object with structure { text : 'tagtext'}
        $scope.user.addTag(tag.text);
    };
    $scope.tagRemoved = function(tag) {
        // Passed variable is an object with structure { text : 'tagtext'}
        $scope.user.removeTag(tag.text);
    };

    $scope.handleEntryClick = function(entry) {
        if (entry.isCollection()) {
            $scope.loadCollectionByUri(UriToolbox.extractUriPathnameHash(entry.id));
        } else if (entry.type == "qa") {
            $state.transitionTo('app.qa.qa', {
                id: UriToolbox.extractUriPathnameHash(entry.id)
            });
        } else {
            var dialog = $dialogs.entryDetail(entry);
        }
    };
}])

angular.module('module.social').controller("FriendsController", ['$scope',function($scope){
    //TODO: List friends
}]);