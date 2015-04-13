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
angular.module('module.authorisation',['module.i18n', 'module.cookies']);

/**
* CONSTANTS
*/
angular.module('module.authorisation').constant('AUTH_CONSTANTS', {
  authCookieName: 'kbAuthData'
});

/**
* CONFIG
*/
angular.module('module.authorisation').config(function($stateProvider) {

  var login = {
    name : 'login',
    url: '/login',
    templateUrl: MODULES_PREFIX + '/authorisation/login.tpl.html',
    controller: 'AuthController',
    access:{
      isFree: true
    } 
  };

  $stateProvider.state(login);

});

/**
* CONTROLLER
*/
angular.module('module.authorisation').controller("AuthController", [
  '$scope', '$rootScope', '$state','$http', '$location', 'UserService', 'i18nService', 
  function($scope, $rootScope, $state, $http, $location, UserSrv, i18nService) {

  /**
  * TRANSLATION INJECTION
  */
  $scope.t = function(identifier){
    return i18nService.t(identifier);
  }

  /**
  * METHODS
  */
  $scope.login = function(auth){
    // login user
    if(angular.isString(auth.label) && angular.isString(auth.password))
    {
      $rootScope.activateLoadingIndicator();
      UserSrv.login(auth).then(
        function(){
          $state.transitionTo('app.collection.content', { coll: 'root'});
          $rootScope.deactivateLoadingIndicator();
        },
        function(){
          auth.$error.incorrect = true;
          $rootScope.deactivateLoadingIndicator();
        }
        );
    }
  }

  $scope.logout = function(){
    UserSrv.logout();
    //hacky but works
    document.location.reload();
  }

}]);

/**
* SERVICES
*/
angular.module('module.authorisation').service('UserService', ['$q', '$rootScope', 'cookiesSrv', 'AUTH_CONSTANTS', 'UriToolbox',
 function($q, $rootScope, cookiesSrv, AUTH_CONSTANTS, UriToolbox) {

  var self = this;

  this.getUserCookie = function(){
    return JSON.parse(cookiesSrv.getCookie(AUTH_CONSTANTS.authCookieName));
  };

//  this.getUser = function(){
//    return self.getUserCookie();
//  };

  this.getLabel = function(){
    return self.getUserCookie().label;
  };

  this.getUser = function(){
    return self.getUserCookie().user;  
  };

  this.getUserSpace = function(){
    return self.getUserCookie().space;
  }

  this.getKey = function(){
    return self.getUserCookie().key;  
  };

   this.login = function(auth){
     
     var defer = $q.defer();
     
     new SSAuthCheckCredPOST(
       
       function(result){
         var userKey = result.key;
         var user    = result.user;
       
         var authData = {
           label: auth.label,
           key: userKey,
           user: user,
           space: UriToolbox.extractUriHostPart(user)
         };

         if(auth.remember){
           cookiesSrv.setCookie(AUTH_CONSTANTS.authCookieName, JSON.stringify(authData));
         }else{ 
           cookiesSrv.setSessionCookie(AUTH_CONSTANTS.authCookieName, JSON.stringify(authData));
         }

         defer.resolve();
         $rootScope.$apply();
       },
       function(result){
         defer.reject();
         $rootScope.$apply();
       },
       auth.label,
       auth.password);
       
     return defer.promise;
   };

 this.logout = function(){
  cookiesSrv.eatCookie(AUTH_CONSTANTS.authCookieName);
};

this.isAuthenticated = function(){

  if(cookiesSrv.getCookie(AUTH_CONSTANTS.authCookieName) != null){
    return true;
  } else {
    return false;
  }
};
}]); 