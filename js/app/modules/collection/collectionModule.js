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
 * COLLECTION MODULE
 */
angular.module('module.collection', ['module.i18n', 'module.cookies', 'module.models', 'ui.bootstrap', 'module.utilities', 'ui.bootstrap.rating', 'dialogs', 'module.entity']);
/**
 * CONFIG
 */
angular.module('module.collection').config(function($stateProvider) {
    $stateProvider.state('app.collection', {
        controller: 'CollectionController',
        templateUrl: MODULES_PREFIX + '/collection/knowbox.tpl.html'
    });
    $stateProvider.state('app.collection.content', {
        url: '/collection/:coll',
        views: {
            "context": {
                templateUrl: MODULES_PREFIX + '/collection/context.tpl.html',
                controller: function($stateParams, $scope, CurrentCollectionService, $state) {
                    var coll = null;
                    if ($stateParams.coll == "") {
                        coll = "root";
                    } else {
                        coll = $stateParams.coll;
                    }
                    $scope.loadCurrentCollection(coll);
                }
            },
            "context-info": {
                templateUrl: MODULES_PREFIX + '/collection/context-info.tpl.html'
            },
            "breadcrumbs": {
                templateUrl: MODULES_PREFIX + '/collection/breadcrumbs.tpl.html'
            },
            "resources-sort-bar": {
                templateUrl: MODULES_PREFIX + '/collection/resources-sort-bar.tpl.html'
            }
        }
    }).state('app.collection.entry', {
        url: '/collection/:coll/entry/:entry',
        views: {
            "context": {
                templateUrl: MODULES_PREFIX + '/collection/context.tpl.html',
                controller: function($stateParams, $scope, $q, CurrentCollectionService) {
                    //TODO check rights for the collection
                    //TODO refactor!
                    // this won't work if you share a url with other users (only if currentCollection is public)
                    var promise;
                    if (CurrentCollectionService.getCurrentCollection() === null || CurrentCollectionService.getCurrentCollection().uriPathnameHash != $stateParams.coll) {
                        promise = $scope.loadCurrentCollection($stateParams.coll);
                    } else {
                        var defer = $q.defer();
                        promise = defer.promise;
                        defer.resolve();
                    }
                    $scope.loadCurrentEntity(promise, $stateParams.entry, $stateParams.coll);
                }
            },
            "context-info": {
                templateUrl: MODULES_PREFIX + '/collection/context-info.tpl.html'
            },
            "breadcrumbs": {
                templateUrl: MODULES_PREFIX + '/collection/breadcrumbs.tpl.html'
            }
        }
    });
});
/**
 * SERVICES
 */
angular.module('module.collection').service('CurrentCollectionService', [function() {
    var self = this;
    var currentCollection = null;
    this.setCurrentCollection = function(collection) {
        currentCollection = collection;
    };
    this.getCurrentCollection = function() {
        return currentCollection;
    };
}]);
/**
 * CONTROLLER
 */
