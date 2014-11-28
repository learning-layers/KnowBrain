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
angular.module('module.qa', []);

/**
 * CONFIG
 */
angular.module('module.qa').config(function ($stateProvider) {

    $stateProvider
            .state('app.qa', {
                url: '/qa',
                controller: 'qaController',
                templateUrl: MODULES_PREFIX + '/qa/qa.tpl.html'
            })

            .state('app.qa.qa', {
                url: '/qa/:id',
                controller: 'questionController',
                templateUrl: MODULES_PREFIX + '/qa/question.tpl.html'
            })

});

/**
 * Constants
 */
angular.module('module.qa').constant('THREAD_LIST_TYPE', {all: 'All', own: 'My Own', group: 'My Group'});

/**
 * CONTROLLER
 */
angular.module('module.qa').controller("qaController", ['$scope', '$state', '$q', '$modal', '$dialogs', '$filter', 'UserService', 'sharedService', 'UriToolbox', 'qaService', 'Thread', 'THREAD_TYPE', 'THREAD_LIST_TYPE', 'Tag', function ($scope, $state, $q, $modal, $dialogs, $filter, UserSrv, sharedService, UriToolbox, qaService, Thread, THREAD_TYPE, THREAD_LIST_TYPE, Tag) {

        $scope.THREAD_TYPE = THREAD_TYPE;
        $scope.newThread = new Thread(null, null, THREAD_TYPE.question, null, null, null, null);
        $scope.threadList = null;
        $scope.tagThreadList = null;
        $scope.myOwnThreadList = [];
        $scope.myGroupThreadList = [];
        $scope.threadResponseLabel = "answer";
        $scope.THREAD_LIST_TYPE = THREAD_LIST_TYPE;
        $scope.selectedThreadListType = THREAD_LIST_TYPE.all;
        $scope.threadListHeader = "All";
        $scope.searchString = '';
        $scope.searchTags = [];
        
        var loadDetailPage = function (thread)
        {
            $state.transitionTo('app.qa.' + thread.type.enum, {id: UriToolbox.extractUriPathnameHash(thread.id)});
        };
        $scope.changeSelectedThreadListType = function (threadListType)
        {
            $scope.selectedThreadListType = threadListType;
        };
        
        $scope.selectedThreadList = function ()
        {
            switch ($scope.selectedThreadListType) {
                case THREAD_LIST_TYPE.all:
                    return $scope.tagThreadList;
                case THREAD_LIST_TYPE.own:
                    return $scope.myOwnThreadList;
                case THREAD_LIST_TYPE.group:
                    return $scope.myGroupThreadList;
            };
        };
        $scope.onTagAdded = function ($tag, object)
        {
            $tag.space = 'privateSpace';
        };
        $scope.onTagClicked = function (tag) {
            $scope.searchTags.push(tag.label);
            updateThreadLists();
        };
        
        $scope.removeSearchTag = function(tagIndex) {
            $scope.searchTags.splice(tagIndex, 1);
            updateThreadLists();
        } 
        
        var updateThreadLists = function () {
            $scope.tagThreadList = $scope.threadList.filter(function(val) {
                return ($scope.searchTags.length == 0 ||
                        $scope.searchTags.every(function(value) { return $.map(val.tags,function(v){return v.label;}).indexOf(value) >= 0; }));
            });
            $scope.myOwnThreadList = $scope.threadList.filter(function(val) {
                return ($.inArray('priv', val.circleTypes) >= 0) &&
                        ($scope.searchTags.length == 0 ||
                        $scope.searchTags.every(function(value) { return $.map(val.tags,function(v){return v.label;}).indexOf(value) >= 0; }));
            });
            $scope.myGroupThreadList = $scope.threadList.filter(function(val) {
                return ($.inArray('group', val.circleTypes) >= 0) &&
                        ($scope.searchTags.length == 0 ||
                        $scope.searchTags.every(function(value) { return $.map(val.tags,function(v){return v.label;}).indexOf(value) >= 0; }));
            });
        };
        
        $scope.removeAttachment = function (attachment) {
            $.each($scope.newThread.attachments, function (i) {
                if ($scope.newThread.attachments[i].id === attachment.id) {
                    $scope.newThread.attachments.splice(i, 1);
                    return false;
                }
            });
        };
        
        $scope.removeAttachedFiles = function (attachedFile) {
            $.each($scope.newThread.attachedFiles, function (i) {
                if ($scope.newThread.attachedFiles[i].id === attachedFile.id) {
                    $scope.newThread.attachedFiles.splice(i, 1);
                    return false;
                }
            });
        };

        var loadThreadList = function ()
        {
            return qaService
                    .getAllThreads()
                    .then(function (result) {
                        $scope.threadList = result;
                        $scope.tagThreadList = result;
                        $scope.myOwnThreadList = result.filter(function(val) {
                            return $.inArray('priv', val.circleTypes) >= 0;
                        });
                        $scope.myGroupThreadList = result.filter(function(val) {
                            return $.inArray('group', val.circleTypes) >= 0;
                        });
                        return result;
                    });
        };
        $scope.invokePostNewThread = function ()
        {
            loadSimilarThreadList()
                    .then(openSimilarThreads);
        };
        var loadSimilarThreadList = function ()
        {
            return qaService
                    .getSimilarThreads($scope.newThread)
                    .then(function (result) {
                        return $filter('threadTypeFilter')(result, $scope.newThread.type);
                    });
        };
        var postNewThread = function ()
        {

            return qaService
                    .uploadAttachments($scope.newThread)
                    .then(qaService.addNewThread)
                    .then(function (result) {
                        $scope.threadList.push(result);
                        updateThreadLists();
                        $scope.newThread = new Thread(null, null, THREAD_TYPE.question, null, null, null, null);
                        return result;
                    });
        };
        var openSimilarThreads = function (similarThreadList) {
            if (similarThreadList.length > 0)
            {
                var modalInstance = $modal.open({
                    templateUrl: MODULES_PREFIX + '/qa/modalSimilarThreads.tpl.html',
                    controller: 'ModalSimilarThreadsController',
                    size: 'lg',
                    resolve: {
                        thread: function () {
                            return $scope.newThread;
                        },
                        similarThreadList: function () {
                            return similarThreadList;
                        }
                    }
                });
                modalInstance.result.then(function (post) {
                    if (post) {
                        postNewThread();
                    }
                }, function () {
                    //$log.info('Modal dismissed at: ' + new Date());
                });
            }
            else
            {
                postNewThread();
            }
        };
        $scope.openAddAttachments = function (object) {
            var modalInstance = $modal.open({
                templateUrl: MODULES_PREFIX + '/qa/modalAddAttachments.tpl.html',
                controller: 'ModalAddAttachmentsController',
                size: 'lg',
                resolve: {
                }
            });
            modalInstance.result.then(function (fileList) {
                fileList.forEach(function (entry) {
                    if (entry.id !== null && entry.id !== undefined) {
                        object.attachments.push(entry);
                    } else {
                        object.attachedFiles.push(entry);
                    }
                });
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };
        $scope.addComment = function (answer) {
            answer.comments.push(answer.newComment);
            qaService.addNewComment(answer)
                    .then(function (result) {
                        answer.newComment = null;
                        var test = result;
                    });
        }

        $scope.openThread = function (thread)
        {
            switch (thread.type) {
                case THREAD_TYPE.question:
                    loadDetailPage(thread);
                    break;
                case THREAD_TYPE.chat:
                    sharedService.prepareForBroadcast('openChatBox', thread);
                    break;
            }
        }

        $scope.shareThread = function (thread) {
            $dialogs.shareEntity(thread);
        }
        
        $scope.showAttachment = function (attachment) {
            if (attachment.type === 'entity') {
                window.open(attachment.id,'_blank');
            } else {
                $dialogs.attachmentDetail(attachment);
            }
        }

        // load data
        loadThreadList();
    }]);
    
angular.module('module.qa').controller('ModalSimilarThreadsController', ['$scope', '$modalInstance', '$state', 'qaService', 'UriToolbox', 'thread', 'similarThreadList', 'THREAD_LIST_TYPE', function ($scope, $modalInstance, $state, qaService, UriToolbox, thread, similarThreadList, THREAD_LIST_TYPE) {

        $scope.THREAD_LIST_TYPE = THREAD_LIST_TYPE;
        $scope.selectedSimilarThreadListType = THREAD_LIST_TYPE.own;
        $scope.thread = thread;
        $scope.similarThreadList = similarThreadList;
        $scope.myOwnSimilarThreadList = similarThreadList.filter(function(val) {
            return $.inArray('priv', val.circleTypes) >= 0;
        });
        $scope.myGroupSimilarThreadList = similarThreadList.filter(function(val) {
            return $.inArray('group', val.circleTypes) >= 0;
        });
        
        $scope.changeSelectedSimilarThreadListType = function (threadListType)
        {
            $scope.selectedSimilarThreadListType = threadListType;
        };
        
        $scope.selectedSimilarThreadList = function ()
        {
            switch ($scope.selectedSimilarThreadListType) {
                case THREAD_LIST_TYPE.own:
                    return $scope.myOwnSimilarThreadList;
                case THREAD_LIST_TYPE.group:
                    return $scope.myGroupSimilarThreadList;
            };
        };
        
        $scope.loadDetailPage = function (thread)
        {
            $state.transitionTo('app.qa.' + thread.type.enum, {id: UriToolbox.extractUriPathnameHash(thread.id)});
            $modalInstance.close(false);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        $scope.ok = function ()
        {
            $modalInstance.close(true);
        };
    }]);
    
angular.module('module.qa').controller('ModalAddAttachmentsController', ['$scope', '$modalInstance', '$state', 'qaService', function ($scope, $modalInstance, $state, qaService) {


        $scope.resourceTypes = ['choose', 'dropbox', 'upload', 'link'];
        $scope.currentResourceType = 0;
        /* PATHS */
        $scope.addLinkTplPath = MODULES_PREFIX + "/dialog/wizzard-create-link.tpl.html";
        $scope.chooseFromDropboxTplPath = MODULES_PREFIX + "/dialog/wizzard-choose-from-dropbox.tpl.html";
        $scope.uploadResourceTplPath = MODULES_PREFIX + "/qa/add-attachments-upload-files.tpl.html";
        $scope.chooseResourceTypeTplPath = MODULES_PREFIX + "/qa/add-attachments-choose-type.tpl.html";
        
        
        
        
        /* TITLE */
        $scope.wizzardTitles = ['Attach content', 'Attach from Dropbox', 'Attach resources', 'Attach a Link'];
        $scope.getCurrentResourceType = function () {
            return $scope.resourceTypes[$scope.currentResourceType];
        };
        $scope.getCurrentWizzardTitle = function () {
            return $scope.wizzardTitles[$scope.currentResourceType];
        };
        
        
        
        
        $scope.chooseResourceType = function (type) {
            $scope.currentResourceType = type;
        };
        $scope.selectedResources = [];
        $scope.attachAllResources = function () {
            $modalInstance.close($scope.selectedResources);
        };
        
        $scope.fileList = [];
        $scope.uploadAllFiles = function () {
            $modalInstance.close($scope.fileList);
        };
        
        $scope.ok = function () {
            $modalInstance.close($scope.fileList);
        };
        
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        
        $scope.appendFile = function (files) {
            angular.forEach(files, function (file, key) {
                $scope.fileList.unshift(file);
            });
            $scope.$apply();
        };
        
        $scope.removeFile = function (index) {
            $scope.fileList.splice(index, 1);
        };
        
        $scope.getFileSizeString = function (size) {
            var mb = ((size / 1024) / 1024);
            if (mb < 0.01) {
                mb = (size / 1024);
                return mb.toFixed(2) + " KB";
            }

            return mb.toFixed(2) + " MB";
        };
        /**
         * FILE DROP-ZONE EVENTS
         */
        
        $scope.$on('$viewContentLoaded', function () {
         var dropZone = document.getElementById('upload-drop-container');


         dropZone.bind('dragover', function(e) {
         e.stopPropagation();
         e.preventDefault();
         e.originalEvent.dataTransfer.effectAllowed = 'copy';
         });

         dropZone.bind('dragenter', function(e) {
         e.stopPropagation();
         e.preventDefault();
         e.originalEvent.dataTransfer.effectAllowed = 'copy';
         });

        dropZone.bind('drop', function(e){
         e.stopPropagation();
         e.preventDefault();

         angular.forEach(e.originalEvent.dataTransfer.files, function(file, key){
         try
         {
         var entry = e.originalEvent.dataTransfer.items[key].webkitGetAsEntry() || e.originalEvent.dataTransfer.items[key].getAsEntry();
         if (entry.isFile) {
         file.isFile = true;
         file.uploading = false;
         file.uploaded = false;
         $scope.appendFileToUploadList(file);
         } else if (entry.isDirectory) {
         file.isFile = false;
         $scope.appendFileToUploadList(file);
         }

         }
         catch(error)
         {
         console.log("Problem while drag & drop. probably no file-api. ERROR: " + error);
         }

         });
         });
});

    }]);
angular.module('module.qa').controller("questionController", ['$scope', '$state', '$stateParams', '$q', '$filter', 'UserService', 'qaService', 'ThreadEntry', 'THREAD_ENTRY_TYPE', 'UriToolbox', function ($scope, $state, $stateParams, $q, $filter, UserSrv, qaService, ThreadEntry, THREAD_ENTRY_TYPE, UriToolbox) {

        $scope.question = null;
        $scope.similarThreadList = null;
        $scope.sortBy = 'date';
        $scope.newAnswer = new ThreadEntry(null, null, THREAD_ENTRY_TYPE.qaEntry, null, null, null);
        // used for sorting
        $scope.predicate = '+position';
        var loadThreadWithEntries = function (id)
        {
            return qaService
                    .getThreadWithEntries(id)
                    .then(function (result) {
                        $scope.question = result;
                        return result;
                    });
        };
        var loadSimilarThreadList = function ()
        {
            return qaService
                    .getSimilarThreads($scope.question)
                    .then(function (result) {
                        $scope.similarThreadList = result;
                        return result;
                    });
        };
        $scope.postNewAnswer = function ()
        {
            $scope.newAnswer.threadId = $scope.question.id;
            return qaService
                    .uploadAttachments($scope.newAnswer)
                    .then(qaService.addNewAnswer)
                    .then(function (result) {
                        $scope.question.entries.push(result);
                        $scope.newAnswer = new ThreadEntry(null, null, THREAD_ENTRY_TYPE.qaEntry, null, null, null);
                        return result;
                    });
        };
        $scope.loadDetailPage = function (thread)
        {
            $state.transitionTo('app.qa.' + thread.type.enum, {id: UriToolbox.extractUriPathnameHash(thread.id)});
        };
        
        $scope.onLikeClicked = function (answer) {
            switch (answer.likes.like) {
                case true: 
                    answer.likes.like = null;
                    answer.likes.likes -= 1;
                    break;
                case null: 
                    answer.likes.like = true;
                    answer.likes.likes += 1;
                    break;
                case false: 
                    answer.likes.like = true;
                    answer.likes.likes += 1;
                    answer.likes.dislikes -= 1;
                    break;
            }
        }
        
        $scope.onDisLikeClicked = function (answer) {
            switch (answer.likes.like) {
                case true: 
                    answer.likes.like = false;
                    answer.likes.likes -= 1;
                    answer.likes.dislikes += 1;
                    break;
                case null: 
                    answer.likes.like = false;
                    answer.likes.dislikes += 1;
                    break;
                case false: 
                    answer.likes.like = null;
                    answer.likes.dislikes -= 1;
                    break;
            }
        }
        
        loadThreadWithEntries(UserSrv.getUserSpace() + "discussion/" + $stateParams.id)
                .then(loadSimilarThreadList);
    }]);
/**
 * Filters
 */
angular.module('module.qa').filter('threadTypeFilter', function () {

    return function (threadList, type) {
        if (type == null || type == '') {
            return threadList;
        }

        var out = new Array();
        angular.forEach(threadList, function (value, key) {
            if (value.type.enum == type.enum) {
                out.push(value);
            }
        });
        return out;
    };
});
angular.module('module.qa').filter('checkNewlines', function () {
    return function (text) {
        if (text != null) {
            text = text.replace(/\\n/g, '<br />');
            return text;
        }
    };
});
/**
 * CUSTOM Directive
 */
//angular.module('module.qa').directive('ngEnter', function () {
//    return function (scope, element, attrs) {
//        element.bind("keydown keypress", function (event) {
//            if (event.which === 13) {
//                scope.$apply(function () {
//                    scope.$eval(attrs.ngEnter);
//                });

//                event.preventDefault();
//            }
//        });
//    };
//});
