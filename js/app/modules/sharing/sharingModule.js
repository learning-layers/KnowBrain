/**
 * Code contributed to the Learning Layers project
 * http://www.learning-layers.eu
 * Development is partly funded by the FP7 Programme of the European Commission under
 * Grant Agreement FP7-ICT-318209.
 * Copyright (c) 2014, Graz University of Technology - KTI (Knowledge Technologies Institute).
 * For a list of contributors see the AUTHORS file at the top-level directory of $scope distribution.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use $scope file except in compliance with the License.
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
 * SEARCH MODULE
 */
var sharingModule = angular.module('module.sharing', ['module.i18n', 'ui.bootstrap.modal', 'dialogs.services']);

/**
 * CONFIG
 */
sharingModule.config(function ($stateProvider) {

    $stateProvider.state('sharing', {
        url: '/sharing',
        templateUrl: PATH_PREFIX + '/main.tpl.html',
        controller: 'SharingController'
    });

});

/**
 * CONTROLLER
 */
sharingModule.controller("SharingController", ['$scope','$modalInstance', '$dialogs', '$q', 'i18nService', 'UserService', 'UserFetchService', 'SharingModel', 'ENTITY_TYPES', 'entities', 'GroupFetchService',function ($scope, $modalInstance, $dialogs, $q, i18nService, UserService, UserFetchService, SharingModel, ENTITY_TYPES, entities, GroupFetchService) {
    
        $scope.entity = entities[0];
        $scope.entities = entities;
        $scope.entityTypes = ENTITY_TYPES;

        $scope.sharingOptions = [{label : 'Public', order : 0, cssClass : 'glyphicon-globe'},
                                {label : 'Friends', order : 1, cssClass : 'glyphicon-user'},
                                {label : 'Circles', order : 2, cssClass : 'glyphicon-copyright-mark'},
                                {label : 'Circles and friends', order : 3, cssClass : 'glyphicon-leaf'},
                                {label : 'Custom', order : 4, cssClass : 'glyphicon-cog'}];

        $scope.shareWith = $scope.sharingOptions[0];
        $scope.sharedEntities = [];
        
        $scope.allFriends = [];
        
        var promise = GroupFetchService.getUserGroups($scope.profileId);

        promise.then(function (result) {
            $scope.allCircles = result.circles;
        });
        
        
        var friendsPromise = UserFetchService.getFriends();
        friendsPromise.then(function(result) {
            $scope.allFriends = result.friends;
        });

        var usersPromise = UserFetchService.getAllUsers();
        usersPromise.then(function(result) {
            $scope.allUsers = result.users;
        });
        
        $scope.shareInput;
        
        $scope.userFilter = {label: ""};

        /**
         * TRANSLATION INJECTION
         */
        $scope.t = function (identifier) {
            return i18nService.t(identifier);
        };

        /**
         * METHODS
         */

        $scope.close = function () {
            $modalInstance.dismiss('Cancel');
        };

        $scope.share = function () {
            if ($scope.shareWith.order === 0) {  //public
                angular.forEach($scope.entities, function(entity, key){
                    SharingModel.shareEntityPublic(entity);
                });
            } else if ($scope.shareWith.order === 1) { //friends
                angular.forEach($scope.entities, function(entity, key){
                    SharingModel.shareEntityCustom(entity, $scope.allFriends, "");
                });
            } else if ($scope.shareWith.order === 2) { //Circles
                angular.forEach($scope.entities, function(entity, key){
                    SharingModel.shareEntityCustom(entity, $scope.allCircles, "");
                });
            } else if ($scope.shareWith.order === 3) { //Friends and circles
                var circlesAndFriends = [];
                angular.forEach($scope.allCircles, function(circle, key){
                    circlesAndFriends.push(circle);
                });
                angular.forEach($scope.allFriends, function(friend, key){
                    circlesAndFriends.push(friend);
                });
                angular.forEach($scope.entities, function(entity, key){
                    SharingModel.shareEntityCustom(entity, circlesAndFriends, "");
                });
            } else {
                angular.forEach($scope.entities, function(entity, key){
                    SharingModel.shareEntityCustom(entity, $scope.sharedEntities, "");
                });
            }

            
            $modalInstance.close();
        };

        $scope.chooseFriendsHandler = function () {
               $dialogs.shareWith($scope.allFriends, $scope.sharedEntities);
        };

        $scope.chooseUsersHandler = function () {
               $dialogs.shareWith($scope.allUsers, $scope.sharedEntities);
        };
        
        $scope.chooseCirclesHandler = function () {
               $dialogs.shareWith($scope.allCircles, $scope.sharedEntities);
        };
        
        $scope.blurInput = function() {
            
            $("#shareInput").val("");
        };
        
        $scope.activateDropdown = function(e) {
            if(!$("#shareWithDropdown").hasClass("open")) {
                $("#shareWithDropDownToggle").dropdown('toggle');
                $("dropdown-toggle").dropdown('toggle');
            }
            e.stopPropagation();
        };
        
        $scope.setSharingOption = function(option) {
            $scope.shareWith = option;
        };
        
        $scope.addShareTag = function(tag) {
            tag.isSelected = true;
            
            for(var i=0; i < $scope.sharedEntities.length; i++) {
                if(tag == $scope.sharedEntities[i]) {
                    $scope.userFilter.label = "";
                    return;
                }
            }
            
            $scope.sharedEntities.push(tag);
            $scope.userFilter.label = "";
        };
        
        $scope.removeShareTag = function(tag) {
            tag.isSelected = false;
            removeFromArray($scope.sharedEntities, tag);
        };
        
        $scope.entityUnselected = function(entity) {
            if(!entity.isSelected) {
                return true;
            } 
            else {
                return false;
            } 
        };
        
        var arrayContains = function(array, entity) {
            for(var i=0; i < array.length; i++) {
                if(array[i].label == entity.label) {
                    return true;
                }
                return false;
            }
        };
        
        var removeFromArray = function(array, entity) {

            for(var i = 0; i < array.length; i++) {
                if(array[i].label == entity.label) {
                    array.splice(i,1);
                }
            }
        };

    }]);

