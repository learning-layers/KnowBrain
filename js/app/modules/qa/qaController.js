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
angular.module('module.qa').config(function($stateProvider) {
    $stateProvider.state('app.qa', {
        url: '/qa',
        controller: 'qaController',
        templateUrl: MODULES_PREFIX + '/qa/qa.tpl.html'
    }).state('app.qa.qa', {
        url: '/qa/:id',
        controller: 'questionController',
        templateUrl: MODULES_PREFIX + '/qa/question.tpl.html'
    }).state('app.ask', {
        url: '/qa/ask',
        controller: 'AskQuestionController',
        templateUrl: MODULES_PREFIX + '/qa/ask-question.tpl.html'
    })
});
/**
 * Constants
 */
angular.module('module.qa').constant('THREAD_LIST_TYPE', {
    all: 'All',
    own: 'My Own',
    group: 'My Group'
});
/**
 * CONTROLLER
 */
angular.module('module.qa').controller("qaController", ['$scope', '$state', '$q', '$modal', '$dialogs', '$filter', 'UserService', 'sharedService', 'UriToolbox', 'qaService', 'Thread', 'THREAD_TYPE', 'THREAD_LIST_TYPE', 'Tag', 'SearchToolbox', function($scope, $state, $q, $modal, $dialogs, $filter, UserSrv, sharedService, UriToolbox, qaService, Thread, THREAD_TYPE, THREAD_LIST_TYPE, Tag, SearchToolbox) {
    $scope.THREAD_TYPE = THREAD_TYPE;
    $scope.threadList = null;
    $scope.tagThreadList = null;
    $scope.myOwnThreadList = [];
    $scope.myGroupThreadList = [];
    $scope.threadResponseLabel = "answer";
    $scope.THREAD_LIST_TYPE = THREAD_LIST_TYPE;
    $scope.selectedThreadListType = THREAD_LIST_TYPE.all;
    $scope.threadListHeader = "All";
    $scope.searchTags = [];
    $scope.searchAnswers = true;
    $scope.showingAdvancedSearch = false;
    var loadDetailPage = function(thread) {
        $state.transitionTo('app.qa.' + thread.type.enum, {
            id: UriToolbox.extractUriPathnameHash(thread.id)
        });
    };
    $scope.changeSelectedThreadListType = function(threadListType) {
        $scope.selectedThreadListType = threadListType;
    };
    $scope.selectedThreadList = function() {
        switch ($scope.selectedThreadListType) {
            case THREAD_LIST_TYPE.all:
                return $scope.tagThreadList;
            case THREAD_LIST_TYPE.own:
                return $scope.myOwnThreadList;
            case THREAD_LIST_TYPE.group:
                return $scope.myGroupThreadList;
        };
    };
    $scope.onTagAdded = function($tag, object) {
        $tag.space = 'privateSpace';
    };
    $scope.onTagClicked = function(tag) {
        $scope.searchTags.push(tag);
        $scope.reloadThreads();
    };
    $scope.reloadThreads = function() {
        $scope.searchThreads();
        updateThreadLists();
    };
    $scope.removeSearchTag = function(tagIndex) {
        $scope.searchTags.splice(tagIndex, 1);
        $scope.reloadThreads();
    }
    var updateThreadLists = function() {
        $scope.tagThreadList = $scope.threadList.filter(function(val) {
            return true;
        });
        $scope.myOwnThreadList = $scope.threadList.filter(function(val) {
            return $.inArray('priv', val.circleTypes) >= 0;
        });
        $scope.myGroupThreadList = $scope.threadList.filter(function(val) {
            return $.inArray('group', val.circleTypes) >= 0;
        });
    };
    $scope.clearSearch = function() {
        loadThreadList();
        this.searchThreadsString = "";
    };
    var loadThreadList = function() {
        return qaService.getAllThreads().then(function(result) {
            $scope.threadList = result.filter(function(val) {
                return val.type.enum == "qa" || val.type.enum == "chat";
            });
            $scope.tagThreadList = $scope.threadList;
            $scope.myOwnThreadList = $scope.threadList.filter(function(val) {
                return $.inArray('priv', val.circleTypes) >= 0;
            });
            $scope.myGroupThreadList = $scope.threadList.filter(function(val) {
                return $.inArray('group', val.circleTypes) >= 0;
            });
            return $scope.threadList;
        });
    };
    $scope.searchThreads = function() {
        if ((this.searchThreadsString === undefined) && ($scope.searchTags.length === 0)) {
            return loadThreadList();
        }
        var keywords = Array();
        if (this.searchThreadsString != undefined) angular.forEach(this.searchThreadsString.split(","), function(string, key) {
            angular.forEach(string.replace(/^\s+|\s+$/g, '').split(" "), function(subString, key2) {
                keywords.push(subString);
            });
        });
        qaService.searchThreads(keywords, $scope.searchTags, $scope.searchAnswers).then(function(result) {
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
    $scope.addComment = function(answer) {
        answer.comments.push(answer.newComment);
        qaService.addNewComment(answer).then(function(result) {
            answer.newComment = null;
            var test = result;
        });
    }
    $scope.openThread = function(thread) {
        switch (thread.type) {
            case THREAD_TYPE.question:
                loadDetailPage(thread);
                break;
            case THREAD_TYPE.chat:
                sharedService.prepareForBroadcast('openChatBox', thread);
                break;
        }
    }
    $scope.shareThread = function(thread) {
        $dialogs.shareEntity(thread);
    }
    $scope.showAttachment = function(attachment) {
            if (attachment.type === 'entity') {
                window.open(attachment.id, '_blank');
            } else {
                $dialogs.attachmentDetail(attachment);
            }
        }
    $scope.askQuestion = function() {
        $state.go('app.ask', {});
    };

        // load data
    loadThreadList();
}]);

angular.module('module.qa').controller("AskQuestionController", function($scope, $state, $q, $modal, $dialogs, $filter, UriToolbox, qaService, Thread, THREAD_TYPE, THREAD_LIST_TYPE, Tag, SearchToolbox, FileUploader, TagFetchService) {
    $scope.THREAD_TYPE = THREAD_TYPE;
    $scope.newThread = new Thread(null, null, THREAD_TYPE.question, null, null, null, null);
    $scope.newThread.attachments = [];
    $scope.THREAD_LIST_TYPE = THREAD_LIST_TYPE;
    $scope.uploader = new FileUploader();

    $scope.onTagAdded = function($tag, object) {
        $tag.space = 'privateSpace';
    };
    $scope.removeAttachment = function(attachment) {
        $.each($scope.newThread.attachments, function(i) {
            if ($scope.newThread.attachments[i].id === attachment.id) {
                $scope.newThread.attachments.splice(i, 1);
                return false;
            }
        });
    };
    $scope.invokePostNewThread = function() {
        loadSimilarThreadList().then(openSimilarThreads);
    };
    var loadSimilarThreadList = function() {
        return qaService.getSimilarThreads($scope.newThread).then(function(result) {
            return $filter('threadTypeFilter')(result, $scope.newThread.type);
        });
    };
    var openSimilarThreads = function(similarThreadList) {
        if (similarThreadList.length > 0) {
            var modalInstance = $modal.open({
                templateUrl: MODULES_PREFIX + '/qa/modalSimilarThreads.tpl.html',
                controller: 'ModalSimilarThreadsController',
                size: 'lg',
                resolve: {
                    thread: function() {
                        return $scope.newThread;
                    },
                    similarThreadList: function() {
                        return similarThreadList;
                    }
                }
            });
            modalInstance.result.then(function(post) {
                if (post) {
                    postNewThread();
                }
            }, function() {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        } else {
            postNewThread();
        }
    };
    var postNewThread = function() {
        return qaService.uploadFiles($scope.uploader.queue, $scope.newThread).then(qaService.addNewThread).then(function(result) {
            $scope.newThread = new Thread(null, null, THREAD_TYPE.question, null, null, null, null);
            $state.go('app.qa.qa', {
                id: UriToolbox.extractUriPathnameHash(result.id)
            });
        });
    };

    $scope.afterAddEntity = function(uploadedEntities) {
        $scope.uploader.addToQueue(uploadedEntities);
    };

    $scope.afterChooseEntity = function(chosenEntities) {
        if (chosenEntities != undefined) {
            chosenEntities.forEach(function(entry) {
                $scope.newThread.attachments.push(entry);
            });
        }
    };

    $scope.afterAddLink = function(link) {
        $scope.newThread.attachments.push(link);
    };
    var search = function(tagsArray, query) {
        var items;
        items = tagsArray.filter(function(x) {
            return x.toLowerCase().indexOf(query.toLowerCase()) > -1;
        });
        return items;
    };
    $scope.queryTags = function($queryString) {
        var defer = $q.defer();
        var promise = TagFetchService.fetchAllPublicTags();
        promise.then(function(result) {
            defer.resolve(search(result, $queryString));
        });
        return defer.promise;
    };
});

angular.module('module.qa').controller('ModalSimilarThreadsController', ['$scope', '$modalInstance', '$state', 'qaService', 'UriToolbox', 'thread', 'similarThreadList', 'THREAD_LIST_TYPE', function($scope, $modalInstance, $state, qaService, UriToolbox, thread, similarThreadList, THREAD_LIST_TYPE) {
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
    $scope.changeSelectedSimilarThreadListType = function(threadListType) {
        $scope.selectedSimilarThreadListType = threadListType;
    };
    $scope.selectedSimilarThreadList = function() {
        switch ($scope.selectedSimilarThreadListType) {
            case THREAD_LIST_TYPE.own:
                return $scope.myOwnSimilarThreadList;
            case THREAD_LIST_TYPE.group:
                return $scope.myGroupSimilarThreadList;
        };
    };
    $scope.loadDetailPage = function(thread) {
        $state.transitionTo('app.qa.' + thread.type.enum, {
            id: UriToolbox.extractUriPathnameHash(thread.id)
        });
        $modalInstance.close(false);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
    $scope.ok = function() {
        $modalInstance.close(true);
    };
}]);
angular.module('module.qa').controller("questionController", function($scope, $state, $stateParams, $dialogs, $q, $filter, qaService, ThreadEntry, THREAD_ENTRY_TYPE, UriToolbox, FileUploader) {
    $scope.question = null;
    $scope.similarThreadList = null;
    $scope.sortBy = 'date';
    $scope.uploader = new FileUploader();
    $scope.newAnswer = new ThreadEntry(null, null, THREAD_ENTRY_TYPE.answer, null, null, null);
    // used for sorting
    $scope.predicate = '+position';
    var loadThreadWithEntries = function(id) {
        return qaService.getThreadWithEntries(id).then(function(result) {
            $scope.question = result;
            return result;
        });
    };
    var loadSimilarThreadList = function() {
        return qaService.getSimilarThreads($scope.question).then(function(result) {
            $scope.similarThreadList = result;
            return result;
        });
    };
    $scope.onTagAdded = function($tag, object) {
        $tag.space = 'privateSpace';
    };

    $scope.afterAddEntity = function(uploadedEntities) {
        $scope.uploader.addToQueue(uploadedEntities);
    };

    $scope.afterChooseEntity = function(chosenEntities) {
        if (chosenEntities != undefined) {
            chosenEntities.forEach(function(entry) {
                $scope.newAnswer.attachments.push(entry);
            });
        }
    };

    $scope.afterAddLink = function(link) {
        $scope.newAnswer.attachments.push(link);
    };

    $scope.postNewAnswer = function() {
        $scope.newAnswer.threadId = $scope.question.id;
        return qaService.uploadFiles($scope.uploader.queue, $scope.newAnswer).then(qaService.addNewAnswer).then(function(result) {
            $scope.question.entries.push(result);
            $scope.newAnswer = new ThreadEntry(null, null, THREAD_ENTRY_TYPE.answer, null, null, null, {
                likes: 0,
                dislikes: 0,
                like: null
            });
            $scope.uploader.clearQueue();
            return result;
        });
    };
    $scope.loadDetailPage = function(thread) {
        $state.transitionTo('app.qa.' + thread.type.enum, {
            id: UriToolbox.extractUriPathnameHash(thread.id)
        });
    };
    $scope.onLikeClicked = function(answer) {
        var newStatus = 1;
        if (answer.likes.like === 1) newStatus = 0;
        qaService.setLikeStatus(answer, newStatus).then(function(result) {
            answer.likes.likes += newStatus === 1 ? 1 : -1;
            answer.likes.dislikes -= answer.likes.like === -1 ? 1 : 0;
            answer.likes.like = newStatus;
        });
    }
    $scope.onDisLikeClicked = function(answer) {
        var newStatus = -1;
        if (answer.likes.like === -1) newStatus = 0;
        qaService.setLikeStatus(answer, newStatus).then(function(result) {
            answer.likes.dislikes += newStatus === -1 ? 1 : -1;
            answer.likes.likes -= answer.likes.like === 1 ? 1 : 0;
            answer.likes.like = newStatus;
        });
    }
    loadThreadWithEntries("http://sss.eu/" + $stateParams.id) //UserSrv.getUserSpace() + "entities/"  + $stateParams.id
        .then(loadSimilarThreadList);
});
/**
 * Filters
 */
angular.module('module.qa').filter('threadTypeFilter', function() {
    return function(threadList, type) {
        if (type == null || type == '') {
            return threadList;
        }
        var out = new Array();
        angular.forEach(threadList, function(value, key) {
            if (value.type.enum == type.enum) {
                out.push(value);
            }
        });
        return out;
    };
});
angular.module('module.qa').filter('checkNewlines', function() {
    return function(text) {
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