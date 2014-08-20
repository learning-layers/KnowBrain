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
        link: function(scope, element, attrs ){
            Logger.useDefaults();

            var mapAsArray = function(value) {
                LOG.debug('mapAsArray', value, value.indexOf('['), value.indexOf(']'));
                return value.indexOf('[') === 0 &&
                    value.indexOf(']') === value.length -1;
            };

            LOG.setLevel(Logger.DEBUG);
            LOG.debug('scope', scope);
            LOG.debug('element', element);
            LOG.debug('attrs', attrs);

            var map = attrs[attr].split(sep);
            LOG.debug('map', map);
            var key_parts = map[0].split("[");
            LOG.debug('key_parts', key_parts);
            var key = key_parts[0];
            var keykey = key_parts[1].substring(0, key_parts[1].length-1);
            LOG.debug('key', key, 'keykey', keykey, scope[key]);
            if( !scope[key] ) return;

            var value = scope[key].get(keykey) || [];
            if( !_.isArray(value)) value = [value];

            var newValue = [];
            _.each(value, function(v) {
                if( v.isEntity ) {
                    newValue.push(scope[key].vie.service('sss').fixFromVIE(v));
                }
            });
            value = newValue;

            var valueKey = map[1];
            if( mapAsArray(map[1]) ) {
                valueKey = map[1].substring(1, map[1].length -1);
            }
            LOG.debug('valueKey', valueKey);
            if( !mapAsArray(map[1]) ) {
                value = value[0];
            } 
            scope[valueKey] = value;

            var changeEventName = 'change:' + scope[key].vie.namespaces.uri(keykey);

            var eventMapper = function(model, value, options) {
                LOG.debug("changing", valueKey, scope[valueKey], scope[valueKey].length);
                var current = scope[key].get(keykey) || [];
                if( !_.isArray(current)) current = [current];
                var newCurrent = [];
                _.each(current, function(v) {
                    if( v.isEntity ) {
                        newCurrent.push(scope[key].vie.service('sss').fixFromVIE(v));
                    }
                });
                current = newCurrent;
                if( !mapAsArray(map[1]) ) {
                    current = current[0];
                }
                scope[valueKey] = current;
                LOG.debug("changed", scope[valueKey], scope[valueKey].length);
                scope.$digest();
            };

            LOG.debug('uri', scope[key].vie.namespaces.uri(keykey));
            scope[key].on(changeEventName, eventMapper);
            scope.$on('$destroy',function(e) {
                LOG.debug('scope destroy e=',e);
                if( e.targetScope !== scope ) return; 
                scope[key].off(changeEventName, eventMapper);
            });
        }
    };
});
