'use strict';

var groupModule = angular.module('module.group',[]);

groupModule.directive('ngEntity', function() {
    return {
        templateUrl: "entity.tpl.html"
      };
});