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


	.factory('AuthFactory', ['$http', '$localStorage', '$rootScope', '$window', '$state', 'baseURL', '$ionicPopup','socket', function($http, $localStorage, $rootScope, $window, $state, baseURL, $ionicPopup,socket){
    
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
	     
	   authFac.login = function(loginData,callback){
	        var load = $ionicPopup.show({
    				title: 'Please Wait ...'});

	       	$http({
  					method: 'POST',
  					url: baseURL+'login',
  					data: loginData
					}).then(function success(response) {
							load.close();
							console.log(response);
      						if(response.data.success)
	           					{
	              				storeUserCredentials({username:loginData.username,
	              							userId:response.data.userId,
	              							token: response.data.token});
	              				return callback();
	           					}
	           		else {

	           			$ionicPopup.alert({
     								title: 'Alert ',
     								template: '<h3>'+response.data.message+'</h3>'
  									});
	           		}

  					}, function error(response) {
  						load.close();
 	           			$ionicPopup.alert({
     								title: 'Server not Responding'
  									});
 	           			console.log("failure");
	           		});
	        return callback();

	    }; 
	    
	    authFac.logout = function() {
	        $http({
	        		method: 'POST',
	        		data:{'userId':userId},
	        		url: baseURL + "logout"})
	        	.then(function(response){
	        		console.log(response.status)
	       	 	});
	        destroyUserCredentials();
	        console.log("response.status")

	    };
	    
	    authFac.register = function(registerData) {
	    		var load = $ionicPopup.show({
    				title: 'Please Wait....'});

	    		$http({
  					method: 'POST',
  					url: baseURL+'register',
  					data: registerData
					})
	    		.then(function success(response){
	    				console.log(response);
	    				load.close();
	           			$ionicPopup.alert({
     								title: response.data.message
  									});
	    		},
	    		function error(response){
	    			  	load.close();
 	           			$ionicPopup.alert({
     								title: 'Server not Responding',
  									});
 	           			console.log("failure");
	    		});
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

	.factory('SearchFollowFac',['socket','AuthFactory','$rootScope',function(socket,AuthFactory,$rootScope){

		var	SF={};

		SF.search =function(sname){
			    socket.emit('search',{userId:AuthFactory.getUserId(),
                      token:AuthFactory.getToken(),
                      name :sname });
		}

		socket.on('searchresult',function(result){
         	$rootScope.$broadcast("SearchResult", result);
      		}); 

		SF.follow =function(him){
       		socket.emit('follow',{followerId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          followingId :him });

    	};
     	
     	SF.unFollow =function(him){
        	socket.emit('unfollow',{followerId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          followingId :him });
    	};

		return SF;

	}])


	.factory('PostBlogFac',['socket','AuthFactory','$rootScope', '$ionicLoading',function(socket,AuthFactory,$rootScope, $ionicLoading){
		var PB ={};

		PB.post = function(title,body)
			{
				$ionicLoading.show({
      				template: '<ion-spinner icon="bubbles"></ion-spinner>',
    				})
				socket.emit('postblog',{ ownerId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          title :title,
                          body :body
        		});

        		

			}





			socket.on('replypost',function(message){
       			console.log(AuthFactory.getUsername()+"posted");
       			$ionicLoading.hide();
       			$rootScope.$broadcast("ReplyPost",message);

      		});




	    	
		return PB;

	}])

	.factory('PostGathFac',['socket','AuthFactory','$rootScope',function(socket,AuthFactory,$rootScope){
		var PG ={};


		PG.refreshPost =function(){
			socket.emit('gatherposts',{userId: AuthFactory.getUserId(),
           					token: AuthFactory.getToken() });
			}
			
	 		socket.on('gatheredpost',function(data){
	 		$rootScope.$broadcast("GatheredPost",data);
     		});

     	return PG;

	}])

	.factory('LikeDislikeFac',['socket','AuthFactory',function(socket,AuthFactory){

		var LD={};

		LD.emitInterest =function(event,id,intrst){

			socket.emit(event,{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          postId:id,
                          interest:intrst });
		}

		return LD;
	}])

	.factory('CommentPostFac',['socket','AuthFactory','$rootScope',function(socket,AuthFactory,$rootScope){
		var CP={};

		CP.postComment =function(pid,commt){
			console.log(pid+commt);
			    socket.emit('NewComment',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          postId:pid,
                          comment:commt });

		}

		 	socket.on('ReplyComment',function(msg){
         		$rootScope.$broadcast("CommentBlog",msg);
        		});
		return CP;
	}])


	.factory('ReportPostFac',['socket','AuthFactory','$rootScope',function(socket,AuthFactory,$rootScope){
		var RP={};

		RP.reportBlog =function(pid,reson ){

      			socket.emit('reportPost',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          postId:pid,
                          reason:reson});

		}
			socket.on('ReplyReport',function(msg){
          			$rootScope.$broadcast("ReportBlog",msg);
        		});

		return RP;
	}])
;