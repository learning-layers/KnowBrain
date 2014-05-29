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
* MODELS MODULE 
*/
angular.module('module.models',[]);

angular.module('module.models').constant('SPACE_ENUM', {private:'privateSpace', shared:'sharedSpace', follow:'followSpace'});
angular.module('module.models').constant('ENTITY_TYPES', {collection:'coll', file:'file', link:'entity'});
angular.module('module.models').constant('RATING_MAX', 5);

angular.module('module.models').factory('BaseModel', ['$q', '$rootScope', 'UserService', 'FetchServiceHelper', "SPACE_ENUM", function($q, $rootScope, UserSrv, FetchServiceHelper, SPACE_ENUM){

  function Model(){};

  Model.prototype = {
    init : function(configuration){
      
      var initialConfiguration = configuration || {};
      
      for(var config in initialConfiguration){  
        this[config] = initialConfiguration[config];
        
        //TODO dtheiler: replace this when differentiation between shared and public is possible in KnowBrain
        if(config === sSVarU.circleTypes){
          
          this[sSVarU.space] = sSColl.getCollSpace(initialConfiguration[config]);
          
          if(this[sSVarU.space] === SPACE_ENUM.follow){
            this[sSVarU.space] = SPACE_ENUM.shared;
          }
        }
      }
    },
    saveLabel: function(newLabel){

      var defer = $q.defer();
      var self = this;

      new SSEntityLabelSet(
        function(result){
          self.label = newLabel;
          defer.resolve(result); 
          $rootScope.$apply();
        },
        function(error){
          defer.reject(error); 
          $rootScope.$apply();
        },
        UserSrv.getUserUri(),
        UserSrv.getKey(),
        self.uri,
        newLabel
        );

      return defer.promise;
    },
    saveRating: function(rating){
      var defer = $q.defer();
      var self = this;

      new SSRatingSet(
        function(result){
          if(result.worked){
            var promise = FetchServiceHelper.getEntityDescribtion(self, true, true, true);
            promise.then(
              function(result){
                defer.resolve(self); 
                FetchServiceHelper.applyHelper();
              },
              function(error){
                console.log(error);
              });
          }
        },
        function(error){
          console.log(error);
          $rootScope.$apply();
        },
        UserSrv.getUserUri(),
        UserSrv.getKey(),
        self.uri,
        rating
        );

      return defer.promise;
    },
    addTag: function(tagString){
      var defer = $q.defer();
      var self = this;

      new SSTagAdd(
        function(result){
          defer.resolve(result); 
          $rootScope.$apply();
        },
        function(error){
          defer.reject(error); 
          $rootScope.$apply();
        }, 
        UserSrv.getUserUri(),
        UserSrv.getKey(),
        self.uri, 
        tagString, 
        self.space
        );

      return defer.promise;
    },
    removeTag: function(tagString){
      var defer = $q.defer();
      var self = this;

      new SSTagsRemove(
        function(result){
          defer.resolve(result); 
          $rootScope.$apply();
        },
        function(error){
          defer.reject(error); 
          $rootScope.$apply();
        }, 
        UserSrv.getUserUri(),
        UserSrv.getKey(),
        self.uri, 
        tagString, 
        self.space
        );
      return defer.promise;
    },
    addComment: function(commentText){
      var defer = $q.defer();
      var self = this;
      var addNewDisc = true;
      var target = null;
      var discType   = "disc";
      var discLabel  = "newDisc";

      if(this.disc != null){
        addNewDisc = false;
        target     = this.disc.uri;
      }else{
        self.disc = {uri:null,entries: new Array()};
      }     

      new SSDiscEntryAdd(
        function(result){ 

          var newComment = {
            content: commentText,
            author: UserSrv.getUserUri(), //TODO
            timestamp: new Date().getTime(),
            uri: result.discEntry,
          };

          self.disc.entries.push(newComment);

          if(addNewDisc){
            self.disc.uri = result.disc;
          }

          defer.resolve(newComment); 
          $rootScope.$apply();
        },
        function(error){ console.log(error); },
        UserSrv.getUserUri(),
        UserSrv.getKey(),
        target,
        self.uri,
        commentText,
        addNewDisc,
        discType,
        discLabel
        );

      return defer.promise;
    },
    uri: "",
    uriPathnameHash: "",
    overallRating: {score: 0, frequency: 0},
    tags: null,
    disc: null
  };

  return ( Model );

}]);

