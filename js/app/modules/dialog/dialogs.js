/**
 * Note: This version requires Angular UI Bootstrap >= v0.6.0 
 */

//== Controllers =============================================================//

angular.module('dialogs.controllers',['ui.bootstrap.modal', 'module.i18n', 'module.collection', 'module.sharing'])

	/**
	 * Error Dialog Controller 
	 */
	 .controller('errorDialogCtrl',['$scope','$modalInstance','header','msg',function($scope,$modalInstance,header,msg){
		//-- Variables -----//
		
		$scope.header = (angular.isDefined(header)) ? header : 'Error';
		$scope.msg = (angular.isDefined(msg)) ? msg : 'An unknown error has occurred.';
		
		//-- Methods -----//
		
		$scope.close = function(){
			$modalInstance.close();
		}; // end close
	}]) // end ErrorDialogCtrl

	/**
	 * Wait Dialog Controller 
	 */
	 .controller('waitDialogCtrl',['$scope','$modalInstance','$timeout','header','msg','progress',function($scope,$modalInstance,$timeout,header,msg,progress){
		//-- Variables -----//
		
		$scope.header = (angular.isDefined(header)) ? header : 'Please Wait...';
		$scope.msg = (angular.isDefined(msg)) ? msg : 'Waiting on operation to complete.';
		$scope.progress = (angular.isDefined(progress)) ? progress : 100;
		
		//-- Listeners -----//
		
		// Note: used $timeout instead of $scope.$apply() because I was getting a $$nextSibling error
		
		// close wait dialog
		$scope.$on('dialogs.wait.complete',function(){
			$timeout(function(){ $modalInstance.close(); });
		}); // end on(dialogs.wait.complete)
		
		// update the dialog's message
		$scope.$on('dialogs.wait.message',function(evt,args){
			$scope.msg = (angular.isDefined(args.msg)) ? args.msg : $scope.msg;
		}); // end on(dialogs.wait.message)
		
		// update the dialog's progress (bar) and/or message
		$scope.$on('dialogs.wait.progress',function(evt,args){
			$scope.msg = (angular.isDefined(args.msg)) ? args.msg : $scope.msg;
			$scope.progress = (angular.isDefined(args.progress)) ? args.progress : $scope.progress;
		}); // end on(dialogs.wait.progress)
		
		//-- Methods -----//
		
		$scope.getProgress = function(){
			return {'width': $scope.progress + '%'};
		}; // end getProgress
	}]) // end WaitDialogCtrl

	/**
	 * Notify Dialog Controller 
	 */
	 .controller('notifyDialogCtrl',['$scope','$modalInstance','header','msg',function($scope,$modalInstance,header,msg){
		//-- Variables -----//
		
		$scope.header = (angular.isDefined(header)) ? header : 'Notification';
		$scope.msg = (angular.isDefined(msg)) ? msg : 'Unknown application notification.';
		
		//-- Methods -----//

		$scope.close = function(){
			$modalInstance.close();
		}; // end close
	}]) // end WaitDialogCtrl

	/**
	 * Confirm Dialog Controller 
	 */
	 .controller('confirmDialogCtrl',['$scope','$modalInstance','header','msg',function($scope,$modalInstance,header,msg){
		//-- Variables -----//
		
		$scope.header = (angular.isDefined(header)) ? header : 'Confirmation';
		$scope.msg = (angular.isDefined(msg)) ? msg : 'Confirmation required.';
		
		//-- Methods -----//
		
		$scope.no = function(){
			$modalInstance.dismiss('no');
		}; // end close
		
		$scope.yes = function(){
			$modalInstance.close('yes');
		}; // end yes
	}])

	 .controller('entryDetailController',['$scope', '$modalInstance','entry', '$q', 'i18nService', 'CurrentCollectionService', 'RATING_MAX', 'ENTITY_TYPES', 'TagFetchService', 'isSearchResult', 'UserService', 'UriToolbox', '$state', '$window', '$dialogs', function($scope, $modalInstance, entry, $q, i18nService, CurrentCollectionService, RATING_MAX, ENTITY_TYPES, TagFetchService, isSearchResult, UserSrv, UriToolbox, $state, $window, $dialogs){

	 	$scope.entry = entry;
	 	$scope.tags = new Array();
	 	$scope.ratingReadOnly = false;
	 	$scope.ENTITY_TYPES = ENTITY_TYPES;
	 	$scope.isSearchResult = isSearchResult;
	 	$scope.locations = [];
	 	var tagsLoaded = false;

		/**
		* TRANSLATION INJECTION
		*/
		$scope.t = function(identifier){
			return i18nService.t(identifier);
		};

		var getLocations = function(){

			new SSCollsEntityIsInGet(
				function(result){
          
          //TODO dtheiler: replace this when differentiation between shared and public is possible in KnowBrain
          angular.forEach(result.colls, function(coll, key){
            
            coll.space = sSColl.getCollSpace(coll.circleTypes);
            
            if(
              coll.space === "followSpace" ||
              coll.space === "sharedSpace"){
              coll.space = "shared";
            }
            
            if(coll.space === "privateSpace"){
              coll.space = "private";
            }
          });
          
					$scope.locations = result.colls;
					$scope.$apply();
				}, 
				function(error){ console.log(error); }, 
				UserSrv.getUser(),
				UserSrv.getKey(), 
				entry.id
				);

		};

		this.init = function()
		{
			//set tags
			angular.forEach(entry.tags, function(tag, key){
				$scope.tags.push(tag);
			});
			$scope.entryRating = entry.overallRating.score;

			if(isSearchResult)
			{
				getLocations();
			}
		};

		this.init();

		$scope.rateEntry = function(rating){
			if(rating != $scope.entryRating && rating <= RATING_MAX && rating > 0 && !$scope.ratingReadOnly)
			{
				$scope.ratingReadOnly = true;
				var promise = $scope.entry.saveRating(rating);
				promise.then(function(result){
					$scope.entryRating = result.overallRating.score;
					$scope.ratingReadOnly = false;	
				});
			}
		};

		$scope.tagAdded = function(tag) {
            console.log(tag);
			entry.addTag(tag).then(

				function(result){
					CurrentCollectionService.getCurrentCollection().getCumulatedTags();
				},
				function(error){
					console.log(error);
				}
				);
		};

		$scope.tagRemoved = function(tag) {
			entry.removeTag(tag).then(
				function(result){
					CurrentCollectionService.getCurrentCollection().getCumulatedTags();
				},
				function(error){
					console.log(error);
				}
				);
		};

		$scope.close = function(){
			$modalInstance.close();
		};

		$scope.deleteEntity = function(){

			var toDelete = new Array();
		  var toDeleteKeys = new Array();

		  var entries = CurrentCollectionService.getCurrentCollection().entries;

		  angular.forEach(entries, function(collEntry, key){
		    if(collEntry.id == $scope.entry.id){
		      toDelete.push(collEntry.id);
		      toDeleteKeys.push(key);
		    }
		  });

		  var promise = CurrentCollectionService.getCurrentCollection().deleteEntries(toDelete, toDeleteKeys);
		  promise.then(
		  	function(result){
		  		$scope.close();	
		  	},
		  	function(error){
		  		console.log(error);
		  	}
		  );
		};

		$scope.downloadEntity = function(){
			if($scope.entry.type != ENTITY_TYPES.file)
				return;

			$scope.entry.downloading = true;

			var promise = $scope.entry.downloadFile();

			promise.finally(function(){
				$scope.entry.downloading = false;
			});

		};

		$scope.openLink = function(){
			if($scope.entry.type != ENTITY_TYPES.link)
				return;

			$window.open(entry.id);
		};

		$scope.queryTags = function($queryString){
			var defer = $q.defer();

			var promise = TagFetchService.fetchAllPublicTags();
			promise.then(
				function(result){
					defer.resolve(search(result,$queryString));
				});

			return defer.promise;  
		};

		var search = function(tagsArray, query) {
			var items;

			items = tagsArray
			.filter(function(x){ 
				return x.toLowerCase().indexOf(query.toLowerCase()) > -1; 
			});

			return items;
		};

		$scope.goToCollection = function(location){

			if(entry.type == ENTITY_TYPES.link){
				entry.uriPathnameHash = UriToolbox.extractUriHostPartWithoutProtocol(entry.id);
			}else{
				entry.uriPathnameHash =  UriToolbox.extractUriPathnameHash(entry.id);
			}
			$scope.close();
    	$state.transitionTo('app.collection.content', { coll: UriToolbox.extractUriPathnameHash(location.id)});
  };
  
  		$scope.shareEntity = function(){
  			$dialogs.shareEntity($scope.entry);
  		};

}])

