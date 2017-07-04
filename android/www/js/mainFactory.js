'use strict';

angular.module('mobileApp.mainFactory',[])
	.constant("baseURL","https://localhost:3443/")


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
    }

	}])


	.factory('AuthFactory', ['$http', '$localStorage', '$rootScope', '$window', '$state', 'baseURL', '$ionicPopup', function($http, $localStorage, $rootScope, $window, $state, baseURL, $ionicPopup){
    
	    var authFac = {};
	    var TOKEN_KEY = 'Token';
	    var isAuthenticated = false;
	    var username = '';
	    var authToken = undefined;
	    var userId ='';

	  function loadUserCredentials() {
	    var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
	    if (credentials.username != undefined) {
	      useCredentials(credentials);
	    }
	  }
	 
	  function storeUserCredentials(credentials) {
	    $localStorage.storeObject(TOKEN_KEY, credentials);
	    useCredentials(credentials);
	  }
	 
	  function useCredentials(credentials) {
	    isAuthenticated = true;
	    username = credentials.username;
	    userId=credentials.userId;
	    authToken = credentials.token;
	 
	    // Set the token as header for your requests!
	    $http.defaults.headers.common['x-access-token'] = authToken;
	  }
	 
	  function destroyUserCredentials() {
	    authToken = undefined;
	    username = '';
	    isAuthenticated = false;
	    $http.defaults.headers.common['x-access-token'] = authToken;
	    $localStorage.remove(TOKEN_KEY);
	  }
	     
	    authFac.login = function(loginData) {
	        var load = $ionicPopup.show({
    				title: 'Please Wait ...'});

	       	$http({
  					method: 'POST',
  					url: baseURL+'login',
  					data: loginData
					}).then(function success(response) {
							load.close();
      						alert($scope.data);
      						if(response.success)
	           					{
	              				storeUserCredentials({username:loginData.username,
	              							userId:response.userId,
	              							token: response.token});

	              				$rootScope.$broadcast('login:Successful');	 
	              				$state.go('home');   

      			
	           					}
	           		else{
	           		ngDialog.open({template:'\
	                <div class="ngdialog-message">\
	                <div><h3>'+response.message+'</h3></div>',plain: 'true', showClose: true});
	           		}
  					}, function error(response) {

      							console.log("failure");
  					});

	    };
	    
	    authFac.logout = function() {
	        $resource(baseURL + "logout").get(function(response){
	        	console.log(response.status)
	        });
	        destroyUserCredentials();
	    };
	    
	    authFac.register = function(registerData) {
	    		var load = $ionicPopup.show({
    				template: 'Please Wait....',
    				title: 'Registration'});
	    		$http({
  					method: 'POST',
  					url: baseURL+'register',
  					data: registerData
					})
	    		.then(function success(response){
	    			
	    		})
	    };
	    
	    authFac.isAuthenticated = function() {
	        return isAuthenticated;
	    };
	    
	    authFac.getUsername = function() {
	        return username;  
	    };

	    authFac.getUserId = function() {
	        return userId;  
	    };
	    authFac.getToken = function() {
	        return authToken;  
	    };
	    	
	    loadUserCredentials();
	    
	    return authFac;
	    
	}])

	
	.factory('NavFactory',['$resource','$rootScope','baseURL','AuthFactory','ngDialog',function($resource,$rootScope,baseURL,AuthFactory,ngDialog){
		var navFac = {};
		navFac.search= function(name){
			$resource(baseURL + "home/search").save({"followerId":AuthFactory.getUserId(), "name":name},function(response){
	        	$rootScope.$emit('searchresult',response);
	        	console.log(response);
			});
		};
		return navFac;
	}])

	.factory('socket', ['$rootScope', function($rootScope) {
		  var socket = io.connect('http://localhost:3000/');

		  return {
		    on: function(eventName, callback){
		      socket.on(eventName, callback);
		    },
		    emit: function(eventName, data) {
		      socket.emit(eventName, data);
		    }
		  };
		}])

	.factory('myService',['$rootScope',function($rootScope){
	var serve;
	var service = {
		setServe:setServe,
		getServe:getServe
	};
 
	return service;

	function setServe(data){
		serve=data;
	}
	
	function getServe(){
		return serve;
	}

}])

;