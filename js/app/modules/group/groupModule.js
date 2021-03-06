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
angular.module('module.group',['module.entity']);

/**
* CONFIG
*/
angular.module('module.group').config(function($stateProvider) {


    $stateProvider.state('app.group', {
         url:'/group/*groupId',
        abstract:true,
        controller: 'GroupController',
        templateUrl: MODULES_PREFIX + '/group/groupProfile.tpl.html'
    });

    $stateProvider.state('app.group.members', {
        url: '/members',
        templateUrl: MODULES_PREFIX + '/group/members.tpl.html',
        controller: "MembersController"
    });

    $stateProvider.state('app.group.entities', {
        url: '/entities',
        templateUrl: MODULES_PREFIX + '/group/entities.tpl.html',
        controller: "EntitiesController"
    });
    
    $stateProvider.state('app.group.activities', {
        url: '/activities',
        templateUrl: MODULES_PREFIX + '/group/activities.tpl.html',
        controller: "GroupActivitiesController"
    });
});

/**
* CONTROLLER
*/

angular.module('module.group').controller("newGroupController", ['$scope', '$q', '$dialogs', 'UserFetchService', 'GroupFetchService', 'ENTITY_TYPES', 'EntityModel', 'UserService', function($scope, $q, $dialogs, UserFetchService, GroupFetchService, ENTITY_TYPES, Entity, UserSrv){
    
    $scope.user = UserSrv.getUser();

    $scope.group = {name: "", desc: ""};
    
    $scope.uploadPic = function() {
        console.log("TODO: Upload profile picture");
      //TODO:Upload profile picture
    };
    
    $scope.addMembers = function() {

        $scope.enterState("members");
    };
    
    $scope.addEntities = function() {
        $scope.enterState("choose");   
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
        //TODO: Go to user's profile (?)
    };
    
    $scope.createGroup = function() {
        var userUrls = []; 
        var entityUrls = [];
        
        var promises = [];
        
        for(var i=0; i < $scope.entities.length; i++) {
            
            if($scope.entities[i].uploaded == false && $scope.entities[i].type == ENTITY_TYPES.file) {
                var file = $scope.entities[i];
                promises.push(file.uploadFile());
            } 
            else if($scope.entities[i].type == ENTITY_TYPES.link) {
                entityUrls.push($scope.entities[i].id);
            }
        }
        
        $q.all(promises).then(function(results) {
            
            for(var i=0; i < results.length; i++) {
                entityUrls.push(results[i].id);
            }
            
            for(var i=0; i < $scope.groupMembers.length; i++) {
                
                if($scope.groupMembers[i].isSelected) {
                    userUrls.push($scope.groupMembers[i].id);
                }
                
            }
            
            var promise = GroupFetchService.createGroup($scope.group.name, entityUrls, userUrls, $scope.group.desc);
            promise.then(function(result) {
                $scope.$apply();
                $scope.close();
            });
        });
        
        
    };
}]);

/*
angular.module('module.group').controller("addMembersController", ['$scope', '$rootScope', 'UserFetchService', function($scope, $rootScope, UserFetchService){
    
    if($scope.groupMembers.length == 0) {
        var promise = UserFetchService.getAllUsers();
        promise.then(function(result) {
            for(var i=0; i < result.users.length; i++) {
                $scope.groupMembers.push(result.users[i]);
            }
        });
    };
    
    $scope.handleEntryClick = function(entry) {
        console.log("TODO: Go to user's profile");
      //TODO: Go to user's profile (?)
    };
    
    $scope.selectResource = function(entry) {
        if(entry.isSelected) {
            entry.isSelected = false; 
        } else {
            entry.isSelected = true;
        }

    };
    
    $scope.back = function() {
       $scope.leaveState();
    };
}]);
*/

angular.module('module.group').controller("addEntitiesController", ['$scope', 'i18nService', function($scope, $modalInstance){
    
}]);

angular.module('module.group').controller("addLinkController", ['$scope', 'i18nService','EntityModel', 'ENTITY_TYPES', function($scope, i18nService, Entity, ENTITY_TYPES){
    $scope.createLink = function(link){
        if(link.label == undefined || link.url == undefined)
        {
          return;
        }
        
        var entity = new Entity();
        entity.label = link.label;
        entity.id = link.url;
        entity.type = ENTITY_TYPES.link;
        entity.uploaded = true;
        entity.isSelected = true;
        $scope.entities.push(entity);
        $scope.leaveState();
    };
}]);