.controller("addResourceWizzardController", ['$scope', '$modalInstance', 'i18nService', function($scope, $modalInstance, i18nService){

	/* STEPS */
	$scope.resourceTypes = ['choose','collection','upload', 'link'];
	$scope.currentResourceType = 0;

	/* TITLE */
	$scope.wizzardTitles = [i18nService.t('upload_wizzard_title'), i18nService.t('create_collection'), i18nService.t('upload_resource'), i18nService.t('add_link')];

	/* PATHS */
	$scope.addLinkTplPath = MODULES_PREFIX+"/dialog/wizzard-create-link.tpl.html"; 
	$scope.addCollectionTplPath = MODULES_PREFIX+"/dialog/wizzard-create-collection.tpl.html"; 
	$scope.uploadResourceTplPath = MODULES_PREFIX+"/dialog/wizzard-upload-resource.tpl.html";
	$scope.chooseResourceTypeTplPath = MODULES_PREFIX+"/dialog/wizzard-choose-resource-type.tpl.html";

	  /**
	  * TRANSLATION INJECTION
	  */
	  $scope.t = function(identifier){
	  	return i18nService.t(identifier);
	  };

	  /**
	  * METHODS
	  */	  
	  $scope.closeWizzard = function(){
	  	$modalInstance.close(true);
	  };

	  $scope.getCurrentResourceType = function() {
	  	return $scope.resourceTypes[$scope.currentResourceType];
	  };

	  $scope.getCurrentWizzardTitle = function(){
	  	return $scope.wizzardTitles[$scope.currentResourceType];
	  };

	  $scope.chooseResourceType = function(type){
	  	$scope.currentResourceType = type;
	  };

	  $scope.backToChoose = function(){
	  	$scope.currentResourceType = 0;
	  };

	}]);
