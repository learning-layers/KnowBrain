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
* SEARCH MODULE 
*/
angular.module('module.search',['module.i18n', 'module.cookies']);

angular.module('module.search').constant('MAX_SEARCH_RESULTS', 20);

/**
* CONFIG
*/
angular.module('module.search').config(function($stateProvider) {

  $stateProvider
  .state('app.search', {
    url:'/search',
    controller: 'SearchController',
    templateUrl: MODULES_PREFIX + '/search/search.tpl.html'
  });

  $stateProvider.state('app.search.keywords', {
    url:'/keywords=:keywords',
    views: {
      "context": {
        templateUrl: MODULES_PREFIX + '/search/search-context.tpl.html',
        controller: function($stateParams, $scope) {
          $scope.clearSearch();
          $scope.performKeywordSearch($stateParams.keywords);
          $scope.performTagSearch($stateParams.keywords);
        },
      },
      "context-info":{
        templateUrl: MODULES_PREFIX + '/search/search-context-info.tpl.html'
      },
      "breadcrumbs":{
        templateUrl: MODULES_PREFIX + '/search/search-breadcrumbs.tpl.html'
      }
    },
      controller: 'SearchController'
  });

  $stateProvider.state('app.search.tag', {
    url:'/tag=:tag',
    views: {
      "context": {
        templateUrl: MODULES_PREFIX + '/search/search-context.tpl.html',
        controller: function($stateParams, $scope) {
          $scope.clearSearch();
          $scope.performTagSearch($stateParams.tag);
          $scope.performKeywordSearch($stateParams.tag);
        },
      },
      "context-info":{
        templateUrl: MODULES_PREFIX + '/search/search-context-info.tpl.html'
      },
      "breadcrumbs":{
        templateUrl: MODULES_PREFIX + '/search/search-breadcrumbs.tpl.html'
      }
    } 
  });

});

