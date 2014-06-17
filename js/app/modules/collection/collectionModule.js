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
angular.module('module.collection',['module.i18n', 'module.cookies', 'module.models', 'ui.bootstrap', 'module.utilities', 'ui.bootstrap.rating', 'dialogs']);

/**
* CONFIG 
*/
angular.module('module.collection').config(function ($stateProvider) {

    $stateProvider
        .state('app.collection', {
            controller:'CollectionController',
            templateUrl: MODULES_PREFIX + '/collection/knowbox.tpl.html'

        });

  $stateProvider.state('app.collection.content', {
    url:'/collection/:coll',
    views: {
      "context": {
        templateUrl: MODULES_PREFIX + '/collection/context.tpl.html',
        controller: function($stateParams, $scope, CurrentCollectionService, $state) {

            var coll = null;
            if($stateParams.coll == "")
            {
              coll = "root";
            }else{
              coll = $stateParams.coll;
            }

            $scope.loadCurrentCollection(coll);
        }
      },
      "context-info":{
        templateUrl: MODULES_PREFIX + '/collection/context-info.tpl.html'
      },
      "breadcrumbs":{
        templateUrl: MODULES_PREFIX + '/collection/breadcrumbs.tpl.html'
      }
    } 
  })
  .state('app.collection.entry',{
    url:'/collection/:coll/entry/:entry',
    views: {
      "context": {
        templateUrl: MODULES_PREFIX + '/collection/context.tpl.html',
        controller: function($stateParams, $scope, $q, CurrentCollectionService) {

          //TODO check rights for the collection
          //TODO refactor!
          // this won't work if you share a url with other users (only if currentCollection is public)
          var promise;

          if(CurrentCollectionService.getCurrentCollection() === null || CurrentCollectionService.getCurrentCollection().uriPathnameHash != $stateParams.coll)
          {
            promise = $scope.loadCurrentCollection($stateParams.coll);
          }else{
            var defer = $q.defer();
            promise = defer.promise;
            defer.resolve();
          }

          $scope.loadCurrentEntity(promise, $stateParams.entry, $stateParams.coll);
        },
      },
      "context-info":{
        templateUrl: MODULES_PREFIX + '/collection/context-info.tpl.html'
      },
      "breadcrumbs":{
        templateUrl: MODULES_PREFIX + '/collection/breadcrumbs.tpl.html'
      }
    }
  });

});

/**
* SERVICES
*/
angular.module('module.collection').service('CurrentCollectionService', [function(){

  var self = this;

  var currentCollection = null;

  this.setCurrentCollection = function(collection){
    currentCollection = collection;
  };

  this.getCurrentCollection = function(){
    return currentCollection;
  };

}]);

