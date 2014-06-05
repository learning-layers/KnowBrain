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
            controller: 'QAController',
            templateUrl: MODULES_PREFIX + '/qa/qa.tpl.html'
        })
				
				.state('app.qa.qa', {
            url:'/qa/:uri',
            controller: 'QAQuestionController',
            templateUrl: MODULES_PREFIX + '/qa/question.tpl.html'
        })
				
				.state('app.qa.disc', {
            url:'/disc/:uri',
            controller: 'QADiscussionController',
            templateUrl: MODULES_PREFIX + '/qa/discussion.tpl.html'
        })
				
				.state('app.qa.chat', {
            url:'/chat/:uri',
            controller: 'QAChatController',
            templateUrl: MODULES_PREFIX + '/qa/chat.tpl.html'
        });

});

/**
* CONTROLLER
*/
angular.module('module.qa').controller("QAController", ['$scope', '$state', '$q', 'UserService', 'qaService', 'Thread','THREAD_TYPE', function($scope, $state, $q, UserSrv, qaService, Thread, THREAD_TYPE){
			
		$scope.threadType = THREAD_TYPE.question;
		$scope.threadTypeLabel = "question";
		
		$scope.threadResponseLabel = "answer";
		
		$scope.threadTitle = '';
		$scope.threadExplanation = '';
		
		$scope.selectedThread = null;
				
		$scope.titlePlaceholder = '';		
		$scope.explanationPlaceholder = '';
		$scope.help = '';
		
		$scope.listHeader = "Top Threads";
		$scope.listFiltersIsCollapsed = false;
		
		$scope.listType = "top";
				
		/* $scope.$watch('threadType', function(newValue, oldValue) {
			
			switch($scope.threadType) {
				case THREAD_TYPE.question:
					$scope.threadTypeLabel = "question";
					break;
				case THREAD_TYPE.discussion:
					$scope.threadTypeLabel = "discussion";
					break;
				case THREAD_TYPE.chat:
					$scope.threadTypeLabel = "chat";
					break;
				}

				$scope.titlePlaceholder = "Enter title of your " + $scope.threadTypeLabel;	
				$scope.explanationPlaceholder = "Add an explanation to your " + $scope.threadTypeLabel;			
		}); */
		
		$scope.threadTypeChangedHandler = function(new_value)
		{
			switch(new_value) {
				case THREAD_TYPE.question:
					$scope.threadTypeLabel = "question";
					break;
				case THREAD_TYPE.discussion:
					$scope.threadTypeLabel = "discussion";
					break;
				case THREAD_TYPE.chat:
					$scope.threadTypeLabel = "chat";
					break;
				}

				$scope.titlePlaceholder = "Enter title of your " + $scope.threadTypeLabel;	
				$scope.explanationPlaceholder = "Add an explanation to your " + $scope.threadTypeLabel;
		};
		
		$scope.loadDetailPage = function(thread)
		{
			$scope.selectedThread = thread;
			$state.transitionTo('app.qa.' + thread.type, { uri: thread.uriPathnameHash});
		};
		
		$scope.addNewThread = function(type, title, explanation)
		{
			var thread = new Thread(UserSrv.getUserUri(), type, title, explanation, '', '', new Date().getTime());
			
			addNewThread(thread)
				.then(loadAuthorDetails);
		};
		
		$scope.getRandomNumber = function(max)
		{
			return Math.floor((Math.random() * max) + 1);
		};
		
		$scope.showHelp = function(focusedControl)
		{
			switch(focusedControl) {
					case 'title':
						$scope.help = "Your " + $scope.threadTypeLabel + " title is the first thing another user sees. It should be clear, concise, and contain enough information so that others can see what it’s about at first glance";
						break;
					case 'explanation':
						$scope.help = "Provide any details that other researchers might need to discuss your topic.";
						break;
			}
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
				
/* 		var loadThreadEntries = function(thread) 
		{
			return qaService
							.getThreadEntries(thread)
							.then(function(result) {
								$scope.threadEntries = result;
								return result;
							});
		}; */
		
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
			
			return 
		};
		
		var addNewThread = function(thread)
		{
			return qaService
							.addNewThread(thread)
							.then(function(result) {
								thread.uri = result;
								$scope.threadList.push(thread);
								var tmpList = new Array();
								tmpList.push(thread);
								return tmpList;
							});
		};	

		// load data
		loadThreadList()
			.then(loadAuthorDetails);		
			
}]);

angular.module('module.qa').controller("QAQuestionController", ['$scope', '$state', '$stateParams', '$q', 'UserService', 'qaService', 'Thread','THREAD_TYPE', function($scope, $state, $stateParams, $q, UserSrv, qaService, Thread, THREAD_TYPE){

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