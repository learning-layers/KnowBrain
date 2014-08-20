'use strict';

angular.module('adapter', []);

angular.module('adapter').factory('CollectionData', function() {
    Logger.useDefaults();
    Logger.get("adapter").setLevel(Logger.DEBUG);
    Logger.get("adapter").debug("CollectionData", CollectionData);
    return CollectionData;//require('data/sss/CollectionData');
});
angular.module('adapter').factory('DataStore', ['CollectionData', 'UserService', function(CollectionData, UserSrv) {
    var vie = new VIE();
    
    var namespace = UserSrv.getUserSpace() + "/";
    var userParams = {};
    userParams.user = UserSrv.getUser();
    userParams.ueTrackUser = "";
    userParams.userKey = UserSrv.getKey();
        
    var sss = new SocialSemanticService(_.extend({
        'namespaces': {
            'sss': namespace
        }
    }, userParams));
    vie.namespaces.add('sssColl', namespace + 'coll/');
    vie.use(sss, 'sss');
    //v.namespaces.base(namespace);

    extender.syncByVIE(vie);

    CollectionData.init(vie);
    return vie;

}]);
