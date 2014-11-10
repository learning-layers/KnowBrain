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
sharingModule.controller("SharingController", ['$scope','$modalInstance', '$dialogs', '$q', 'i18nService', 'UserService', 'UserFetchService', 'SharingModel', 'ENTITY_TYPES', 'SHARING_OPTIONS', 'entity', 'GroupFetchService',function ($scope, $modalInstance, $dialogs, $q, i18nService, UserService, UserFetchService, SharingModel, ENTITY_TYPES, SHARING_OPTIONS, entity, GroupFetchService) {
    
        $scope.entity = entity;
        $scope.entityTypes = ENTITY_TYPES;
        $scope.sharingOptions = SHARING_OPTIONS;

        $scope.shareWith = SHARING_OPTIONS.private;
        $scope.sharedEntities = [];
        
        $scope.allFriends = [];
        
        var promise = GroupFetchService.getUserGroups($scope.profileId);

        promise.then(function (result) {
            $scope.allCircles = result.circles;
        });
        
        
        var promise = UserFetchService.getFriends();
        promise.then(function(result) {
            $scope.allFriends = result.friends;
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
            if (arrayContains($scope.sharedEntities, {label:"public"})) {
                SharingModel.shareEntityPublic($scope.entity);
            } else if ($scope.sharingType === 1) {
                SharingModel.shareEntityCustom($scope.entity, $scope.allFriends, "");
            } else {
                SharingModel.shareEntityCustom($scope.entity, $scope.sharedEntities, "");
            }

            
            $modalInstance.close();
        };

        $scope.choosePersonsHandler = function () {
               $dialogs.shareWith($scope.allFriends, $scope.sharedEntities);
        };
        
        $scope.chooseGroupsHandler = function () {
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
        
        
        $scope.sharingType = 0;
        
        $scope.setSharingType = function(sharingType) {
            $scope.sharingType = sharingType;
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

    $scope.selectResource = function(entry) {
        if(entry.isSelected) {
            entry.isSelected = false;
        }
        else {
            entry.isSelected = true;
        }
        if(!arrayContains(sharedUsers, entry)) {
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