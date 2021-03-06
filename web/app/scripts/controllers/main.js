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
                  $scope.SR=0;
                console.log($scope.SR);
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
              $scope.postdialog.close();
    };



    /* blog section ends here */

    /* notification starts here */
    $scope.NAlist =[];
    $scope.$on("RNotificationResult",function(evt,data){
      $scope.$applyAsync(function () {
            $scope.NAlist.push(data);
            $scope.notificationCount=$scope.NAlist.length;
        });
    });
    /*notification ends here */

  }])



  .controller('BlogDCtrl',['$scope','AuthFactory','ngDialog','LikeDislikeFac','CommentPostFac', 'ReportPostFac','PostGathFac','NotificationFac','$localStorage', function($scope,AuthFactory,ngDialog,LikeDislikeFac,CommentPostFac,ReportPostFac,PostGathFac,NotificationFac,$localStorage){
   $scope.BD=[];

   PostGathFac.refreshPost();
   NotificationFac.gatherNotification();

   $scope.$on("GatheredPost", function (evt, data) {
     $scope.$applyAsync(function () {
          if(Object.keys(data).length===0){
        console.log("Current Data Finished ");
      }
       
      else {
          $localStorage.store('UB',data.slno);
         $scope.BD.push(data);
         console.log("Gathered post",$localStorage.get('UB',''));
      //  console.log(data);
      }

    });
      });

   $scope.$applyAsync(function () {
   
   $scope.$on("GatheredNewPost", function (evt, data) {



        if(data.slno > $localStorage.get('UB','')){
           console.log("UB updated");
            $localStorage.store('UB',data.slno);
      }

        $scope.BD.push(data);
        console.log("Gathered new post",data.postId);
  

    });
});



   /*
new post section

   */

       $scope.$on("ReplyPost", function (evt, data) {
        $scope.$applyAsync(function () {
        $scope.BD.push(data.blog);
       console.log("newpost :",data.blog);
    });
        ngDialog.open({template:'\
                  <div class="ngdialog-message">\
                  <div><h3>Your Blog Posted Successfully</h3></div>',plain: 'true',});
      });


    /* Like and dislike */
 $scope.changestate=function(obj,id,state,from){
      $scope.indexObj=$scope.BD.indexOf(obj);
      
      if(from==1)
          {
            if(state==2){
              LikeDislikeFac.emitInterest('interestInsert',id,1);
               $scope.BD[$scope.indexObj].noLikes=$scope.BD[$scope.indexObj].noLikes+1;
                return 1; // null->liked  :insert 
            }
            if(state==0){
               LikeDislikeFac.emitInterest('interestUpdate',id,1);
                $scope.BD[$scope.indexObj].noLikes=$scope.BD[$scope.indexObj].noLikes+1;
                $scope.BD[$scope.indexObj].noDislikes=$scope.BD[$scope.indexObj].noDislikes-1;
                return 1; // disliked ->liked update
            }
            if(state==1){ 
               LikeDislikeFac.emitInterest('interestDelete',id,1);
               $scope.BD[$scope.indexObj].noLikes=$scope.BD[$scope.indexObj].noLikes-1;
                return 2
            } //liked -> null delete
          }
       if(from==0)
          {
            if(state==2){
               LikeDislikeFac.emitInterest('interestInsert',id,0);
               $scope.BD[$scope.indexObj].noDislikes=$scope.BD[$scope.indexObj].noDislikes+1;
                return 0; // null -> dislike insert
            }
            if(state==1){
               LikeDislikeFac.emitInterest('interestUpdate',id,0);
               $scope.BD[$scope.indexObj].noLikes=$scope.BD[$scope.indexObj].noLikes-1;
                $scope.BD[$scope.indexObj].noDislikes=$scope.BD[$scope.indexObj].noDislikes+1;
                return 0; //like -> dislike update
            }
            if(state==0){
               LikeDislikeFac.emitInterest('interestDelete',id,0);
               $scope.BD[$scope.indexObj].noDislikes=$scope.BD[$scope.indexObj].noDislikes-1;
                return 2; //dislike ->null delete
            }
          }
      
    }
    /* like and dislike ends here */

     /* comment section */
      $scope.newComment={'comment':"",
                        'username':AuthFactory.getUsername(),
                        'createdAt':""};

    $scope.submitComment = function(cmt,pId,obj) {

           $scope.$applyAsync(function () {
              if(cmt)
              $scope.indexCmt =$scope.BD.indexOf(obj);
              $scope.newComment.createdAt=Date();

              $scope.newComment.comment=cmt;
              $scope.newComment.username=AuthFactory.getUsername();
              $scope.BD[$scope.indexCmt].comments.push($scope.newComment);
              $scope.newComment={};

            
            });

          console.log(pId,$scope.newComment.comment);

         CommentPostFac.postComment(pId,$scope.newComment.comment);

    };
    /* comment section ends here */


      /* report section */

  $scope.reportPost=function(pId,res){
          console.log(pId,res);

          ReportPostFac.reportBlog(pId,res);
  }


  /* report section ends here */



  

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
              $scope.RPlist=data.blogs;
              $scope.RPuser=data.users;
          });
    });
    $scope.Adminlogout = function(){
      AuthFactory.logout();
      };

    $scope.blockUser = function(unm){
      console.log(unm);
      AdminFac.blockUser(unm);
    };

    $scope.unblockUser=function(unm){
      AdminFac.unblockUser(unm);
    };


    $scope.removePost =function(pId){
      AdminFac.removeBlog(pId);

      $scope.RPlist.forEach(function(pt,index){
          if(pt.postId==pId){
            $scope.$applyAsync(function () {
            $scope.RPlist.splice(index,1);
            });
          }
      });

    }

  $scope.removecomplaint =function(pId){
        console.log("response received");
        AdminFac.removecomplaint(pId);
      $scope.$applyAsync(function () {
      $scope.RPlist.forEach(function(pt,index){
          if(pt.postId==pId){
            
            $scope.RPlist.splice(index,1);
        
          }
              });
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

