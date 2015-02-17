/**
* Code contributed to the Learning Layers project
* http://www.learning-layers.eu
* Development is partly funded by the FP7 Programme of the European Commission under
* Grant Agreement FP7-ICT-318209.
* Copyright (c) 2014, Graz University of Technology - KTI (Knowledge Technologies Institute).
* For a list of contributors see the AUTHORS file at the top-level directory of this distribution.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
 
// Encoding: UTF-8
'use strict';

/**
* UTILITIES MODULE 
*/
angular.module('module.utilities',[]);

/**
* SERVICES
*/
angular.module('module.utilities').service("UriToolbox", [function(){

  this.extractUriPathnameHash = function(uri){
   var a = document.createElement("a");
   a.href = uri;
   var split = a.pathname.split("/");
   return split[split.length - 1];
 };

 this.extractUriPathnameHashEntities = function(uri){
   var a = document.createElement("a");
   a.href = uri;
   var split = a.pathname.split("/");
   return split[1] + "." + split[2];
 };

 this.extractUriHostPart = function(uri){

//   var a = document.createElement("a");
//   a.href = uri;

   return sSGlobals.serverHost; //   this.serverHost a.protocol + "//" + a.hostname + (a.port ? ':' + window.location.port: '');
 };

 this.extractUriHostPartWithoutProtocol = function(uri){
//   var a = document.createElement("a");
//   a.href = uri;

   var a = document.createElement("a");
   a.href = sSGlobals.serverHost;
   
   return a.hostname;
 };

}]);

angular.module('module.utilities').service("TagCloudToolbox",[function(){

  this.getWeightedTagsFromTagFrequencies = function (tagsByFrequency){

    var result          = new Array();
    var tagEntry        = null;
    var max             = -1;
    var counter         = -1;
    
    for(counter = 0; counter < jSGlobals.arrayLength(tagsByFrequency); counter++){

      tagEntry = tagsByFrequency[counter];
      
      if(tagEntry.frequ > max){

        max = tagEntry.frequ;
      } 
    }
    
    if(max == -1){
      return result;
    }

    for(counter = 0; counter < jSGlobals.arrayLength(tagsByFrequency); counter++){

      tagEntry = tagsByFrequency[counter];

      if(jSGlobals.arrayLength (result)  <= 15){

        var object      = new Object();
        object.label    = tagEntry.label;
        object.weight   = (tagEntry.frequ / max);
        object.weight  *= 50;
        
        if(object.weight < 0.25 * 50){
          object.weight = 0.25 * 50;
        }
        
        object.fontSize = object.weight / 10;       
        
        result.push(object);
      }
    }
    
    return result;
  };

}]);


angular.module('module.utilities').service("SearchToolbox",[function(){

  this.plusSeparateStringArray = function(stringArray){

    var result = jSGlobals.empty;
    
    for(var counter = 0; counter < jSGlobals.arrayLength(stringArray); counter++){
      result += stringArray[counter] + '+';
    }
    
    if(jSGlobals.isNotEmpty(result) && jSGlobals.endsWith(result, '+'))
    {
      result = result.substring(0, result.length - 1);
    }
    
    return result;
  };

  this.explodePlusSeparatedStringIntoString = function(plusSeparateString){
    var result = jSGlobals.empty;

    if(jSGlobals.isNotEmpty(plusSeparateString)){
      var stringArray = plusSeparateString.split("+");

      for(var counter = 0; counter < jSGlobals.arrayLength(stringArray); counter++){
         result += stringArray[counter] + ' ';
      }

      if(jSGlobals.isNotEmpty(result) && jSGlobals.endsWith(result, ' '))
      {
        result = result.substring(0, result.length - 1);
      }
    }

    return result;
  };

  this.explodeByPlus = function(plusSeparateString){

    return plusSeparateString.split('+');
  };

}]);

