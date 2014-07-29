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
* Chat MODULE 
*/
angular.module('module.chat', ['ngAnimate']);

/**
* CONFIG
*/
angular.module('module.qa').config(function ($stateProvider) {

    $stateProvider
        .state('app.chat', {
            controller: 'chatController',
            templateUrl: MODULES_PREFIX + '/chat/chat.tpl.html'
        })
});

/**
* Constants
*/
angular.module('module.chat').constant('CHAT_STATE', { closed: 1, open: 2, init: 3 });

/**
* CONTROLLER
*/
angular.module('module.chat').controller("chatController", ['$scope', '$q', 'sharedService', 'chatService', 'UserService', 'CHAT_STATE', function ($scope, $q, sharedService, chatService, UserSrv, CHAT_STATE) {
	
    $scope.CHAT_STATE = CHAT_STATE;
    $scope.state = CHAT_STATE.closed;

    $scope.headerTitle = '';

    $scope.users = [];
    $scope.userFilter = '';
    $scope.userChoiceIsVisible = false;

    $scope.myUser = null;
    $scope.sharedUsers = [];

    $scope.messages = [];
    $scope.newMessage = null;

    var chatId = null;
    var pollId = null;

    var getOtherSharedUserLabel = function () {
        var list = [];
        angular.forEach($scope.sharedUsers, function (user, key) {
            if (user.id !== $scope.myUser.id) {
                list.push(user.label);
            }
        });
        return list.toString();
    }

    // handles event from another controller (navbar)
    $scope.$on('handleBroadcast', function () {
        
        if (sharedService.message === 'openChatBox') {
            if (sharedService.param !== null) {
                chatId = sharedService.param.id;
                $scope.sharedUsers = [];

                var sharedUserIdList = sharedService.param.description.split(",");
                var promiseList = [];

                angular.forEach(sharedUserIdList, function (id, key) {
                    var promise = chatService.getUser(id)
                                    .then(function (result) {
                                        $scope.sharedUsers.push(result.entity);
                                    });
                    promiseList.push(promise);
                });

                $q.all(promiseList)
                    .then(function(result) {
                        $scope.state = CHAT_STATE.open;
                    });                
            }
            else {
                $scope.state = CHAT_STATE.init;
            }
        }
    })

    $scope.$watch('state', function () {
        switch ($scope.state) {

            case CHAT_STATE.init:
                $scope.headerTitle = 'New Message';
                $scope.userFilter = '';
                $scope.userChoiceIsVisible = false;
                $scope.sharedUsers = [];
                $scope.messages = [];
                $scope.newMessage = null;
                break;

            case CHAT_STATE.open:
                $scope.headerTitle = getOtherSharedUserLabel();
                $scope.userFilter = '';
                $scope.userChoiceIsVisible = false;
                $scope.messages = [];
                $scope.newMessage = null;

                startMessagePolling();
                break;

            case CHAT_STATE.closed:
                stopMessagePolling();
                break;
        }
    })

    $scope.showUserChoice = function () {
        if ($scope.userFilter === '') {
            $scope.userChoiceIsVisible = false;
            $scope.sharedUsers = [];
        }
        else {
            $scope.userChoiceIsVisible = true;
        }
    }

    $scope.setSharedUser = function (user) {
        if ($scope.sharedUsers.indexOf(user) < 0) {
            $scope.sharedUsers.push(user);
        }
        $scope.userFilter = user.label;
        $scope.userChoiceIsVisible = false;
    }

    $scope.sendMessage = function () {
        $scope.newMessage.author = $scope.myUser.id;

        if (chatId === null)
        {
            $scope.sharedUsers.push($scope.myUser);

            chatService.addNewChat($scope.sharedUsers, $scope.newMessage)
                .then(function (result) {
                    chatId = result.disc;
                    $scope.messages.push($scope.newMessage);
                    $scope.newMessage = null;
                    $scope.state = CHAT_STATE.open;
                });
        }
        else {
            chatService.addNewMessage(chatId, $scope.newMessage)
                .then(function (result) {
                    $scope.messages.push($scope.newMessage);
                    $scope.newMessage = null;
                });
        }
    }

    var startMessagePolling = function () {
        chatService.getMessages(chatId)
            .then(function (result) {
                $scope.messages = result.disc.entries;
            });

        pollId = window.setInterval(function () {

            chatService.getMessages(chatId)
            .then(function (result) {
                $scope.messages = result.disc.entries;
            });

        }, 5000);   
    }

    var stopMessagePolling = function () {
        if (pollId != null) {
            window.clearInterval(pollId);
        }
    }

    chatService.getUser(UserSrv.getUser())
        .then(function (result) {
            $scope.myUser = result.entity;
        });

    chatService.getAllUsers()
        .then(function (result) {
            $scope.users = result.users;
        });
			
}]);

/**
* CUSTOM Directive
*/
angular.module('module.chat').directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

