'use strict';

angular.module('data', []);

angular.module('data').factory('CollectionData', function() {
    // simply returns the global object CollectionData of app/data/sss/CollectionData.js
    // a better wrapping technique would be needed (eg. require.js)
    // or the full integration of the data modules into Angular's dependency system
    return CollectionData;
});
/**
 * DataStore module
 *
 * Wraps VIE.
 */
angular.module('data').factory('DataStore', ['CollectionData', 'UserService', function(CollectionData, UserSrv) {
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

angular.module('data').directive("vieMap", function() {
    var attr = "vieMap";
    var sep = " as ";
    var LOG = Logger.get('relDirective');
    return {
        restrict: 'A',
        priority: 1001,
        // parses a directive like "x[sss:y] as z"
        // or "x[sss:y] as [zz]" where zz should become an array
        // and maps a VIE entity in the scope to a plain object or array of objects
        link: function(scope, element, attrs ){
            var mapAsArray = function(value) {
                return value.indexOf('[') === 0 &&
                    value.indexOf(']') === value.length -1;
            };

            var map = attrs[attr].split(sep);
            var key_parts = map[0].split("[");
            
            // key corr. to "x"
            var key = key_parts[0];

            // keykey corr. to "sss:y"
            var keykey = key_parts[1].substring(0, key_parts[1].length-1);
            if( !scope[key] ) return;

            var getValue = function(key, keykey) {
                // get the value from the scoped VIE entity and normalize it to an array
                var value = scope[key].get(keykey) || [];
                if( !_.isArray(value)) value = [value];

                var newValue = [];
                // if the value is an VIE entity also (or an array of) turn it in an object
                _.each(value, function(v) {
                    if( v.isEntity ) {
                        // using SocialSemanticService
                        newValue.push(scope[key].vie.service('sss').fixFromVIE(v));
                    }
                });
                value = newValue;

                // map[1] corr. to "z" or "[zz]"
                // valueKey corr. to "zz" without []
                var valueKey = map[1];
                if( mapAsArray(map[1]) ) {
                    valueKey = map[1].substring(1, map[1].length -1);
                }
                if( !mapAsArray(map[1]) ) {
                    value = value[0];
                } 
                scope[valueKey] = value;
            };

            // call it on initalization of the link
            getValue(key, keykey);

            // setup the change listener for the VIE entity
            var changeEventName = 'change:' + scope[key].vie.namespaces.uri(keykey);

            var eventMapper = function() {
                // call getValue on change of the entity
                getValue(key, keykey);
                scope.$digest();
            };

            scope[key].on(changeEventName, eventMapper);
            scope.$on('$destroy',function(e) {
                if( e.targetScope !== scope ) return; 
                scope[key].off(changeEventName, eventMapper);
            });
        }
    };
});
