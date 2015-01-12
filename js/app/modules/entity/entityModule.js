'use strict';

var entityModule = angular.module('module.entity',[]);

entityModule.controller('EntityController', ['$scope', function($scope) {
}]);

entityModule.directive('ngEntity', function() {
    return {
        restrict:"E",
        transclude:true,
        templateUrl: MODULES_PREFIX + "/entity/entity.tpl.html"
      };
});

entityModule.directive('ngEntitySmall', function() {
    return {
        restrict:"E",
        transclude:true,
        templateUrl: MODULES_PREFIX + "/entity/entitySmall.tpl.html"
      };
});

entityModule.directive('ngAddEntity', function() {
    return {
        restrict:"E",
        transclude:true,
        templateUrl: MODULES_PREFIX + "/entity/addEntity.tpl.html"
      };
});

entityModule.directive('ngAddEntitySmall', function() {
    return {
        restrict:"E",
        transclude:true,
        templateUrl: MODULES_PREFIX + "/entity/addEntitySmall.tpl.html"
      };
});

entityModule.directive('ngUserSmall', function() {
    return {
        restrict:"E",
        transclude:true,
        templateUrl: MODULES_PREFIX + "/entity/userSmall.tpl.html"
      };
});

entityModule.directive('ngUser', function() {
    return {
        restrict:"E",
        transclude:true,
        templateUrl: MODULES_PREFIX + "/entity/user.tpl.html"
      };
});