/**
* CONTROLLER
*/
angular.module('module.collection').controller("CollectionController", [
  '$scope', '$q','$location', '$rootScope', '$state', 'i18nService', 'CollectionFetchService', 'CurrentCollectionService', 'EntityFetchService', '$modal','EntityModel', 'ENTITY_TYPES', 'SPACE_ENUM', 'RATING_MAX', '$dialogs',
  function($scope, $q,  $location, $rootScope, $state, i18nService, CollectionFetchService, CurrentCollectionService, EntityFetchService, $modal, EntityModel, ENTITY_TYPES, SPACE_ENUM, RATING_MAX, $dialogs) {

    var self = this;
    var selectedCounter = 0;

    $scope.entityTypes = ENTITY_TYPES;
    $scope.spaceEnum = SPACE_ENUM;
    $scope.cumulatedTagsLoading;
		
  /**
  * This events are used to adjust body padding-top, required cause of a growing navbar (breadcrumbs)
  */
  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    $('#path').css('padding-top', parseInt($('#path').css("margin-top")) + parseInt($('#kb-navbar').css("height")) - 9);
  });

  $(window).resize(function() { 
    $('#path').css('padding-top', parseInt($('#path').css("margin-top")) + parseInt($('#kb-navbar').css("height")) - 9);
  }); 

  /**
  * TRANSLATION INJECTION
  */
  $scope.t = function(identifier){
    return i18nService.t(identifier);
  };

  /**
  * METHODS
  */

  $scope.transitionToHome = function(){
    $state.go('app.collection.content');
  }

  $scope.activateCumulatedTagsLoadingIndicator = function(){
    $scope.cumulatedTagsLoading = true;
  };

  $scope.deactivateCumulatedTagsLoadingIndicator = function(){
    $scope.cumulatedTagsLoading = false;
  };

  $scope.loadCurrentCollection = function(coll){

    $rootScope.activateLoadingIndicator();
    $scope.activateCumulatedTagsLoadingIndicator();
    
    var defer = $q.defer();

    if(coll === 'root'){
      $scope.loadRootCollection(defer);
    }else{
      self.loadCollectionByUri(coll, defer);
    }

    return defer.promise;
  }; 

  $scope.loadRootCollection = function(defer){

    var promise = CollectionFetchService.getRootCollection();

    promise.then(function(model){
      $rootScope.deactivateLoadingIndicator();
      self.renderCollectionContent(model);
      $state.transitionTo('app.collection.content', { coll: model.uriPathnameHash});
      defer.resolve();
    },function(error){
      console.log(error);
    });
  };

  this.loadCollectionByUri = function(coll, defer){

    var promise = CollectionFetchService.getCollectionByUri(coll);

    promise.then(function(model){
      $rootScope.deactivateLoadingIndicator()
      self.renderCollectionContent(model);  
      defer.resolve();
    },function(error){
     console.log(error);
   });

  };

  this.renderCollectionContent = function(collection){
    $scope.collectionRating = collection.overallRating.score;
    CurrentCollectionService.setCurrentCollection(collection); 
    $scope.currentCollection = CurrentCollectionService.getCurrentCollection();
    this.getCumulatedTagsOfCurrentCollection();
    $rootScope.$broadcast("currCollLoaded");
  };

  $scope.selectResource = function(entry){

    if(entry.isSelected){
      entry.isSelected = false;
      selectedCounter--;
    } else {
      entry.isSelected = true;
      selectedCounter++;
    }

    if(selectedCounter <= 0){
      $scope.resourcesSelected = false;
    }else{
      $scope.resourcesSelected = true;
    }
  };

  var resetSelectCounter = function(){
    selectedCounter = 0;
    $scope.resourcesSelected = false;
  };

  $scope.handleEntryClick = function(entry){

    if(entry.isCollection()){
      $scope.openCollection(entry.uriPathnameHash);
    }else{
      $state.transitionTo('app.collection.entry', { coll: CurrentCollectionService.getCurrentCollection().uriPathnameHash, entry:entry.uriPathnameHash});
    }
    
  };

  $scope.clickEventloadRootCollection = function(){
    $rootScope.activateLoadingIndicator();
    var defer = $q.defer();
    $scope.loadRootCollection(defer);
  }

  $scope.openCollection = function(uriPathnameHash){
    $state.transitionTo('app.collection.content', { coll: uriPathnameHash});
  };

  $scope.loadCurrentEntity = function(event, entryUri, parentCollectionUri){

    event.then(function(){

      var entry = CurrentCollectionService.getCurrentCollection().getEntryByUriPathnameHash(entryUri);

      if(entry != null){

        var promise = EntityFetchService.getEntityByUri(entry.id, true, true, true);

        promise.then(
          function(entity){
            entity.init({parentColl:CurrentCollectionService.getCurrentCollection()});
            self.openEntryDetailView(entity, $scope);
          },
          function(error){
            console.log(error);
          } 
          );

      }else{
        //TODO
        //404 error page
      }

    });    
  };

  this.openEntryDetailView = function(entry, scope){
    var dialog = $dialogs.entryDetail(entry);

    dialog.result.finally(function(btn){      
      $state.transitionTo('app.collection.content', { coll: CurrentCollectionService.getCurrentCollection().uriPathnameHash});
    });
  };

  $scope.closeModal = function(){
    $scope.modal.close(true);
    $state.transitionTo('app.collection.content', { coll: CurrentCollectionService.getCurrentCollection().uriPathnameHash});
  };

  $scope.leaveCurrentCollectionRating = function(rating){

    if(rating != CurrentCollectionService.getCurrentCollection().overallRating.score && rating <= RATING_MAX && rating > 0 && !$scope.ratingReadOnly)
    {
     $scope.ratingReadOnly = true;
     var promise = CurrentCollectionService.getCurrentCollection().saveRating(rating);
     promise.then(function(result){
      $scope.collectionRating = result.overallRating.score;
      $scope.ratingReadOnly = false;
    });
   }
 };

 $scope.deleteCollectionEntries = function(){

  var toDelete = new Array();
  var toDeleteKeys = new Array();

  var entries = CurrentCollectionService.getCurrentCollection().entries;

  angular.forEach(entries, function(entry, key){
    if(entry.isSelected){
      toDelete.push(entry.id);
      toDeleteKeys.push(key);
    }
  });

  var promise = CurrentCollectionService.getCurrentCollection().deleteEntries(toDelete, toDeleteKeys);
  promise.then(function(result){
    resetSelectCounter()
  });
 };

  $scope.openAddResourceWizzard = function(){
    $dialogs.addResourceWizzard();
  };

  $scope.setCollPublic = function(){
    CurrentCollectionService.getCurrentCollection().setCollPublic();
  };

  this.getCumulatedTagsOfCurrentCollection = function(){
    var promise = CurrentCollectionService.getCurrentCollection().getCumulatedTags();
    promise.then(function(){
      $scope.deactivateCumulatedTagsLoadingIndicator();
    });
  };

  $scope.tagSearchClicked = function(tag){
    $state.go('app.search.tag', { tag: tag});
  };

}]);  

