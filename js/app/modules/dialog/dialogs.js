/**
 * Note: This version requires Angular UI Bootstrap >= v0.6.0
 */
//== Controllers =============================================================//
angular.module('dialogs.controllers', ['ui.bootstrap.modal', 'module.i18n', 'module.collection', 'module.sharing'])
    /**
     * Error Dialog Controller
     */
    .controller('errorDialogCtrl', ['$scope', '$modalInstance', 'header', 'msg', function($scope, $modalInstance, header, msg) {
        //-- Variables -----//
        $scope.header = (angular.isDefined(header)) ? header : 'Error';
        $scope.msg = (angular.isDefined(msg)) ? msg : 'An unknown error has occurred.';
        //-- Methods -----//
        $scope.close = function() {
            $modalInstance.close();
        }; // end close
    }]) // end ErrorDialogCtrl

/**
 * Wait Dialog Controller
 */
.controller('waitDialogCtrl', ['$scope', '$modalInstance', '$timeout', 'header', 'msg', 'progress', function($scope, $modalInstance, $timeout, header, msg, progress) {
        //-- Variables -----//
        $scope.header = (angular.isDefined(header)) ? header : 'Please Wait...';
        $scope.msg = (angular.isDefined(msg)) ? msg : 'Waiting on operation to complete.';
        $scope.progress = (angular.isDefined(progress)) ? progress : 100;
        //-- Listeners -----//
        // Note: used $timeout instead of $scope.$apply() because I was getting a $$nextSibling error
        // close wait dialog
        $scope.$on('dialogs.wait.complete', function() {
            $timeout(function() {
                $modalInstance.close();
            });
        }); // end on(dialogs.wait.complete)
        // update the dialog's message
        $scope.$on('dialogs.wait.message', function(evt, args) {
            $scope.msg = (angular.isDefined(args.msg)) ? args.msg : $scope.msg;
        }); // end on(dialogs.wait.message)
        // update the dialog's progress (bar) and/or message
        $scope.$on('dialogs.wait.progress', function(evt, args) {
            $scope.msg = (angular.isDefined(args.msg)) ? args.msg : $scope.msg;
            $scope.progress = (angular.isDefined(args.progress)) ? args.progress : $scope.progress;
        }); // end on(dialogs.wait.progress)
        //-- Methods -----//
        $scope.getProgress = function() {
            return {
                'width': $scope.progress + '%'
            };
        }; // end getProgress
    }]) // end WaitDialogCtrl

/**
 * Notify Dialog Controller
 */
.controller('notifyDialogCtrl', ['$scope', '$modalInstance', 'header', 'msg', function($scope, $modalInstance, header, msg) {
        //-- Variables -----//
        $scope.header = (angular.isDefined(header)) ? header : 'Notification';
        $scope.msg = (angular.isDefined(msg)) ? msg : 'Unknown application notification.';
        //-- Methods -----//
        $scope.close = function() {
            $modalInstance.close();
        }; // end close
    }]) // end WaitDialogCtrl

/**
 * Confirm Dialog Controller
 */
