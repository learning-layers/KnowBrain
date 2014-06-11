'use strict';

angular.module('adapter', []);

angular.module('adapter').factory('CollectionData', function() {
    Logger.useDefaults();
    Logger.get("adapter").setLevel(Logger.DEBUG);
    Logger.get("adapter").debug("CollectionData", CollectionData);
    return CollectionData;//require('data/sss/CollectionData');
});
angular.module('adapter').factory('DataStore', ['CollectionData', function(CollectionData) {
    var vie = new VIE();
    var space = "armin";
    var app = "kb";
    var username = "pjotr";
    
    var namespace = "http://"+space+"."+app+"/";
    var userParams = {};
    userParams.user = namespace + 'user/'+username;
    userParams.ueTrackUser = namespace + 'user/ue_track_'+username;
    userParams.userKey = "681V454J1P3H4W3B367BB79615U184N22356I3E";
        
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
