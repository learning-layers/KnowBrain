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
angular.module('module.sharing', ['module.i18n']);

/**
 * CONFIG
 */
angular.module('module.sharing').config(function ($stateProvider) {

    $stateProvider.state('sharing', {
        url: '/sharing',
        templateUrl: PATH_PREFIX + '/main.tpl.html',
        controller: 'SharingController'
    });

});

/**
 * CONTROLLER
 */
angular.module('module.sharing').controller("SharingController", [
    '$scope', '$modalInstance', 'i18nService', 'UserModel',  'ENTITY_TYPES', 'SHARING_OPTIONS', 'entry', function ($scope, $modalInstance, i18nService, UserModel, ENTITY_TYPES, SHARING_OPTIONS, entry) {

        $scope.entry = entry;
        $scope.entityTypes = ENTITY_TYPES;
        $scope.sharingOptions = SHARING_OPTIONS;
        $scope.shareWith = SHARING_OPTIONS.private;

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
            $modalInstance.close();
        };

        $scope.shareWithHandler = function (option) {
            switch(option) {
                case SHARING_OPTIONS.private: {
                    break;
                }
                case SHARING_OPTIONS.friends: {

                    break;
                }
                case SHARING_OPTIONS.global: {

                    break;
                }
                case SHARING_OPTIONS.custom: {
                    UserModel.getAllUsers();
                    break;
                }
            }
        };
        $scope.shareResource = function () {
            console.log("Method called: shareResource()");

        };

    }]);