// end ConfirmDialogCtrl / dialogs.controllers


//== Services ================================================================//

angular.module('dialogs.services',['ui.bootstrap.modal','dialogs.controllers'])

	/**
	 * Dialogs Service 
	 */
.directive("dialogShow", function ($parse) {
        return {
            restrict: "A",
            link: function (scope, element, attrs) {
    
                //Hide or show the modal
                scope.showModal = function (visible, elem) {
                    if (!elem)
                        elem = element;
    
                    if (visible)
                        $(elem).modal("show");                     
                    else
                        $(elem).modal("hide");
                }
    
                //Watch for changes to the modal-visible attribute
                scope.$watch(attrs.modalShow, function (newValue, oldValue) {
                    scope.showModal(newValue, attrs.$$element);
                });
    
                //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
                $(element).bind("hide.bs.modal", function () {
                    $parse(attrs.modalShow).assign(scope, false);
                    if (!scope.$$phase && !scope.$root.$$phase)
                        scope.$apply();
                });
            }
    
        };
    })
	 .factory('$dialogs',['$modal',function($modal){
	 	return {
	 		error : function(header,msg){
	 			return $modal.open({
	 				templateUrl : '/dialogs/error.html',
	 				controller : 'errorDialogCtrl',
	 				resolve : {
	 					header : function() { return angular.copy(header); },
	 					msg : function() { return angular.copy(msg); }
	 				}
				}); // end modal.open
			}, // end error
			
			wait : function(header,msg,progress){
				return $modal.open({
					templateUrl : '/dialogs/wait.html',
					controller : 'waitDialogCtrl',
					resolve : {
						header : function() { return angular.copy(header); },
						msg : function() { return angular.copy(msg); },
						progress : function() { return angular.copy(progress); }
					}
				}); // end modal.open
			}, // end wait
			
			notify : function(header,msg){
				return $modal.open({
					templateUrl : '/dialogs/notify.html',
					controller : 'notifyDialogCtrl',
					resolve : {
						header : function() { return angular.copy(header); },
						msg : function() { return angular.copy(msg); }
					}
				}); // end modal.open
			}, // end notify
			
			confirm : function(header,msg){
				return $modal.open({
					templateUrl : '/dialogs/confirm.html',
					controller : 'confirmDialogCtrl',
					resolve : {
						header : function() { return angular.copy(header); },
						msg : function() { return angular.copy(msg); }
					}
				}); // end modal.open
			}, // end confirm
			
			create : function(url,ctrlr,data,opts){
				var k = (angular.isDefined(opts.keyboard)) ? opts.keyboard : true; // values: true,false
				var b = (angular.isDefined(opts.backdrop)) ? opts.backdrop : true; // values: 'static',true,false
				var w = (angular.isDefined(opts.windowClass)) ? opts.windowClass : 'dialogs-default'; // additional CSS class(es) to be added to a modal window
				return $modal.open({
					templateUrl : url,
					controller : ctrlr,
					keyboard : k,
					backdrop : b,
					windowClass: w,
					resolve : {
						data : function() { return angular.copy(data); }
					}
				}); // end modal.open
			}, // end create
			entryDetail : function(entry, isSearchResult){
				return $modal.open({
					templateUrl : MODULES_PREFIX + '/dialog/entryDetail.tpl.html',
					controller : 'entryDetailController',
					keyboard : true,
					backdrop : true,
					windowClass: 'modal-huge',
					resolve : {
						entry : function() { return entry; },
						isSearchResult: function() { 
							if(isSearchResult == undefined)
								isSearchResult = false;

							return isSearchResult; 
						}
					}
				});
			},
			addResourceWizzard : function(){
				return $modal.open({
					templateUrl: MODULES_PREFIX + '/dialog/addResourceWizzard.tpl.html',
					controller: 'addResourceWizzardController',
					keyboard : true,
					backdrop : true
				});
			},
			shareEntity : function(entity){
				return $modal.open({
					templateUrl: MODULES_PREFIX + '/sharing/shareEntity.tpl.html',
					controller: 'SharingController',
					keyboard : true,
					backdrop : true,
					windowClass: 'modal-small',
					resolve : {
                        entity : function() { return entity; }
					}
				});
			},
            shareWith : function(allUsers, shareEntities){
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/sharing/shareWith.tpl.html',
                    controller: 'ShareWithController',
                    keyboard : true,
                    backdrop : true,
                    windowClass: 'modal-huge',
                    resolve : {
                        allUsers : function() { return allUsers; },
                        shareEntities : function() { return shareEntities; },
                    }
                });
            },

            createNewGroup: function() {
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/group/newGroup.tpl.html',
                    controller: 'newGroupController',
                    keyboard : true,
                    backdrop : true,
                    windowClass: 'modal-huge'
                });
            },
			
            addMembers: function(users) {
                return $modal.open({
                    templateUrl: MODULES_PREFIX + '/group/addMembers.tpl.html',
                    controller: 'addMembersController',
                    keyboard : true,
                    backdrop : true,
                    windowClass: 'modal-huge',
                    resolve: {
                    	users: function() {
                    		return users;
                    	},
                    }
                    
                });
            }
		};
	}]); // end $dialogs / dialogs.services


