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
angular.module('module.qa').constant('THREAD_TYPE', {discussion: {enum: 'disc', label: 'discussion'}, question: {enum: 'qa', label: 'question'}, answer: {enum: 'qaEntry', label: 'answer'}, chat: {enum: 'chat', label: 'chat'}});
// type of thread entry
angular.module('module.qa').constant('THREAD_ENTRY_TYPE', {answer: {enum: 'qaEntry', label: 'answer'}});

angular.module('module.qa').factory('Thread', ['UriToolbox', function (UriToolbox) {

        // Constructor
        function Thread(id, author, type, title, description, entity_id, creationTime, circleTypes, likes) {
            // Public properties
            this.id = id;
            this.type = type;
            this.title = title;
            this.description = description;
            this.entityId = entity_id;
            this.entries = new Array();
            this.creationTime = new Date(creationTime);
            this.author = author;
            this.tags = new Array();
            this.attachments = new Array();
            this.attachedFiles = new Array();
            this.circleTypes = circleTypes;
            this.likes = likes;
            this.mimeType = null;
            if (!likes)
                this.likes = {likes : 0, dislikes : 0, like : null};
        }

        // Public method
        Thread.prototype.getFormattedCreationTime = function () {
            return this.creationTime.toLocaleDateString() + ' ' + this.creationTime.toLocaleTimeString();
        };

        return Thread;
    }])

angular.module('module.qa').factory('ThreadEntry', function () {

    // Constructor
    function ThreadEntry(id, author, type, content, position, creationTime, likes) {
        // Public properties
        this.id = id;
        this.threadId = null;
        this.type = type;
        this.content = content;
        this.position = position;
        this.creationTime = new Date(creationTime);
        this.author = author;
        this.tags = new Array();
        this.attachments = new Array();
        this.comments = new Array();
        this.attachedFiles = new Array();
        this.likes = likes;
        this.mimeType = null;
        if (!likes)
            this.likes = {likes : 0, dislikes : 0, like : null};
    }

    // Public method
    ThreadEntry.prototype.getFormattedCreationTime = function () {
        return this.creationTime.toLocaleDateString() + ' ' + this.creationTime.toLocaleTimeString();
    };

    return ThreadEntry;
})

angular.module('module.qa').factory('Tag', function () {

    // Constructor
    function Tag(id, entity_id, label) {
        // Public properties
        this.id = id;
        this.entityId = entity_id;
        this.label = label;
        this.frequency = 0;
        this.space = 'privateSpace';
    }

    return Tag;
})

angular.module('module.qa').factory('Author', function () {

    // Constructor
    function Author(id, name, email) {
        // Public properties
        this.id = id;
        this.name = name;
        this.email = email;
    }

    return Author;
})

angular.module('module.qa').factory('Attachment', ['$q', 'UserService', 'ENTITY_TYPES', function($q, UserSrv, ENTITY_TYPES) {

    // Constructor
    function Attachment(id, label, type) {
        // Public properties
        this.id = id;
        this.name = label;
        this.type = type == null ? 'file' : type;
        this.mimeType = jSGlobals.substring(id, jSGlobals.lastIndexOf(id, jSGlobals.dot) + 1, jSGlobals.length(id));
        
        this.servHandleFileDownload = function(defer){
          var self = this;
        
          return function(fileAsBlob){
        
            var a = document.createElement("a");
            a.download    = self.name;
        
            a.href        = window.URL.createObjectURL(fileAsBlob);
            a.textContent = jSGlobals.download;
        
            a.click(); 
            defer.resolve();
          };
        }
    }
    
    Attachment.prototype.downloadFile = function(){
        var defer = $q.defer();
    
        if(this.type !== ENTITY_TYPES.file)
          return null;
    
        new SSFileDownload(
          this.servHandleFileDownload(defer),
          function(error){ defer.reject(); console.log(error); },
          UserSrv.getUser(),
          UserSrv.getKey(),
          this.id
          );
    
        return defer.promise;
      };
      
      Attachment.prototype.getFile = function(){
        var defer = $q.defer();
      
        if(this.type !== ENTITY_TYPES.file)
          return null;
      
        new SSFileDownload(
          function (result) {
            defer.resolve(result);
          },
          function(error){ defer.reject(); console.log(error); },
          UserSrv.getUser(),
          UserSrv.getKey(),
          this.id
          );
      
        return defer.promise;
      };

    return Attachment;
}])