/**
* MODELS
*/
angular.module('module.models').factory('CollectionModel', ['$q', '$rootScope','UserService', 'BaseModel', 'EntityModel', 'UriToolbox', 'SPACE_ENUM', 'ENTITY_TYPES', 'TagCloudToolbox', function($q, $rootScope, UserSrv, BaseModel, EntityModel, UriToolbox, SPACE_ENUM, ENTITY_TYPES, TagCloudToolbox){

  function Collection(){
    this.entries = [];
    this.author = '';
    this.label = '';
    this.circleTypes = [];
    this.space = SPACE_ENUM.private;
    this.parentColl = null;
    this.isRoot = false;
    this.collHierarchy = [];
    this.cumulatedTags = [];
  }    

  Collection.prototype = Object.create(BaseModel.prototype);
  Collection.prototype.constructor = Collection;

  Collection.prototype.init = function(configuration){
    BaseModel.prototype.init.call(this, configuration);
  };

  Collection.prototype.saveLabel = function(newLabel){
    BaseModel.prototype.saveLabel.call(this, newLabel);
  };

  Collection.prototype.createCollection = function(label){
    var defer = $q.defer();
    var self = this;

    new SSCollEntryAdd(
      function(result){

        var entry = new EntityModel();

        entry.init({uri:result.uri, label:label, parentColl: this, space: self.space, entityType: ENTITY_TYPES.collection});
        entry.init({uriPathnameHash: UriToolbox.extractUriPathnameHash(result.uri)});

        self.entries.push(entry);

        defer.resolve(entry); 
        $rootScope.$apply();
      },
      function(error){
        defer.reject(error);
        $rootScope.$apply();
      },
      UserSrv.getUserUri(),
      UserSrv.getKey(),
      this.uri,
      null,
      label,
      true
      );

    return defer.promise;
  };

  Collection.prototype.getHierarchy = function(){
    var defer = $q.defer();
    var self = this;

    new SSCollHierarchyGet(
      function(result){
        defer.resolve(result); 
        $rootScope.$apply();
      },
      function(error){
        defer.reject(error);
        $rootScope.$apply();
      },
      UserSrv.getUserUri(),
      UserSrv.getKey(),
      this.uri
      );

    return defer.promise;
  }

  Collection.prototype.uploadFile = function(file){
    var defer = $q.defer();
    var self = this;

    new SSFileUpload(
      function(parentUri,fileUri,fileName){
        var entry = new EntityModel();

        entry.init({uri:fileUri, label:fileName, parentColl: parentUri, space: self.space, entityType: ENTITY_TYPES.file});
        entry.init({uriPathnameHash: UriToolbox.extractUriPathnameHash(fileUri)});

        defer.resolve(entry); 
        $rootScope.$apply();
      },
      function(error){
        defer.reject(error);
        $rootScope.$apply();
      },
      UserSrv.getUserUri(),
      UserSrv.getKey(),
      file,
      this.uri
      );

    return defer.promise;
  };

  Collection.prototype.addEntries = function(entries, entryLabels){

    var defer = $q.defer();
    new SSCollEntriesAdd(
      function(result){
        defer.resolve(result); 
        $rootScope.$apply();
      },
      function(error){
        defer.reject(error);
        $rootScope.$apply();
      },
      UserSrv.getUserUri(),
      UserSrv.getKey(),
      this.uri,
      entries,
      entryLabels
      );

    return defer.promise;

  };

  Collection.prototype.createLink = function(label, url){
    var defer = $q.defer();
    var self = this;
    
    new SSCollEntryAdd(
      function(result){
        var link = new EntityModel();
        link.init({label:label, uri:url, entityType: ENTITY_TYPES.link});
        link.init({uriPathnameHash: UriToolbox.extractUriHostPartWithoutProtocol(url)});
        self.entries.push(link);

        defer.resolve(result); 
        $rootScope.$apply();
      },
      function(error){
        defer.reject(error);
        $rootScope.$apply();
      },
      UserSrv.getUserUri(),
      UserSrv.getKey(),
      this.uri,
      url,
      label,
      false
      );

    return defer.promise;
  };

  Collection.prototype.deleteEntries = function(collEntries, collEntryKeys){

    var defer = $q.defer();
    var self = this;

    new SSCollEntriesDelete(
      function(result){
        
        if(result.worked){
          for (var i = collEntryKeys.length -1; i >= 0; i--){
            self.entries.splice(collEntryKeys[i],1);  
          }         
        }
       $rootScope.$apply();
       defer.resolve(result);
     }, 
     function(error){ console.log(error); }, 
     UserSrv.getUserUri(),
     UserSrv.getKey(), 
     self.uri, 
     collEntries
     );

    return defer.promise;
  };

  Collection.prototype.getEntryByUriPathnameHash = function(uriPathnameHash){

    var ret = null;

    angular.forEach(this.entries, function(entry, key){
      if(entry.uriPathnameHash === uriPathnameHash){
        ret = entry;
      }
    });

    return ret;
  };

  Collection.prototype.setCollPublic = function(){

    var self = this;

    new SSEntityPublicSet(
      function(result){
        if(result.worked){
          self.space = SPACE_ENUM.shared;
          $rootScope.$apply();
        }
      },
      function(error){
        console.log(error);
      },
      UserSrv.getUserUri(),
      UserSrv.getKey(),
      this.uri
      );

  };

  Collection.prototype.getCumulatedTags = function(model){

    var defer = $q.defer();
    var self = this;

    new SSCollCumulatedTagsGet(
      function(result){ 
        self.cumulatedTags = TagCloudToolbox.getWeightedTagsFromTagFrequencies(result.tagFrequs);
        defer.resolve();
        $rootScope.$apply();
      },
      function(error){ defer.reject(error); },
      UserSrv.getUserUri(),
      UserSrv.getKey(),
      this.uri
      );

    return defer.promise;

  };

  return (Collection);

}]);

