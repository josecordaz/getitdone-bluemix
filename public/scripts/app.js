'use strict';
angular.module('getItDoneApp', ['ui.router','ngResource','ngDialog'])
.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
        $stateProvider
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/home.html',
                        controller  : 'HomeController'
                    }/*,
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }*/
                }

            })
            .state('app.pomodoro', {
                url:'pomodoro',
                views: {
                    'content@': {
                        templateUrl : 'views/pomodoro.html',
                        controller  : 'PomodoroController'                  
                    }
                }
            });
    
        $urlRouterProvider.otherwise('/');
    }])
;