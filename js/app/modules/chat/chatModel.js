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

/************************************************************************************
* Chat - Model and Services
*************************************************************************************/

/**
* Model
*/



/**
* Services
*/

angular.module('module.chat').service("chatService", ['$q', '$rootScope','UserService', function($q, $rootScope, UserSrv){
	
    this.getAllUsers = function () {

        var defer = $q.defer();
        var self = this;

        new SSUsersGet(
            function (result) {
                defer.resolve(result);
            },
            function (error) {
                console.log(error);
                defer.reject(error);
            },
            UserSrv.getKey()
        );

        return defer.promise;
    };

    this.getUser = function (id) {

        var defer = $q.defer();

        new SSEntitiesGetFiltered(
			function (result) {
			    defer.resolve(result.entities[0]);
			},
			function (error) {
			    console.log(error);
			    defer.reject(error);
			},
			UserSrv.getKey(),
			[id], //entities,
			null, // circle
      null, //setTags,
      null, // space
      null, //setOverallRating, 
      null, //setDiscs, 
      null, //setUEs, 
      null, //setThumb, 
      null, //setFlags,
      null //setCircles
			);

        return defer.promise;
    };

    this.addNewChat = function (sharedUsers, message) {
        var defer = $q.defer();
        var currentTime = new Date();

        var sharedUserIdList = []
        angular.forEach(sharedUsers, function (user, key) {
            sharedUserIdList.push(user.id);
        });

        var allOtherUserList = [];
        var myId = UserSrv.getUser();
        angular.forEach(sharedUserIdList, function (id, key) {
            if (id !== myId) {
                allOtherUserList.push(id);
            }
        });

      new SSDiscEntryAdd(
        function (result) {
          
			    if (message !== null) {
            addNewMessage(result.disc, message)
            .then(function (result) {
              defer.resolve(result);
          });
        }
			},
			function (error) {
        console.log(error);
        defer.reject(error);
			},
			UserSrv.getKey(),
			null,//disc, 
			null,//targets, 
			null,//entry, 
			true,//addNewDisc,
			'chat',//type,
			currentTime.toLocaleDateString() + ' ' + currentTime.toLocaleTimeString(), //label, 
			sharedUserIdList.toString(),//description,
			allOtherUserList,//users,
			null, //entities
      null, //entityLabels
      null //circles
			);

        return defer.promise;
      };
    
    var addNewMessage = function (chatId, message) {
      var defer = $q.defer();
      
      new SSDiscEntryAdd(
        function (result) {
			    defer.resolve(result);
			},
			function (error) {
        console.log(error);
        defer.reject(error);
			},
			UserSrv.getKey(),
			chatId,//disc, 
			null,//targets, 
			message.content,//entry, 
			false,//addNewDisc,
			null,//type,
			null,//label, 
			null,//description,
			null,//users,
			null,//entities
      null, //entityLabels
      null //circles
        );
      
      return defer.promise;
    };
    
    this.addNewMessage = addNewMessage;
    
    this.getMessages = function (chatId) {
      var defer = $q.defer();
      
      new SSDiscGetFiltered(
        function (result) {
          defer.resolve(result);
			},
      function (error) {
        console.log(error);
        defer.reject(error);
      },
      UserSrv.getKey(),
      chatId, //disc
      false); //includeComments
      
      return defer.promise;
    };
		
  }]);