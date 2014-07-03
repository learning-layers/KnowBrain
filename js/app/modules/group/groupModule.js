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
angular.module('module.group',['module.entity', 'dialogs.services']);

/**
* CONFIG
*/
angular.module('module.group').config(function($stateProvider) {
    
    $stateProvider
    .state('app.social.groups.new', {
         url:'/new',
         onEnter: function($dialogs, $state) {
             var newGroupDialog = $dialogs.createNewGroup()
             newGroupDialog.result.then(function(result) {
                 if (result) {
                     console.log("Success");
                     return $state.transitionTo("app.social.groups");
                 }
             },function(error) {
                     console.log("Error");
                     return $state.transitionTo("app.social.groups");
             });
         }
    });
    
    $stateProvider
    .state('app.social.groups.new.members', {
         url:'/members',
         onEnter: function($dialogs, $state) {
             var addMembersDialog = $dialogs.addMembers();
             addMembersDialog.result.then(function(result) {
                 if (result) {
                     console.log("Success");
                     return $state.transitionTo("app.social.groups.new");
                 }
             },function(error) {
                     console.log("Error");
                     console.log("Transition to app.social.groups.new");
                     $state.transitionTo("app.social.groups.new");
                     return; 
             });
         }
    });
    
    $stateProvider
        .state('app.groupProfile', {
             url:'/group',
            abstract:true,
            controller: 'GroupController',
            templateUrl: MODULES_PREFIX + '/group/groupProfile.tpl.html'
        });

    $stateProvider.state('app.groupProfile.members', {
        url: '/members',
        templateUrl: MODULES_PREFIX + '/group/members.tpl.html',
        controller: "MembersController"
    });

    $stateProvider.state('app.groupProfile.entities', {
        url: '/entities',
        templateUrl: MODULES_PREFIX + '/group/entities.tpl.html',
        controller: "EntitiesController"
    });
    
    $stateProvider.state('app.groupProfile.activities', {
        url: '/activities',
        templateUrl: MODULES_PREFIX + '/group/activities.tpl.html',
        controller: "ActivitiesController"
    });
});

/**
* CONTROLLER
*/
angular.module('module.group').controller("newGroupController", ['$scope', '$dialogs', '$state', '$modalInstance', 'UserModel', 'GroupFetchService', function($scope, $dialogs, $state, $modalInstance, UserModel, GroupFetchService){
    $scope.group = {name: ""};
    $scope.groupMembers = [];
    $scope.showDialog = true;
    $scope.show = true;
    
    var promise = UserModel.getAllUsers();
    promise.then(function(result) {
        $scope.groupMembers = result.users;
    });
    
    
    $scope.uploadPic = function() {
        console.log("TODO: Upload profile picture");
        $scope.show = false;

    };
    
    $scope.addMembers = function() {
        $state.transitionTo("app.social.groups.new.members");
        $modalInstance.close();
//        if($scope.groupMembers.length > 0) {
//            $dialogs.addMembers($scope.groupMembers);
//        }
    };
    
    $scope.selectResource = function(user, $event) {
        if(user.isSelected){
            user.isSelected = false;
          } else {
            user.isSelected = true;
          }
    };
    
    $scope.handleEntryClick = function(entry) {
        console.log("TODO: Go to user's profile");
    };
    
    $scope.createGroup = function() {
        
        $state.transitionTo("app.group.new");
       /* var userUrls = [];
        
        for(var i=0; i < $scope.groupMembers.length; i++) {
            
            if($scope.groupMembers[i].isSelected) {
                userUrls.push($scope.groupMembers[i].id);
            }
            
        }
        
        var promise = GroupFetchService.createGroup($scope.group.name, [], userUrls);
        promise.then(function(result) {
            $modalInstance.close(result.circleUri);
        });*/
    };
    

    
    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    };
}]);

angular.module('module.group').controller("addMembersController", ['$scope', '$rootScope', '$modalInstance', 'users', function($scope, $rootScope, $modalInstance, users){
    
    $scope.allUsers = users;
    
    $scope.handleEntryClick = function(entry) {
        console.log("TODO: Go to user's profile");
    };
    
    $scope.selectResource = function(user, $event) {
        if(user.isSelected){
            user.isSelected = false;
          } else {
            user.isSelected = true;
          }
    };
    
    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    };
    
    $scope.confirm = function() {
        $modalInstance.close();
    };
    
    var findUserInArray = function(user, array) {

        for(var i = 0; i < array.length; i++) {
            if(array[i].label == user.label) {
                return i;
            }
        }

        return -1;
    };

}]);

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