sharingModule.controller("ShareWithController", ['$scope','$modalInstance', 'i18nService', 'allUsers', 'sharedEntities',  function ($scope, $modalInstance, $i18nService, allUsers, sharedEntities) {

    var sharedUsers = [];

    $scope.allUsers = allUsers;

    $scope.selectUser = function(entry) {
        if(entry.isSelected) {
            entry.isSelected = false;
        }
        else {
            entry.isSelected = true;
        }
        if(arrayContains(sharedUsers, entry)) {
            removeFromArray(sharedUsers, entry);
        } else {
            sharedUsers.push(entry);
        }
    };

    $scope.ok = function () {
        for(var i=0; i < sharedUsers.length; i++) {
            if(sharedUsers[i].isSelected) {
                if(!arrayContains(sharedEntities, sharedUsers[i])) {
                    sharedEntities.push(sharedUsers[i]);
                }
            } 
            else {
                removeFromArray(sharedEntities, sharedUsers[i]);
            }
        }
        
        $modalInstance.close();
    };

    $scope.close = function () {
        for(var i=0; i < sharedUsers.length; i++) {
            sharedUsers[i].isSelected = false;
        }
        
        $modalInstance.dismiss('cancel');
    };
    
    var arrayContains = function(array, entity) {
        for(var i=0; i < array.length; i++) {
            if(array[i].label == entity.label) {
                return true;
            }
            return false;
        }
    };
    
    var removeFromArray = function(array, entity) {
        for(var i = 0; i < array.length; i++) {
            if(array[i].label == entity.label) {
                array.splice(i,1);
            }
        }
    };

}]);