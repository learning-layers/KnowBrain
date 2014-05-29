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
angular.module('module.group',[]);

/**
* CONFIG
*/
angular.module('module.group').config(function($stateProvider) {


    $stateProvider
        .state('app.group', {
             url:'/group',
            abstract:true,
            controller: 'GroupController',
            templateUrl: MODULES_PREFIX + '/group/groupProfile.tpl.html'
        });

    $stateProvider.state('app.group.members', {
        url: '/members',
        templateUrl: MODULES_PREFIX + '/group/members.tpl.html',
        controller: "MembersController"
    });

    $stateProvider.state('app.group.entities', {
        url: '/entities',
        templateUrl: MODULES_PREFIX + '/group/entities.tpl.html',
        controller: "EntitiesController"
    });
    
    $stateProvider.state('app.group.activities', {
        url: '/activities',
        templateUrl: MODULES_PREFIX + '/group/activities.tpl.html',
        controller: "ActivitiesController"
    });
});

/**
* CONTROLLER
*/
angular.module('module.group').controller("GroupController", ['$scope', function($scope){

}]);

angular.module('module.group').controller("MembersController", ['$scope',function($scope){
    this.groups = "To be implemented";
}]);

angular.module('module.group').controller("EntitiesController", ['$scope',function($scope){
    this.groups = "To be implemented";
}]);

angular.module('module.group').controller("ActivitiesController", ['$scope',function($scope){
    this.groups = "To be implemented";
}]);
