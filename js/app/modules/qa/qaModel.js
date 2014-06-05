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
* Q&A - Model and Services
*************************************************************************************/

/**
* Model
*/

// type of the thread; either disc, qa or chat
angular.module('module.models').constant('THREAD_TYPE', {discussion:'disc', question:'qa', chat:'chat'});

angular.module('module.models').factory('Thread', ['UriToolbox', function (UriToolbox) {
 		
  // Constructor
  function Thread(author_uri, type, title, explanation, target_entry_uri, uri, creationTimeTicks) {
    // Public properties
		this.authorUri = author_uri;
		// type of the thread; either disc, qa or chat
    this.type = type;
		this.title = title;
		this.explanation = explanation;
		// target uri of the entity to start a thread for
		this.targetUri = target_entry_uri;
		this.uri = uri;
		this.uriPathnameHash = UriToolbox.extractUriPathnameHash(uri);
		this.entries = new Array();
		this.author = null;
		this.creationTime = new Date(creationTimeTicks);
  }
 
 /*
  // Public method, assigned to prototype
  User.prototype.getFullName = function () {
    return this.firstName + ' ' + this.lastName;
  };
 
  // Private property
  var possibleRoles = ['admin', 'editor', 'guest'];
 
  // Private function
  function checkRole(role) {
    return possibleRoles.indexOf(role) !== -1;
  }
 
  
  // Static property
  // Using copy to prevent modifications to private property
  User.possibleRoles = angular.copy(possibleRoles);
 
  // Static method, assigned to class
  // Instance ('this') is not available in static context
  User.build = function (data) {
    if (!checkRole(data.role)) {
      return;
    }
    return new Person(
      data.first_name,
      data.last_name,
      data.role,
      Organisation.build(data.organisation) // another model
    );
  };
 */
  // Return the constructor function
  return Thread;
}])

angular.module('module.models').factory('ThreadEntry', function () {
 		
  // Constructor
  function ThreadEntry(author_uri, content, disc_entry_type, position, timestamp, uri) {
    // Public properties
		this.authorUri = author_uri;
		this.content = content;
		// type of the thread; either discEntry, qaEntry or chatEntry
    this.type = disc_entry_type;
		this.position = position;
		this.timestamp = timestamp;
		this.uri = uri;
  }
	
	return ThreadEntry;
})

angular.module('module.models').factory('Author', function () {
 		
  // Constructor
  function Author(name) {
    // Public properties
		this.name = name;
  }
	
	return Author;
})

/**
* Services
*/

angular.module('module.models').service("qaService", ['$q', '$rootScope','UserService','Thread','ThreadEntry','Author', function($q, $rootScope, UserSrv, Thread, ThreadEntry, Author){

	this.addNewThread = function(thread){
		var defer = $q.defer();
		
		new SSDiscEntryAdd(
			function(result){
				defer.resolve(result.disc);
			},
			function(error){
				console.log(error);
				defer.reject(error);
			},
			UserSrv.getUserUri(),
			UserSrv.getKey(),
			thread.uri,
			thread.targetUri,
			'',
			true,
			thread.type,
			thread.title,
			thread.explanation
			);

		return defer.promise;     
	};
	
	this.addComment = function(thread, comment){
		var defer = $q.defer();

		new SSDiscEntryAdd(
			function(result){
				defer.resolve(result);
			},
			function(error){
				console.log(error);
				defer.reject(error);
			},
			UserSrv.getUserUri(),
			UserSrv.getKey(),
			thread.uri,
			thread.targetUri,
			comment,
			false,
			thread.type,
			thread.title
			);

		return defer.promise;     
	};

	this.getThreadEntries = function(thread){
		var defer = $q.defer();
		var entries = new Array();
		
		new SSDiscWithEntriesGet(
			function(result){
				angular.forEach(result.disc.entries, function(value, key){
					var entry = new ThreadEntry(value.author, value.content, value.discEntryType, value.pos, value.timestamp, value.uri, value.creationTime);
					entries.push(entry);
				});

        defer.resolve(entries);
      },
      function(error){
			  console.log(error);
				defer.reject(error);
      },
      UserSrv.getUserUri(),
      UserSrv.getKey(),
			thread.uri
      );

    return defer.promise;     
	};

  this.getAllThreads = function(){
    var defer = $q.defer();
		var threadList = new Array();
		
    new SSDiscsAllGet(
      function(result){
        angular.forEach(result.discs, function(value, key){
					var thread = new Thread(value.author, value.discType, value.label, value.explanation, value.target, value.uri, value.creationTime);
          threadList.push(thread);
        });

        defer.resolve(threadList);
      },	
      function(error){
			  console.log(error);
				defer.reject(error);
      },
      UserSrv.getUserUri(),
      UserSrv.getKey()
      );

    return defer.promise;  
  };
	
	this.getAuthorDetails = function(thread){
		var defer = $q.defer();

		new SSEntityGet(
			function(result){
				var author = new Author(result.entity.label);
				defer.resolve(author);
			},
			function(error){
				console.log(error);
				defer.reject(error);
			},
			UserSrv.getUserUri(),
			UserSrv.getKey(),
			thread.authorUri
			);

		return defer.promise;     
	};
		
}]);