angular.module('module.group').service("GroupFetchService", ['$q','UserService', function($q, UserSrv){
    
    this.getGroup = function(groupId) {
        var defer = $q.defer();
        var self = this;

        new SSEntityCircleGet(
            function(result){
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

}]);