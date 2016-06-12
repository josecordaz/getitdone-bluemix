'use strict';

angular.module('getItDoneApp')
.constant("baseURL", "http://getitdone.mybluemix.net/")
//.constant("baseURL", "https://localhost:3443/")
///:goalId/tasks/:taskId/pomodoro
.factory('taskFactory',['$resource','baseURL',function($resource,baseURL){
    return $resource(baseURL+"goals/:idGoal/tasks/:idTask",{idGoal:"@IdGoal",idTask:"@IdTask"},{
      'update':{
        method:'PUT'
      },
      'delete':{
        method:'DELETE'
      }
    });
}])
.factory('pomodorosFactory',['$resource','baseURL',function($resource,baseURL){
    return $resource(baseURL+"goals/:idGoal/tasks/:idTask/pomodoro/:idPomodoro",
      {idGoal:"@IdGoal",idTask:"@IdTask",idPomodoro:"@IdPomodoro"},{
      'update':{
        method:'PUT'
      }
    });
}])
.factory('goalsFactory',['$resource','baseURL',function($resource,baseURL){
    return $resource(baseURL+"goals/:id",{goalId:"@GoalId"},{
      'update':{
        method:'PUT'
      },
      'delete':{
        method:'DELETE'
      }
    });
}])
.factory('menuFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "dishes/:id", null, {
        'update': {
            method: 'PUT'
        }
    });
}])
.factory('commentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "dishes/:id/comments/:commentId", {id:"@Id", commentId: "@CommentId"}, {
        'update': {
            method: 'PUT'
        }
    });

}])
.factory('promotionFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "promotions/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])
.factory('corporateFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "leadership/:id", null, {
            'update': {
                method: 'PUT'
            }
        });
}])
.factory('favoriteFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "favorites/:id", null, {
            'update': {
                method: 'PUT'
            },
            'query':  {method:'GET', isArray:false}
        });
}])
.factory('feedbackFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "feedback/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])
.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    };
}])
.factory('AuthFactory', ['$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL', 'ngDialog', 'goalsFactory',function($resource, $http, $localStorage, $rootScope, $window, baseURL, ngDialog,goalsFactory){
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var authToken;
    
    function useCredentials(credentials) {
      isAuthenticated = true;
      username = credentials.username;
      authToken = credentials.token;
   
      // Set the token as header for your requests!
      $http.defaults.headers.common['x-access-token'] = authToken;
    }

  function loadUserCredentials() {
    var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.username !== undefined) {
      useCredentials(credentials);
      authFac.login($localStorage.getObject('userinfo','{}'));
    } 
  }
 
  function storeUserCredentials(credentials) {
    $localStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }
 
  
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['x-access-token'] = authToken;
    $localStorage.remove(TOKEN_KEY);
  }
     
    authFac.login = function(loginData,flagLogInAgain,username) {
        $resource(baseURL + "users/login")
        .save(loginData,
           function(response) {
              storeUserCredentials({username:!!username?username:loginData.username, token: response.token});
              $rootScope.$broadcast('login:Successful');

              goalsFactory.query({})
              .$promise.then(
                  function (response) {
                      response = response.map(function(val){
                          val.dueDate = moment(val.dueDate).format("dddd, MMM DD, YYYY");
                          val.tasks = val.tasks.map(function(task){
                              task.startDate = moment(task.startDate).format("dddd, MMM DD, YYYY");
                              task.daysWeek = task.daysWeek.join(", ");
                              task.hoursWorded = Math.round(task.workedPomodoros.length * (25/60) * 100)/100;
                              return task;
                          });
                          return val;
                      });
                      $rootScope.goals = response;
                  },
                  function (response) {
                      //$scope.message = 
                      console.log("Error: " + response.status + " " + response.statusText);
                  }
              );

           },
           function(response){
              if(response.statusText==='Unauthorized'&&!flagLogInAgain){
                var loginData = $localStorage.getObject('userinfo','{}');
                authFac.login(loginData,true,loginData.username);
              } else {
                isAuthenticated = false;
                var message = ''+
                  '<div class="ngdialog-message">'+
                  '<div><h3>Login Unsuccessful</h3></div>' +
                    '<div><p>' +  response.data.err.message + '</p><p>' +
                      response.data.err.name + '</p></div>' +
                  '<div class="ngdialog-buttons">'+
                      '<button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>'+
                  '</div>';
              
                ngDialog.openConfirm({ template: message, plain: 'true'});
              }
           }
        
        );

    };
    
    authFac.logout = function() {
        $resource(baseURL + "users/logout").get();
        destroyUserCredentials();
    };
    
    authFac.register = function(registerData) {
        
        var tmp = $resource(baseURL + "users/register");
        tmp.save(registerData,
           function() {
              authFac.login({username:registerData.username, password:registerData.password});
              if (registerData.rememberMe) {
                  $localStorage.storeObject('userinfo',
                      {username:registerData.username, password:registerData.password});
              }
              $rootScope.$broadcast('registration:Successful');
           },
           function(response){
            
              var message = ''+
                '<div class="ngdialog-message">'+
                '<div><h3>Registration Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + 
                  '</p><p>' + response.data.err.name + '</p></div>';

                ngDialog.openConfirm({ template: message, plain: 'true'});

           }
        
        );
    };
    
    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };
    
    authFac.getUsername = function() {
        return username;  
    };

    loadUserCredentials();
    
    return authFac;
    
}])
;