angular.module('module.models').factory('EntityModel', ['$q', '$rootScope','UserService', 'BaseModel', 'SPACE_ENUM', 'ENTITY_TYPES', function($q, $rootScope, UserSrv, BaseModel, SPACE_ENUM, ENTITY_TYPES){

  function Entity(){
    this.parentColl = null;
    this.author = null;
    this.label = null;
    this.space = SPACE_ENUM.private;
    this.entityType = null;
    this.pos = null;
    this.mimeType = null;

    this.servHandleFileDownload = function(defer){
      var self = this;

      return function(fileAsBlob){

        var a = document.createElement("a");

        if(jSGlobals.endsWith(self.label, "." + self.mimeType)){
          a.download    = self.label;
        }else{
          a.download    = self.label + "." + self.mimeType;  
        }

        a.href        = window.URL.createObjectURL(fileAsBlob);
        a.textContent = jSGlobals.download;

        a.click();
        defer.resolve();
      };
    }
  }


  Entity.prototype = Object.create(BaseModel.prototype);
  Entity.prototype.constructor = Entity;

  Entity.prototype.init = function(configuration){
    BaseModel.prototype.init.call(this, configuration);
  };

  Entity.prototype.saveLabel = function(newLabel){
    BaseModel.prototype.saveLabel.call(this, newLabel);
  };

  Entity.prototype.isCollection = function(){
    if(this.entityType == ENTITY_TYPES.collection)
      return true;
    else
      return false;
  };

  Entity.prototype.downloadFile = function(){
    var defer = $q.defer();

    if(this.entityType != ENTITY_TYPES.file)
      return null;

    new SSFileDownload(
      this.servHandleFileDownload(defer),
      function(error){ defer.reject(); console.log(error); },
      UserSrv.getUserUri(),
      UserSrv.getKey(),
      this.uri
      );

    return defer.promise;
  };

  return (Entity);

}]);