.controller('confirmDialogCtrl', ['$scope', '$modalInstance', 'header', 'msg', function($scope, $modalInstance, header, msg) {
    //-- Variables -----//
    $scope.header = (angular.isDefined(header)) ? header : 'Confirmation';
    $scope.msg = (angular.isDefined(msg)) ? msg : 'Confirmation required.';
    //-- Methods -----//
    $scope.no = function() {
        $modalInstance.dismiss('no');
    }; // end close
    $scope.yes = function() {
        $modalInstance.close('yes');
    }; // end yes
}]).controller('entryDetailController', ['$scope', '$modalInstance', 'entry', '$q', 'i18nService', 'CurrentCollectionService', 'FetchServiceHelper', 'RATING_MAX', 'ENTITY_TYPES', 'TagFetchService', 'isSearchResult', 'UserService', 'UriToolbox', '$state', '$window', '$dialogs', 'GroupFetchService', function($scope, $modalInstance, entry, $q, i18nService, CurrentCollectionService, FetchServiceHelper, RATING_MAX, ENTITY_TYPES, TagFetchService, isSearchResult, UserSrv, UriToolbox, $state, $window, $dialogs, GroupFetchService) {
    $scope.entry = entry;
    $scope.tags = new Array();
    $scope.ratingReadOnly = false;
    $scope.ENTITY_TYPES = ENTITY_TYPES;
    $scope.isSearchResult = isSearchResult;
    $scope.locations = [];
    $scope.circleId = $state.params.id;
    
    $scope.circles = [$scope.circleId];
//    var promise = GroupFetchService.getUserGroups(null);
//    promise.then(function(result) {
//        $scope.circles = result.circles;
//    });

    /**
     * TRANSLATION INJECTION
     */
    $scope.t = function(identifier) {
        return i18nService.t(identifier);
    };
    var getLocations = function() {
        new SSCollsEntityIsInGet(function(result) {
            //TODO dtheiler: replace this when differentiation between shared and public is possible in KnowBrain
            angular.forEach(result.colls, function(coll, key) {
                coll.space = sSColl.getCollSpace(coll.circleTypes);
                if (coll.space === "followSpace" || coll.space === "sharedSpace") {
                    coll.space = "shared";
                }
                if (coll.space === "privateSpace") {
                    coll.space = "private";
                }
            });
            $scope.locations = result.colls;
            $scope.$apply();
        }, function(error) {
            console.log(error);
        }, UserSrv.getKey(), entry.id);
    };
    this.init = function() {

        var promise = FetchServiceHelper.getEntityDescribtion(entry, true, true, true, $scope.circleId);
        promise.then(function(result) {
            
			if(result.thumb){
				$scope.entry.thumb = result.thumb.file.downloadLink;
		    }
			
            $scope.editedDescription = entry.description;
            //set tags
            angular.forEach(entry.tags, function(tag, key) {
                $scope.tags.push({text: tag});
            })
            if (entry.overallRating !== null && entry.overallRating.score != null) $scope.entryRating = entry.overallRating.score;
            if (isSearchResult) {
                getLocations();
            }
        }, function(error) {
            console.log(error);
        });
    };
    this.init();
    $scope.rateEntry = function(rating) {
        if (rating != $scope.entryRating && rating <= RATING_MAX && rating > 0 && !$scope.ratingReadOnly) {
            $scope.ratingReadOnly = true;
            var promise = $scope.entry.saveRating(rating);
            promise.then(function(result) {
                $scope.entryRating = result.overallRating.score;
                $scope.ratingReadOnly = false;
            });
        }
    };
    $scope.tagAdded = function(tag) {
        // Passed variable is an object with structure { text : 'tagtext'}
        entry.addTag(tag.text, $scope.circleId).then(function(result) {
        	// dkowald: added null check
        	if (CurrentCollectionService.getCurrentCollection() != null) {
        		CurrentCollectionService.getCurrentCollection().getCumulatedTags();
        	}
        }, function(error) {
            console.log(error);
        });
    };
    $scope.tagRemoved = function(tag) {
        // Passed variable is an object with structure { text : 'tagtext'}
        entry.removeTag(tag.text, $scope.circleId).then(function(result) {
        	// dkowald: added null check
        	if (CurrentCollectionService.getCurrentCollection() != null) {
        		CurrentCollectionService.getCurrentCollection().getCumulatedTags();
        	}
        }, function(error) {
            console.log(error);
        });
    };
    $scope.close = function() {
        $modalInstance.close();
    };
    $scope.deleteEntity = function() {
    	var toDelete = new Array();
        var entries = CurrentCollectionService.getCurrentCollection().entries;
        angular.forEach(entries, function(collEntry, key) {
            if (collEntry.id == $scope.entry.id) {
                toDelete.push(collEntry.id);
            }
        });
        var promise = CurrentCollectionService.getCurrentCollection().deleteEntries(toDelete);
        promise.then(function(result) {
            $scope.close();
        }, function(error) {
            console.log(error);
        });
    };
    $scope.downloadEntity = function() {
        if ($scope.entry.type != ENTITY_TYPES.file) return;
        $scope.entry.downloading = true;
        var promise = $scope.entry.downloadFile();
        promise.finally(function() {
            $scope.entry.downloading = false;
        });
    };
    $scope.viewEntity = function() {
        if ($scope.entry.type != ENTITY_TYPES.file) return;
        $scope.entry.viewFile();
    };
    $scope.openLink = function() {
        if ($scope.entry.type != ENTITY_TYPES.link) return;
        $window.open(entry.id);
    };
    $scope.queryTags = function($queryString) {
        var defer = $q.defer();
        var promise = TagFetchService.fetchAllPublicTags($scope.circles);
        promise.then(function(result) {
            defer.resolve(search(result, $queryString));
        });
        return defer.promise;
    };
    var search = function(tagsArray, query) {
        var items;
        items = tagsArray.filter(function(x) {
            return x.toLowerCase().indexOf(query.toLowerCase()) > -1;
        });
        return items;
    };
    $scope.goToCollection = function(location) {
        if (entry.type == ENTITY_TYPES.link) {
            entry.uriPathnameHash = UriToolbox.extractUriHostPartWithoutProtocol(entry.id);
        } else {
            entry.uriPathnameHash = UriToolbox.extractUriPathnameHash(entry.id);
        }
        $scope.close();
        $state.transitionTo('app.collection.content', {
            coll: UriToolbox.extractUriPathnameHash(location.id)
        });
    };
    $scope.shareEntity = function() {
        $dialogs.shareEntities([$scope.entry]);
    };
    $scope.saveDescription = function(description) {
        if (this.editingDescription) {
            var promise = $scope.entry.setDescription(description);
            promise.then(function(result) {
                $scope.entry.description = description;
            }, function(error) {
                console.log(error);
            });
        }
    };

}]).controller('attachmentDetailController', ['$scope', '$modalInstance', 'attachment', '$q', 'i18nService', 'CurrentCollectionService', 'RATING_MAX', 'ENTITY_TYPES', 'UriToolbox', '$state', '$window', '$dialogs', function($scope, $modalInstance, attachment, $q, i18nService, CurrentCollectionService, RATING_MAX, ENTITY_TYPES, UriToolbox, $state, $window, $dialogs) {
    $scope.attachment = attachment;
    $scope.ENTITY_TYPES = ENTITY_TYPES;
    $scope.fileType = null;
    if (attachment.mimeType != undefined) {
        switch (attachment.mimeType.toLowerCase()) {
            case "png":
            case "jpg":
            case "jpeg":
            case "gif":
                $scope.fileType = 'image';
                break;
            case "html":
            case "c":
            case "js":
            case "h":
            case "cpp":
            case "m":
            case "css":
            case "htm":
                $scope.fileType = 'code';
                break;
            case "pdf":
                $scope.fileType = 'pdf';
                break;
        }
    };
    /**
     * TRANSLATION INJECTION
     */
    $scope.t = function(identifier) {
        return i18nService.t(identifier);
    };
    $scope.close = function() {
        $modalInstance.close();
    };
    $scope.downloadAttachment = function() {
        if ($scope.attachment.type != ENTITY_TYPES.file) return;
        $scope.attachment.downloading = true;
        var promise = $scope.attachment.downloadFile();
        promise.finally(function() {
            $scope.attachment.downloading = false;
        });
    };
    $scope.openLink = function() {
        if ($scope.attachment.type != ENTITY_TYPES.link) return;
        $window.open(attachment.id);
    };
    if ($scope.fileType === 'code') {
        document.getElementById("attachment-preview-code").innerHTML = attachment.downloadLink;
    }
}])


