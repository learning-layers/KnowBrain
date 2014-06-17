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
sharingModule.controller("SharingController", ['$scope','$modalInstance', '$dialogs', '$q', 'i18nService', 'UserService', 'UserModel', 'SharingModel', 'ENTITY_TYPES', 'SHARING_OPTIONS', 'entity',function ($scope, $modalInstance, $dialogs, $q, i18nService, UserService, UserModel, SharingModel, ENTITY_TYPES, SHARING_OPTIONS, entity) {
    
        $scope.entity = entity;
        $scope.entityTypes = ENTITY_TYPES;
        $scope.sharingOptions = SHARING_OPTIONS;

        $scope.shareWith = SHARING_OPTIONS.private;
        $scope.shareEntities = [];
        
        $scope.allUsers = [];
        $scope.allCircles = [{label: "public"}, {label:"friends"}];
        
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
        
        var promise = UserModel.getAllUsers();
        promise.then(function(result) {

            $scope.allUsers = result.users;
            console.log($scope.allUsers);
        });

        $scope.share = function () {

            if(arrayContains($scope.shareEntities, {label:"public"})) {
                SharingModel.shareEntityPublic($scope.entity);
            }
            else {
                removeFromArray($scope.shareEntities, {label:"friends"});
                
                var shareTemp = [];
                
                for(var i=0; i < $scope.shareEntities.length; i++) {

                    shareTemp.push($scope.shareEntities[i].id);

                }
                console.log("Share custom");
                console.log(shareTemp);
                SharingModel.shareEntityCustom($scope.entity, shareTemp, "");

            }

            
            $modalInstance.close();
        }

        $scope.shareWithHandler = function () {
               $dialogs.shareWith($scope.allUsers, $scope.shareEntities);
        };
        

        
        $scope.blurInput = function() {
            
            $("#shareInput").val("");
        };
        
        $scope.activateDropdown = function(e) {
            console.log("Toggle");
            if(!$("#shareDropdown").hasClass("open")) {
                $("#dropDownToggle").dropdown('toggle');
                $("dropdown-toggle").dropdown('toggle');
            }
            e.stopPropagation();
        };
        
        $scope.addShareTag = function(tag) {
            tag.isSelected = true;
            $scope.shareEntities.push(tag);
            $scope.userFilter.label = "";
        };
        
        $scope.removeShareTag = function(tag) {
            tag.isSelected = false;
            removeFromArray($scope.shareEntities, tag);
        };
        
        $scope.entityUnselected = function(entity) {
            if(!entity.isSelected) {
                return true;
            } 
            else {
                return false;
            } 
        };

        var getUserUris = function(users) {

            var userUris = [];

            for(var i = 0; i < users.length; i++) {
                userUris.push(users[i].id);
            }

            return userUris;
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

sharingModule.controller("ShareWithController", ['$scope','$modalInstance', 'i18nService', 'allUsers', 'shareEntities',  function ($scope, $modalInstance, $i18nService, allUsers, shareEntities) {

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
                if(!arrayContains(shareEntities, sharedUsers[i])) {
                    shareEntities.push(sharedUsers[i]);
                }
            } 
            else {
                removeFromArray(shareEntities, sharedUsers[i]);
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