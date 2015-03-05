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
angular.module('module.collection').config(function ($stateProvider) {

    $stateProvider
            .state('app.collection', {
                controller: 'CollectionController',
                templateUrl: MODULES_PREFIX + '/collection/knowbox.tpl.html'

            });

    $stateProvider.state('app.collection.content', {
        url: '/collection/:coll',
        views: {
            "context": {
                templateUrl: MODULES_PREFIX + '/collection/context.tpl.html',
                controller: function ($stateParams, $scope, CurrentCollectionService, $state) {

                    var coll = null;
                    if ($stateParams.coll == "")
                    {
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
            }
        }
    })
            .state('app.collection.entry', {
                url: '/collection/:coll/entry/:entry',
                views: {
                    "context": {
                        templateUrl: MODULES_PREFIX + '/collection/context.tpl.html',
                        controller: function ($stateParams, $scope, $q, CurrentCollectionService) {

                            //TODO check rights for the collection
                            //TODO refactor!
                            // this won't work if you share a url with other users (only if currentCollection is public)
                            var promise;

                            if (CurrentCollectionService.getCurrentCollection() === null || CurrentCollectionService.getCurrentCollection().uriPathnameHash != $stateParams.coll)
                            {
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
angular.module('module.collection').service('CurrentCollectionService', [function () {

        var self = this;

        var currentCollection = null;

        this.setCurrentCollection = function (collection) {
            currentCollection = collection;
        };

        this.getCurrentCollection = function () {
            return currentCollection;
        };

    }]);

/**
 * CONTROLLER
 */
angular.module('module.collection').controller("CollectionController", [
    '$scope', '$q', '$location', '$rootScope', '$state', 'i18nService', 'CollectionFetchService', 'CurrentCollectionService', 'EntityFetchService', '$modal', 'EntityModel', 'ENTITY_TYPES', 'SPACE_ENUM', 'RATING_MAX', '$dialogs',
    function ($scope, $q, $location, $rootScope, $state, i18nService, CollectionFetchService, CurrentCollectionService, EntityFetchService, $modal, EntityModel, ENTITY_TYPES, SPACE_ENUM, RATING_MAX, $dialogs) {

        var self = this;
        var selectedCounter = 0;

        $scope.entityTypes = ENTITY_TYPES;
        $scope.spaceEnum = SPACE_ENUM;
        $scope.cumulatedTagsLoading;

        /**
         * This events are used to adjust body 
         , required cause of a growing navbar (breadcrumbs)
         */
        $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
            //$('#path').css('padding-top', parseInt($('#path').css("margin-top")) + parseInt($('#kb-navbar').css("height")) - 9);
        });

        $(window).resize(function () {
            //$('#path').css('padding-top', parseInt($('#path').css("margin-top")) + parseInt($('#kb-navbar').css("height")) - 9);
        });

        /**
         * TRANSLATION INJECTION
         */
        $scope.t = function (identifier) {
            return i18nService.t(identifier);
        };

        /**
         * METHODS
         */

        $scope.transitionToHome = function () {
            $state.go('app.collection.content');
        }

        $scope.activateCumulatedTagsLoadingIndicator = function () {
            $scope.cumulatedTagsLoading = true;
        };

        $scope.deactivateCumulatedTagsLoadingIndicator = function () {
            $scope.cumulatedTagsLoading = false;
        };

        $scope.loadCurrentCollection = function (coll) {

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

        $scope.loadRootCollection = function (defer) {

            var promise = CollectionFetchService.getRootCollection();

            promise.then(function (model) {
                $rootScope.deactivateLoadingIndicator();
                self.renderCollectionContent(model);
                $state.transitionTo('app.collection.content', {coll: model.uriPathnameHash});
                defer.resolve();
            }, function (error) {
                console.log(error);
            });
        };

        this.loadCollectionByUri = function (coll, defer) {

            var promise = CollectionFetchService.getCollectionByUri(coll);

            promise.then(function (model) {
                $rootScope.deactivateLoadingIndicator()
                self.renderCollectionContent(model);
                defer.resolve();
            }, function (error) {
                console.log(error);
            });

        };

        this.renderCollectionContent = function (collection) {
            $scope.collectionRating = collection.overallRating.score;
            CurrentCollectionService.setCurrentCollection(collection);
            $scope.currentCollection = CurrentCollectionService.getCurrentCollection();
            this.getCumulatedTagsOfCurrentCollection();
            $rootScope.$broadcast("currCollLoaded");
        };

        $scope.selectResource = function (entry) {

            if (entry.isSelected) {
                entry.isSelected = false;
                selectedCounter--;
            } else {
                entry.isSelected = true;
                selectedCounter++;
            }

            if (selectedCounter <= 0) {
                $scope.resourcesSelected = false;
            } else {
                $scope.resourcesSelected = true;
            }
        };

        var resetSelectCounter = function () {
            selectedCounter = 0;
            $scope.resourcesSelected = false;
        };

        $scope.handleEntryClick = function (entry) {

            if (entry.isCollection()) {
                $scope.openCollection(entry.uriPathnameHash);
            } else {
                $state.transitionTo('app.collection.entry', {coll: CurrentCollectionService.getCurrentCollection().uriPathnameHash, entry: entry.uriPathnameHash});
            }

        };

        $scope.clickEventloadRootCollection = function () {
            $rootScope.activateLoadingIndicator();
            var defer = $q.defer();
            $scope.loadRootCollection(defer);
        }

        $scope.openCollection = function (uriPathnameHash) {
            $state.transitionTo('app.collection.content', {coll: uriPathnameHash});
        };

        $scope.loadCurrentEntity = function (event, entryUri, parentCollectionUri) {

            event.then(function () {

                var entry = CurrentCollectionService.getCurrentCollection().getEntryByUriPathnameHash(entryUri);

                if (entry != null) {

                    var promise = EntityFetchService.getEntityByUri(entry.id, true, true, true);

                    promise.then(
                            function (entity) {
                                entity.init({parentColl: CurrentCollectionService.getCurrentCollection()});
                                self.openEntryDetailView(entity, $scope);
                            },
                            function (error) {
                                console.log(error);
                            }
                    );

                } else {
                    //TODO
                    //404 error page
                }

            });
        };

        this.openEntryDetailView = function (entry, scope) {
            var dialog = $dialogs.entryDetail(entry);

            dialog.result.finally(function (btn) {
                $state.transitionTo('app.collection.content', {coll: CurrentCollectionService.getCurrentCollection().uriPathnameHash});
            });
        };

        $scope.closeModal = function () {
            $scope.modal.close(true);
            $state.transitionTo('app.collection.content', {coll: CurrentCollectionService.getCurrentCollection().uriPathnameHash});
        };

        $scope.leaveCurrentCollectionRating = function (rating) {

            if (rating != CurrentCollectionService.getCurrentCollection().overallRating.score && rating <= RATING_MAX && rating > 0 && !$scope.ratingReadOnly)
            {
                $scope.ratingReadOnly = true;
                var promise = CurrentCollectionService.getCurrentCollection().saveRating(rating);
                promise.then(function (result) {
                    $scope.collectionRating = result.overallRating.score;
                    $scope.ratingReadOnly = false;
                });
            }
        };

        $scope.deleteCollectionEntries = function () {

            var toDelete = new Array();
            var toDeleteKeys = new Array();

            var entries = CurrentCollectionService.getCurrentCollection().entries;

            angular.forEach(entries, function (entry, key) {
                if (entry.isSelected) {
                    toDelete.push(entry.id);
                    toDeleteKeys.push(key);
                }
            });

            var promise = CurrentCollectionService.getCurrentCollection().deleteEntries(toDelete, toDeleteKeys);
            promise.then(function (result) {
                resetSelectCounter()
            });
        };

        $scope.openAddResourceWizzard = function () {
            $dialogs.addResourceWizzard();
        };

        $scope.setCollPublic = function () {
            CurrentCollectionService.getCurrentCollection().setCollPublic();
        };

        $scope.shareCollection = function () {
            $dialogs.shareEntity(CurrentCollectionService.getCurrentCollection());
        }

        this.getCumulatedTagsOfCurrentCollection = function () {
            var promise = CurrentCollectionService.getCurrentCollection().getCumulatedTags();
            promise.then(function () {
                $scope.deactivateCumulatedTagsLoadingIndicator();
            });
        };

        $scope.tagSearchClicked = function (tag) {
            $state.go('app.search.tag', {tag: tag});
        };

    }]);