/**
* Directives
*/
angular.module('module.utilities').directive('shortenentryname', function() {
  return {
    restrict: 'A',
    scope: {
      model: "=",
    },
    link: function($scope, $element, attr){

      $scope.$watch('model',function(newValue,oldValue){
        //console.log($element[0].innerHTML);
        shorten($element[0]);
      });

      var shorten = function(element){

        var parent = element.parentElement;
        var parentFontSize = $(parent).css('font-size');
        var parentFontFamily = $(parent).css('font-family');

        var content = element.innerHTML;
        var parentSize = parent.offsetWidth;
        var measureBox = $('<div id="measureBox" style="display:inline; font-size: '+parentFontSize+'; font-family: '+parentFontFamily+'; position:absolute; width:auto; height:auto; padding:0px; margin:0px; visibility:hidden;">'+content+'</div>').appendTo('body')[0];

        var textWidth = measureBox.offsetWidth;

        while(textWidth > parentSize){
          var charCount = content.length;

          if(charCount < 5)
            break;

          var cutAt = Math.round(charCount / 2);

          var part1 = content.substr(0,cutAt-4);
          var part2 = content.substr(cutAt+1, charCount-1);

          content = part1 + "..." + part2;
          $(measureBox).html(content);
          textWidth = measureBox.offsetWidth;
        }

        $(element).html(content);

        $('#measureBox').remove(); 
      
      };
    }
  };
});

angular.module('module.utilities').directive('editInPlace',['i18nService' ,function(i18nService) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      model: "=",
      saveMethod: "&"
    },
    templateUrl: MODULES_PREFIX + '/utils/inline-editing.tpl.html',
    link: function(scope, element, attrs) {
      scope.showInlineInput = false;
      scope.empty = false;
      scope.element = element;

      /**
      * TRANSLATION INJECTION
      */
      scope.t = function(identifier){
        return i18nService.t(identifier);
      };

      scope.showInlineEditing = function() {

        scope.valueToEdit = scope.model;

        if(scope.showInlineInput){
          scope.showInlineInput = false;
        }else{
          scope.showInlineInput = true;
          $(scope.element).find(':input').get(0).focus();
        }
      }

      scope.save = function(){

        if(scope.valueToEdit == undefined || scope.valueToEdit === ""){
          return; 
        } 

        if(scope.valueToEdit == scope.model){
          scope.showInlineInput = false;
          return;
        }

        scope.saveMethod({newLabel:scope.valueToEdit});
        scope.showInlineInput = false;
      }
    }
  }
}]);

angular.module('module.utilities').directive('enterHit', function () {
  return{ 
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
          scope.$apply(function (){
            scope.$eval(attrs.enterHit);
          });

          event.preventDefault();
        }
      });
    }
  }
});

angular.module('module.utilities').directive('onFinishNgRepeatLoad', ['$timeout', function ($timeout) {
 return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
}]);

angular.module('module.utilities').directive('clickAnywhereButHere', function($document){
  return {
    restrict: 'A',
    link: function(scope, elem, attr, ctrl) {
      elem.bind('click', function(e) {
        // this part keeps it from firing the click on the document.
        e.stopPropagation();
      });
      $document.bind('click', function() {
        // magic here.
        scope.$apply(attr.clickAnywhereButHere);
      })
    }
  }
});

angular.module('module.utilities').directive('commentsUtil', ['$rootScope', 'i18nService', 'CurrentCollectionService', function($rootScope, i18nService, CurrentCollectionService) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: MODULES_PREFIX + '/utils/comments.tpl.html',
    scope: {
      model: '='
    },
    link: function($scope, element, attrs) {

      $scope.newCommentText = "";
      $scope.loadDiscs = false;

     /**
      * TRANSLATION INJECTION
      */
      $scope.t = function(identifier){
        return i18nService.t(identifier);
      };

      $scope.addComment = function(){

        if($scope.newCommentText == ""){
          return;
        }

        $scope.model.addComment        ($scope.newCommentText);
        

        $scope.newCommentText = "";
      };

    }

  }
}]);


