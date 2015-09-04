'use strict';
var entityModule = angular.module('module.entity', []);
entityModule.controller('EntityController', ['$scope', function($scope) {}]);
entityModule.directive('ngEntity', function() {
    return {
        restrict: "E",
        transclude: true,
        templateUrl: MODULES_PREFIX + "/entity/entity.tpl.html"
    };
});
entityModule.directive('ngEntitySmall', function() {
    return {
        restrict: "E",
        transclude: true,
        templateUrl: MODULES_PREFIX + "/entity/entitySmall.tpl.html"
    };
});
entityModule.directive('ngEntityListItem', function() {
    return {
        restrict: "A",
        replace: true,
        transclude: true,
        templateUrl: MODULES_PREFIX + "/entity/entityListItem.tpl.html"
    };
});
entityModule.directive('kbAddEntity', function($dialogs) {
    return {
        restrict: "E",
        transclude: true,
        templateUrl:  function(elem, attr) {
            return MODULES_PREFIX + "/entity/addEntity" + (attr.containerType === 'list' ? 'List' : '') + ".tpl.html";
        },
        scope: {
            destination: '=destination',
            afterAddLink: '&',
            afterChooseEntity: '&',
            afterAddEntity: '&'
        },
        link: function(scope, element, attr) {
            scope.$watch('destination', function(destination) {
                if (destination == undefined) {return;}
                scope.availableActions = [{title: 'Link', id: 1, cssClass: 'icon-add-link'}, 
                                          {title: 'Upload', id: 2, cssClass: 'icon-add-file'}];

                var enableSelectingCollections = true;
                if (destination.type == 'coll')
                    scope.availableActions.push({title: 'Collection', id: 0, cssClass: 'icon-add-collection'});
                if ( destination.type == 'circle' || destination.type.enum == 'qa' || destination.type.enum == 'qaEntry') {
                    scope.availableActions.push({title: 'Dropbox', id: 3, cssClass: 'icon-add-file'});
                }
                if (destination.type.enum == 'qa' || destination.type.enum == 'qaEntry') {
                    enableSelectingCollections = false;
                }

                scope.clickedAction = function(action) {
                    switch(action.id) {
                        case 0:
                            $dialogs.createCollection().result.then(function(link) {}, function() {});
                            break;
                        case 1:
                            $dialogs.createLink(destination).result.then(function(link) {
                                var expressionHandler = scope.afterAddLink();
                                expressionHandler(link);
                            }, function() {});
                            break;
                        case 2:

                            $dialogs.uploadResources(destination.type == 'coll', destination.type.enum != 'qa' && destination.type.enum != 'qaEntry').result.then(function(uploadedEntities) {
                                var expressionHandler = scope.afterAddEntity();
                                expressionHandler(uploadedEntities);
                            }, function() {});
                            break;
                        case 3:
                            $dialogs.chooseFromDropbox(enableSelectingCollections).result.then(function(chosenEntities) {
                                var expressionHandler = scope.afterChooseEntity();
                                expressionHandler(chosenEntities);
                            }, function() {
                            });
                            break;
                    }
                };
            });
        }
    };
});
entityModule.directive('ngUserSmall', function() {
    return {
        restrict: "E",
        transclude: true,
        templateUrl: MODULES_PREFIX + "/entity/userSmall.tpl.html"
    };
});
entityModule.directive('ngUser', function() {
    return {
        restrict: "E",
        transclude: true,
        templateUrl: MODULES_PREFIX + "/entity/user.tpl.html"
    };
});