/**
* SERVICES  
*/
angular.module('module.models').service("CollectionFetchService", ['$q', '$rootScope','UserService', 'CollectionModel', 'EntityModel', 'UriToolbox', 'SPACE_ENUM', 'FetchServiceHelper', 'ENTITY_TYPES', function($q, $rootScope, UserSrv, CollectionModel, EntityModel, UriToolbox, SPACE_ENUM, FetchServiceHelper, ENTITY_TYPES){

  var self = this;


  var initCollection = function(result){
   var model = new CollectionModel();
   model.init(result.coll);
   model.init({uriPathnameHash: UriToolbox.extractUriPathnameHash(model.uri)});

   var tmpEntries = [];

   angular.forEach(model.entries, function(entry, key){

    var entity = new EntityModel();
    entity.init(entry);
    entity.init({parentColl:model});

    if(entity.entityType == ENTITY_TYPES.link){
      entity.uriPathnameHash = UriToolbox.extractUriHostPartWithoutProtocol(entry.uri);
    }else{
      entity.uriPathnameHash =  UriToolbox.extractUriPathnameHash(entry.uri);
    }

    tmpEntries.push(entity);
  });

   model.entries = tmpEntries;

   return model;
 };

 var getHierarchy = function(model,defer){
  model.getHierarchy().then(
    function(result){

      var hierarchy = [];

      angular.forEach(result.colls, function(coll, key){
        coll.uriPathnameHash =  UriToolbox.extractUriPathnameHash(coll.uri);
        hierarchy.push(coll);
      });

      if(hierarchy[0].uriPathnameHash == model.uriPathnameHash){
        model.isRoot = true;
      }

      model.collHierarchy = hierarchy.reverse();

      model.parentColl = model.collHierarchy[model.collHierarchy.length-1];

      defer.resolve(model); 
      FetchServiceHelper.applyHelper();
    },
    function(error){
      defer.reject(error);
      FetchServiceHelper.applyHelper();
    });
};

this.getRootCollection = function(){
  var defer = $q.defer();

  new SSCollRootGet(
    function(result){
      var model = initCollection(result);
      model.isRoot = true;

      FetchServiceHelper.getEntityDescribtion(model,true,true,true).then(
        function(result){
         defer.resolve(model);
       },
       function(error){
        defer.reject(error);
        $rootScope.$apply();
      }
      );
    },
    function(error){
      defer.reject(error);
      $rootScope.$apply();
    },
    UserSrv.getUserUri(),
    UserSrv.getKey()
    );

  return defer.promise;
};

this.getCollectionByUri = function(collUri){
  var defer = $q.defer();
  var self = this;

  new SSCollWithEntries(
    function(result){
      var model = initCollection(result);
      
      FetchServiceHelper.getEntityDescribtion(model,true,true,true).then(
        function(result){
          getHierarchy(model, defer);
        },
        function(error){
          defer.reject(error);
          $rootScope.$apply();
        }
        ); 
    },
    function(error){
      defer.reject(error);
      $rootScope.$apply();
    },
    UserSrv.getUserUri(),
    UserSrv.getKey(),
      UserSrv.getUserSpace()+"/coll/"+collUri //TODO
      );

  return defer.promise;     
};

}]);

angular.module('module.models').service("EntityFetchService", ['$q', '$rootScope','UserService', 'EntityModel', 'UriToolbox', 'ENTITY_TYPES', 'FetchServiceHelper', function($q, $rootScope, UserSrv, EntityModel, UriToolbox, ENTITY_TYPES, FetchServiceHelper){

 this.getEntityByUri = function(entityUri, getTags, getOverallRating, getDiscUris){
  var defer = $q.defer();

  new SSEntityDescGet(
    function(result){

      var result = result.entityDesc;

      var entity = new EntityModel();
      entity.init({uri:result.entityUri});
      entity.init({entityType:result.entityType});
      entity.init({label:result.label});
      entity.init({tags:result.tags});
      entity.init({overallRating:result.overallRating});
      entity.init({creationTime:result.creationTime});
      entity.init({author:result.author});

      if(entity.entityType == ENTITY_TYPES.file){

        var mimeType = jSGlobals.removeTrailingSlash(entity.uri);

        if(jSGlobals.lastIndexOf(mimeType, jSGlobals.dot) === -1){
          console.log("could not determine mime-type");
        }

        entity.mimeType = jSGlobals.substring(mimeType, jSGlobals.lastIndexOf(mimeType, jSGlobals.dot) + 1, jSGlobals.length(mimeType));

      }

      if(result.discs.length > 0){
        var discUri = result.discs[0];
        var promise = FetchServiceHelper.getDiscussionByUri(discUri);

        promise.then(function(result){
          entity.disc = result.disc;
          defer.resolve(entity);
          FetchServiceHelper.applyHelper();
        });

      }else{
        defer.resolve(entity);
        $rootScope.$apply();
      }

    },
    function(error){
      defer.reject(error);
      $rootScope.$apply();
    },
    UserSrv.getUserUri(),
    UserSrv.getKey(),
    entityUri,
    getTags,
    getOverallRating,
    getDiscUris
    );

return defer.promise;     
};

}]);

