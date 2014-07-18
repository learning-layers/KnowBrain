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
  function Thread(id, type, title, explanation, entry_id, creationTime) {
    // Public properties
		this.id = id;
    this.type = type;
		this.title = title;
		this.explanation = explanation;
		this.entityId = entry_id;
		this.entries = new Array();
		this.creationTime = new Date(creationTime);
		this.author = null;
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
  function ThreadEntry(id, type, content, position, timestamp) {
    // Public properties
		this.id = id;
		this.type = type;
		this.content = content;
		this.position = position;
		this.timestamp = new Date(timestamp);
		this.author = null;
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
	
	var addAuthorDetails = function(thread, author_id){
		var defer = $q.defer();

		new SSEntityGet(
			function(result){
				var author = new Author(result.entity.label);
				thread.author = author;
				defer.resolve(thread);
			},
			function(error){
				console.log(error);
				defer.reject(error);
			},
			UserSrv.getUser(),
			UserSrv.getKey(),
			author_id
			);

		return defer.promise;     
	};

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

	var getThreadWithEntries = function(id){
		var deferThreadList = $q.defer();
				
		new SSDiscWithEntriesGet(
			function(result){
				
				var thread = new Thread(result.disc.id, getThreadTypeByEnum(result.disc.type), result.disc.label, result.disc.explanation, result.disc.entity, result.disc.creationTime);				
				var entries = result.disc.entries;
									
				var deferThreadAuthor = $q.defer();
					
				addAuthorDetails(thread, result.disc.author)
					.then(function(result) {
						deferThreadAuthor.resolve(result);
					});
				
				deferThreadAuthor.promise.then(function(result) {
					addEntries();
				});
				
				
				var addEntries = function() {
	
					var promiseListEntryAuthor = [];
					
					angular.forEach(entries, function(value, key){
						var entry = new ThreadEntry(value.id, getThreadEntryTypeByEnum(value.type), value.content, value.pos, value.timestamp);
						thread.entries.push(entry);
						
						var deferEntryAuthor = $q.defer();
						
						addAuthorDetails(entry, value.author)
							.then(function(result) {
								deferEntryAuthor.resolve(result);
							});
						
						promiseListEntryAuthor.push(deferEntryAuthor.promise);
					});
				
					$q.all(promiseListEntryAuthor)
						.then(function(result) {
							deferThreadList.resolve(thread);
						});
					};				
      },
      function(error){
			  console.log(error);
				deferThreadList.reject(error);
      },
      UserSrv.getUser(),
      UserSrv.getKey(),
			id
      );

    return deferThreadList.promise;     
	};
	
	// to make the function accessible from the controller
	this.getThreadWithEntries = getThreadWithEntries;

  this.getAllThreads = function(){
    var deferThreadList = $q.defer();
				
    new SSDiscsAllGet(
      function(result){
				
				var promiseListAuthor = [];	
				
        angular.forEach(result.discs, function(value, key){
					var type = getThreadTypeByEnum(value.type);
					var thread = new Thread(value.id, type, value.label, value.explanation, value.entity, value.creationTime);
					
					var deferAuthor = $q.defer();
					
					addAuthorDetails(thread, value.author)
						.then(function(result) {
							deferAuthor.resolve(result);
						});
					
					promiseListAuthor.push(deferAuthor.promise);
        });
				
				$q.all(promiseListAuthor)
					.then(function(result) {
						deferThreadList.resolve(result);
					});
      },	
      function(error){
			  console.log(error);
				deferThreadList.reject(error);
      },
      UserSrv.getUser(),
      UserSrv.getKey()
      );

    return deferThreadList.promise;  
  };
	
	this.getSimilarThreads = function(thread){
		var deferThreadList = $q.defer();
		
		new SSSearchCombined(
			function(result){
				
				var promiseList = [];			
				
				angular.forEach(result.searchResults, function(value, key){
					var deferThreadWithEntities = $q.defer();
									
					getThreadWithEntries(value.entity)
						.then(function(result) {
							deferThreadWithEntities.resolve(result);
						});
					
					promiseList.push(deferThreadWithEntities.promise);
				});
				
				$q.all(promiseList)
					.then(function(result) {
						deferThreadList.resolve(result);
					});
			},	
			function(error){
				console.log(error);
				deferThreadList.reject(error);
			},
			UserSrv.getUser(),
			UserSrv.getKey(),
			[thread.title], // keywords strings to search for
			null, //entities to search within
			false, // whether to search only in, e.g. collection entries, discussion entries
			[thread.type.enum], // entity types to consider when searching
			false, // whether to use tags for search (should be true as soon tags exists)
			false, // whether to search in the content of, e.g. a file
			true, // whether to include the name/title of entities in search
			true, // whether to include the description of entities in search
			false // whether to search with automatically calculated usage-based indicators
			);

		return deferThreadList.promise;  
	};
			
}]);