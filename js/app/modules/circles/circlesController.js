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
angular.module('module.circles', []);
/**
 * CONFIG
 */
angular.module('module.circles').config(function($stateProvider) {
    $stateProvider.state('app.circles', {
        url: '/circles',
        controller: 'CirclesController',
        templateUrl: MODULES_PREFIX + '/circles/circles.tpl.html'
    });
    $stateProvider.state('app.circles.circle', {
        url: '/circles/:id',
        controller: 'CircleController',
        templateUrl: MODULES_PREFIX + '/circles/circle.tpl.html'
    });
});
/**
 * CONTROLLER
 */
angular.module('module.circles').controller("CirclesController", function($scope, $state, $modal, $controller, $dialogs, GroupFetchService, UriToolbox) {
    $scope.circles = [];
    var promise = GroupFetchService.getUserGroups($scope.profileId);
    promise.then(function(result) {
        $scope.circles = result.circles;
    });
    $scope.handleEntryClick = function(entry) {
        if (entry.type == "circle") {
            $state.go('app.circles.circle', {
                id: UriToolbox.extractUriPathnameHash(entry.id)
            });
        }
    };
    $scope.addCircle = function() {
        $modal.open({
            templateUrl: MODULES_PREFIX + '/circles/createCircle.tpl.html',
            controller: 'createCircleController',
            backdrop: true,
            windowClass: "modal-huge",
            resolve: {
                excludeUsers: function () {
                    return $scope.groupMembers;
                }
            }
        }).result.then(function(result) {
           
        });
    };

});

angular.module('module.circles').controller("CircleController", function($scope, $state, $modal, $controller, $dialogs, GroupFetchService, UserService, UserFetchService, UserModel) {
    $scope.circleId = $state.params.id;
    $scope.circle = null;
    $scope.groupMembers = [];

    var promise = GroupFetchService.getGroup(UserService.getUserSpace() + "entities/entities/" + $scope.circleId);
    promise.then(function(result) {
        $scope.circle = result.circle;
        var memberIds = $scope.circle.users;
        for (var i = 0; i < memberIds.length; i++) {
            var promise = UserFetchService.getUser(memberIds[i]);
            promise.then(function(result) {
                var user = new UserModel();
                user.id = result.desc.entity;
                user.label = result.desc.label;
                $scope.groupMembers.push(user);
            });
        }
    });
    $scope.addMember = function() {
        $modal.open({
            templateUrl: MODULES_PREFIX + '/circles/addMembers.tpl.html',
            controller: 'addMembersController',
            backdrop: true,
            windowClass: "modal-huge",
            resolve: {
                excludeUsers: function () {
                    return $scope.groupMembers;
                }
            }
        }).result.then(function(result) {
            var userUrls = [];
            for (var i = 0; i < result.length; i++) {
                $scope.groupMembers.push(result[i]);
                userUrls.push(result[i].id);
            }
            var promise = GroupFetchService.addMembersToGroup(userUrls, $scope.groupId);
            promise.then(function(result) {
                //$rootScope.$apply();
            });
        });
    }
});

angular.module('module.circles').controller("addMembersController", function($q, $scope, $rootScope, $modalInstance, UserFetchService, UserService, excludeUsers) {
    $scope.allUsers = [];
    $scope.friends = [];
    $scope.selectedUsers = [];
    var friendsPromise = UserFetchService.getFriends();
    friendsPromise.then(function(result) {
        for (var i = 0; i < result.friends.length; i++) {
            result.friends[i].isFriend = true;
            $scope.friends.push(result.friends[i]);
        }
        var allUsersPromise = UserFetchService.getAllUsers();
        allUsersPromise.then(function(result) {
            $scope.allUsers = result.users;
            $scope.allUsers = $scope.allUsers.filter(function(item) {
                return !excludeUsers.some(function(test){
                    return test.label === item.label; // TODO:use id
                });
            });
        });
    });
    $scope.selectUser = function(user) {
        user.isSelected = !user.isSelected;
        if (user.isSelected) {
            $scope.selectedUsers.push(user);
        } else {
            $scope.selectedUsers = $.grep($scope.selectedUsers, function(o, i) {
                return o.id === user.id;
            }, true);
        }
    };
    $scope.addUsers = function(users) {
        $modalInstance.close(users);
    }
});

angular.module('module.circles').controller("createCircleController", function($q, $scope, $rootScope, $modalInstance, UserFetchService, GroupFetchService, UserService, excludeUsers) {
    $scope.circle = {name: "", desc: ""};
    $scope.allUsers = [];
    $scope.friends = [];
    $scope.selectedUsers = [];
    $scope.selectedResources = [];

    var friendsPromise = UserFetchService.getFriends();
    friendsPromise.then(function(result) {
        for (var i = 0; i < result.friends.length; i++) {
            result.friends[i].isFriend = true;
            $scope.friends.push(result.friends[i]);
        }
        var allUsersPromise = UserFetchService.getAllUsers();
        allUsersPromise.then(function(result) {
            $scope.allUsers = result.users;
        });
    });

    $scope.selectUser = function(user) {
        user.isSelected = !user.isSelected;
        if (user.isSelected) {
            $scope.selectedUsers.push(user);
        } else {
            $scope.selectedUsers = $.grep($scope.selectedUsers, function(o, i) {
                return o.id === user.id;
            }, true);
        }
    };

    $scope.createCircle = function() {
        var userUrls = []; 
        var entityUrls = [];
        
        var promises = [];
        
        for(var i=0; i < $scope.selectedResources.length; i++) {
            
            if($scope.selectedResources[i].uploaded == false && $scope.selectedResources[i].type == ENTITY_TYPES.file) {
                var file = $scope.selectedResources[i];
                promises.push(file.uploadFile());
            } 
            else if($scope.selectedResources[i].type == ENTITY_TYPES.link) {
                entityUrls.push($scope.selectedResources[i].id);
            }
        }
        
        $q.all(promises).then(function(results) {
            
            for(var i=0; i < results.length; i++) {
                entityUrls.push(results[i].id);
            }
            
            for(var i=0; i < $scope.selectedUsers.length; i++) {
                    userUrls.push($scope.selectedUsers[i].id);
            }
            
            var promise = GroupFetchService.createGroup($scope.circle.name, entityUrls, userUrls, $scope.circle.desc);
            promise.then(function(result) {
                $modalInstance.close();
            });
        });
    };
});