angular.module('module.collection').controller("CollectionController", function($scope, $q, $location, $rootScope, $state, i18nService, cookiesSrv, CollectionFetchService, UriToolbox, CurrentCollectionService, EntityFetchService, $modal, EntityModel, ENTITY_TYPES, SETTINGS_CONSTANTS, SPACE_ENUM, RATING_MAX, $dialogs, FileUploader) {
    var self = this;
    var collectionViewMode = cookiesSrv.getCookie(SETTINGS_CONSTANTS.collectionViewModeCookieName);
    $scope.collectionViewMode = collectionViewMode != undefined ? collectionViewMode : 'grid';
    $scope.setCollectionViewMode = function(mode) {
        cookiesSrv.setCookie(SETTINGS_CONSTANTS.collectionViewModeCookieName, mode);
        $scope.collectionViewMode = mode;
    };
    $scope.uploader = new FileUploader();
    $scope.uploader.onAfterAddingAll = function(item) {
        $scope.uploader.uploadAll();
    };
    $scope.uploader.uploadAll = function() {
        var entries = [];
        var labels = [];
        var uploadCounter = 0;
        var fileCount = $scope.uploader.queue.length;
        var newEntrieObjects = [];
        var defer = $q.defer();
        angular.forEach($scope.uploader.queue, function(file, key) {
            file.uploading = true;
            var currColl = CurrentCollectionService.getCurrentCollection();
            currColl.uploadFile(file._file).then(function(entry) {
                file.uploading = false;
                file.uploaded = true;
                file.uriPathnameHash = UriToolbox.extractUriPathnameHash(entry.id);
                entries.push(entry.id);
                labels.push(entry.label);
                uploadCounter++;
                newEntrieObjects.push(entry);
                if (uploadCounter == fileCount) {
                    defer.resolve();
                }
            }, function(error) {
                console.log(error);
            });
        });
        defer.promise.then(function() {
            $scope.uploader.clearQueue();
            var currColl = CurrentCollectionService.getCurrentCollection();
            currColl.addEntries(entries, labels).then(function(result) {
                angular.forEach(newEntrieObjects, function(newEntry, key) {
                    currColl.entries.push(newEntry);
                });
            }, function(error) {
                console.log(error);
            });
        });
    };
    $scope.predicate = 'creationTime';
    $scope.reverse = false;
    $scope.entityTypes = ENTITY_TYPES;
    $scope.spaceEnum = SPACE_ENUM;
    $scope.cumulatedTagsLoading;
    $scope.selectedEntities = [];
    $scope.actions = [{
        title: 'Download',
        cssClass: 'glyphicon glyphicon-download-alt'
    }, {
        title: 'Move',
        cssClass: 'glyphicon glyphicon-floppy-open'
    }, {
        title: 'Delete',
        cssClass: 'glyphicon glyphicon-trash'
    }];
    /**
     * This events are used to adjust body 
     , required cause of a growing navbar (breadcrumbs)
     */
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        //$('#path').css('padding-top', parseInt($('#path').css("margin-top")) + parseInt($('#kb-navbar').css("height")) - 9);
    });
    $(window).resize(function() {
        //$('#path').css('padding-top', parseInt($('#path').css("margin-top")) + parseInt($('#kb-navbar').css("height")) - 9);
    });
    /**
     * TRANSLATION INJECTION
     */
    $scope.t = function(identifier) {
        return i18nService.t(identifier);
    };
    /**
     * METHODS
     */
    $scope.transitionToHome = function() {
        $state.go('app.collection.content');
    }
    $scope.activateCumulatedTagsLoadingIndicator = function() {
        $scope.cumulatedTagsLoading = true;
    };
    $scope.deactivateCumulatedTagsLoadingIndicator = function() {
        $scope.cumulatedTagsLoading = false;
    };
    $scope.loadCurrentCollection = function(coll) {
        $rootScope.activateLoadingIndicator();
        $scope.activateCumulatedTagsLoadingIndicator();
        var defer = $q.defer();
        if (coll === 'root') {
            $scope.loadRootCollection(defer);
        } else {
            self.loadCollectionByUri(coll, defer);
        }
        return defer.promise;
    };
    $scope.loadRootCollection = function(defer) {
        var promise = CollectionFetchService.getRootCollection();
        promise.then(function(model) {
            $rootScope.deactivateLoadingIndicator();
            self.renderCollectionContent(model);
            $state.transitionTo('app.collection.content', {
                coll: model.uriPathnameHash
            });
            defer.resolve();
        }, function(error) {
            console.log(error);
        });
    };
    this.loadCollectionByUri = function(coll, defer) {
        var promise = CollectionFetchService.getCollectionByUri(coll);
        promise.then(function(model) {
            $rootScope.deactivateLoadingIndicator()
            self.renderCollectionContent(model);
            defer.resolve();
        }, function(error) {
            console.log(error);
        });
    };
    this.renderCollectionContent = function(collection) {
        $scope.collectionRating = collection.overallRating.score;
        CurrentCollectionService.setCurrentCollection(collection);
        $scope.currentCollection = CurrentCollectionService.getCurrentCollection();
        this.getCumulatedTagsOfCurrentCollection();
        $rootScope.$broadcast("currCollLoaded");
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
    $scope.handleEntryClick = function(entry) {
        if (entry.isCollection()) {
            $scope.openCollection(entry.uriPathnameHash);
        } else {
            $state.transitionTo('app.collection.entry', {
                coll: CurrentCollectionService.getCurrentCollection().uriPathnameHash,
                entry: entry.uriPathnameHash
            });
        }
    };
    $scope.clickEventloadRootCollection = function() {
        $rootScope.activateLoadingIndicator();
        var defer = $q.defer();
        $scope.loadRootCollection(defer);
    }
    $scope.openCollection = function(uriPathnameHash) {
        $state.transitionTo('app.collection.content', {
            coll: uriPathnameHash
        });
    };
    $scope.loadCurrentEntity = function(event, entryUri, parentCollectionUri) {
        event.then(function() {
            var entry = CurrentCollectionService.getCurrentCollection().getEntryByUriPathnameHash(entryUri);
            if (entry != null) {
                var promise = EntityFetchService.getEntityByUri(entry.id, true, true, true);
                promise.then(function(entity) {
                    entity.init({
                        parentColl: CurrentCollectionService.getCurrentCollection()
                    });
                    self.openEntryDetailView(entity, $scope);
                }, function(error) {
                    console.log(error);
                });
            } else {
                //TODO
                //404 error page
            }
        });
    };
    this.openEntryDetailView = function(entry, scope) {
        var dialog = $dialogs.entryDetail(entry);
        dialog.result.finally(function(btn) {
            $state.transitionTo('app.collection.content', {
                coll: CurrentCollectionService.getCurrentCollection().uriPathnameHash
            });
        });
    };
    $scope.closeModal = function() {
        $scope.modal.close(true);
        $state.transitionTo('app.collection.content', {
            coll: CurrentCollectionService.getCurrentCollection().uriPathnameHash
        });
    };
    $scope.leaveCurrentCollectionRating = function(rating) {
        if (rating != CurrentCollectionService.getCurrentCollection().overallRating.score && rating <= RATING_MAX && rating > 0 && !$scope.ratingReadOnly) {
            $scope.ratingReadOnly = true;
            var promise = CurrentCollectionService.getCurrentCollection().saveRating(rating);
            promise.then(function(result) {
                $scope.collectionRating = result.overallRating.score;
                $scope.ratingReadOnly = false;
            });
        }
    };
    $scope.removeEntities = function(entities) {
        var entityIds = [];
        for (var i = 0; i < entities.length; i++) {
            entityIds.push(entities[i].id);
        }
        var promise = CurrentCollectionService.getCurrentCollection().deleteEntries(entityIds);
        promise.then(function(result) {
            for (var i = 0; i < entities.length; i++) {
                $.each($scope.currentCollection.entries, function(j) {
                    if ($scope.currentCollection.entries[j].id === entities[i].id) {
                        $scope.currentCollection.entries.splice(j, 1);
                        return false;
                    }
                });
            }
        });
    };
    $scope.addEntity = function() {
        $dialogs.uploadResources(true).result.then(function(uploadedEntities) {}, function() {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };
    $scope.addLink = function() {
        $dialogs.createLink(CurrentCollectionService.getCurrentCollection()).result.then(function(link) {}, function() {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };
    $scope.addCollection = function() {
        $dialogs.createCollection().result.then(function(link) {}, function() {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };
    $scope.setCollPublic = function() {
        CurrentCollectionService.getCurrentCollection().setCollPublic();
    };
    $scope.shareCollection = function() {
        $dialogs.shareEntity(CurrentCollectionService.getCurrentCollection());
    }
    this.getCumulatedTagsOfCurrentCollection = function() {
        var promise = CurrentCollectionService.getCurrentCollection().getCumulatedTags();
        promise.then(function() {
            $scope.deactivateCumulatedTagsLoadingIndicator();
        });
    };
    $scope.tagSearchClicked = function(tag) {
        $state.go('app.search.tag', {
            tag: tag
        });
    };
    $scope.deselectAllEntities = function() {
        for (var i = 0; i < $scope.selectedEntities.length; i++) {
            $scope.selectedEntities[i].isSelected = false;
        }
        $scope.selectedEntities = [];
    };
     $scope.downloadEntity = function(entity) {
        //$scope.entry.downloading = true;

        var promise = entity.downloadFile();
        promise.finally(function() {
            //$scope.entry.downloading = false;
        });
    };
    var downloadEntities = function(entities) {
        var defer = $q.defer();
        var promiseList = [];
        angular.forEach(entities, function(entity, key) {
            promiseList.push(entity.downloadFile());
        });
        $q.all(promiseList).then(function(result) {
            $scope.deselectAllEntities();
        });
    };
    $scope.clickedAction = function(index) {
        switch (index) {
            case 0:
                downloadEntities($scope.selectedEntities);
                break;
            case 2:
                $scope.removeEntities($scope.selectedEntities);
                break;
        }
    };
});