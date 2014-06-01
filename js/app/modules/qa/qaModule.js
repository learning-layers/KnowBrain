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
* AUTHORISATION MODULE 
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
        });

});

/**
* CONTROLLER
*/
angular.module('module.qa').controller("QAController", ['$scope', function($scope){
		$scope.header = "Q&A";
		$scope.subheader = "Questions and Answers";
		
		$scope.qaType = 'question';
		$scope.qaTitlePlaceholder = "";
		$scope.qaTitlePopover = "";
		$scope.qaExplanationPlaceholder = "";
		$scope.qaExplanationPopover = "";
		
		$scope.qaListHeader = "Top Questions";
		$scope.qaListFiltersIsCollapsed = false;
		
		$scope.qaListType = 'top';
				
		$scope.$watch('qaType', function(value) {
			switch($scope.qaType) {
				case 'question':
					$scope.qaTitlePlaceholder = "Enter title of your question";
					$scope.qaTitlePopover = "Your question title is the first thing another user sees. It should be clear, concise, and contain enough information so that others can see what it’s about at first glance";
					$scope.qaExplanationPlaceholder = "Add an explanation to your question";
					$scope.qaExplanationPopover = "TODO: Explain why this question explanation is important";
					break;
				case 'discussion':
					$scope.qaTitlePlaceholder = "Enter title of your discussion";
					$scope.qaTitlePopover = "Your discussion title is the first thing another user sees. It should be clear, concise, and contain enough information so that others can see what it’s about at first glance";
					$scope.qaExplanationPlaceholder = "Add an explanation to your discussion";
					$scope.qaExplanationPopover = "TODO: Explain why this discussion explanation is important";
					break;
				case 'chat':
					$scope.qaTitlePlaceholder = "Enter title of your chat";
					$scope.qaTitlePopover = "Your chat title is the first thing another user sees. It should be clear, concise, and contain enough information so that others can see what it’s about at first glance";
					$scope.qaExplanationPlaceholder = "Add an explanation to your chat";
					$scope.qaExplanationPopover = "TODO: Explain why this chat explanation is important";
					break;
				}	
		});
		
		$scope.$watch('qaListType', function(value) {
			if($scope.qaListType == 'top')
		});
				
}]);