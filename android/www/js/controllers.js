angular.module('mobileApp.controllers', []) 

.controller('AppCtrl', function($rootScope,$state,$ionicHistory,$timeout,$scope, $ionicModal,$ionicPopup, $timeout,AuthFactory,$localStorage) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
 /* filtering section */
 $rootScope.filterOn =function(){
  $rootScope.$broadcast('FilterMe',"filtering");
 }
  $rootScope.filterOff =function(){
  $rootScope.$broadcast('FilterNotMe',"filtering");
 }
 
 /*filtering section ends here */


  $scope.timeLine =function(){
    console.log("function called");
    $rootScope.$broadcast('FilterOff',"filtering");
  };


  $scope.logout =function(){
         $timeout(function () {
          $ionicHistory.clearCache();
          $ionicHistory.clearHistory();
      },0) 
    $localStorage.remove('UB');
    $localStorage.remove('LB');
    AuthFactory.logout();
     $state.go('app.profile');   
  }
  $scope.$on("Username",function(evt,data){
   $scope.userName=data;
  });

})
.controller('ProfileCtrl', function($rootScope,$state,$ionicHistory,$timeout,$scope, $ionicModal,$ionicPopup, $timeout,AuthFactory, PostGathFac,NotificationFac) {

   // Form data for the login modal
  $scope.loginData = {
      "username":"",
      "password" :""
    };
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/logIn.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.loginmodal = modal;
  });

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/register.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.registermodal = modal;
  });

  // Triggered in the register modal to close it
  $scope.closeRegister = function() {
    $scope.registermodal.hide();
  };

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
        $timeout(function(){
    $scope.loginmodal.hide();
},0);
    
  };

  // Open the register modal
  $scope.openRegister = function() {
    $scope.registermodal.show();
  };
 // Open the login modal
  $scope.openLogin = function() {
    $timeout(function(){
    $scope.loginmodal.show(); 
},0);
  };

  $scope.registerdata={
    "userId" : "",
    "email" : "",
    "username": "",
    "password" : "",
    "state" : "",
    "name" : ""
    };


  $scope.rpassword={"ch":""};

    function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
    };


  $scope.doRegister=function(){

    $scope.registerdata.userId=generateUUID();
    console.log($scope.rpassword.ch);
    if($scope.registerdata.password!=$scope.rpassword.ch)
    {
      $ionicPopup.alert({
      title: 'Alert',
      template: 'Password Mismatch'
        });
    }
    else
    {
      console.log('Registering with data: ',$scope.registerdata);
      AuthFactory.register($scope.registerdata);
    }

  }
  
 // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    AuthFactory.login($scope.loginData,function(){
          if(AuthFactory.isAuthenticated()){
            $scope.closeLogin();
             $rootScope.$broadcast('Username',AuthFactory.getUsername());
              NotificationFac.gatherNotification();
            $state.go('app.home'); 
          }
    });

  };
/*
 $scope.$on("NotLoggedIn",function(evt,data){
       $scope.openLogin();
  });
*/


  })

