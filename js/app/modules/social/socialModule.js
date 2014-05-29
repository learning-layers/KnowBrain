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
angular.module('module.social',[]);

/**
* CONFIG
*/
angular.module('module.social').config(function($stateProvider) {


    $stateProvider
        .state('app.social', {
             url:'/social',
            abstract:true,
            controller: 'SocialController',
            templateUrl: MODULES_PREFIX + '/social/social.tpl.html'
        });

    $stateProvider.state('app.social.groups', {
        url: '/groups',
        templateUrl: MODULES_PREFIX + '/social/groups.tpl.html',
        controller: "GroupsController as groupCtrl"
    });

    $stateProvider.state('app.social.friends', {
        url: '/friends',
        templateUrl: MODULES_PREFIX + '/social/friends.tpl.html',
        controller: "FriendsController"
    });
});

/**
* CONTROLLER
*/
angular.module('module.social').controller("SocialController", ['$scope', function($scope){

}]);

angular.module('module.social').controller("GroupsController", ['$scope', '$dialogs', 'GroupFetchService', function($scope, $dialogs, GroupFetchService){
    
    var promise = GroupFetchService.getUserGroups();
    
    promise.then(function(result){
        console.log(result);
    });

    this.createGroup = function() {
        var newGroupDialog = $dialogs.createNewGroup();
        
        newGroupDialog.result.then(function(result) {
            console.log(result);
        });

    };

}]);

angular.module('module.social').controller("FriendsController", ['$scope',function($scope){
    this.groups = "To be implemented";
}]);

angular.module('module.social').controller("newGroupController", ['$scope', '$dialogs', '$modalInstance', 'UserModel', 'GroupFetchService', function($scope, $dialogs, $modalInstance, UserModel, GroupFetchService){
	$scope.group = {name: ""};
	$scope.groupMembers = [];
	
	$scope.uploadPic = function() {
        console.log("TODO: Upload profile picture");
        console.log($scope.group);
    };

    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    };
    
    $scope.createGroup = function() {
    	console.log("Creating Group");
    	
    	var userUrls = [];
    	
    	for(var i=0; i < $scope.groupMembers.length; i++) {
    		userUrls.push($scope.groupMembers[i].uri);
    	}
    	console.log($scope.groupName);
    	
    	var promise = GroupFetchService.createGroup($scope.groupName, [], userUrls);
    	promise.then(function(result) {
    		console.log("Group created!");
    		console.log(result);
    	    $modalInstance.close(result.circleUri);
    	});
    };
    
    $scope.addMembers = function() {
    	var promise = UserModel.getAllUsers();
    	promise.then(function(result) {
        	var addMembersDialog = $dialogs.addMembers(result.users, $scope.groupMembers);
        	addMembersDialog.result.then(function() {
        		console.log($scope.groupMembers);
        	});
    	});
    }
}]);

angular.module('module.social').controller("addMembersController", ['$scope', '$modalInstance', 'members', 'allUsers', function($scope, $modalInstance, members, allUsers){
	
	$scope.allUsers = allUsers;

	$scope.close = function() {
		console.log("Cancel");
        $modalInstance.dismiss('cancel');
    };
    
    $scope.confirm = function() {

        $modalInstance.close();
    };
    
    $scope.isUserChecked = function (user) {
        if(findUserInArray(user, members) >= 0) {
            return true;
        }
        else {
            return false;
        }
    }
	
    $scope.checkboxChanged = function (user, $event) {

        if ($event.currentTarget.checked) {

        	console.log(user.label);
        	members.push(user);
        }
        else {
            var i = findUserInArray(user, members);
            if(i > 0) {
            	members.splice(i,1);
            }
        }
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