angular.module('module.collection').controller("AddResourceController", [ '$scope', '$http', '$location','i18nService', 'CurrentCollectionService', 'SPACE_ENUM', function($scope, $http, $location, i18nService, CurrentCollectionService, SPACE_ENUM){

  $scope.newColl = {shared:false, private:true};
  $scope.currentCollection = CurrentCollectionService.getCurrentCollection();
  $scope.SPACE_ENUM = SPACE_ENUM;

  $scope.createCollection = function(coll,closeWizzardFnc){

   if(coll.label == undefined){
    return;
  }

  var promise = CurrentCollectionService.getCurrentCollection().createCollection(coll.label);
  promise.then(function(result){
    //nothing to do
  },function(error){
    console.log(error);
  });

  closeWizzardFnc();
};

  //checkbox -> radiobutton hack ... damn angular
  $scope.privateClicked = function(){
    if($scope.newColl.private){
      $scope.newColl.shared = true;
    }else{
      $scope.newColl.shared = false;
    }
  };

  $scope.sharedClicked = function(){
    if($scope.newColl.shared){
      $scope.newColl.private = true;
    }else{
      $scope.newColl.private = false;
    }
  };

  $scope.createLink = function(link,closeWizzardFnc){
    if(link.label == undefined || link.url == undefined)
    {
      return;
    }


    var promise = CurrentCollectionService.getCurrentCollection().createLink(link.label, link.url);
    promise.then(function(result){
      //nothing to do
    },function(error){
      console.log(error);
    });

    closeWizzardFnc();

  };

}]);

