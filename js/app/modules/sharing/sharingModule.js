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
sharingModule.controller("SharingController", ['$scope','$modalInstance', '$dialogs', '$q', 'i18nService', 'UserService', 'UserModel', 'SharingModel', 'ENTITY_TYPES', 'SHARING_OPTIONS', 'entity', function ($scope, $modalInstance, $dialogs, $q, i18nService, UserService, UserModel, SharingModel, ENTITY_TYPES, SHARING_OPTIONS, entity) {
    
        $scope.entity = entity;
        $scope.entityTypes = ENTITY_TYPES;
        $scope.sharingOptions = SHARING_OPTIONS;

        $scope.shareWith = SHARING_OPTIONS.private;
        $scope.sharedUsers = [];
        
        $scope.allUsers = [];
        $scope.allCircles = [{label: "public"}, {label:"friends"}];
        
        $scope.shareInput;

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

            switch($scope.shareWith) {
                case SHARING_OPTIONS.public:
                    SharingModel.shareEntityPublic($scope.entity);
                    break;

                case SHARING_OPTIONS.custom:
                    SharingModel.shareEntityCustom($scope.entity, $scope.sharedUsers, "");
                    break;
            }
            $modalInstance.close();
        }

        $scope.shareWithHandler = function () {

            var self = $scope;

            if ($scope.shareWith == SHARING_OPTIONS.custom) {


                var promises = [];
                var allUsersPromise = UserModel.getAllUsers();
                promises.push(allUsersPromise);

                var entityUsersPromise = SharingModel.getEntityUsers($scope.entity);
                promises.push(entityUsersPromise);

                $q.all(promises).then(function (results) {

                    var allUsers = [];
                    var sharedUsers = [];

                    allUsers = results[0].users;
                    sharedUsers = results[1].users;

                    var shareWithDialog = $dialogs.shareWith(allUsers, sharedUsers);

                    shareWithDialog.result.then(function (sharedUsers) {
                        self.sharedUsers = getUserUris(sharedUsers);

                    }, function (error) {

                       //TODO: Reset sharedWith
                       self.shareWith = SHARING_OPTIONS.private;
                       console.log(error);
                    });
                });
            }
        };
        
        $scope.activateDropdown = function(e) {
            console.log("Toggle");
            if(!$("#shareDropdown").hasClass("open")) {
                $("#dropDownToggle").dropdown('toggle');
                $("dropdown-toggle").dropdown('toggle');
            }
            e.stopPropagation();
        };
        
        $scope.shareEntities = [];
        
        $scope.addShareTag = function(tag) {
            removeFromArray($scope.allUsers, tag);
            removeFromArray($scope.allCircles, tag);
            $scope.shareEntities.push(tag);
            $("#shareInput").val("");
        };
        
        $scope.removeShareTag = function(tag) {
            if(tag.label == "public" || tag.label == "friends") {
                $scope.allCircles.push(tag);
            }
            else {
                $scope.allUsers.push(tag);
            }
            
            removeFromArray($scope.shareEntities, tag);
        };

        var getUserUris = function(users) {

            var userUris = [];

            for(var i = 0; i < users.length; i++) {
                userUris.push(users[i].uri);
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

sharingModule.controller("ShareWithController", ['$modalInstance', 'i18nService', 'allUsers', 'sharedUsers', function ($modalInstance, $i18nService, allUsers, sharedUsersBefore) {

    var sharedUsers = [];

    $scope.allUsers = allUsers;

    $scope.isUserChecked = function (user) {
        if(findUserInArray(user, sharedUsersBefore) > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    $scope.checkboxChanged = function (user, $event) {

        if ($event.currentTarget.checked) {

            sharedUsers.push(user);
        }
        else {
            var i = findUserInArray(user, sharedUsers);
            if(i > 0) {
                sharedUsers.splice(i,1);
            }
        }
    };

    $scope.updateSharedUsers = function () {

        if(angular.equals(sharedUsers, sharedUsersBefore)) {
            $modalInstance.dismiss('No change');
        }
        else {
            $modalInstance.close(sharedUsers);
        }
    }

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };

    var findUserInArray = function(user, array) {

        for(var i = 0; i < array.length; i++) {
            if(array[i].label == user.label) {
                return i;
            }
        }

        return -1;
    }

}]);