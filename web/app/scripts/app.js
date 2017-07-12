'use strict';

/**
 * @ngdoc overview
 * @name webApp
 * @description
 * # webApp
 *
 * Main module of the application.
 */

angular.module('webApp', ['ui.router','ngResource','ngDialog','ngDropover','infinite-scroll'])
.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'content': {
                        templateUrl : 'views/login.html',
                        controller  : 'LoginCtrl'
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
                        templateUrl : 'views/blog.html',
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