/**
 * Services
 */

angular.module('module.qa').service("qaService", ['$q', '$rootScope', 'UserService', 'THREAD_TYPE', 'THREAD_ENTRY_TYPE', 'Thread', 'ThreadEntry', 'Author', 'Tag', 'Attachment', function ($q, $rootScope, UserSrv, THREAD_TYPE, THREAD_ENTRY_TYPE, Thread, ThreadEntry, Author, Tag, Attachment) {

        var getThreadTypeByEnum = function (enum_value) {
            var type = null;
            angular.forEach(THREAD_TYPE, function (value, key) {
                if (value.enum == enum_value) {
                    type = value;
                }
            });
            return type;
        };

        var getThreadEntryTypeByEnum = function (enum_value) {
            var type = null;
            angular.forEach(THREAD_ENTRY_TYPE, function (value, key) {
                if (value.enum == enum_value) {
                    type = value;
                }
            });
            return type;
        };

        var getAuthorDetails = function (object) {

            var defer = $q.defer();

            //setTimeout(function () {
            //    object.author = new Author('test1');
            //    defer.resolve(object);
            //}, 10);

            new SSEntityGet(
                    function (result) {
                        var author = new Author(result.entity.id,result.entity.label, result.entity.email);
                        object.author = author;
                        defer.resolve(object);
                    },
                    function (error) {
                        console.log(error);
                        defer.reject(error);
                    },
                    UserSrv.getUser(),
                    UserSrv.getKey(),
                    object.author.id
                    );

            return defer.promise;
        };

        var getEntityDetails = function (id) {
            var defer = $q.defer();

            new SSEntityGet(
                    function (result) {
                        defer.resolve(result);
                    },
                    function (error) {
                        console.log(error);
                        defer.reject(error);
                    },
                    UserSrv.getUser(),
                    UserSrv.getKey(),
                    id
                    );

            return defer.promise;
        };

        this.addNewThread = function (thread) {
            var defer = $q.defer();

            var attachmentIdList = new Array();
            angular.forEach(thread.attachments, function (attachment, key) {
                if (attachment.id !== undefined)
                    attachmentIdList.push(attachment.id);
            });

            new SSDiscEntryAdd(
                    function (result) {
                        thread.id = result.disc;
                        thread.author = {id: UserSrv.getUser()};
                        thread.creationTime = new Date();

                        addTags(thread)
                                .then(getAuthorDetails)
                                .then(function () {
                                    defer.resolve(thread)
                                });
                    },
                    function (error) {
                        console.log(error);
                        defer.reject(error);
                    },
                    UserSrv.getKey(),
                    thread.id, //disc
                    thread.entityId, //entity
                    null, //entry
                    true, //addNewDisc
                    thread.type.enum, //type
                    thread.title, //label
                    thread.description, //description 
                    null, //users
                    attachmentIdList, //entities
                    null //circles
                    );

            return defer.promise;
        };

        this.addNewAnswer = function (answer) {
            var defer = $q.defer();

            var attachmentIdList = new Array();
            angular.forEach(answer.attachments, function (attachment, key) {
                if (attachment.id !== undefined)
                    attachmentIdList.push(attachment.id);
            });

            new SSDiscEntryAdd(
                    function (result) {
                        answer.id = result.entry;
                        answer.author = {id: UserSrv.getUser()};
                        answer.creationTime = new Date();

                        addTags(answer)
                                .then(getAuthorDetails)
                                .then(function () {
                                    defer.resolve(answer)
                                });
                    },
                    function (error) {
                        console.log(error);
                        defer.reject(error);
                    },
                    UserSrv.getKey(),
                    answer.threadId, //disc
                    null, //entity
                    answer.content, //entry
                    false, //addNewDisc
                    null, //type
                    null, //label
                    null, //description
                    null, //users
                    attachmentIdList, //entities
                    null //circles
                    );

            return defer.promise;
        };

    this.addNewComment = function (answer) {
      var defer = $q.defer();
      
      new SSEntityCommentsAdd(
        function (result) {
          defer.resolve(answer)
      },
      function (error) {
        console.log(error);
        defer.reject(error);
      },
      UserSrv.getKey(),
      answer.id,
      [answer.comments[answer.comments.length - 1]]); //comments
      
      return defer.promise;
    };

    this.setLikeStatus = function (answer, status) {
      var defer = $q.defer();
      
      new SSLikeUpdate(
        function (result) {
            defer.resolve(answer)
        },
        function (error) {
            console.log(error);
            defer.reject(error);
        },
        UserSrv.getKey(),
        answer.id,
        status);
      
      return defer.promise;
    };

        this.uploadFiles = function (files, object) {
            var defer = $q.defer();

            var promiseList = [];

            angular.forEach(files, function (attachment, key) {
                var deferFile = $q.defer();

                new SSFileUpload(
                        function (file_id) {
                            deferFile.resolve(new Attachment(file_id, file_id, 'file'));
                        },
                        function (error) {
                            console.log(error);
                            deferFile.reject(error);
                        },
                        UserSrv.getUser(),
                        UserSrv.getKey(),
                        attachment._file
                        );

                promiseList.push(deferFile.promise);
            });

            $q.all(promiseList)
                    .then(function (result) {
                        object.attachments = object.attachments.concat(result);
                        defer.resolve(object);
                    });

            return defer.promise;
        };

        var addTags = function (object) {
            var defer = $q.defer();

            var promiseListTag = [];

            angular.forEach(object.tags, function (value, key) {

                var deferTag = $q.defer();

                new SSTagAdd(
                        function (result) {
                            deferTag.resolve(result);
                        },
                        function (error) {
                            console.log(error);
                            deferTag.reject(error);
                        },
                        UserSrv.getKey(),
                        object.id, //entity
                        value.label, //label
                        value.space, //space
                        null);  //creationTime

                promiseListTag.push(deferTag.promise);
            });

            $q.all(promiseListTag)
                    .then(function (result) {
                        defer.resolve(object);
                    });

            return defer.promise;
        };

        var getTags = function (object) {
            var defer = $q.defer();

            //setTimeout(function () {
            //    object.tags.push(new Tag('id','entityId','tag1'));
            //    object.tags.push(new Tag('id', 'entityId', 'tag2'));
            //    defer.resolve(object);
            //}, 10);

            new SSTagsGetPOST(
                    function (result) {
                        angular.forEach(result.tags, function (value, key) {
                            var tag = new Tag(value.id, value.entity, value.label);
                            tag.space = value.space;

                            object.tags.push(tag);
                        });
                        defer.resolve(object);
                    },
                    function (error) {
                        console.log(error);
                        defer.reject(error);
                    },
                    UserSrv.getKey(),
                    null, //forUser
                    [object.id], //entities
                    null, //labels
                    null, //space
                    null //startime
                    );
            return defer.promise;
        };

        this.getEntitiesForTag = function (tag) {
            var defer = $q.defer();

            new SSEntitiesForTagsGet(
                    function (result) {

                        var promiseList = [];

                        angular.forEach(result.entities, function (entry, key) {

                            var deferEntityDetails = $q.defer();

                            getEntityDetails(entry)
                                    .then(function (result) {
                                        deferEntityDetails.resolve(result);
                                    });

                            promiseList.push(deferEntityDetails.promise);
                        });

                        $q.all(promiseList)
                                .then(function (result) {
                                    defer.resolve(result);
                                });

                    },
                    function (error) {
                        console.log(error);
                        defer.reject(error);
                    },
                    UserSrv.getKey(),
                    null, //forUser
                    [tag.label], //labels
                    null, //space
                    null //startTime
                    );

          return defer.promise;
        };

        var getThreadEntryDetails = function (thread, entries) {

            var defer = $q.defer();
            var promiseListEntryAuthor = [];

            angular.forEach(entries, function (value, key) {
                var entry = new ThreadEntry(value.id, value.author, getThreadEntryTypeByEnum(value.type), value.content, value.pos, value.creationTime, value.likes);

                if (value.comments != null) {
                    entry.comments = value.comments;
                }

                thread.entries.push(entry);

                getAttachmentDetailsSync(entry, value.attachedEntities);

                var deferEntryAuthor = $q.defer();

                getAuthorDetails(entry)
                        .then(getTags)
                        .then(function (result) {
                            deferEntryAuthor.resolve(result);
                        });

                promiseListEntryAuthor.push(deferEntryAuthor.promise);
            });

            $q.all(promiseListEntryAuthor)
                    .then(function (result) {
                        defer.resolve(thread);
                    });

            return defer.promise;
        };

        var getAttachmentDetailsSync = function (object, attachments) {
            angular.forEach(attachments, function (value, key) {
                var attachment = new Attachment(value.id, value.label, value.type);
                object.attachments.push(attachment);
            });

            return;
        };

    var getThreadWithEntries = function (id) {
      var deferThread = $q.defer();
      
      new SSDiscGet(
        function (result) {
          
          var thread = new Thread(result.disc.id, result.disc.author, getThreadTypeByEnum(result.disc.type), result.disc.label, result.disc.description, result.disc.entity, result.disc.creationTime, result.disc.circleTypes, {likes : 10, dislikes : 5, like : null});
        var entries = result.disc.entries;
        
        getAttachmentDetailsSync(thread, result.disc.attachedEntities);
        
        getThreadEntryDetails(thread, entries)
          .then(getAuthorDetails)
          .then(getTags)
          .then(function () {
            deferThread.resolve(thread);
        });
      },
      function (error) {
        console.log(error);
        deferThread.reject(error);
      },
      UserSrv.getKey(),
      id, //disc
      true); //includeComments
      
      return deferThread.promise;
    };

        // to make the function accessible from the controller
        this.getThreadWithEntries = getThreadWithEntries;

        this.getAllThreads = function () {
            var deferThreadList = $q.defer();

            new SSDiscsGet(
                    function (result) {

                        var promiseList = [];

                        angular.forEach(result.discs, function (value, key) {
                            var type = getThreadTypeByEnum(value.type);
                            var thread = new Thread(value.id, value.author, type, value.label, value.description, value.entity, value.creationTime, value.circleTypes, value.likes);

                            getAttachmentDetailsSync(thread, value.attachedEntities);

                            var deferThread = $q.defer();

                            getAuthorDetails(thread)
                                    .then(getTags)
                                    .then(function (result) {
                                        deferThread.resolve(result);
                                    }, function (error) {
                                        var test = error;
                                    });

                            promiseList.push(deferThread.promise);
                        });

                        $q.all(promiseList)
                                .then(function (result) {
                                    deferThreadList.resolve(result);
                                }, function (error) {
                                    var test = error;
                                });
                    },
                    function (error) {
                        console.log(error);
                        deferThreadList.reject(error);
                    },
                    UserSrv.getKey()
                    );

            return deferThreadList.promise;
        };

        this.searchThreads = function (keywordsToSearchFor, tagsToSearchFor, searchAnswers) {

            var tagList = [];
            $.each(tagsToSearchFor, function( index, value ) {
                tagList.push(value.label);
            });

            var deferThreadList = $q.defer();

            var typesToSearchOnlyFor = ["qa"];
            if (searchAnswers) {typesToSearchOnlyFor.push("qaEntry")};

            new SSSearch(
                    function (result) {

                        var promiseList = [];

                        angular.forEach(result.entities, function (value, key) {
                            var type = getThreadTypeByEnum(value.type);
                            var thread = new Thread(value.id, value.author, type, value.label, value.description, value.entity, value.creationTime, value.circleTypes, value.likes);

                            getAttachmentDetailsSync(thread, value.attachedEntities);

                            var deferThread = $q.defer();

                            getAuthorDetails(thread)
                                    .then(getTags)
                                    .then(function (result) {
                                        deferThread.resolve(result);
                                    }, function (error) {
                                        var test = error;
                                    });

                            promiseList.push(deferThread.promise);
                        });

                        $q.all(promiseList)
                                .then(function (result) {
                                    deferThreadList.resolve(result);
                                }, function (error) {
                                    var test = error;
                                });
                    },
                    function (error) {
                        console.log(error);
                        deferThreadList.reject(error);
                    },
                    UserSrv.getKey(),
                    false,                       //includeTextualContent
                    keywordsToSearchFor,         //wordsToSearchFor
                    tagList.length > 0,         //includeTags
                    tagList,                    //tagsToSearchFor
                    false,                      //includeMIs
                    null,                       //misToSearchFor
                    true,                      //includeLabel
                    keywordsToSearchFor,       //labelsToSearchFor
                    true,                      //includeDescription
                    keywordsToSearchFor,       //descriptionsToSearchFor
                    typesToSearchOnlyFor,       //typesToSearchOnlyFor
                    false,                      //includeOnlySubEntities
                    null,                       //entitiesToSearchWithin
                    false,                      //extendToParents
                    false,                      //includeRecommendedResults
                    false,                      //provideEntries
                    null,                       //pagesID
                    null,                       //pageNumber
                    null,                       //minRating,
                    null,                       //maxRating,
                    null,                       //localSearchOp,
                    null                        //globalSearchOp 
                    );



            return deferThreadList.promise;
        };

//        this.getSimilarThreads = function (thread) {
//           var deferThreadList = $q.defer();
//
//             new SSRecommResources(
//                     function (result) {
//                         var promiseList = [];
// 
//                         angular.forEach(result.resources, function (value, key) {
//                             var type = getThreadTypeByEnum(value.resource.type);
//                             var similar_thread = new Thread(value.resource.id,
//                                     value.resource.author,
//                                     type,
//                                     value.resource.label,
//                                     value.resource.description,
//                                     null,
//                                     value.resource.creationTime,
//                                     value.circleTypes);
//                             similar_thread.likelihood = Math.round(value.likelihood * 100);
// //similar_thread.likelihood = Math.floor(Math.random() * 100) + 1;
//                             var deferThread = $q.defer();
// 
//                             getAuthorDetails(similar_thread)
//                                     .then(getTags)
//                                     .then(function (result) {
//                                         deferThread.resolve(result);
//                                     });
// 
//                             promiseList.push(deferThread.promise);
//                         });
// 
//                         $q.all(promiseList)
//                                 .then(function (result) {
//                                     result.sort(function (a, b) {
//                                         if (a.likelihood > b.likelihood)
//                                             return -1;
//                                         else if (a.likelihood < b.likelihood)
//                                             return 1;
//                                         return 0;
//                                     });
//                                     deferThreadList.resolve(result);
//                                 });
//                     },
//                     function (error) {  //errorHandler, 
//                         console.log(error);
//                         deferThreadList.reject(error);
//                     },
//                     UserSrv.getUser(), //user
//                     UserSrv.getKey(), //key,
//                     UserSrv.getUser(), //forUser, 
//                     null, //entity, 
//                     null, //categories, 
//                     5, //maxResources, 
//                     ["qa"],         //typesToRecommOnly
//                     true); //setCircleTypes
// 
//             return deferThreadList.promise;
//         };


        this.getSimilarThreads = function (thread) {

            var tagList = [];
            $.each(thread.tags, function( index, value ) {
                tagList.push(value.label);
            });

            var deferThreadList = $q.defer();

            new SSSearch(
                    function (result) {
                        var promiseList = [];

                        angular.forEach(result.entities, function (value, key) {
                            var type = getThreadTypeByEnum(value.type);
                            var similar_thread = new Thread(value.id,
                                    value.author,
                                    type,
                                    value.label,
                                    value.description,
                                    null,
                                    value.creationTime,
                                    value.circleTypes, 
                                    {likes : 10, dislikes : 5, like : null});
                            var deferThread = $q.defer();

                            getAuthorDetails(similar_thread)
                                    .then(getTags)
                                    .then(function (result) {
                                        deferThread.resolve(result);
                                    });

                            promiseList.push(deferThread.promise);
                        });

                        $q.all(promiseList)
                                .then(function (result) {
                                    deferThreadList.resolve(result);
                                });
                    },
                    function (error) {  //errorHandler, 
                        console.log(error);
                        deferThreadList.reject(error);
                    },
                    UserSrv.getKey(),
                    false,                      //includeTextualContent
                    null,                       //wordsToSearchFor
                    true,                       //includeTags
                    tagList,                     //tagsToSearchFor
                    false,                      //includeMIs
                    null,                       //misToSearchFor
                    true,                       //includeLabel
                    thread.title.split(" "),    //labelsToSearchFor
                    false,                      //includeDescription
                    null,                       //descriptionsToSearchFor
                    ["qa"],                     //typesToSearchOnlyFor
                    false,                      //includeOnlySubEntities
                    null,                       //entitiesToSearchWithin
                    false,                      //extendToParents
                    true,                       //includeRecommendedResults
                    false,                      //provideEntries
                    null,                       //pagesID
                    null,                       //pageNumber
                    null,                       //minRating,
                    null,                       //maxRating,
                    null,                       //localSearchOp,
                    null                        //globalSearchOp 
                    );

            return deferThreadList.promise;
        };
    }]);