.controller("ChooseFromDropboxController", function($scope, $q, $location, $rootScope, $state, i18nService, CollectionFetchService, CurrentCollectionService, EntityFetchService, $modal, EntityModel, ENTITY_TYPES, SPACE_ENUM, RATING_MAX, $dialogs, $modalInstance, enableSelectingCollections) {

    var self = this;
    var selectedCounter = 0;

    $scope.entityTypes = ENTITY_TYPES;
    $scope.spaceEnum = SPACE_ENUM;
    $scope.selectedResources = [];
    $scope.disableSelectingCollections = !enableSelectingCollections;

    /**
     * TRANSLATION INJECTION
     */
    $scope.t = function(identifier) {
        return i18nService.t(identifier);
    };

    /**
     * METHODS
     */

    $scope.transitionToHome = function() {};


    $scope.loadCurrentCollection = function(coll) {

        $rootScope.activateLoadingIndicator();

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
            defer.resolve();
        }, function(error) {
            console.log(error);
        });
    };

    $scope.loadCollectionByUri = function(coll, defer) {

        var promise = CollectionFetchService.getCollectionByUri(coll);

        promise.then(function(model) {
            $rootScope.deactivateLoadingIndicator();
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

        var selectedResourcesIDs = [];
        $scope.selectedResources.forEach(function(entry) {
            selectedResourcesIDs.push(entry.id);
        });
        $scope.currentCollection.entries.forEach(function(entry) {
            entry.isSelected = $.inArray(entry.id, selectedResourcesIDs) !== -1;
        });
    };

    $scope.selectResource = function(entry) {
        if (entry.type === ENTITY_TYPES.collection && $scope.disableSelectingCollections) {
            $scope.handleEntryClick(entry);
            return;
        }
        if (entry.isSelected) {
            $scope.deselectResource($scope.selectedResources.indexOf(entry));
        } else {
            entry.isSelected = true;
            selectedCounter++;
            $scope.selectedResources.push(entry);
        }

        if (selectedCounter <= 0) {
            $scope.resourcesSelected = false;
        } else {
            $scope.resourcesSelected = true;
        }
    };

    $scope.deselectResource = function(index) {
        var entry = $scope.selectedResources[index];
        if (entry.isSelected) {
            entry.isSelected = false;
            selectedCounter--;

        }
        $scope.selectedResources.splice(index, 1);
    };

    var resetSelectCounter = function() {
        selectedCounter = 0;
        $scope.resourcesSelected = false;
    };

    $scope.handleEntryClick = function(entry) {
        if (entry.type === 'coll') {
            $scope.loadCollectionByUri(entry.uriPathnameHash);
        } else {
            $scope.selectResource(entry);
        }
    };

    $scope.clickEventloadRootCollection = function() {
        $rootScope.activateLoadingIndicator();
        var defer = $q.defer();
        $scope.loadRootCollection(defer);
    }

    $scope.openCollection = function(uriPathnameHash) {
        $scope.loadCollectionByUri(uriPathnameHash);
    };

    $scope.loadCurrentEntity = function(event, entryUri, parentCollectionUri) {

        event.then(function() {

            var entry = CurrentCollectionService.getCurrentCollection().getEntryByUriPathnameHash(entryUri);

            if (entry != null) {

                var promise = EntityFetchService.getEntityByUri(entry.id, true, true, true);

                promise.then(
                    function(entity) {
                        entity.init({
                            parentColl: CurrentCollectionService.getCurrentCollection()
                        });
                        self.openEntryDetailView(entity, $scope);
                    },
                    function(error) {
                        console.log(error);
                    }
                );

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

    $scope.close = function() {
        $modalInstance.close();
    };


    $scope.resetAttachedResources = function() {
        $scope.currentCollection.entries.forEach(function(entry) {
            entry.isSelected = false;
        });
        $scope.selectedResources.forEach(function(entry) {
            entry.isSelected = false;
        });
        $scope.selectedResources = [];
        resetSelectCounter();
    };

    $scope.doneClicked = function() {
        $modalInstance.close($scope.selectedResources);
    };


    $scope.loadCurrentCollection('root');

})



.controller("UploadResourcesController", function($q, $scope, $modalInstance, $http, $location, $state, $stateParams, i18nService, CurrentCollectionService, UriToolbox, UserService, EntityModel, ENTITY_TYPES, FileUploader, saveInCollection, uploadFiles, GroupFetchService, CategoryTagFetchService) {
    var self = this;
    
    $scope.uploader = new FileUploader();
    $scope.showTagInput = !saveInCollection;

    /**
     * TRANSLATION INJECTION
     */
    $scope.t = function(identifier) {
            return i18nService.t(identifier);
        }
        /**
         * METHODS
         */
    $scope.filesArray = [];
    $scope.showUploadWidget = function() {
        return $scope.uploader.queue.length > 0;
    }

    $scope.getFileSizeString = function(size) {
        var mb = ((size / 1024) / 1024);
        if (mb < 0.01) {
            mb = (size / 1024);
            return mb.toFixed(2) + " KB";
        }
        return mb.toFixed(2) + " MB";
    };

    $scope.close = function() {
        $modalInstance.dismiss();
    };
    ///////////////////////////////////////////////////
   ///  kb-recommender user study
   ///////////////////////////////////////////////////
    $scope.recTagsShow = false;
    $scope.circleId = $state.params.id;
    /*
    $scope.circleName = "";
    $scope.circle = null;
    var promise = GroupFetchService.getGroup("http://sss.eu/" + $scope.circleId);
    promise.then(function(result) {
        $scope.circle = result.circle;
        $scope.circleName = result.circle.label;
    });
    */
    
    $scope.predefinedCategories = [];
    var categoriesPromise = CategoryTagFetchService.fetchPredefinedCategories();
    categoriesPromise.then(function(result) {
    	// When categories are defined uncomment the following line.
    	//$scope.predefinedCategories = result.categories;
     	for(var i=0; i < result.categories.length; i++) {
    		 if (i < 10) {
    			 $scope.predefinedCategories.push(result.categories[i]);
    		 } else {
    			 break;
    		 }
        }
    });
    
    
    $scope.selectedCategories = [];
    
    $scope.stayOpen = function($event) {
    	$event.stopImmediatePropagation();
    }
    
    $scope.selectCategory = function($event, category) {
        var idx = $scope.selectedCategories.indexOf(category);
        if (idx > -1) {
            $scope.selectedCategories.splice(idx, 1);
          }
          else {
            $scope.selectedCategories.push(category);
          }
        $event.stopImmediatePropagation();
    };
    $scope.recommendedTags = [];
    //$scope.recommendedTagsDummy = ["rectag1", "rectag2", "rectag3", "rectag4"];  //  for test purposes 
    $scope.allTags = [];
    $scope.inputTags =[];
    $scope.getTagsforCategories = function (){
    	var tagsPromise = CategoryTagFetchService.fetchRecommendedTags($scope.circleId, $scope.selectedCategories);
    	tagsPromise.then(function(result) {
    		//if (result.tags.length > 0)
				tagnames = [];
				
        if(result.tags){
        
          for (i = 0; i < result.tags.length; i++) {
            tagnames.push(result.tags[i].label);
          }
        }
    			$scope.recommendedTags = tagnames;//result.tags;
    		//else 
    			//$scope.recommendedTags = $scope.recommendedTagsDummy;
    	});
    	$scope.recTagsShow = true;
    };
   
    // dkowald: fixed duplicate tags bug
    $scope.addTagToInput = function (tag) {
    	var oldTags = $scope.inputTags.map(function(tag) { return tag.text; });
    	var tagText = {text: tag};
    	
    	var index = oldTags.indexOf(tagText.text);
    	if (index == -1) {
		    $scope.inputTags.push(tagText);
		    $scope.allTags = $scope.inputTags.map(function(tag) { return tag.text; });
    	}
    }
    $scope.addTagToAll = function (tag) {
    	$scope.allTags.push( tag.text);
    }
    // dkowald: fixed
    $scope.removeTagFromAll = function (tag) {
    	var index = $scope.allTags.indexOf(tag.text);
    	if (index > -1) {
    		$scope.allTags.splice(index, 1);
    	}
    }
    
    ///////////////////////////////////////////////////
    ///  END: kb-recommender user study
    ///////////////////////////////////////////////////
    $scope.uploader.uploadAll = function() {
        if (!uploadFiles) {
            var files = [];
            angular.forEach($scope.uploader.queue, function(file, key) {
                files.push(file._file);
            });
            $modalInstance.close(files);
            return;
        }
        var entries = [];
        var labels = [];
        var uploadCounter = 0;
        var fileCount = $scope.uploader.queue.length;
        var newEntrieObjects = [];
        var defer = $q.defer();
        angular.forEach($scope.uploader.queue, function(file, key) {
                file.uploading = true;

                if (saveInCollection == true) {
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
                } else {
                    new SSFileUpload(
                        function(result, fileName) {
                            var entry = new EntityModel();

                            entry.init({
                                id: result.file,
                                label: fileName,
                                parentColl: null,
                                space: null,
                                type: ENTITY_TYPES.file
                            });
                            entry.init({
                                uriPathnameHash: UriToolbox.extractUriPathnameHash(result.file)
                            });

                            file.uploading = false;
                            file.uploaded = true;
                            file.uriPathnameHash = UriToolbox.extractUriPathnameHash(result.file);
                            entries.push(entry);
                            uploadCounter++;
                            newEntrieObjects.push(entry);
                            if (uploadCounter == fileCount) {
                                defer.resolve();
                            }
                            
                            var fileUri = result.file;
                            var promise = GroupFetchService.addEntitiesToGroup([fileUri], "http://sss.eu/" + $scope.circleId, $scope.allTags, $scope.selectedCategories);
                            promise.then(function(result) {
                            	console.log("Added file: " + fileUri);
                            }, function(error) {
                                console.log(error);
                            });
                        },
                        function(error) {
                            console.log("Error");
                            defer.reject(error);
                        },
                        UserService.getKey(),
                        file._file
                    );
            }
        });
        defer.promise.then(function() {
            if (saveInCollection == true) {
                var currColl = CurrentCollectionService.getCurrentCollection();
                currColl.addEntries(entries, labels).then(function(result) {
                    angular.forEach(newEntrieObjects, function(newEntry, key) {
                        currColl.entries.push(newEntry);
                    });
                    $modalInstance.close(entries);
                }, function(error) {
                    console.log(error);
                });
            } else {
                $modalInstance.close(entries);
            }
        });
    };
})

.controller("CreateLinkController", function($scope, $modalInstance, $http, $location, $state, i18nService, GroupFetchService, targetEntity, EntityModel, CategoryTagFetchService) {
    $scope.createLink = function(link) {
        if (/*link.label == undefined || */link.url == undefined) {
            return;
        }

        if (targetEntity.type === 'circle') {
            var promise = GroupFetchService.addEntitiesToGroup([link.url], targetEntity.id, $scope.allTags, $scope.selectedCategories);
            promise.then(function(result) {
                var entry = new EntityModel();
                entry.init({ id: link.url,
                            label: link.url
                            });
                //location.reload();
                $modalInstance.close(entry);
            }, function(error) {
                console.log(error);
            });
        } else if (targetEntity.type === 'coll') {
            var promise = targetEntity.createLink(link.label, link.url);
            promise.then(function(result) {
                $modalInstance.close(result);
            }, function(error) {
                console.log(error);
            });
        } else {
            var entry = new EntityModel();
            entry.init({id: link.url, label: link.label});
            $modalInstance.close(entry);
        }

    };
    ///////////////////////////////////////////////////
    ///  kb-recommender user study
    ///////////////////////////////////////////////////
    /**
     * TRANSLATION INJECTION
     */
    $scope.t = function(identifier) {
            return i18nService.t(identifier);
        }
    
     $scope.recTagsShow = false;
     $scope.circleId = $state.params.id;
     /*
     $scope.circleName = "";
     $scope.circle = null;
     var promise = GroupFetchService.getGroup("http://sss.eu/" + $scope.circleId);
     promise.then(function(result) {
         $scope.circle = result.circle;
         $scope.circleName = result.circle.label;
     });
     */
     $scope.predefinedCategories = [];
     var categoriesPromise = CategoryTagFetchService.fetchPredefinedCategories();
     categoriesPromise.then(function(result) {
     	// When categories are defined uncomment the following line.
    	// $scope.predefinedCategories = result.categories;
     	for(var i=0; i < result.categories.length; i++) {
     		 if (i < 10) {
     			 $scope.predefinedCategories.push(result.categories[i]);
     		 } else {
     			 break;
     		 }
         }
     });
       
     $scope.stayOpen = function($event) {
     	$event.stopImmediatePropagation();
     }
     
     $scope.selectedCategories = [];
     $scope.selectCategory = function($event, category) {
         var idx = $scope.selectedCategories.indexOf(category);
         if (idx > -1) {
             $scope.selectedCategories.splice(idx, 1);
           }
           else {
             $scope.selectedCategories.push(category);
           }
         $event.stopImmediatePropagation();
     };
     $scope.recommendedTags = [];
     //$scope.recommendedTagsDummy = ["rectag1", "rectag2", "rectag3", "rectag4"];  //  for test purposes 
     $scope.allTags = [];
     $scope.inputTags =[];
     $scope.getTagsforCategories = function (){
     	var tagsPromise = CategoryTagFetchService.fetchRecommendedTags($scope.circleId, $scope.selectedCategories);
     	tagsPromise.then(function(result) {
     		//if (result.tags.length > 0)
				tagnames = [];
				
        if(result.tags){
        
          for (i = 0; i < result.tags.length; i++) {
            tagnames.push(result.tags[i].label);
          }
        }
    			$scope.recommendedTags = tagnames;//result.tags;
     		//else 
     			//$scope.recommendedTags = $scope.recommendedTagsDummy;
     	});
     	$scope.recTagsShow = true;
     };
    
     // dkowald: fixed duplicate tags bug
     $scope.addTagToInput = function (tag) {
     	var oldTags = $scope.inputTags.map(function(tag) { return tag.text; });
     	var tagText = {text: tag};
     	
     	var index = oldTags.indexOf(tagText.text);
     	if (index == -1) {
 		    $scope.inputTags.push(tagText);
 		    $scope.allTags = $scope.inputTags.map(function(tag) { return tag.text; });
     	}
     }
     $scope.addTagToAll = function (tag) {
     	$scope.allTags.push( tag.text);
     }
     // dkowald: fixed
     $scope.removeTagFromAll = function (tag) {
     	var index = $scope.allTags.indexOf(tag.text);
     	if (index > -1) {
     		$scope.allTags.splice(index, 1);
     	}
     }
     ///////////////////////////////////////////////////
     ///  END: kb-recommender user study
     ///////////////////////////////////////////////////
    $scope.close = function() {
        $modalInstance.close();
    };
})

.controller("CreateCollectionController", function($scope, $modalInstance, $http, $location, i18nService, CurrentCollectionService, SPACE_ENUM) {
    $scope.t = function(identifier) {
            return i18nService.t(identifier);
        }
    $scope.newColl = {
        shared: false,
        private: true
    };
    $scope.currentCollection = CurrentCollectionService.getCurrentCollection();
    $scope.SPACE_ENUM = SPACE_ENUM;

    $scope.close = function() {
        $modalInstance.close();
    };
    
    $scope.createCollection = function(coll, closeWizzardFnc) {

        if (coll.label == undefined) {
            return;
        }

        var promise = CurrentCollectionService.getCurrentCollection().createCollection(coll.label);
        promise.then(function(result) {
            $modalInstance.close(result);
        }, function(error) {
            console.log(error);
        });
    };

    //checkbox -> radiobutton hack ... damn angular
    $scope.privateClicked = function() {
        if ($scope.newColl.private) {
            $scope.newColl.shared = true;
        } else {
            $scope.newColl.shared = false;
        }
    };

    $scope.sharedClicked = function() {
        if ($scope.newColl.shared) {
            $scope.newColl.private = true;
        } else {
            $scope.newColl.private = false;
        }
    };
    
})

.controller("ProfilePictureController", function($scope, $modalInstance, $state, $stateParams, FileUploader, UserService, UserFetchService){
    $scope.uploader = new FileUploader();
    $scope.uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });
    $scope.uploader.onAfterAddingFile = function(item) {
        if ($scope.uploader.queue.length > 1) {
            $scope.uploader.removeFromQueue(0);
        }
        $scope.item = item;
    };

    $scope.close = function() {
        $modalInstance.dismiss();
    };
    
    $scope.save = function() {
        new SSFileUpload(
            function(result, fileName) {

                new SSImageProfilePictureSet(
                    function(result) {
                        $modalInstance.dismiss(result);
                    },
                    function(error) {
                        console.log("Error");
                    },
                    UserService.getUser(),
                    UserService.getKey(),
                    result.file
                );
            },
            function(error) {
                console.log("Error");
            },
            UserService.getKey(),
            $scope.item._file
        );
    };
})
// end ConfirmDialogCtrl / dialogs.controllers
.controller("baseModalController", ['$controller', '$scope', '$rootScope', 'i18nService', 'states', 'ctrlFunction', function($controller, $scope, $rootScope, $modalInstance, i18nService, states, ctrlFunction) {
    $scope.baseCtrl = $controller(ctrlFunction, {
        $scope: $scope
    });
    $scope.stateStack = [];
    $scope.states = states;
    $scope.close = function() {
        $modalInstance.dismiss();
    };
    $scope.confirm = function(result) {
        $modalInstance.close(result);
    };
    $scope.enterState = function(state) {
        $scope.stateStack.push(state);
        $scope.currentState = state;
    };
    $scope.leaveState = function() {
        $scope.stateStack.pop();
        if ($scope.stateStack.length < 1) {
            $scope.close();
        }
        $scope.currentState = $scope.stateStack[$scope.stateStack.length - 1];
    };
    $scope.gotoBaseState = function() {
        while ($scope.stateStack.length > 1) {
            $scope.stateStack.pop();
        }
        $scope.currentState = $scope.stateStack[$scope.stateStack.length - 1];
    };
    var initialState = Object.keys(states)[0];
    $scope.enterState(initialState);
}]);



//== Services ================================================================//
angular.module('dialogs.services', ['ui.bootstrap.modal', 'dialogs.controllers'])
    /**
     * Dialogs Service
     */
    .factory('$dialogs', ['$modal', function($modal) {
        return {
            error: function(header, msg) {
                return $modal.open({
                    templateUrl: '/dialogs/error.html',
                    controller: 'errorDialogCtrl',
                    resolve: {
                        header: function() {
                            return angular.copy(header);
                        },
                        msg: function() {
                            return angular.copy(msg);
                        }
                    }
                }); // end modal.open
            }, // end error
            wait: function(header, msg, progress) {
                return $modal.open({
                    templateUrl: '/dialogs/wait.html',
                    controller: 'waitDialogCtrl',
                    resolve: {
                        header: function() {
                            return angular.copy(header);
                        },
                        msg: function() {
                            return angular.copy(msg);
                        },
                        progress: function() {
                            return angular.copy(progress);
                        }
                    }
                }); // end modal.open
            }, // end wait
            notify: function(header, msg) {
                return $modal.open({
                    templateUrl: '/dialogs/notify.html',
                    controller: 'notifyDialogCtrl',
                    resolve: {
                        header: function() {
                            return angular.copy(header);
                        },
                        msg: function() {
                            return angular.copy(msg);
                        }
                    }
                }); // end modal.open
            }, // end notify
            confirm: function(header, msg) {
                return $modal.open({
                    templateUrl: '/dialogs/confirm.html',
                    controller: 'confirmDialogCtrl',
                    resolve: {
                        header: function() {
                            return angular.copy(header);
                        },
                        msg: function() {
                            return angular.copy(msg);
                        }
                    }
                }); // end modal.open
            }, // end confirm
            create: function(url, ctrlr, data, opts) {
                var k = (angular.isDefined(opts.keyboard)) ? opts.keyboard : true; // values: true,false
                var b = (angular.isDefined(opts.backdrop)) ? opts.backdrop : true; // values: 'static',true,false
                var w = (angular.isDefined(opts.windowClass)) ? opts.windowClass : 'dialogs-default'; // additional CSS class(es) to be added to a modal window
                return $modal.open({
                    templateUrl: url,
                    controller: ctrlr,
                    keyboard: k,
                    backdrop: b,
                    windowClass: w,
                    resolve: {
                        data: function() {
                            return angular.copy(data);
                        }
                    }
                }); // end modal.open
            }, // end create
            newModal: function(states, ctrlFunction, wClass) {
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/dialog/baseModal.tpl.html',
                    controller: 'baseModalController',
                    keyboard: true,
                    backdrop: true,
                    windowClass: wClass,
                    resolve: {
                        states: function() {
                            return states;
                        },
                        ctrlFunction: function() {
                            return ctrlFunction;
                        }
                    }
                });
            },
            entryDetail: function(entry, isSearchResult) {
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/dialog/entryDetail.tpl.html',
                    controller: 'entryDetailController',
                    keyboard: true,
                    backdrop: true,
                    windowClass: 'modal-huge',
                    resolve: {
                        entry: function() {
                            return entry;
                        },
                        isSearchResult: function() {
                            if (isSearchResult == undefined) isSearchResult = false;
                            return isSearchResult;
                        }
                    }
                });
            },
            attachmentDetail: function(attachment) {
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/dialog/attachmentDetail.tpl.html',
                    controller: 'attachmentDetailController',
                    keyboard: true,
                    backdrop: true,
                    windowClass: 'modal-huge',
                    resolve: {
                        attachment: function() {
                            return attachment;
                        }
                    }
                });
            },
            shareEntities: function(entities) {
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/sharing/shareEntities.tpl.html',
                    controller: 'SharingController',
                    keyboard: true,
                    backdrop: true,
                    windowClass: 'modal-small',
                    resolve: {
                        entities: function() {
                            return entities;
                        }
                    }
                });
            },
            shareWith: function(allUsers, sharedEntities) {
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/sharing/shareWith.tpl.html',
                    controller: 'ShareWithController',
                    keyboard: true,
                    backdrop: true,
                    windowClass: 'modal-huge',
                    resolve: {
                        allUsers: function() {
                            return allUsers;
                        },
                        sharedEntities: function() {
                            return sharedEntities;
                        }
                    }
                });
            },
            uploadResources: function(saveInCollection, uploadFiles) {
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/dialog/wizzard-upload-resource.tpl.html',
                    controller: 'UploadResourcesController',
                    keyboard: true,
                    backdrop: true,
                    resolve: {
                        saveInCollection: function() {
                            return saveInCollection;
                        },
                        uploadFiles: function() {
                            return uploadFiles;
                        }
                    }
                });
            },
            chooseFromDropbox: function(enableSelectingCollections) {
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/dialog/wizzard-choose-from-dropbox.tpl.html',
                    controller: 'ChooseFromDropboxController',
                    keyboard: true,
                    backdrop: true,
                    resolve: {
                        enableSelectingCollections: function() {
                            return enableSelectingCollections;
                        }
                    }
                });
            },
            createLink: function(targetEntity) {
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/dialog/wizzard-create-link.tpl.html',
                    controller: 'CreateLinkController',
                    keyboard: true,
                    backdrop: true,
                    windowClass: 'modal-small',
                    resolve: {
                        targetEntity: function() {
                            return targetEntity;
                        }
                    }
                });
            },
            createCollection: function(targetEntity) {
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/dialog/wizzard-create-collection.tpl.html',
                    controller: 'CreateCollectionController',
                    keyboard: true,
                    backdrop: true,
                    windowClass: 'modal-small'
                });
            },
            uploadProfilePicture: function(targetEntity) {
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/social/update-profile-picture.tpl.html',
                    controller: 'ProfilePictureController',
                    keyboard: true,
                    backdrop: true,
                    windowClass: 'modal-small',
                    resolve: {
                        targetEntity: function() {
                            return targetEntity;
                        }
                    }
                });
            }
        };
    }]); // end $dialogs / dialogs.services