//== Module ==================================================================//

angular.module('dialogs',['dialogs.services','ngSanitize']) // requires angular-sanitize.min.js (ngSanitize) //code.angularjs.org/1.2.1/angular-sanitize.min.js

	// Add default templates via $templateCache
	.run(['$templateCache',function($templateCache){
		$templateCache.put('/dialogs/error.html','<div class="modal-header dialog-header-error"><button type="button" class="close" ng-click="close()">&times;</button><h4 class="modal-title text-danger"><span class="glyphicon glyphicon-warning-sign"></span> <span ng-bind-html="header"></span></h4></div><div class="modal-body text-danger" ng-bind-html="msg"></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="close()">Close</button></div>');
		$templateCache.put('/dialogs/wait.html','<div class="modal-header dialog-header-wait"><h4 class="modal-title"><span class="glyphicon glyphicon-time"></span> Please Wait</h4></div><div class="modal-body"><p ng-bind-html="msg"></p><div class="progress progress-striped active"><div class="progress-bar progress-bar-info" ng-style="getProgress()"></div><span class="sr-only">{{progress}}% Complete</span></div></div>');
		$templateCache.put('/dialogs/notify.html','<div class="modal-header dialog-header-notify"><button type="button" class="close" ng-click="close()" class="pull-right">&times;</button><h4 class="modal-title text-info"><span class="glyphicon glyphicon-info-sign"></span> {{header}}</h4></div><div class="modal-body text-info" ng-bind-html="msg"></div><div class="modal-footer"><button type="button" class="btn btn-primary" ng-click="close()">OK</button></div>');
		$templateCache.put('/dialogs/confirm.html','<div class="modal-header dialog-header-confirm"><button type="button" class="close" ng-click="no()">&times;</button><h4 class="modal-title"><span class="glyphicon glyphicon-check"></span> {{header}}</h4></div><div class="modal-body" ng-bind-html="msg"></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="yes()">Yes</button><button type="button" class="btn btn-primary" ng-click="no()">No</button></div>');
	}]); // end run / dialogs


