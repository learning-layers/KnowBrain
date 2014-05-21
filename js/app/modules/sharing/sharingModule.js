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

        this.entity = entity;
        this.entityTypes = ENTITY_TYPES;
        this.sharingOptions = SHARING_OPTIONS;

        this.shareWith = SHARING_OPTIONS.private;
        this.sharedUsers = [];

        /**
         * TRANSLATION INJECTION
         */
        this.t = function (identifier) {
            return i18nService.t(identifier);
        };

        /**
         * METHODS
         */

        this.close = function () {


            $modalInstance.dismiss('Cancel');
        };

        this.share = function () {

            switch(this.shareWith) {
                case SHARING_OPTIONS.public:
                    SharingModel.shareEntityPublic(this.entity);
                    break;

                case SHARING_OPTIONS.custom:
                    SharingModel.shareEntityCustom(this.entity, this.sharedUsers, "");
                    break;
            }
            $modalInstance.close();
        }

        this.shareWithHandler = function () {

            var self = this;

            if (this.shareWith == SHARING_OPTIONS.custom) {


                var promises = [];
                var allUsersPromise = UserModel.getAllUsers();
                promises.push(allUsersPromise);

                var entityUsersPromise = SharingModel.getEntityUsers(this.entity);
                promises.push(entityUsersPromise);

                $q.all(promises).then(function (results) {

                    var allUsers = [];
                    var sharedUsers = [];

                    allUsers = results[0].users;
                    sharedUsers = results[1].users;

                    var shareWithDialog = $dialogs.shareWith(allUsers, sharedUsers, space);

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

        var getUserUris = function(users) {

            var userUris = [];

            for(var i = 0; i < users.length; i++) {
                userUris.push(users[i].uri);
            }

            return userUris;
        }

    }]);

sharingModule.controller("ShareWithController", ['$modalInstance', 'i18nService', 'allUsers', 'sharedUsers', function ($modalInstance, $i18nService, allUsers, sharedUsersBefore) {

    var sharedUsers = [];

    this.allUsers = allUsers;

    this.isUserChecked = function (user) {
        if(findUserInArray(user, sharedUsersBefore) > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    this.checkboxChanged = function (user, $event) {

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

    this.updateSharedUsers = function () {

        if(angular.equals(sharedUsers, sharedUsersBefore)) {
            $modalInstance.dismiss('No change');
        }
        else {
            $modalInstance.close(sharedUsers);
        }
    }

    this.close = function () {
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