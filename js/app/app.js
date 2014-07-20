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
/**
* KNOWBRAIN MODULE
*/

'use strict';

var PATH_PREFIX = "js/app";
var MODULES_PREFIX = "js/app/modules";

angular.module('knowbrain', [
  //angular modules
  'ui.router',
  'ui.bootstrap',
  //kb modules
  'module.authorisation',
  'module.collection',
  'module.i18n',
  'module.cookies',
  'module.search',
  'module.models',
  'module.utilities',
  'module.sharing',
  // dialog module
  'dialogs',
  'ngTagsInput',
  'module.social',
  'module.qa',
  'module.group',
  'module.entity',
  'module.activities'

  ]).config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$tooltipProvider',function ($stateProvider, $urlRouterProvider, $locationProvider, $tooltipProvider) {

    $stateProvider
        .state('app', {
            abstract:true,
            templateUrl: PATH_PREFIX + '/main.tpl.html',
            controller: 'MainController'
        });

    $urlRouterProvider.otherwise('/collection/root');

  }]).run(['$rootScope', '$location', 'UserService', function($rootScope, $location, UserSrv) {

    $rootScope.ajaxLoading = false;

    $rootScope.activateLoadingIndicator = function(){
      $rootScope.ajaxLoading = true;
    }

    $rootScope.deactivateLoadingIndicator = function(){
      $rootScope.ajaxLoading = false;
    }

    $rootScope.$on('$stateChangeStart', function (e, to, toParams, from, fromParams) {
      if(!to.isFree && !UserSrv.isAuthenticated()){
       $location.path('/login');
     }
   });

  }]);

/**
* CONSTANTS
*/
angular.module('knowbrain').constant('SERVER_ADDRESS', '127.0.0.1');

angular.module('knowbrain').controller('AppController', ['$scope', '$location', 'i18nService', function ($scope, $location, i18nService) {
  /**
  * TRANSLATION INJECTION
  */
  $scope.t = function(identifier){
    return i18nService.t(identifier);
  };

}]);

angular.module('knowbrain').controller('MainController', [function(){

}]);
