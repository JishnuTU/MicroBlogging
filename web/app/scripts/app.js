'use strict';

/**
 * @ngdoc overview
 * @name webApp
 * @description
 * # webApp
 *
 * Main module of the application.
 */

angular.module('webApp', ['ui.router','ngResource','ngDialog'])
.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/fheader.html'
                    },
                    'content': {
                        templateUrl : 'views/login.html',
                        controller  : 'LoginCtrl'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }
                }

            })
                        // route for the aboutus page
            .state('app.register', {
                url:'/register',
                views: {
                    'content@': {
                        templateUrl : 'views/register.html',
                        controller  : 'RegisterCtrl'                  
                    }
                }
            })

            .state('home', {
                url:'/home',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                    },
                    'content': {
                        templateUrl : 'views/home.html',
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }
                }

            })

            .state('home.activity', {
                url:'/activity',
                views: {
          
                    'content@': {
                        templateUrl : 'views/activity.html',
                    },
                }

            })

            .state('admin', {
                url:'/admin',
                views: {
                    'content': {
                        templateUrl : 'views/manage.html',
                    },
                }

            });
        
            
  
    
        $urlRouterProvider.otherwise('/');
    })
;
