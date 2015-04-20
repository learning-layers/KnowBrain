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
    $stateProvider.state('app.circles.circle.activities', {
        url: '/activities',
        controller: 'CircleActivitiesController',
        templateUrl: MODULES_PREFIX + '/circles/activities.tpl.html'
    });
});
/**
 * CONTROLLER
 */
angular.module('module.circles').controller("CirclesController", function($scope, $state, $modal, $controller, $dialogs, UserService, GroupFetchService, UriToolbox) {
    $scope.circles = [];
    var promise = GroupFetchService.getUserGroups(null);
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
                excludeUsers: function() {
                    return $scope.groupMembers;
                },
                circle: function() {
                    return null;
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
    $scope.circles = [];
    $scope.tab = 0;

    var circlesPromise = GroupFetchService.getUserGroups($scope.profileId);
    circlesPromise.then(function(result) {
        $scope.circles = result.circles;
    });

    var promise = GroupFetchService.getGroup("http://sss.eu/" + $scope.circleId);
    promise.then(function(result) {
        $scope.circle = result.circle;
    });

    $scope.setTab = function(index) {
        $scope.tab = index;
        if (index == 0) {
            $state.go("app.circles.circle.activities");
        } else if (index == 1) {
            $state.go("app.circles.circle.resources");
        };
    }
    $scope.setTab(0);

    $scope.showCircle = function(circleId) {
        $state.go('app.circles.circle', {
            id: UriToolbox.extractUriPathnameHash(circleId)
        });
    };


    $scope.editCircle = function() {
        $modal.open({
            templateUrl: MODULES_PREFIX + '/circles/createCircle.tpl.html',
            controller: 'createCircleController',
            backdrop: true,
            windowClass: "modal-huge",
            resolve: {
                circle: function() {
                    return $scope.circle;
                }
            }
        }).result.then(function(result) {
        });
    };

    $scope.addMember = function() {
        $modal.open({
            templateUrl: MODULES_PREFIX + '/circles/addMembers.tpl.html',
            controller: 'addMembersController',
            backdrop: true,
            windowClass: "modal-huge",
            resolve: {
                excludeUsers: function() {
                    return $scope.circle.users;
                }
            }
        }).result.then(function(result) {
            var userUrls = [];
            for (var i = 0; i < result.length; i++) {
                $scope.circle.users.push(result[i]);
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
        $(function() {
            $('[data-toggle="popover"]').popover({
                    html: true
                })
                .click(function(ev) {
                    //this is workaround needed in order to make ng-click work inside of popover
                    $compile($('.popover.in').contents())($scope);
                });
        })
    });
});

angular.module('module.circles').controller("CircleActivitiesController", function($scope, $state, $q, $dialogs, GroupFetchService, UserFetchService, EntityFetchService, CollectionFetchService, UriToolbox, ENTITY_TYPES, Activity) {

    $scope.leftActivities = [];
    $scope.rightActivities = [];

    var promise = GroupFetchService.getActivities("http://sss.eu/" + $scope.circleId);


    promise.then(function(result) {
        for (var i = 0; i < result.length; i++) {
            if (i % 2 == 0)
                $scope.leftActivities.push(result[i]);
            else
                $scope.rightActivities.push(result[i]);
        }
    });
    
    $scope.handleEntryClick = function(entry) {
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

angular.module('module.circles').controller("CircleResourcesController", function($scope, $state, $q, $dialogs, GroupFetchService, UserFetchService, EntityFetchService, CollectionFetchService, UriToolbox, ENTITY_TYPES) {

    $scope.entities = [];
    $scope.isGridViewMode = true;
    $scope.isListViewMode = false;
    $scope.predicate = 'creationTime';
    $scope.reverse = false;
    $scope.selectedTag = null;
    $scope.availableTags = [];
    $scope.searchResourcesString = null;
    $scope.selectedEntities = [];
    $scope.actions = [{
        title: 'Download',
        cssClass: 'glyphicon glyphicon-download-alt'
    }, {
        title: 'Add to Dropbox',
        cssClass: 'glyphicon glyphicon-floppy-open'
    }, {
        title: 'Delete',
        cssClass: 'glyphicon glyphicon-trash'
    }];

    var promise = GroupFetchService.getGroup("http://sss.eu/" + $scope.circleId);

    promise.then(function(result) {

        var circle = result.circle;
        addEntitiesToCircle(circle.entities);
    });

    var addEntitiesToCircle = function(entities) {
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            entity.isSelected = false;
            $scope.entities.push(entity);

            if (entity.tags != null) {
                for (var j = 0; j < entity.tags.length; j++) {
                    if ($.inArray(entity.tags[j], $scope.availableTags) == -1) {
                        $scope.availableTags.push(entity.tags[j]);
                    }
                }
            }
        }
    };

    $scope.downloadEntity = function(entity) {
        //$scope.entry.downloading = true;

        var promise = entity.downloadFile();
        promise.finally(function() {
            //$scope.entry.downloading = false;
        });
    };

    $scope.selectResource = function(entity) {
        if (entity.isSelected) {
            entity.isSelected = false;
            $scope.selectedEntities.splice($scope.selectedEntities.indexOf(entity), 1);
        } else {
            entity.isSelected = true;
            $scope.selectedEntities.push(entity);
        }
    };

    $scope.deselectAllEntities = function() {
        for (var i = 0; i < $scope.selectedEntities.length; i++) {
            $scope.selectedEntities[i].isSelected = false;
        }
        $scope.selectedEntities = [];
    };

    $scope.selectTag = function(tag) {
        $scope.selectedTag = tag;
    };


    $scope.filterFunction = function(element) {
        var matchesSearch = true;
        if ($scope.searchResourcesString != null && element.label.toLowerCase().indexOf($scope.searchResourcesString.toLowerCase()) == -1) {
            matchesSearch = false;
        }

        var matchesTag = false
        if ($scope.selectedTag != null) {
            for (var i = 0; i < element.tags.length; i++) {
                if ($.inArray($scope.selectedTag, element.tags) != -1) {
                    matchesTag = true;
                    break;
                }
            }
        } else {
            matchesTag = true;
        }
        return matchesSearch && matchesTag;
    };

    $scope.addEntity = function() {
        $dialogs.uploadResources(false).result.then(function(uploadedEntities) {
            var entityIds = [];
            for (var i = uploadedEntities.length - 1; i >= 0; i--) {
                entityIds.push(uploadedEntities[i].id);
            }
            var promise = GroupFetchService.addEntitiesToGroup(entityIds, $scope.circle.id);
            promise.then(function(result) {
                addEntitiesToCircle(uploadedEntities);
            });
        }, function() {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.chooseEntity = function() {
        $dialogs.chooseFromDropbox().result.then(function(chosenEntities) {
            if (chosenEntities != undefined) {
                var entityIds = [];
                for (var i = 0; i < chosenEntities.length; i++) {
                    entityIds.push(chosenEntities[i].id);
                }

                var promise = GroupFetchService.addEntitiesToGroup(entityIds, $scope.circle.id);
                promise.then(function(result) {
                    addEntitiesToCircle(chosenEntities);
                });
            }
            
        }, function() {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.addLink = function() {
        $dialogs.createLink($scope.circle).result.then(function(link) {
            addEntitiesToCircle([link]);
        }, function() {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.loadCollectionByUri = function(coll, defer) {
        var promise = CollectionFetchService.getCollectionByUri(coll);

        promise.then(function(model) {
            $scope.currentCollection = model;
            $scope.entities = model.entries;
        }, function(error) {
            console.log(error);
        });

    };

    $scope.handleEntryClick = function(entry) {
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

    $scope.clickedAction = function(index) {
        if (index == 1) {
            $scope.addEntitiesToHomeCollection();
        } else if (index == 2) {
            $scope.removeEntities($scope.selectedEntities);
        }
    };

    $scope.removeEntities = function(entities) {
        var entityIds = [];
        for (var i = 0; i < entities.length; i++) {
            entityIds.push(entities[i].id);
        }
        var promise = GroupFetchService.removeEntitiesFromGroup(entityIds, $scope.circle.id);
        promise.then(function(result) {
            for (var i = 0; i < entities.length; i++) {
                $.each($scope.entities, function(j) {
                    if ($scope.entities[j].id === entities[i].id) {
                        $scope.entities.splice(j, 1);
                        return false;
                    }
                });
            }
            $scope.deselectAllEntities();
        });
    };

    $scope.addEntityToHomeCollection = function(entity) {
        var promise = CollectionFetchService.getRootCollection();

        promise.then(function(model) {
            model.addEntries([entity.id], [entity.label]);
        }, function(error) {
            console.log(error);
        });
    };

    $scope.addEntitiesToHomeCollection = function() {
        var selectedEntitiesIDs = [];
        var selectedLabels = [];
        for (var i = 0; i < $scope.selectedEntities.length; i++) {
            selectedEntitiesIDs.push($scope.selectedEntities[i].id);
            selectedLabels.push($scope.selectedEntities[i].label);
        }
        var promise = CollectionFetchService.getRootCollection();

        promise.then(function(model) {
            model.addEntries(selectedEntitiesIDs, selectedLabels);
            $scope.deselectAllEntities();
        }, function(error) {
            console.log(error);
        });
    };

    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        $(function() {
            $('[data-toggle="tooltip"]').tooltip();
        })
    });
});

angular.module('module.circles').controller("addMembersController", function($q, $scope, $rootScope, $modalInstance, UserFetchService, UserService, excludeUsers) {
    $scope.allUsers = [];
    $scope.selectedUsers = [];
    var allUsersPromise = UserFetchService.getAllUsers();
    allUsersPromise.then(function(result) {
        $scope.allUsers = result.users;
        $scope.allUsers = $scope.allUsers.filter(function(item) {
            return !excludeUsers.some(function(test) {
                return test.label === item.label; // TODO:use id
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

angular.module('module.circles').controller("createCircleController", function($q, $scope, $modal, $rootScope, $modalInstance, UserFetchService, GroupFetchService, UserService, ENTITY_TYPES, circle) {
    $scope.editingCircle = circle != null;
    if (circle != null) {
        $scope.circle = circle;
    } else {
        $scope.circle = {
            label: "",
            description: ""
        };
    }
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

    $scope.save = function() {
        if ($scope.editingCircle) {
            var promise = GroupFetchService.editCircle($scope.circle.label, $scope.circle.description, $scope.circle);
            promise.then(function(result) {
                $modalInstance.close(result);
            }); 
        } else {
            var userUrls = [];
            for (var i = 0; i < $scope.selectedUsers.length; i++) {
                userUrls.push($scope.selectedUsers[i].id);
            }
            var promise = GroupFetchService.createGroup($scope.circle.label, null, userUrls, $scope.circle.description);
            promise.then(function(result) {
                $modalInstance.close(result.circle);
            }); 
        }
        
    };



    $scope.close = function() {
        $modalInstance.close();
    }
});