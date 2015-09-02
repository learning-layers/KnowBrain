angular.module('module.group').service("GroupFetchService", ['$q','UserService', 'EntityModel', 'ENTITY_TYPES', 'Activity', function($q, UserSrv, EntityModel, ENTITY_TYPES, Activity){
    
    this.getGroup = function(groupId) {
        var defer = $q.defer();
        var self = this;

        new SSCircleGetFiltered(
            function(result) {
                var entities = [];
                
                if(
                  result.circle &&
                  result.circle.entities){
              
                  for (var i=0; i < result.circle.entities.length; i++) {
                      var entity = new EntityModel();
                      entity.init({id:result.circle.entities[i].id});
                      entity.init({type:result.circle.entities[i].type});
                      entity.init({label:result.circle.entities[i].label});
                      entity.init({tags:result.circle.entities[i].tags});
                      entity.init({overallRating:result.circle.entities[i].overallRating});
                      entity.init({creationTime:result.circle.entities[i].creationTime});
                      entity.init({author:result.circle.entities[i].author});

                      if(entity.type == ENTITY_TYPES.file) {
                          entity.mimeType = result.circle.entities[i].mimeType;
                          entity.fileExtension = result.circle.entities[i].fileExt;
                          if (result.circle.entities[i].mimeType.indexOf('/') > 0) {
                              entity.fileType = result.circle.entities[i].mimeType.substr(0, result.circle.entities[i].mimeType.indexOf('/'));
                          } else {
                              entity.fileType = result.circle.entities[i].mimeType;
                          }
                      }
                      entities.push(entity);
                  }
                  
                  result.circle.entities = entities;
                }
                
                defer.resolve(result);
            },
            function(error){
                console.log(error);
            },
            UserSrv.getKey(),
            groupId,
            ['entity', 'coll', 'disc', 'qa', 'chat', 'file'], //entityTypesToIncludeOnly
            true, 				//includeTags
            "circleSpace"		//tag-circle
        );
       return defer.promise;
    };
    

    this.getUserGroups = function(user) {
        var defer = $q.defer();
        var self = this;

        new SSCirclesFilteredGet(
            function(result){
                defer.resolve(result);
            },
            function(error){
                console.log(error);
            },
            UserSrv.getKey(),
            ['uploadedFile'],
            true
//            user // TODO pmarton: user always undefined here
        );
       return defer.promise;
    };
    
    this.createGroup = function(groupName, entities, users, description) {
        var defer = $q.defer();
        var self = this;

        new SSCircleCreate(
            function(result){
                defer.resolve(result);
            },
            function(error){
                console.log(error);
            },
            UserSrv.getKey(),
            groupName,
            entities,
            users,
            description
        );

        return defer.promise;        
    };

    this.editCircle = function(label, description, circle) {
        var defer = $q.defer();
        var self = this;

        new SSEntityUpdate(
        function(result){
          circle.label = label;
          circle.description = description;
          defer.resolve(circle); 
        },
        function(error){
          defer.reject(error); 
        },
        UserSrv.getKey(),
        circle.id,    //entity, 
        label,        //label, 
        description, //description
        null); //read

        return defer.promise;        
    };
    
    this.addMembersToGroup = function(users, group) {
        var defer = $q.defer();
        var self = this;
        
        new SSCircleUsersAdd(
            function(result) {
                defer.resolve(result);
            },
            function(error) {
                console.log(error);
            },
            UserSrv.getKey(),
            group,
            users
        );
        return defer.promise;
    };
    
    this.removeMembersFromGroup = function(users, group) {
        var defer = $q.defer();
        var self = this;
        
        new SSCircleUsersRemove(
            function(result) {
                defer.resolve(result);
            },
            function(error) {
                console.log(error);
            },
            UserSrv.getKey(),
            group,
            users
        );
        return defer.promise;
    };
    
    this.removeCircle = function(circle) {
        var defer = $q.defer();
        var self = this;
        
        new SSCircleRemove(
            function(result) {
                defer.resolve(result);
            },
            function(error) {
                console.log(error);
            },
            UserSrv.getKey(),
            circle
        );
        return defer.promise;
    };
    
    this.mergeCircle = function(circle, targetCircle /* for merge */, circleUsers /* for split */) {
        var defer = $q.defer();
        var self = this;
        var includeUsers = false;
        if (targetCircle != null) {
        	includeUsers = true;
        }
        var appendUserName = !includeUsers;
        
        new SSEntityCopy(
            function(result) {
                defer.resolve(result);
            },
            function(error) {
                console.log(error);
            },
            UserSrv.getKey(),
            circle,							// entity
            targetCircle,					// targetEntity
            circleUsers,					// forUsers
            null,							// label
            includeUsers,					// includeUsers (merge: true / split: false)
            true,							// includeEntities
            true,							// includeMetaSpecificToEntityAndItsEntities
            true,							// include caller
            null,							// entitiesToExclude
            null,							// comment
            appendUserName					// appendUserName (merge: false / split: true)
        );
        return defer.promise;
    };   
    
    this.addEntitiesToGroup = function(entities, group, tags, categories) {
        var defer = $q.defer();
        var self = this;
        
        new SSCircleEntitiesAdd(
            function(result) {
                defer.resolve(result);
            },
            function(error) {
                console.log(error);
            },
            UserSrv.getKey(),
            group,
            entities, 
            tags, //tags 
            categories //categories
        );
        
        return defer.promise;
    };

    this.removeEntitiesFromGroup = function(entities, group) {
        var defer = $q.defer();
        var self = this;
        
        new SSCircleEntitiesRemove(
            function(result) {
                defer.resolve(result);
            },
            function(error) {
                console.log(error);
            },
            UserSrv.getKey(),
            group,
            entities,
            true //removeCircleSpecificMetadata
        );
        
        return defer.promise;
    };

    this.getActivities = function(circle) {
        var defer = $q.defer();
        var self = this;
        
        new SSActivitiesGetFiltered(
            function(result) {
                var activities = [];
                for(var i = 0; i < result.activities.length; i++) {
                    var act = result.activities[i];
            

                    var entities = [];
                    for (var j=0; j < act.entities.length; j++) {
                        var entity = new EntityModel();
                        entity.init({id:act.entities[j].id});
                        entity.init({type:act.entities[j].type});
                        entity.init({label:act.entities[j].label});
                        entity.init({tags:act.entities[j].tags});
                        entity.init({overallRating:act.entities[j].overallRating});
                        entity.init({creationTime:act.entities[j].creationTime});
                        entity.init({author:act.entities[j].author});

                        if(entity.type == ENTITY_TYPES.file) {
                            entity.mimeType = result.mimeType;
                            entity.fileExtension = result.fileExt;
                            if (act.entities[j].mimeType.indexOf('/') > 0) {
                                entity.fileType = act.entities[j].mimeType.substr(0, act.entities[j].mimeType.indexOf('/'));
                            } else {
                                entity.fileType = act.entities[j].mimeType;
                            }
                        }
                        entities.push(entity);
                    }

                    var activity = new Activity(act.author, act.activityType, act.creationTime, entities, act.users);
                    activities.push(activity);
                }


                defer.resolve(activities);
            },
            function(error) {
                console.log(error);
            },
            UserSrv.getKey(),
            null, //types
            null, //users
            null, //entities
            [circle], //circles
            null, //startTime
            null, //endTime
            true //includeOnlyLastActivities
        );
      
        return defer.promise;
    };

}]);