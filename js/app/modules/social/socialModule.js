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
angular.module('module.social').controller("SocialController", ['$modal', '$scope', '$state', '$stateParams', 'UserService', 'UserFetchService', function($modal, $scope, $state, $stateParams, UserSrv, UserFetchService){

    $scope.profileId = $stateParams.profileId;
    $scope.uploadProfilePicture = function() {
        $modal.open({
                    templateUrl: MODULES_PREFIX + '/social/update-profile-picture.tpl.html',
                    controller: 'ProfilePictureController',
                    keyboard: true,
                    backdrop: true,
                    windowClass: 'modal-small'
                });  
    } 
    
    var promise = UserFetchService.getUser($scope.profileId);
    promise.then(function(result) {
        $scope.label = result.label;
        $scope.email = result.email;
        $scope.thumb = result.profilePicture.thumb;
    });
    
    $scope.userId = UserSrv.getUser();
    $scope.isFriend = false;

    var promise = UserFetchService.getFriends();
    promise.then(function(result) {
        
        if(result.friends){

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

}])

.controller("ProfilePictureController", function($scope, $modalInstance, $state, $stateParams, FileUploader, UserService, UserFetchService){
    $scope.uploader = new FileUploader();
    $scope.uploader.filters.push({
            name: 'imageFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });
    $scope.item = null;
    $scope.uploader.onAfterAddingFile = function(item) {
        $scope.item = item;
    };

    $scope.save = function() {
        new SSFileUpload(
            function(result, fileName) {

                new SSImageProfilePictureSet(
                    function(result) {
                    },
                    function(error) {
                        console.log("Error");
                        defer.reject(error);
                    },
                    UserService.getUser(),
                    UserService.getKey(),
                    result.file
                );
            },
            function(error) {
                console.log("Error");
                defer.reject(error);
            },
            UserService.getKey(),
            $scope.item._file
        );
    };
});



angular.module('module.social').controller("FriendsController", ['$scope',function($scope){
    //TODO: List friends
}]);