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
            url:'/qa/:id',
            controller: 'QuestionController',
            templateUrl: MODULES_PREFIX + '/qa/question.tpl.html'
        })
				
				.state('app.qa.disc', {
            url:'/disc/:id',
            controller: 'DiscussionController',
            templateUrl: MODULES_PREFIX + '/qa/discussion.tpl.html'
        })
				
				.state('app.qa.chat', {
            url:'/chat/:id',
            controller: 'ChatController',
            templateUrl: MODULES_PREFIX + '/qa/chat.tpl.html'
        });

});

/**
* Constants
*/
angular.module('module.qa').constant('THREAD_LIST_TYPE', {own:'My own', newest:'Newest', unanswered:'Unanswered'});

/**
* CONTROLLER
*/
angular.module('module.qa').controller("Controller", ['$scope', '$state', '$q', '$modal', '$dialogs', '$filter', 'UserService', 'UriToolbox', 'qaService', 'Thread','THREAD_TYPE', 'THREAD_LIST_TYPE', function($scope, $state, $q, $modal, $dialogs, $filter, UserSrv, UriToolbox, qaService, Thread, THREAD_TYPE, THREAD_LIST_TYPE){
		
		$scope.THREAD_TYPE = THREAD_TYPE;
		$scope.newThread = new Thread(null, THREAD_TYPE.question, null, null, null, null);
		$scope.help = 'To post a question enter a title and an explanation.';
		
		$scope.threadList = null;
		$scope.threadResponseLabel = "answer";
		
		$scope.THREAD_LIST_TYPE = THREAD_LIST_TYPE;
		$scope.selectedThreadListType = THREAD_LIST_TYPE.own;	
		$scope.threadListHeader = "My own";
		$scope.searchString = '';
						
						
		$scope.loadDetailPage = function(thread)
		{
			$state.transitionTo('app.qa.' + thread.type.enum, { id: UriToolbox.extractUriPathnameHash(thread.id)});
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
		
		$scope.postNewThread = function()
		{
			loadSimilarThreadList()
				.then(openSimilarThreads);
		};
		
		var loadSimilarThreadList = function() 
		{
			return qaService
							.getSimilarThreads($scope.newThread)
							.then(function(result) {
								return $filter('threadTypeFilter')(result, $scope.newThread.type);
							});
		};
		
		var addNewThread = function()
		{
			return qaService
							.addNewThread($scope.newThread)
							.then(function(result) {
								$scope.newThread.id = result;
								$scope.threadList.push($scope.newThread);
									
								$scope.newThread = new Thread(null, THREAD_TYPE.question, null, null, null, null);
								
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

				modalInstance.result.then(function (post) {
					if(post) {
						addNewThread();
					}
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
		loadThreadList();	
			
}]);

angular.module('module.qa').controller('ModalSimilarThreadsController', ['$scope', '$modalInstance', '$state', 'qaService', 'UriToolbox', 'thread', 'similarThreadList', function($scope, $modalInstance, $state, qaService, UriToolbox, thread, similarThreadList){

	$scope.thread = thread;	
	$scope.similarThreadList = similarThreadList;
	
	$scope.loadDetailPage = function(thread)
	{
		$state.transitionTo('app.qa.' + thread.type.enum, { id: UriToolbox.extractUriPathnameHash(thread.id)});
		$modalInstance.close(false);
	};

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
		
	$scope.ok = function()
	{
		$modalInstance.close(true);
	};	
		
	$scope.getRandomNumber = function(max)
	{
		return Math.floor((Math.random() * max) + 1);
	};	
		
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

angular.module('module.qa').controller("QuestionController", ['$scope', '$state', '$stateParams', '$q', '$filter', 'UserService', 'qaService', 'ThreadEntry', 'THREAD_ENTRY_TYPE', 'UriToolbox', function($scope, $state, $stateParams, $q, $filter, UserSrv, qaService, ThreadEntry, THREAD_ENTRY_TYPE, UriToolbox){

	$scope.question = null;
	$scope.similarThreadList = null;
	
	$scope.newAnswer = new ThreadEntry(null, THREAD_ENTRY_TYPE.qaEntry, null, null, null);
	// used for sorting
	$scope.predicate = '+position';
	
	var loadThreadWithEntries = function(id) 
	{
		return qaService
						.getThreadWithEntries(id)
						.then(function(result) {
							$scope.question = result;
							return result;
						});
	};

	var loadSimilarThreadList = function() 
	{
		return qaService
						.getSimilarThreads($scope.question)
						.then(function(result) {
							$scope.similarThreadList = result;
							return result;
						});
	};
	
	$scope.addNewAnswer = function()
		{
			return qaService
							.addNewAnswer($scope.question, $scope.newAnswer)
							.then(function(result) {	
								$scope.newAnswer.id = result;
								$scope.newAnswer.creationTime = new Date();
								$scope.question.entries.push($scope.newAnswer);
								
								$scope.newAnswer = new ThreadEntry(null, THREAD_ENTRY_TYPE.qaEntry, null, null, null);
								
								return result;
							});
		};
	
	$scope.loadDetailPage = function(thread)
	{
		$state.transitionTo('app.qa.' + thread.type.enum, { id: UriToolbox.extractUriPathnameHash(thread.id)});
	};
	
	loadThreadWithEntries(UserSrv.getUserSpace() + "/" + $stateParams.id)
									.then(loadSimilarThreadList);
	
}]);

angular.module('module.qa').controller("DiscussionController", ['$scope', '$state', '$stateParams', '$q', '$filter', 'UserService', 'qaService', 'Thread','THREAD_TYPE', function($scope, $state, $stateParams, $q, $filter, UserSrv, qaService, Thread, THREAD_TYPE){

	$scope.discussion = null;
	
	var loadThreadWithEntries = function(id) 
	{
		return qaService
						.getThreadWithEntries(id)
						.then(function(result) {
							$scope.discussion = result;
						});
	};
	
	loadThreadWithEntries(UserSrv.getUserSpace() + "/" + $stateParams.id);
}]);

angular.module('module.qa').controller("ChatController", ['$scope', '$state', '$stateParams', '$q', '$filter', 'UserService', 'qaService', 'Thread','THREAD_TYPE', function($scope, $state, $stateParams, $q, $filter, UserSrv, qaService, Thread, THREAD_TYPE){

	$scope.chat = null;
	
	var loadThreadWithEntries = function(id) 
	{
		return qaService
						.getThreadWithEntries(id)
						.then(function(result) {
							$scope.chat = result;
						});
	};
	
	loadThreadWithEntries(UserSrv.getUserSpace() + "/" + $stateParams.id);
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

angular.module('module.qa').filter('checkNewlines', function() {
	return function(text) {
		if(text != null) {
			text = text.replace(/\\n/g, '<br />');
			return text;
		}
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