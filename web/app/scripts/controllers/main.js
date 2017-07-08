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

  .controller('NavigationCtrl',['$scope','AuthFactory','SearchFollowFac','PostBlogFac','ngDialog',function($scope,AuthFactory,SearchFollowFac,PostBlogFac,ngDialog){
    $scope.displayname =AuthFactory.getUsername();
    $scope.logout= function(){
      AuthFactory.logout();
      };


  /* Search section */
  //$scope.SR={};

  $scope.searchFor =function(searchname){
    console.log(searchname);
      SearchFollowFac.search(searchname);
    };


  $scope.$on("SearchResult", function (evt, data) {
        $scope.$applyAsync(function () {
               $scope.SR =  data;
                  console.log($scope.SR);
              if(Object.keys($scope.SR).length==0)
                  $scope.SR=false;
                  var dialog = ngDialog.open({
                  template: '/views/search.html',
                  scope: $scope,
                  controller:'NavigationCtrl',
                  });
            });
      });

  /* end Search section */

  /* following section */
  $scope.followHim =function(him){
        SearchFollowFac.follow(him);
    };

  $scope.unFollowHim =function(him){
        SearchFollowFac.unFollow(him);
    };
       /* following section end */



  /* blog section starts here*/
    $scope.postb={
      title: "",
      body : ""
    }

    $scope.openPostBlog =function(){
            $scope.postdialog = ngDialog.open({
                  template: '/views/postpanel.html',
                  scope: $scope,
                  controller:'NavigationCtrl',
                   showClose: false,
                  });
    };


  $scope.postBlog =function(){
      PostBlogFac.post($scope.postb.title,$scope.postb.body);
    };
    $scope.$on("ReplyPost", function (evt, data) {
        $scope.postdialog.close();
        ngDialog.open({template:'\
                  <div class="ngdialog-message">\
                  <div><h3>Yoor Blog Posted Successfully</h3></div>',plain: 'true',});
      });

  }])

/*
  .controller('PostCtrl',['$scope','AuthFactory','socket','ngDialog',function($scope,AuthFactory,socket,ngDialog){

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

  }]) */




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


  .controller('ActivityCtrl',['$scope','ActivityFac',function($scope,ActivityFac){

    ActivityFac.gatherActivity();
    $scope.RAlist=[];
    $scope.$on("RActiviyResult",function(evt,data){
              $scope.$applyAsync(function () {
      $scope.RAlist=$scope.RAlist.concat(data);
    });
     // console.log($scope.RAlist);
    });


  }])

  
  .controller('AdminCtrl',['$scope','AuthFactory','AdminFac',function($scope,AuthFactory,AdminFac){
    AdminFac.gatherreportedPost();
    $scope.RPlist=[];
    $scope.RPuser=[];
    $scope.$on("RAdminResult",function(evt,data){
              $scope.$applyAsync(function () {
              $scope.RPlist=data;
              $scope.RPuser=[];
              data.forEach(function(usr){
                $scope.RPusr={};
                $scope.RPusr.ofUser=usr.ofUser;
                $scope.RPusr.userstate=usr.userstate;
                $scope.RPuser.push($scope.RPusr);
              });
          });
    });
    $scope.Adminlogout = function(){
      AuthFactory.logout();
      };

    $scope.removePost =function(pId){
      $scope.RPlist.forEach(function(pt,index){
          if(pt.postId==pId)
            $scope.RPlist.splice(index,1);
      });


    }
  }])

  .filter('unique', function() {
   // we will return a function which will take in a collection
   // and a keyname
   return function(collection, keyname) {
      // we define our output and keys array;
      var output = [], 
          keys = [];
      
      // we utilize angular's foreach function
      // this takes in our original collection and an iterator function
      angular.forEach(collection, function(item) {
          // we check to see whether our object exists
          var key = item[keyname];
          // if it's not already part of our keys array
          if(keys.indexOf(key) === -1) {
              // add it to our keys array
              keys.push(key); 
              // push this item to our final output array
              output.push(item);
          }
      });
      // return our array which should be devoid of
      // any duplicates
      return output;
   };
});

;
