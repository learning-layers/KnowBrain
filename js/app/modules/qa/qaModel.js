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
            this.comments = new Array();
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
    function ThreadEntry(id, author, type, content, position, creationTime, likes, accepted) {
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
        this.accepted = accepted;
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
    function Author(id, name, email, thumb) {
        // Public properties
        this.id = id;
        this.name = name;
        this.email = email;
        this.thumb = thumb;
    }

    return Author;
})

angular.module('module.qa').factory('Attachment', ['$q', 'UserService', 'ENTITY_TYPES', function($q, UserSrv, ENTITY_TYPES) {

    // Constructor
    function Attachment(id, label, type) {
        // Public properties
        this.id = id;
        this.name = label;
        this.type = type == null ? ENTITY_TYPES.file : type;
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

          new SSEntitiesGetFiltered(
            function (result) {
                if (result.entities.length > 0) {
                    var thumb = "images/circles/user.svg";
                    if (result.entities[0].thumb != undefined) {
                        thumb = result.entities[0].thumb.file.downloadLink;
                    };
                    var author = new Author(result.entities[0].id, result.entities[0].label, result.entities[0].email, thumb);
                    object.author = author;
                }
                defer.resolve(object);
              },
              function (error) {
                console.log(error);
                defer.reject(error);
              },
              UserSrv.getKey(),
              [object.author.id], //entities,
              null, // circle
              null, //setTags,
              null, // space
              null, //setOverallRating, 
              null, //setDiscs, 
              null, //setUEs, 
              true, //setThumb, 
              null, //setFlags,
              null //setCircles
                );

            return defer.promise;
        };

    var getEntityDetails = function (id) {
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

        this.addNewThread = function (thread) {
            var defer = $q.defer();

            var attachmentIdList = new Array();
            var attachmentLabelList = new Array();
            angular.forEach(thread.attachments, function (attachment, key) {
                if (attachment.id !== undefined) {
                    attachmentIdList.push(attachment.id);
                }
                if (attachment.label !== undefined) {
                    attachmentLabelList.push(attachment.label);
                } else if (attachment.name !== undefined) {
                    attachmentLabelList.push(attachment.name);
                }
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
                    [thread.entityId], //entity
                    null, //entry
                    true, //addNewDisc
                    thread.type.enum, //type
                    thread.title, //label
                    thread.description, //description 
                    null, //users
                    attachmentIdList, //entities
                    attachmentLabelList, //entityLabels
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
                    null, //entityLabels
                    null //circles
                    );

            return defer.promise;
        };

    this.addNewComment = function (answer) {
      var defer = $q.defer();
      
      new SSCommentsAdd(
        function (result) {
          defer.resolve(answer)
      },
      function (error) {
        console.log(error);
        defer.reject(error);
      },
      UserSrv.getKey(),
      answer.id, //entity
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

    this.setAnswerAcceptedStatus = function (answer, status) {
      var defer = $q.defer();
      
      new SSDiscEntryAccept(
        function (result) {
            defer.resolve(answer)
        },
        function (error) {
            console.log(error);
            defer.reject(error);
        },
        UserSrv.getKey(),
        answer.id);
      
      return defer.promise;
    };

        this.uploadFiles = function (files, object) {
            var defer = $q.defer();

            var promiseList = [];

            angular.forEach(files, function (attachment, key) {
                var deferFile = $q.defer();

                new SSFileUpload(
                        function (result, fileName) {
                            deferFile.resolve(new Attachment(result.file, fileName, 'uploadedFile'));
                          },
                          function (error) {
                            console.log(error);
                          deferFile.reject(error);
                        },
                          UserSrv.getKey(),
                          attachment._file);
                        
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
                        null, //circle
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

            new SSTagsGetFiltered(
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
                    null, //circles
                    null //startime
                    );
            return defer.promise;
        };

        this.getEntitiesForTag = function (tag) {
            var defer = $q.defer();

            new SSEntitiesForTagsGetFiltered(
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
                var entry = new ThreadEntry(value.id, value.author, getThreadEntryTypeByEnum(value.type), value.content, value.pos, value.creationTime, value.likes, value.accepted);

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
      
      new SSDiscGetFiltered(
        function (result) {
          
          var thread = new Thread(result.disc.id, result.disc.author, getThreadTypeByEnum(result.disc.type), result.disc.label, result.disc.description, null, result.disc.creationTime, result.disc.circleTypes, {likes : 10, dislikes : 5, like : null});
        if (result.disc.comments != null) {
            thread.comments = result.disc.comments;
        }

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
                            var thread = new Thread(value.id, value.author, type, value.label, value.description, null, value.creationTime, value.circleTypes, value.likes);

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
                    UserSrv.getUser() //forUser
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
                            var thread = new Thread(value.id, value.author, type, value.label, value.description, null, value.creationTime, value.circleTypes, value.likes);

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
                    keywordsToSearchFor,         //wordsToSearchFor
                    tagList,                    //tagsToSearchFor
                    null,                       //authorsToSearchFor
                    keywordsToSearchFor,       //labelsToSearchFor
                    keywordsToSearchFor,       //descriptionsToSearchFor
                    typesToSearchOnlyFor,       //typesToSearchOnlyFor
                    false,                      //includeRecommendedResults
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
                    null,                       //wordsToSearchFor
                    tagList,                     //tagsToSearchFor
                    null,                       //authorsToSearchFor
                    thread.title.split(" "),    //labelsToSearchFor
                    null,                       //descriptionsToSearchFor
                    ["qa"],                     //typesToSearchOnlyFor
                    true,                       //includeRecommendedResults
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