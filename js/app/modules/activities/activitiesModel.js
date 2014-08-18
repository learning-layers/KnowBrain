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
* MODEL
*/
angular.module('module.activities').factory('Activity', [function() {
    function Activity(user, type, time, entities, users){
        this.user = user;
        this.type = type;
        this.time = parseTime(time);
        this.date = parseDate(time);
        this.entities = entities;
        this.users = users;
      }
    
    var months = [ "January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December" ];
    
    var parseTime = function(time) {
        
        var myDate = new Date(time);
        var hours = myDate.getHours(); //returns 0-23
        var minutes = myDate.getMinutes(); //returns 0-59
        var seconds = myDate.getSeconds(); //returns 0-59
        
        if (hours < 10) hours = '0' + hours;
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;
        
        return hours + ":" + minutes + ":" + seconds;
    }
    
    var parseDate = function(time) {
        var myDate = new Date(1000*time);
        
        var day = myDate.getDate();
        var month = myDate.getMonth();

        return day + ". " + months[month];
    }
    return (Activity);
}]);

/**
* SERVICE
*/
angular.module('module.activities').service('ActivityFetchService', ['$q','UserService', function($q, UserSrv) {
    
    this.getActivities = function(types, users, entities, circles, startTime, endTime) {
        
        var defer = $q.defer();
        var self = this;
        
        new SSActivitiesGet(function(result){
                defer.resolve(result);
            },
            function(error){
                console.log(error);
            },
            UserSrv.getUser(),
            UserSrv.getKey(),
            types, //types
            users, //users
            entities, //entities 
            circles, //circles
            startTime, //startTime
            endTime //endTime
        );
        
        return defer.promise;
    };
}]);