angular.module('module.models').service("FetchServiceHelper", ['$q', '$rootScope','UserService', 'UriToolbox', 'SPACE_ENUM', function($q, $rootScope, UserSrv, UriToolbox, SPACE_ENUM){

  this.getEntityDescribtion = function(model, getTags, getOverallRating, getDiscUris){

    var defer = $q.defer();
    var self = this;

    new SSEntityDescGet(
      function(result){

        var result = result.entityDesc;

        model.init({uri:result.entityUri});
        model.init({entityType:result.entityType});
        model.init({label:result.label});
        model.init({tags:result.tags});
        model.init({overallRating:result.overallRating});
        model.init({creationTime:result.creationTime});
        model.init({author:result.author});

        if(result.discs.length > 0){
          var discUri = result.discs[0];
          var promise = self.getDiscussionByUri(discUri);

          promise.then(function(result){
            model.disc = result.disc;
            defer.resolve(result);
            self.applyHelper();
          });

        }else{
          defer.resolve(result);
          self.applyHelper();
        }


      },
      function(error){
        defer.reject(error);
        self.applyHelper();
      },
      UserSrv.getUserUri(),
      UserSrv.getKey(),
      model.uri,
      getTags,
      getOverallRating,
      getDiscUris
      );

return defer.promise;
};

this.getDiscussionByUri = function(discUri){
  var defer = $q.defer();
  var self = this;

  new SSDiscWithEntriesGet(
    function(result){ defer.resolve(result); }, 
    function(error){ console.log(error); }, 
    UserSrv.getUserUri(),
    UserSrv.getKey(), 
    discUri
    );

  return defer.promise;
};

  //helper
  this.applyHelper = function(){
    if(!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  };

}]);  

angular.module('module.models').service("TagFetchService", ['$q', '$rootScope','UserService', 'SPACE_ENUM', function($q, $rootScope, UserSrv, SPACE_ENUM){

  this.fetchAllPublicTags = function(){
    var defer = $q.defer();
    var self = this;

    new SSTagFrequsGet(
      function(result){
        var tagArray = new Array();
        angular.forEach(result.tagFrequs, function(value, key){
          tagArray.push(value.label);
        });

        defer.resolve(tagArray);
      },
      function(error){
        console.log(error);
      },
      UserSrv.getUserUri(),
      UserSrv.getKey(), 
      null, 
      null, 
      SPACE_ENUM.private
      );

    return defer.promise;  
  };

  this.fetchTagsByName = function(queryString){
    var defer = $q.defer();
    var self = this;
    
    return defer.promise; 
  };

}]);

angular.module('module.models').service('UserModel', ['$q', '$rootScope','UserService', function($q, $rootScope, UserSrv) {

    console.log(UserSrv.getUserUri());
    console.log(UserSrv.getKey());

    this.getAllUsers = function() {

        var defer = $q.defer();
        var self = this;

        new SSUserAll(
            function(result){
                console.log("All users:");
                console.log(result);

                defer.resolve(result);
            },
            function(error){
                console.log(error);
            },
            UserSrv.getUserUri(),
            UserSrv.getKey()
        );

       return defer.promise;
    };

    this.getUserLabel = function(uri) {
        var defer = $q.defer();
        var self = this;

        return new getUserLabelFromUri(uri);
    };

}]);

angular.module('module.models').service("GroupFetchService", ['$q','UserService', function($q, UserSrv){
    this.getUserGroups = function() {
        var defer = $q.defer();
        var self = this;

        new SSEntityUserCirclesGet(function(result){
                defer.resolve(result);
            },
            function(error){
                console.log(error);
            },
            UserSrv.getUserUri(),
            UserSrv.getKey()
        );

        return defer.promise;
    };
    
    this.createGroup = function(groupName, entities, users) {
    	var defer = $q.defer();
        var self = this;
        
        console.log("Group name:");
        console.log(groupName);
        
        new SSEntityCircleCreate(function(result){
        	console.log("Group created");
                defer.resolve(result);
            },
            function(error){
                console.log(error);
            },
            UserSrv.getUserUri(),
            UserSrv.getKey(),
            groupName,
            entities,
            users
        );
        
        return defer.promise;
    };


}]);