//== Module ==================================================================//
angular.module('dialogs', ['dialogs.services', 'ngSanitize']) // requires angular-sanitize.min.js (ngSanitize) //code.angularjs.org/1.2.1/angular-sanitize.min.js
    // Add default templates via $templateCache
    .run(['$templateCache', function($templateCache) {
        $templateCache.put('/dialogs/error.html', '<div class="modal-header dialog-header-error"><button type="button" class="close" ng-click="close()">&times;</button><h4 class="modal-title text-danger"><span class="glyphicon glyphicon-warning-sign"></span> <span ng-bind-html="header"></span></h4></div><div class="modal-body text-danger" ng-bind-html="msg"></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="close()">Close</button></div>');
        $templateCache.put('/dialogs/wait.html', '<div class="modal-header dialog-header-wait"><h4 class="modal-title"><span class="glyphicon glyphicon-time"></span> Please Wait</h4></div><div class="modal-body"><p ng-bind-html="msg"></p><div class="progress progress-striped active"><div class="progress-bar progress-bar-info" ng-style="getProgress()"></div><span class="sr-only">{{progress}}% Complete</span></div></div>');
        $templateCache.put('/dialogs/notify.html', '<div class="modal-header dialog-header-notify"><button type="button" class="close" ng-click="close()" class="pull-right">&times;</button><h4 class="modal-title text-info"><span class="glyphicon glyphicon-info-sign"></span> {{header}}</h4></div><div class="modal-body text-info" ng-bind-html="msg"></div><div class="modal-footer"><button type="button" class="btn btn-primary" ng-click="close()">OK</button></div>');
        $templateCache.put('/dialogs/confirm.html', '<div class="modal-header dialog-header-confirm"><button type="button" class="close" ng-click="no()">&times;</button><h4 class="modal-title"><span class="glyphicon glyphicon-check"></span> {{header}}</h4></div><div class="modal-body" ng-bind-html="msg"></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="yes()">Yes</button><button type="button" class="btn btn-primary" ng-click="no()">No</button></div>');
    }]); // end run / dialogs