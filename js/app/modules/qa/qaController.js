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
* QA MODULE 
*/
angular.module('module.qa',[]);

/**
* CONFIG
*/
angular.module('module.qa').config(function($stateProvider) {

    $stateProvider
        .state('app.qa', {
            url:'/qa',
            controller: 'Controller',
            templateUrl: MODULES_PREFIX + '/qa/qa.tpl.html'
        })
				
				.state('app.qa.qa', {
            url:'/qa/:uri',
            controller: 'QuestionController',
            templateUrl: MODULES_PREFIX + '/qa/question.tpl.html'
        })
				
				.state('app.qa.disc', {
            url:'/disc/:uri',
            controller: 'DiscussionController',
            templateUrl: MODULES_PREFIX + '/qa/discussion.tpl.html'
        })
				
				.state('app.qa.chat', {
            url:'/chat/:uri',
            controller: 'ChatController',
            templateUrl: MODULES_PREFIX + '/qa/chat.tpl.html'
        });

});

/**
* Constants
*/
angular.module('module.qa').constant('THREAD_LIST_TYPE', {top:'Top', newest:'Newest', unanswered:'Unanswered'});

/**
* CONTROLLER
*/
angular.module('module.qa').controller("Controller", ['$scope', '$state', '$q', '$modal', '$dialogs', '$filter', 'UserService', 'qaService', 'Thread','THREAD_TYPE', 'THREAD_LIST_TYPE', function($scope, $state, $q, $modal, $dialogs, $filter, UserSrv, qaService, Thread, THREAD_TYPE, THREAD_LIST_TYPE){
		
		$scope.THREAD_TYPE = THREAD_TYPE;
		$scope.newThread = new Thread(UserSrv.getUserUri(), THREAD_TYPE.question, '', '', null, null, null);
		$scope.help = 'To post a question enter a title and an explanation.';
		
		$scope.threadList = null;
		$scope.selectedThread = null;
		$scope.threadResponseLabel = "answer";
		
		$scope.THREAD_LIST_TYPE = THREAD_LIST_TYPE;
		$scope.selectedThreadListType = THREAD_LIST_TYPE.top;	
		$scope.threadListHeader = "Top Threads";
		$scope.searchString = '';
						
						
		$scope.loadDetailPage = function(thread)
		{
			$scope.selectedThread = thread;
			$state.transitionTo('app.qa.' + thread.type.enum, { uri: thread.uriPathnameHash});
		};
				
		$scope.getRandomNumber = function(max)
		{
			return Math.floor((Math.random() * max) + 1);
		};
		
		$scope.showHelp = function(focusedControl)
		{
			switch(focusedControl) {
					case 'title':
						$scope.help = "Your " + $scope.newThread.type.label + " title is the first thing another user sees. It should be clear, concise, and contain enough information so that others can see what it’s about at first glance";
						break;
					case 'explanation':
						$scope.help = "Provide any details that other users might need to discuss your topic.";
						break;
					case 'tag':
						$scope.help = "Enter tags, so other user can find your "+ $scope.newThread.type.label + " easier.";
						break;
					case 'btnQuestion':
						$scope.help = "To post a " + $scope.newThread.type.label + " enter a title and an explanation.";
						break;
					case 'btnDiscussion':
						$scope.help = "To start a " + $scope.newThread.type.label + " enter a title and an explanation.";
						break;
					case 'btnChat':
						$scope.help = "To start a " + $scope.newThread.type.label + " enter a title.";;
						break;
			}
		};
		
		$scope.changeSelectedThreadListType = function(threadListType)
		{
			$scope.selectedThreadListType = threadListType;
		};
				
		var loadThreadList = function() 
		{
			return qaService
							.getAllThreads()
							.then(function(result) {
								$scope.threadList = result;
								return result;
							});
		};
						
		var loadAuthorDetails = function(threadList) 
		{
			angular.forEach(threadList, function(value, key){
				qaService
							.getAuthorDetails(value)
							.then(function(result) {
								value.author = result;
								return value.author;
							});
			});
		};
		
		$scope.postNewThread = function()
		{
			loadSimilarThreadList()
				.then(openSimilarThreads);
		};
		
		var loadSimilarThreadList = function() 
		{
			return qaService
							.getAllThreads()
							.then(function(result) {
								return $filter('threadTypeFilter')(result, $scope.newThread.type);
							});
		};
		
		var addNewThread = function()
		{
			return qaService
							.addNewThread($scope.newThread)
							.then(function(result) {
								$scope.newThread.uri = result;
								$scope.threadList.push($scope.newThread);
	
								var tmpList = new Array();
								tmpList.push($scope.newThread);
								loadAuthorDetails(tmpList);
								
								$scope.newThread = new Thread(UserSrv.getUserUri(), THREAD_TYPE.question, '', '', null, null, null);
								
								return result;
							});
		};
						
		var openSimilarThreads = function (similarThreadList) {	
			if(similarThreadList.length > 0)
			{
				var modalInstance = $modal.open({
					templateUrl: MODULES_PREFIX + '/qa/modalSimilarThreads.tpl.html',
					controller: 'ModalSimilarThreadsController',
					size: 'lg',
					resolve: {
						thread: function () { return $scope.newThread; },
						similarThreadList: function () { return similarThreadList; }
					}
				});

				modalInstance.result.then(function () {
					addNewThread();
				}, function () {
					//$log.info('Modal dismissed at: ' + new Date());
				});
			}
			else
			{
				addNewThread();
			}
		};
		
		$scope.openAddAttachments = function () {	
			var modalInstance = $modal.open({
				templateUrl: MODULES_PREFIX + '/qa/modalAddAttachments.tpl.html',
				controller: 'ModalAddAttachmentsController',
				size: 'lg',
				resolve: {
					thread: function () { return $scope.newThread; }
				}
			});

			modalInstance.result.then(function () {

			}, function () {
				//$log.info('Modal dismissed at: ' + new Date());
			});
		};

		// load data
		loadThreadList()
			.then(loadAuthorDetails);		
			
}]);