angular.module('module.group').controller("EntityUploadController", ['$q', '$scope', '$http', '$location', '$state', 'i18nService', 'UriToolbox', 'EntityFetchService', 'EntityModel', function($q, $scope, $http, $location, $state, i18nService, UriToolbox, EntityFetchService, Entity){

    var self = this;
    
    $scope.filesArray = [];

    /**
    * TRANSLATION INJECTION
    */
    $scope.t = function(identifier){
      return i18nService.t(identifier);
    }

    /**
    * METHODS
    */

    $scope.showUploadWidget = function(){
      if($scope.filesArray.length > 0){
        return true;
      }else{
        return false;
      }
    }

    $scope.resetUploader = function(){
      $scope.entities = [];
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
    
    $scope.addFiles = function() {
        
        for(var i = 0; i < $scope.filesArray.length; i++) {
            
            var file = $scope.filesArray[i];
            
            var entity = new Entity();
            entity.label = file.name;
            entity.type = "file";
            entity.uploaded = false;
            entity.fileHandle = file;
            entity.isSelected = true;
            $scope.entities.push(entity);
        }
        $scope.gotoBaseState();
    };

    $scope.uploadAllFiles = function(){

      var entries = [];
      var labels = [];
      var uploadCounter = 0;
      var fileCount = $scope.filesArray.length;

      var newEntrieObjects = [];

      var defer = $q.defer();

      angular.forEach($scope.filesArray, function(file, key){

        if(file.isFile && !file.uploaded){
          file.uploading = true;

          EntityFetchService.uploadEntity(file).then(
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

angular.module('module.group').controller("GroupController", ['$scope', '$state', '$stateParams', 'GroupFetchService', function($scope, $state, $stateParams, GroupFetchService){
    
    $scope.groupId = $stateParams.groupId;
    $scope.groupName = "";
    $scope.groupDesc = "";
    
    $scope.memberIds = [];
    $scope.entityIds = [];
    
    var promise = GroupFetchService.getGroup($scope.groupId);
    
    promise.then(function(result) {
        
        var group = result.circle;
        
        $scope.groupName = group.label;
        $scope.groupDesc = group.description;
        $scope.memberIds = group.users;
        $scope.entityIds = group.entities;
    });
    
    $scope.tabs = 
        [
           { heading: "Activities", route:"app.group.activities", active:false },
           { heading: "Members", route:"app.group.members", active:false },
           { heading: "Resources", route:"app.group.entities", active:false },
        ];
    
    $scope.go = function(route){
        $state.go(route);
    };
 
    $scope.active = function(route){
        return $state.is(route);
    };
 
    $scope.$on("$stateChangeSuccess", function() {
        $scope.tabs.forEach(function(tab) {
            tab.active = $scope.active(tab.route);
        });
    });
}]);

angular.module('module.group').controller("MembersController", ['$scope', '$rootScope', '$state', '$dialogs', 'GroupFetchService', 'UserFetchService', 'UserModel', function($scope, $rootScope, $state, $dialogs, GroupFetchService, UserFetchService, User){
    
    $scope.groupMembers = [];
    
    var promise = GroupFetchService.getGroup($scope.groupId);
        
    promise.then(function(result) {
        
        var group = result.circle;
        
        var memberIds = group.users;
        for(var i=0; i < memberIds.length; i++) {
            var promise = UserFetchService.getUser(memberIds[i]);
            promise.then(function(result){
                var user = new User();
                user.id = result.desc.entity;
                user.label = result.desc.label;
                $scope.groupMembers.push(user);
            });
        }
    });
    
    $scope.handleEntryClick = function(entry) {
        if(entry.type == "user") {
            $state.go("app.social.groups", {profileId: entry.id});
        }
    };
    
    $scope.addMember = function() {

        var states = {
                "members": MODULES_PREFIX+"/group/addMembers.tpl.html",
        };
        
        var ctrlFunction = function($scope) {
            $scope.groupMembers = [];
        };
        
        $dialogs.newModal(states, ctrlFunction, "modal-huge").result.then(function (result) {
             
            var userUrls = [];
            
            for(var i=0; i < result.length; i++) {
                if(result[i].isSelected) {
                    userUrls.push(result[i].id);
                } 
             }
             var promise = GroupFetchService.addMembersToGroup(userUrls, $scope.groupId);
             
             promise.then(function(result) {
                 //$rootScope.$apply();
             });
        });
    }
}]);

angular.module('module.group').controller("EntitiesController", ['$scope', '$q', '$dialogs', 'GroupFetchService', 'EntityFetchService', 'ENTITY_TYPES', function($scope, $q, $dialogs, GroupFetchService, EntityFetchService, ENTITY_TYPES){
    
    $scope.entities = [];
    
    var promise = GroupFetchService.getGroup($scope.groupId);
        
    promise.then(function(result) {
        
        var group = result.circle;
        var entityIds = group.entities;
        for(var i=0; i < entityIds.length; i++) {
            var promise = EntityFetchService.getEntityByUri(entityIds[i], false, false, false);
            promise.then(function(result){
                $scope.entities.push(result);
            });
        }
    });
    
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
}]);

angular.module('module.group').controller("GroupActivitiesController", ['$scope', 'Activity', 'ActivityFetchService', function($scope, Activity, ActivityFetchService){

    
    promise.then(function(result) {
        
        for(var i = 0; i < result.activities.length; i++) {
            var act = result.activities[i];
            
            var activity = new Activity(act.author, act.type, act.creationTime, act.entities, act.users);
            $scope.activities.unshift(activity);
        }
    });
}]);


