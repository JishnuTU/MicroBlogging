'use strict';

angular.module('webApp')
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


	.factory('AuthFactory', ['$resource', '$http', '$localStorage', '$rootScope', '$window', '$state', 'baseURL', 'ngDialog', function($resource, $http, $localStorage, $rootScope, $window, $state, baseURL, ngDialog){
    
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
	        var load = ngDialog.open({template:'\
	                <div class="ngdialog-message">\
	                <div><h3>Please wait...</h3></div>',plain: 'true', showClose: false});
	        $resource(baseURL + "login")
	        .save(loginData,
	           function(response) {
	           		load.close();
	           		if(response.success)
	           		{

	              	storeUserCredentials({username:loginData.username,
	              		userId:response.userId,
	              		token: response.token});

	              	//$rootScope.$broadcast('login:Successful');
	              	console.log(response.message);

	              	if(response.message=='Administrator')
	              		$state.go('admin');
	              	else
	              		$state.go('home');    
      			
	           		}
	           		else{
	           		ngDialog.open({template:'\
	                <div class="ngdialog-message">\
	                <div><h3>'+response.message+'</h3></div>',plain: 'true', showClose: true});
	           		}

	           },
	           function(response){
	              isAuthenticated = false;
	            load.close();
	              var message = '\
	                <div class="ngdialog-message">\
	                <div><h3>Server not Responding</h3></div>'
	                '<div class="ngdialog-buttons">\
	                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
	                </div>'
	            
	                ngDialog.openConfirm({ template: message, plain: 'true'});
	           }
	        
	        );

	    };
	    
	    authFac.logout = function() {
	        $resource(baseURL + "logout").save({'userId':userId},function(response){
	        	console.log(response.status)
	        });
	        destroyUserCredentials();
	    };
	    
	    authFac.register = function(registerData) {

	         var load = ngDialog.open({template:'\
	                <div class="ngdialog-message">\
	                <div><h3>Please wait...</h3></div>',plain: 'true', showClose: false});

	        $resource(baseURL + "register")
	        .save(registerData,
	           function(response) {
	           	load.close();
	  				var message = '\
	                <div class="ngdialog-message">\
	                <div><h3>Registration</h3></div>' +
	                  '<div><p>' +  response.message +'</p></div>';
	                ngDialog.openConfirm({ template: message, plain: 'true'});
	           },
	           function(response){
	            load.close();
	              var message = '\
	                <div class="ngdialog-message">\
	                <div><h3>No response from Server.. <br> Try Again Later.. </h3></div>';

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

	.factory('ActivityFac',['$rootScope','socket','AuthFactory',function($rootScope,socket,AuthFactory){

		var RA={};
		RA.gatherActivity=function(){
			socket.emit('recentActivity',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken()
                           });
		}


			socket.on('ReplyActivity',function(data){
				//console.log(data);
				$rootScope.$broadcast("RActiviyResult",data);
			});


		return RA;
	}])

	.factory('AdminFac',['$rootScope','socket','AuthFactory',function($rootScope,socket,AuthFactory){
		var AP={};

		AP.gatherreportedPost =function(){
			socket.emit('ReportedPost',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken()
                           });

		}

		socket.on('ReplyReportedPost',function(data){
			console.log(data);
			$rootScope.$broadcast("RAdminResult",data);
		});

		return AP;
	}])

;