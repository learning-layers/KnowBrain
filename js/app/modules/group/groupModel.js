angular.module('module.group').service("GroupFetchService", ['$q','UserService', 'EntityModel', 'ENTITY_TYPES', function($q, UserSrv, EntityModel, ENTITY_TYPES){
    
    this.getGroup = function(groupId) {
        var defer = $q.defer();
        var self = this;

        new SSEntityCircleGet(
            function(result) {
                var entities = [];
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
                        entity.mimeType = result.mimeType;
                        entity.fileExtension = result.fileExt;
                        if (result.circle.entities[i].mimeType.indexOf('/') > 0) {
                            entity.fileType = result.circle.entities[i].mimeType.substr(0, result.circle.entities[i].mimeType.indexOf('/'));
                        } else {
                            entity.fileType = result.circle.entities[i].mimeType;
                        }
                    }
                    entities.push(entity);
                }
                result.circle.entities = entities;
                defer.resolve(result);
            },
            function(error){
                console.log(error);
            },
            UserSrv.getUser(),
            UserSrv.getKey(),
            groupId
        );
       return defer.promise;
    };
    

    this.getUserGroups = function(user) {
        var defer = $q.defer();
        var self = this;

        new SSEntityUserCirclesGet(
            function(result){
                defer.resolve(result);
            },
            function(error){
                console.log(error);
            },
            UserSrv.getUser(),
            UserSrv.getKey(),
            user
        );
       return defer.promise;
    };
    
    this.createGroup = function(groupName, entities, users, description) {
        var defer = $q.defer();
        var self = this;

        new SSEntityCircleCreate(
            function(result){
                defer.resolve(result);
            },
            function(error){
                console.log(error);
            },
            UserSrv.getUser(),
            UserSrv.getKey(),
            groupName,
            entities,
            users,
            description
        );

        return defer.promise;        
    };
    
    this.addMembersToGroup = function(users, group) {
        var defer = $q.defer();
        var self = this;
        
        new SSEntityUsersToCircleAdd(
            function(result) {
                defer.resolve(result);
            },
            function(error) {
                console.log(error);
            },
            UserSrv.getUser(),
            UserSrv.getKey(),
            group,
            users
        );
        return defer.promise;
    };
    
    this.addEntitiesToGroup = function(entities, group) {
        var defer = $q.defer();
        var self = this;
        
        new SSEntityEntitiesToCircleAdd(
            function(result) {
                defer.resolve(result);
            },
            function(error) {
                console.log(error);
            },
            UserSrv.getUser(),
            UserSrv.getKey(),
            group,
            entities
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
            UserSrv.getUser(),
            UserSrv.getKey(),
            group,
            entities
        );
        
        return defer.promise;
    };

}]);