angular.module('module.collection').controller("UploadController", ['$q', '$scope', '$http', '$location', '$state', 'i18nService', 'CurrentCollectionService',  'UriToolbox', function($q, $scope, $http, $location, $state, i18nService, CurrentCollectionService, UriToolbox){

  var self = this;

  /**
  * TRANSLATION INJECTION
  */
  $scope.t = function(identifier){
    return i18nService.t(identifier);
  }

  /**
  * METHODS
  */
  $scope.filesArray = [];

  $scope.showUploadWidget = function(){
    if($scope.filesArray.length > 0){
      return true;
    }else{
      return false;
    }
  }

  $scope.resetUploader = function(){
    $scope.filesArray = [];
  }

  $scope.appendFileListToUploadList = function(fileList){
    angular.forEach(fileList, function(file, key){
      file.isFile = true;
      $scope.appendFileToUploadList(file);
    });
    $scope.$apply();
  };

  $scope.appendFileToUploadList = function(file){
    file.uploaded = false;
    file.uploading = false; 
    $scope.filesArray.unshift(file); 
    $scope.$apply();
  };

  $scope.getFileSizeString = function(size){
    var mb = ((size/1024)/1024);

    if(mb < 0.01){
      mb = (size/1024);
      return mb.toFixed(2)+" KB";
    }    

    return mb.toFixed(2)+" MB";
  };

  $scope.removeFromUploadList = function(index){
    $scope.filesArray.splice(index,1);   
  };

  $scope.uploadAllFiles = function(){

    var currColl = CurrentCollectionService.getCurrentCollection();

    var entries = [];
    var labels = [];
    var uploadCounter = 0;
    var fileCount = $scope.filesArray.length;

    var newEntrieObjects = [];

    var defer = $q.defer();

    angular.forEach($scope.filesArray, function(file, key){

      if(file.isFile && !file.uploaded){
        file.uploading = true;

        currColl.uploadFile(file).then(
          function(entry){
            file.uploading = false;
            file.uploaded = true;
            file.uriPathnameHash = UriToolbox.extractUriPathnameHash(entry.id);
            entries.push(entry.id);
            labels.push(entry.label);
            uploadCounter++;
            newEntrieObjects.push(entry);

            if(uploadCounter == fileCount){
              defer.resolve();
            }
          },
          function(error){
            console.log(error);
          });

      }
    });

    defer.promise.then(
      function(){
        currColl.addEntries(entries, labels).then(
          function(result){
            angular.forEach(newEntrieObjects, function(newEntry, key){
              currColl.entries.push(newEntry);
            }); 
          },
          function(error){console.log(error);}
          );
      });

  };

  $scope.openEntry = function(indexOfFileArray){
    if($scope.filesArray[indexOfFileArray].uploaded){
     var hash = $scope.filesArray[indexOfFileArray].uriPathnameHash;
     $state.transitionTo('app.collection.entry', { coll: CurrentCollectionService.getCurrentCollection().uriPathnameHash, entry:hash});
   }      
 };

  /**
  * FILE DROP-ZONE EVENTS
  */
  var dropZone = $('.upload-drop-container');

  dropZone.bind('dragover', function(e) {
   e.stopPropagation();
   e.preventDefault();
   e.originalEvent.dataTransfer.effectAllowed = 'copy';
 });

  dropZone.bind('dragenter', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.originalEvent.dataTransfer.effectAllowed = 'copy';
  });

  dropZone.bind('drop', function(e){
    e.stopPropagation();
    e.preventDefault();

    angular.forEach(e.originalEvent.dataTransfer.files, function(file, key){
      try
      {
        var entry = e.originalEvent.dataTransfer.items[key].webkitGetAsEntry() || e.originalEvent.dataTransfer.items[key].getAsEntry();
        if (entry.isFile) {
          file.isFile = true;
          file.uploading = false;
          file.uploaded = false;
          $scope.appendFileToUploadList(file);
        } else if (entry.isDirectory) {
          file.isFile = false;
          $scope.appendFileToUploadList(file);
        }

      }
      catch(error)
      {
        console.log("Problem while drag & drop. probably no file-api. ERROR: "+error);
      }

    });
  });
}]);