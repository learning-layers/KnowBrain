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
        url: '/:id',
        controller: 'CircleController',
        templateUrl: MODULES_PREFIX + '/circles/circle.tpl.html'
    });
    $stateProvider.state('app.circles.circle.resources', {
        url: '/resources',
        controller: 'CircleResourcesController',
        templateUrl: MODULES_PREFIX + '/circles/resources.tpl.html'
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
            var promise = GroupFetchService.getGroup(result);
            promise.then(function(result) {
                $scope.circles.push(result.circle);
            });
        });
    };

});

angular.module('module.circles').controller("CircleController", function($compile, $scope, $state, $modal, $controller, $dialogs, GroupFetchService, UserService, UserFetchService, UserModel, UriToolbox) {
    $scope.circleId = $state.params.id;
    $scope.circle = null;
    $scope.groupMembers = [];
    $scope.circles = [];
    $scope.tab = 0;

    var circlesPromise = GroupFetchService.getUserGroups($scope.profileId);
    circlesPromise.then(function(result) {
        $scope.circles = result.circles;
    });

    $scope.groupMembers = [];
        var promise = GroupFetchService.getGroup("http://sss.eu/" + $scope.circleId);
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

    $scope.setTab = function(index) {
        $scope.tab = index;
        if (index == 1) {
            $state.go("app.circles.circle.resources");
        };
    }


    $scope.showCircle = function(circleId) {
            $state.go('app.circles.circle', {
                id: UriToolbox.extractUriPathnameHash(circleId)
            });
    };

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
            var promise = GroupFetchService.addMembersToGroup(userUrls, $scope.circle.id);
            promise.then(function(result) {
                //$rootScope.$apply();
            });
        });
    }

    $scope.friend = function(user) {
        UserService.addFriend(user.id);
    }

    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        $(function () {
            $('[data-toggle="popover"]').popover({ html : true })
    .click(function(ev) {
     //this is workaround needed in order to make ng-click work inside of popover
     $compile($('.popover.in').contents())($scope);
});
        })
    });
});

angular.module('module.circles').controller("CircleResourcesController", function($scope, $state, $q, $dialogs, GroupFetchService, UserFetchService, EntityFetchService, CollectionFetchService, UriToolbox, ENTITY_TYPES){
    
    $scope.entities = [];
    $scope.isGridViewMode = true;
    $scope.isListViewMode = false;
    $scope.predicate = 'creationTime';
    $scope.reverse = false;
    $scope.selectedTags = [];
    
    var promise = GroupFetchService.getGroup("http://sss.eu/" + $scope.circleId);
        
    promise.then(function(result) {
        
        var circle = result.circle;
        var entityIds = circle.entities;
        for(var i=0; i < entityIds.length; i++) {
            var promise = EntityFetchService.getEntityByUri(entityIds[i], true, false, false);
            promise.then(function(entityResult){
                var promise = UserFetchService.getUser(entityResult.author);
                promise.then(function(userResult) {
                    entityResult.author = userResult.desc;
                    $scope.entities.push(entityResult);
                });
            });
        }
    });

    $scope.selectTag = function(tag) {
        $scope.selectedTags.push(tag);
    }
    
    
    
    $scope.addEntity = function() {

        var states = {
                "choose": MODULES_PREFIX+"/group/addEntities.tpl.html",
                "upload": MODULES_PREFIX+"/group/addEntitiesUpload.tpl.html",
                "link": MODULES_PREFIX+"/group/addEntitiesLink.tpl.html"
                //TODO: Add entities from collection
                
        };
        
        var ctrlFunction = function($scope) {
            $scope.entities = [];
        };
        
        $dialogs.newModal(states, ctrlFunction, "modal-huge").result.then(function (result) {
            
            var entityUrls = [];
            
            var promises = [];
            
            for(var i=0; i < result.length; i++) {
                
                if(result[i].type == ENTITY_TYPES.file) {
                    var file = result[i];
                    promises.push(file.uploadFile());
                } 
                else if(result[i].type == ENTITY_TYPES.link) {
                    entityUrls.push(result[i].id);
                }
            }
            
            $q.all(promises).then(function(results) {
                
                for(var i=0; i < results.length; i++) {
                    entityUrls.push(results[i].id);
                }
                
                var promise = GroupFetchService.addEntitiesToGroup(entityUrls, $scope.groupId);
                
                promise.then(function(result) {
                   // $scope.$apply();
                });
            });
        });
    }


    $scope.loadCollectionByUri = function (coll, defer) {
        var promise = CollectionFetchService.getCollectionByUri(coll);

        promise.then(function (model) {
            $scope.currentCollection = model;
            $scope.entities = model.entries;
        }, function (error) {
            console.log(error);
        });

    };

    $scope.handleEntryClick = function (entry) {
        if (entry.isCollection()) {
                $scope.loadCollectionByUri(UriToolbox.extractUriPathnameHash(entry.id));
        } else {
            if (entry.type == "qa") {
                $state.transitionTo('app.qa.qa', {
                    id: UriToolbox.extractUriPathnameHash(entry.id)
                });
            } else {
                var dialog = $dialogs.entryDetail(entry);
            }
            
        }

    };
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

    $scope.close = function() {
        $modalInstance.close();
    }
});

angular.module('module.circles').controller("createCircleController", function($q, $scope, $modal, $rootScope, $modalInstance, UserFetchService, GroupFetchService, UserService, ENTITY_TYPES) {
    $scope.circle = {name: "", desc: ""};
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
        for(var i=0; i < $scope.selectedUsers.length; i++) {
            userUrls.push($scope.selectedUsers[i].id);
        }
        var promise = GroupFetchService.createGroup($scope.circle.name, null, userUrls, $scope.circle.desc);
        promise.then(function(result) {
            $modalInstance.close(result.circle);
        });
    };

    $scope.openAddResources = function() {
        var modalInstance = $modal.open({
            templateUrl: MODULES_PREFIX + '/qa/modalAddAttachments.tpl.html',
            controller: 'ModalAddAttachmentsController',
            size: 'lg',
            resolve: {}
        });
        modalInstance.result.then(function(fileList) {
            fileList.forEach(function(entry) {
                if (entry.id !== null && entry.id !== undefined) {
                    $scope.selectedResources.push(entry);
                } else {
                    // TODO: upload files
                }
            });
        }, function() {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.close = function() {
        $modalInstance.close();
    }
});