angular.module('module.qa').controller('ModalSimilarThreadsController', ['$scope', '$modalInstance', '$state', 'qaService', 'thread', 'similarThreadList', function($scope, $modalInstance, $state, qaService, thread, similarThreadList){

	$scope.thread = thread;	
	$scope.similarThreadList = similarThreadList;
	
	$scope.loadDetailPage = function(thread)
	{
		$scope.selectedThread = thread;
		$state.transitionTo('app.qa.' + thread.type.enum, { uri: thread.uriPathnameHash});
		$modalInstance.close(null);
	};

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
		
	$scope.ok = function()
	{
		$modalInstance.close(null);
	};	
	
	var loadAuthorDetails = function() 
	{
		angular.forEach($scope.similarThreadList, function(value, key){
			qaService
						.getAuthorDetails(value)
						.then(function(result) {
							value.author = result;
							return value.author;
						});
		});
	};
	
	$scope.getRandomNumber = function(max)
	{
		return Math.floor((Math.random() * max) + 1);
	};	
	
	loadAuthorDetails();
	
}]);

angular.module('module.qa').controller('ModalAddAttachmentsController', ['$scope', '$modalInstance', '$state', 'qaService', 'thread', function($scope, $modalInstance, $state, qaService, thread){

	$scope.thread = thread;
		
	$scope.ok = function () {
    $modalInstance.close(null);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
	
}]);

angular.module('module.qa').controller("QuestionController", ['$scope', '$state', '$stateParams', '$q', 'UserService', 'qaService', 'Thread','THREAD_TYPE', function($scope, $state, $stateParams, $q, UserSrv, qaService, Thread, THREAD_TYPE){

	$scope.question = $scope.$parent.selectedThread;
	
	var loadThreadEntries = function(thread) 
	{
		return qaService
						.getThreadEntries(thread)
						.then(function(result) {
							$scope.question.entries = result;
						});
	};
	
	// TODO load thread first if thread is null (happens by refreshing page F5)
	loadThreadEntries($scope.question);
}]);

/**
* Filters
*/
angular.module('module.qa').filter('threadTypeFilter', function() {
  
    return function(threadList, type) {
		  if(type == null || type == ''){
				return threadList;
			}
		
			var out = new Array();
						
			angular.forEach(threadList, function(value, key){
				if(value.type.enum == type.enum) {
					out.push(value);
				}
			});
			
      return out;
    };
});

/**
* Directives
*/
angular.module('module.qa').directive('bindOnce', function() {
    return {
        scope: true,
        link: function( $scope ) {
            setTimeout(function() {
                $scope.$destroy();
            }, 0);
        }
    }
});