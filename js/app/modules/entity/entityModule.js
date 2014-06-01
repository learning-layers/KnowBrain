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