'use strict';
/**
 * @ngdoc function
 * @name webApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webApp
 */
angular.module('webApp')
  .controller('LoginCtrl',['$scope','AuthFactory',function ($scope,AuthFactory) {
    $scope.login = {
      "username":"",
      "password" :""
    };
    $scope.loginEntry=function(){ 
      AuthFactory.login($scope.login);
    };

  }])

  .controller('RegisterCtrl',['$scope','AuthFactory',function ($scope,AuthFactory) {
      $scope.register={
    "userId" : "",
    "email" : "",
    "username": "",
    "password" : "",
    "state" : "",
    "name" : ""
    };
    function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
    };
    $scope.rpassword="";
    $scope.validate= function() {

    $scope.register.userId=generateUUID();
    if($scope.register.password!=$scope.rpassword)
    {
      alert('Password mismatch');
    }
    else if( ($scope.register.password.length<6) &&
        ($scope.register.password.match(/.[!,@,#,$,%,^,&,*,?,_,~]/)) &&
        ($scope.register.password.match(/[0-9]/)) )
      alert('Atleast 6 letters for password with special character and numerical');
    else
    {
      console.log('register',$scope.register);
      AuthFactory.register($scope.register);
    }

  };

  }])

  .controller('NavigationCtrl',['$scope','AuthFactory','socket','ngDialog','myService',function($scope,AuthFactory,socket,ngDialog,myService){
    $scope.name="";
    $scope.displayname =AuthFactory.getUsername();
    $scope.logout= function(){
      AuthFactory.logout();
      };
    socket.on('AuthorizationFailed',function(message){
        ngDialog.open({template:'\
                  <div class="ngdialog-message">\
                  <div><h3>Unauthorized</h3></div>',plain: 'true'});
    });

    socket.on('searchresult',function(result){
          myService.setServe(result);
          var dialog = ngDialog.open({
            template: '/views/search.html',
            });
      }); 



    $scope.search =function(){
     socket.emit('search',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          name :$scope.name });
     
    };
  }])

  .controller('SearchCtrl',['$scope','$state','myService','AuthFactory','socket',function($scope,$state,myService,AuthFactory,socket){
    $scope.SR=myService.getServe();
  
    
    $scope.followHim =function(him){
        console.log(him);
       socket.emit('follow',{followerId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          followingId :him });

    };
     $scope.unFollowHim =function(him){
        console.log(him);
        socket.emit('unfollow',{followerId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          followingId :him });
    };
  }])

  .controller('PostCtrl',['$scope','AuthFactory','socket','ngDialog',function($scope,AuthFactory,socket,ngDialog){
    $scope.postb={
      title: "",
      body : ""
    }
      socket.on('replypost',function(message){
       console.log(AuthFactory.getUsername()+"posted");
      });
      
    $scope.postBlog =function(){
        socket.emit('postblog',{ ownerId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          title :$scope.postb.title,
                          body :$scope.postb.body
        });

    };

  }])




  .controller('BlogDCtrl',['$scope','myService','socket','AuthFactory','ngDialog',function($scope,myService,socket,AuthFactory,ngDialog){
    $scope.BD=[];
    socket.emit('gatherposts',{userId:AuthFactory.getUserId(),
           token:AuthFactory.getToken() });

    $scope.triggerreport =function(pId){
        
        var dialog = ngDialog.open({
            template: '/views/report.html',
            });
        myService.setServe({'Id':pId,'dg':dialog});
      }


    $scope.changestate=function(id,state,from){
      if(from==1)
          {
            if(state==2){
              socket.emit('interestInsert',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          postId:id,
                          interest:1 });
              return 1; // null->liked  :insert 
            }
            if(state==0){
              socket.emit('interestUpdate',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          postId:id,
                          interest:1 });
              return 1; // disliked ->liked update
            }
            if(state==1){ 
                socket.emit('interestDelete',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          postId:id
                          });
              return 2;
            } //liked -> null delete
          }
       if(from==0)
          {
            if(state==2){
               socket.emit('interestInsert',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          postId:id,
                          interest:0 });
              return 0; // null -> dislike insert
            }
            if(state==1){
              socket.emit('interestUpdate',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          postId:id,
                          interest:0 });
              return 0; //like -> dislike update
            }
            if(state==0){
               socket.emit('interestDelete',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          postId:id
                          });
              return 2; //dislike ->null delete
            }
          }
      
    }
    socket.on('gatheredpost',function(data){
        $scope.$applyAsync(function () {
               $scope.BD=data;
              console.log($scope.BD);
     });

    });

  }])

  .controller('CommentCtrl',['$state','$scope','socket','AuthFactory','ngDialog',function($state,$scope,socket,AuthFactory,ngDialog){
    
    $scope.newComment={ 'comment':"",
                        'username':AuthFactory.getUsername(),
                        'createdAt':""};
    $scope.showcomment=false;

    $scope.submitComment = function(pId,obj) {
      console.log("i am called");

        socket.emit('NewComment',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          postId:pId,
                          comment:$scope.newComment.comment });
        console.log($scope.BD.indexOf(obj));
        $scope.newComment.createdAt=Date.now();

        console.log($scope.newComment);
        $scope.ind =$scope.BD.indexOf(obj);
        console.log($scope.BD[$scope.ind]);

        $scope.BD[$scope.ind].comments.push($scope.newComment);


        socket.on('ReplyComment',function(msg){
          
          //$state.go($state.current, {}, {reload: true});
        });

    };
  }])

  .controller('ReportCtrl',['$scope','socket','AuthFactory','myService',function($scope,socket,AuthFactory,myService){
    $scope.rdata=myService.getServe();

    $scope.reportPost=function(reason){
      $scope.rdata.dg.close();
      console.log(reason+$scope.rdata.Id);
      socket.emit('reportPost',{userId:AuthFactory.getUserId(),
                          token:AuthFactory.getToken(),
                          postId:$scope.rdata.Id,
                          reason:reason });

      socket.on('ReplyReport',function(msg){
          
        });
    }

  }])
;