.controller('HomeCtrl', function($localStorage,$scope,$rootScope,AuthFactory,$ionicModal,SearchFollowFac,PostBlogFac,$ionicPopup,LikeDislikeFac,CommentPostFac,ReportPostFac,PostGathFac,NotificationFac) {
  /* filtering section */

    $scope.filterObject="";
    $scope.$on("FilterMe",function(evt,data){
      $scope.filterObject=AuthFactory.getUserId();
    });
    $scope.$on("FilterNotMe",function(evt,data){
      $scope.filterObject='!'+AuthFactory.getUserId();
    });
    $scope.$on("FilterOff",function(evt,data){
      $scope.filterObject='';
      //PostGathFac.refreshPost();
      //NotificationFac.gatherNotification();

    });

  /*filtering section ends here */
$scope.$on("$ionicView.beforeEnter", function(event, data){
   // handle event
console.log("State Params: ", data.stateParams);
      $scope.NAlist=[];
      $scope.BD=[];
      console.log("Before enter the view");
      $scope.numberOfItemsToDisplay=2;
  });
$scope.$on("$ionicView.beforeLeave", function(event, data){
   // handle event

console.log("Before leave the view");
      $scope.NAlist=[];
      $scope.BD=[];
      $localStorage.remove('UB');
      $localStorage.remove('LB');
  });


  /* Display post Section */
  // $scope.BD=[];
  $scope.loadMoreData = function() {

  console.log("number of items : ",$scope.numberOfItemsToDisplay);
  if($localStorage.get('LB',undefined)==undefined)
   PostGathFac.refreshPost();

  if($localStorage.get('LB',undefined)!=undefined)
      PostGathFac.oldPost($localStorage.get('LB',''));
   
   if ($scope.BD.length > $scope.numberOfItemsToDisplay){
        $scope.numberOfItemsToDisplay +=1;
  }
   $scope.$broadcast('scroll.infiniteScrollComplete');

  };
/*
  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  }); */
$scope.doRefresh = function() {
  console.log("the current upper bound is",$localStorage.get('UB',''));
  PostGathFac.newPost($localStorage.get('UB',''));
};



$scope.$applyAsync(function () {

   $scope.$on("GatheredPost", function (evt, data) {

    if(Object.keys(data).length===0){
        console.log("Current Data Finished ");
      }
       
      else {

            $localStorage.store('UB',data.slno);
            $localStorage.store('LB',data.slno); 
         $scope.BD.push(data);
         console.log("Gathered post",$localStorage.get('LB',''));
      //  console.log(data);
      }
   });

});


$scope.$applyAsync(function () {
   $scope.$on("GatheredNewPost", function (evt, data) {

    if(Object.keys(data).length===0){
        console.log("Data Finished ");
      }
      else{

        if(data.slno > $localStorage.get('UB','')){
           console.log("UB updated");
            $localStorage.store('UB',data.slno);
      }
        if(data.slno < $localStorage.get('LB','')){
          console.log("LB updated");
            $localStorage.store('LB',data.slno); 
      }

        $scope.BD.push(data);
        console.log("Gathered new post",data.postId);
  }

    });
});


$scope.$applyAsync(function () {
   $scope.$on("GatheredOldPost", function (evt, data) {
            if(Object.keys(data).length===0){
        console.log("Old Data Finished ");
      }
      else{

        if(data.slno > $localStorage.get('UB','')){
           console.log("UB updated");
            $localStorage.store('UB',data.slno);
        }
        if(data.slno < $localStorage.get('LB','')){
          console.log("LB updated");
            $localStorage.store('LB',data.slno); 
          }
        $scope.BD.push(data);
        console.log("Gathered old post LB is ",$localStorage.get('LB',''));
    }
    });
});



  /* Display post Section  Ends*/



  /* Post section */
  $scope.postb={
      title: "",
      body : ""
    };
/* before enter homectrl */
  $scope.$on("$ionicView.beforeEnter", function(event, data){
   // handle event
   if(!AuthFactory.isAuthenticated())
        $rootScope.$broadcast("NotLoggedIn","openlogin");
    });
/* before enter homectrl  ends here*/

  $ionicModal.fromTemplateUrl('templates/postpanel.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.postmodal = modal;
  });

  $scope.postBlog =function(){
      PostBlogFac.post($scope.postb.title,$scope.postb.body);
    };
    $scope.$on("ReplyPost", function (evt, data) {
          $ionicPopup.alert({
                title: 'Blog Posted'
              });
          $scope.postb.title='';
          $scope.postb.body='';
          $scope.postmodal.hide();

          $scope.$applyAsync(function () {

        if(data.slno > $localStorage.get('UB','')){
           console.log("UB updated");
            $localStorage.store('UB',data.slno);
        }
        if(data.slno < $localStorage.get('LB','')){
          console.log("LB updated");
            $localStorage.store('LB',data.slno); 
        }
        $scope.BD.push(data.blog);
        console.log(data.blog);
      });


       
      });

  /*End  Post section */

  /* Search section */

  $ionicModal.fromTemplateUrl('templates/search.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.searchmodal = modal;
  });

  $scope.SR={};

  $scope.searchFor =function(searchname){
      SearchFollowFac.search(searchname);
    };

  $scope.$on("SearchResult", function (evt, data) {
        $scope.SR =  data;
        console.log($scope.SR);
        if(Object.keys($scope.SR).length==0)
            $scope.SR=false;
        $scope.searchmodal.show();
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




/* Like and dislike */
 $scope.changestate=function(id,state,from){
      if(from==1)
          {
            if(state==2){
              LikeDislikeFac.emitInterest('interestInsert',id,1);
                return 1; // null->liked  :insert 
            }
            if(state==0){
               LikeDislikeFac.emitInterest('interestUpdate',id,1);
                return 1; // disliked ->liked update
            }
            if(state==1){ 
               LikeDislikeFac.emitInterest('interestDelete',id,1);
                return 2
            } //liked -> null delete
          }
       if(from==0)
          {
            if(state==2){
               LikeDislikeFac.emitInterest('interestInsert',id,0);
                return 0; // null -> dislike insert
            }
            if(state==1){
               LikeDislikeFac.emitInterest('interestUpdate',id,0);
                return 0; //like -> dislike update
            }
            if(state==0){
               LikeDislikeFac.emitInterest('interestDelete',id,0);
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
      //console.log(newComment);

          $scope.$applyAsync(function () {

              $scope.indexCmt =$scope.BD.indexOf(obj);
              $scope.newComment.createdAt=Date();
              $scope.newComment.comment=cmt;
              $scope.newComment.username=AuthFactory.getUsername();
              if(cmt!=undefined){
              $scope.BD[$scope.indexCmt].comments.push($scope.newComment);
              CommentPostFac.postComment(pId,$scope.newComment.comment);
              }
              $scope.newComment={};
            });

         

    };
    /* comment section ends here */

  /* report section */
  $scope.reportPost=function(postId){

    $ionicPopup.prompt({
              title: 'Report Blog',
              template: 'Reason',
              inputType: 'text',
              inputPlaceholder: 'Your Reason'
        })
    .then(function(res) {
         ReportPostFac.reportBlog(postId,res);
      });
     

  }


  /* report section ends here */
})


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
