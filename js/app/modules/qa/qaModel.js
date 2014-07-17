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

// type of the thread
angular.module('module.qa').constant('THREAD_TYPE', {discussion:{enum:'disc', label:'discussion'}, question:{enum:'qa', label:'question'}, chat:{enum:'chat', label:'chat'}});
// type of thread entry
angular.module('module.qa').constant('THREAD_ENTRY_TYPE', {answer:{enum:'qaEntry', label:'answer'}});

angular.module('module.qa').factory('Thread', ['UriToolbox', function (UriToolbox) {
 		
  // Constructor
  function Thread(author_id, type, title, explanation, entry_id, id, creationTime) {
    // Public properties
		this.authorId = author_id;
    this.type = type;
		this.title = title;
		this.explanation = explanation;
		this.entityId = entry_id;
		this.id = id;
		this.entries = new Array();
		this.author = null;
		this.creationTime = new Date(creationTime);
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

angular.module('module.qa').factory('ThreadEntry', function () {
 		
  // Constructor
  function ThreadEntry(author_id, content, type, position, timestamp, id) {
    // Public properties
		this.authorId = author_id;
		this.content = content;
		// type of the thread; either discEntry, qaEntry or chatEntry
    this.type = type;
		this.position = position;
		this.timestamp = new Date(timestamp);
		this.id = id;
  }
	
	return ThreadEntry;
})

angular.module('module.qa').factory('Author', function () {
 		
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

angular.module('module.qa').service("qaService", ['$q', '$rootScope','UserService','THREAD_TYPE','THREAD_ENTRY_TYPE','Thread','ThreadEntry','Author', function($q, $rootScope, UserSrv, THREAD_TYPE, THREAD_ENTRY_TYPE, Thread, ThreadEntry, Author){
	
	this.getThreadTypeByEnum = function(enum_value) {
		angular.forEach(THREAD_TYPE, function(value, key){
			if(value.enum == enum_value) {
				return value;
			}
		});
		
		return null;
	}

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
			UserSrv.getUser(),
			UserSrv.getKey(),
			thread.id,
			thread.entityId,
			'',
			true,
			thread.type.enum,
			thread.title,
			thread.explanation
			);

		return defer.promise;     
	};
	
	this.addAnswer = function(thread, answer){
		var defer = $q.defer();

		new SSDiscEntryAdd(
			function(result){
				defer.resolve(result);
			},
			function(error){
				console.log(error);
				defer.reject(error);
			},
			UserSrv.getUser(),
			UserSrv.getKey(),
			thread.id,
			null,
			answer,
			false,
			null,
			null,
			null
			);

		return defer.promise;     
	};

	this.getThreadWithEntries = function(id){
		var defer = $q.defer();
		
		var thread = new Thread(null, null, '', '', null, id, null);
		var entries = new Array();
		
		new SSDiscWithEntriesGet(
			function(result){
				
				var getThreadTypeByEnum = function(enum_value) {
					var type = null;
					angular.forEach(THREAD_TYPE, function(value, key){
						if(value.enum == enum_value) {
							type = value;
						}
					});
					return type;
				};
				
				var getThreadEntryTypeByEnum = function(enum_value) {
					var type = null;
					angular.forEach(THREAD_ENTRY_TYPE, function(value, key){
						if(value.enum == enum_value) {
							type = value;
						}
					});
					return type;
				};
				
				thread.authorId = result.disc.author;
				thread.type = getThreadTypeByEnum(result.disc.type);
				thread.title = result.disc.label;
				thread.explanation = result.disc.explanation;
				thread.entityId = result.disc.entity;
				thread.creationTime = result.disc.creationTime;

				angular.forEach(result.disc.entries, function(value, key){
					var entry = new ThreadEntry(value.author, value.content, getThreadEntryTypeByEnum(value.type), value.pos, value.timestamp, value.id, value.timestamp);
					entries.push(entry);
				});
				
				thread.entries = entries;

        defer.resolve(thread);
      },
      function(error){
			  console.log(error);
				defer.reject(error);
      },
      UserSrv.getUser(),
      UserSrv.getKey(),
			id
      );

    return defer.promise;     
	};

  this.getAllThreads = function(){
    var defer = $q.defer();
		var threadList = new Array();
		
    new SSDiscsAllGet(
      function(result){
			
				var getThreadTypeByEnum = function(enum_value) {
					var type = null;
					angular.forEach(THREAD_TYPE, function(value, key){
						if(value.enum == enum_value) {
							type = value;
						}
					});
					return type;
				};
				
        angular.forEach(result.discs, function(value, key){
					var type = getThreadTypeByEnum(value.type);
					var thread = new Thread(value.author, type, value.label, value.explanation, value.entity, value.id, value.creationTime);
          threadList.push(thread);
        });

        defer.resolve(threadList);
      },	
      function(error){
			  console.log(error);
				defer.reject(error);
      },
      UserSrv.getUser(),
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
			UserSrv.getUser(),
			UserSrv.getKey(),
			thread.authorId
			);

		return defer.promise;     
	};
		
}]);