/**
* CONTROLLER
*/
angular.module('module.search').controller("SearchController", [
  '$scope', '$rootScope', '$http', '$location', '$state', 'UserService', 'i18nService', 'SearchToolbox', 'UriToolbox','$q', 'EntityModel', '$dialogs', 'EntityFetchService','MAX_SEARCH_RESULTS', 'ENTITY_TYPES',
  function($scope, $rootScope, $http, $location, $state, UserSrv, i18nService, SearchToolbox, UriToolbox, $q, EntityModel, $dialogs, EntityFetchService, MAX_SEARCH_RESULTS, ENTITY_TYPES) {

    $scope.entityTypes = ENTITY_TYPES;
    
    $scope.showContentSearchResults = false;
    $scope.expandContentResults = false;

    $scope.showTagSearchResults = false;
    $scope.expandTagResults = false;

    $scope.contentSearchResultsCount = 0;
    $scope.tagSearchResultsCount = 0;

    $scope.contentSearchResults = new Array();
    $scope.tagSearchResults = new Array();

  /**
  * TRANSLATION INJECTION
  */
  $scope.t = function(identifier){
    return i18nService.t(identifier);
  }

  /**
  * METHODS
  */
  $scope.searchAction = function(){

    if($scope.searchForm.$invalid){
      return;
    }

    //todo filter not allowed chars
    if($scope.searchString != undefined || $scope.searchString != ""){
      
      var keywords = Array();
      angular.forEach($scope.searchString.split(","), function(string, key){
        angular.forEach(string.replace(/^\s+|\s+$/g, '').split(" "), function(subString, key2){
          keywords.push(subString);
        });
      });

      keywords = SearchToolbox.plusSeparateStringArray(keywords);
      $state.transitionTo('app.search.keywords', {keywords: keywords});
    }
  }; 

  $scope.performKeywordSearch = function(keywordsPlusSeparated){

    $scope.searchString = SearchToolbox.explodePlusSeparatedStringIntoString(keywordsPlusSeparated);

    var keywordsArray = SearchToolbox.explodeByPlus(keywordsPlusSeparated);
    if(keywordsArray.length > 0)
    {
      $rootScope.activateLoadingIndicator();
      var promise = searchByFullText(keywordsArray);
      promise.finally(function(){
        $rootScope.deactivateLoadingIndicator();
        $scope.showContentSearchResults = true;
      });

      $scope.toggleContentSearchResults();
    }
  };

  $scope.performTagSearch = function(tagsPlusSeparated){

    $scope.searchString = SearchToolbox.explodePlusSeparatedStringIntoString(tagsPlusSeparated);

    var tagsArray = SearchToolbox.explodeByPlus(tagsPlusSeparated);
    if(tagsArray.length > 0)
    {
      $rootScope.activateLoadingIndicator();
      var promise = searchByTags(tagsArray);
      promise.finally(function(){
        $rootScope.deactivateLoadingIndicator();
        $scope.showTagSearchResults = true;
      });

      $scope.toggleTagSearchResults();
    }
  };
  
  $scope.transitionToHome = function(){
    $state.go('app.collection.content',{coll: "root"});
  }
  
  var searchByTags = function(tagsArray){
    var defer = $q.defer();
    
    new SSSearch(
      function(result){
        
        var entities = new Array()
      
      if(result.entities.length > 0){
        var entities = initEntitiesBySearchResult(result.entities);
        $scope.tagSearchResults = entities;
        $scope.tagSearchResultsCount = result.entities.length;
      }
      
      defer.resolve(entities);
      $rootScope.$apply();
    },  
    function(error){ console.log(error); }, 
    UserSrv.getUser(),
    UserSrv.getKey(),
    null, //keywordsToSearchFor
    false, //includeTextualContent,
    null, //wordsToSearchFor,
    true, //includeTags,
    tagsArray, //tagsToSearchFor,
    false, //includeMIs,
    null, //misToSearchFor,
    false, //includeLabel,
    null, //labelsToSearchFor,
    false, //includeDescription,
    null, //descriptionsToSearchFor,
    null, //typesToSearchOnlyFor,
    false, //includeOnlySubEntities,
    null, //entitiesToSearchWithin,
    false, //extendToParents,
    false, //includeRecommendedResults,
    false); //provideEntries,
    
    return defer.promise;
  };
  
  var searchByFullText = function(keywordsArray){
    var defer = $q.defer();
    
    new SSSearch(
      function(result){
        
        var entities = new Array()
      
      if(result.entities.length > 0){
        var entities = initEntitiesBySearchResult(result.entities);
        $scope.contentSearchResults      = entities;
        $scope.contentSearchResultsCount = result.entities.length;
      } 
      
      defer.resolve(entities);
      $rootScope.$apply();
    },  
    function(error){ console.log(error); }, 
    UserSrv.getUser(),
    UserSrv.getKey(),
    null, //keywordsToSearchFor
    true, //includeTextualContent,
    keywordsArray, //wordsToSearchFor,
    false, //includeTags,
    null, //tagsToSearchFor,
    false, //includeMIs,
    null, //misToSearchFor,
    false, //includeLabel,
    null, //labelsToSearchFor,
    false, //includeDescription,
    null, //descriptionsToSearchFor,
    null, //typesToSearchOnlyFor,
    false, //includeOnlySubEntities,
    null, //entitiesToSearchWithin,
    false, //extendToParents,
    false, //includeRecommendedResults,
    false); //provideEntries,
    
    return defer.promise;
  };

var initEntitiesBySearchResult = function(searchResult){

  var entities = new Array();

  angular.forEach(searchResult, function(value, key){
    var entity = new EntityModel();
    entity.init(value);
    entity.init({type: value.type});
    entity.init({uriPathnameHash: UriToolbox.extractUriHostPartWithoutProtocol(value.id)});
    entities.push(entity);
  });

  return entities;
};

  $scope.entityClickAction = function(entity){

    var promise = EntityFetchService.getEntityByUri(entity.id, true, true, true);

    promise.then(
      function(entity){

        var dialog = $dialogs.entryDetail(entity, true);
      },
      function(error){
        console.log(error);
      } 
      );

  };

$scope.toggleContentSearchResults = function(){
  if($scope.expandContentResults){

    $scope.expandContentResults = false;
  }else{

    $scope.expandContentResults = true;
  }
};

$scope.toggleTagSearchResults = function(){
  if($scope.expandTagResults){

    $scope.expandTagResults = false;
  }else{

    $scope.expandTagResults = true;
  }
};

 $scope.clearSearch = function(){
    $scope.showContentSearchResults = false;
    $scope.expandContentResults = false;

    $scope.showTagSearchResults = false;
    $scope.expandTagResults = false;

    $scope.contentSearchResultsCount = 0;
    $scope.tagSearchResultsCount = 0;

    $scope.contentSearchResults = new Array();
    $scope.tagSearchResults = new Array();
 };

}]);

