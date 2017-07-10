angular.module('mobileApp.controllers', []) 

.controller('AppCtrl', function($rootScope,$state,$ionicHistory,$timeout,$scope, $ionicModal,$ionicPopup, $timeout,AuthFactory,socket,PostBlogFac,PostGathFac) {

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
    $scope.loginmodal.hide();
  };

  // Open the register modal
  $scope.openRegister = function() {
    $scope.registermodal.show();
  };

  $scope.timeLine =function(){
    console.log("function called");
    $rootScope.$broadcast('FilterOff',"filtering");
  };

  // Open the login modal
  $scope.openLogin = function() {
    $timeout(function(){
    $scope.loginmodal.show(); 
},0);
  };

  $scope.openLogin();

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
    else if( ($scope.registerdata.password.length<6) &&
        ($scope.registerdata.password.match(/.[!,@,#,$,%,^,&,*,?,_,~]/)) &&
        ($scope.registerdata.password.match(/[0-9]/)) )
            $ionicPopup.alert({
      title: 'Alert',
      template: 'Wrong Pasword'
        });
    else
    {
      console.log('register',$scope.registerdata);
      AuthFactory.register($scope.registerdata);
    }

  }
      /* access checking */
        socket.on('AuthorizationFailed',function(message){
           
           $ionicPopup.alert({
                title: 'You are not Logged In'
            })
           .then(function(res) {
                $scope.openLogin();
            });
        });
      /* access checking */   


  $scope.logout =function(){
         $timeout(function () {
          $ionicHistory.clearCache();
          $ionicHistory.clearHistory();
      },100) 
    AuthFactory.logout();  
    $scope.openLogin();
  }

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    AuthFactory.login($scope.loginData,function(){
          if(AuthFactory.isAuthenticated()){
            $scope.closeLogin();
            PostGathFac.refreshPost();
            $state.go('app.home'); 
          }
    });

  };

  $scope.$on("NotLoggedIn",function(evt,data){
    console.log("before enter the ctrl");
       $scope.openLogin();
  });

  $scope.$on("$ionicView.beforeEnter", function(event, data){
   // handle event
   if(!AuthFactory.isAuthenticated())
        $scope.openLogin();
    });
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
      $scope.BD=[];
        $localStorage.remove('UB');
        $localStorage.remove('LB');
      PostGathFac.refreshPost();
      NotificationFac.gatherNotification();

    });

  /*filtering section ends here */


  /* Display post Section */
  // $scope.BD=[];
   $scope.moreDataCanBeLoaded=true;
  $scope.loadMore = function() {
      $scope.BD=[];
       PostGathFac.refreshPost();
       NotificationFac.gatherNotification();
  };

  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });

$scope.$applyAsync(function () {

   $scope.$on("GatheredPost", function (evt, data) {

    if(Object.keys(data).length===0){
        $scope.moreDataCanBeLoaded=false;
        console.log("Data Finished ",$scope.moreDataCanBeLoaded);
      }
       
      else {
        if($localStorage.get('UB',undefined)==undefined){
           console.log("UB  intialized");
            $localStorage.store("UB",data.slno);
        }

        if($localStorage.get('LB',undefined)==undefined){
          console.log("LB  intialized");
            $localStorage.store('LB',data.slno);
        }
        if(data.slno > $localStorage.get('UB','')){
           console.log("UB updated");
            $localStorage.store('UB',data.slno);
        }
        if(data.slno < $localStorage.get('LB','')){
          console.log("LB updated");
            $localStorage.store('LB',data.slno); 
        }
         $scope.BD.push(data);

      //  console.log(data);
      }
   });

});



$scope.doRefresh = function() {
  console.log("the current upper bound is",$localStorage.get('UB',''));
  PostGathFac.newPost($localStorage.get('UB',''));
};

$scope.$applyAsync(function () {
   $scope.$on("GatheredNewPost", function (evt, data) {


        if($localStorage.get('UB',undefined)==undefined){
           console.log("UB  intialized");
            $localStorage.store("UB",data.slno);
}
        if($localStorage.get('LB',undefined)==undefined){
          console.log("LB  intialized");
            $localStorage.store('LB',data.slno);
}
        if(data.slno > $localStorage.get('UB','')){
           console.log("UB updated");
            $localStorage.store('UB',data.slno);
}
        if(data.slno < $localStorage.get('LB','')){
          console.log("LB updated");
            $localStorage.store('LB',data.slno); 
          }

        $scope.BD.push(data);
        console.log(data);
        $scope.$broadcast('scroll.refreshComplete');
    });
});

/*
$scope.$applyAsync(function () {
   $scope.$on("GatheredOldPost", function (evt, data) {


        if($localStorage.get('UB',undefined)==undefined){
           console.log("UB  intialized");
            $localStorage.store("UB",data.slno);
}
        if($localStorage.get('LB',undefined)==undefined){
          console.log("LB  intialized");
            $localStorage.store('LB',data.slno);
}
        if(data.slno > $localStorage.get('UB','')){
           console.log("UB updated");
            $localStorage.store('UB',data.slno);
}
        if(data.slno < $localStorage.get('LB','')){
          console.log("LB updated");
            $localStorage.store('LB',data.slno); 
          }

        $scope.BD.push(data);
        console.log(data);
        $scope.$broadcast('scroll.refreshComplete');
    });
});


*/

  /* Display post Section  Ends*/
    /* notification starts here */

      $scope.NAlist=[];
    $scope.$on("RNotificationResult",function(evt,data){
      $scope.$applyAsync(function () {
            $scope.NAlist.push(data);
            console.log($scope.NAlist);
            $scope.notificationCount=$scope.NAlist.length;
        });
    });
    /*notification ends here */


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
       // $scope.postmodal.hide();
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
    $scope.submitComment = function(pId,obj) {
      //console.log(newComment);

          $scope.$applyAsync(function () {

              $scope.indexCmt =$scope.BD.indexOf(obj);
              $scope.newComment.createdAt=Date();
              //$scope.newComment.createdAt="$scope.newComment.createdAt.toString();"
              $scope.newComment.username=AuthFactory.getUsername();
              $scope.BD[$scope.indexCmt].comments.push($scope.newComment);
              $scope.newComment={};

            
            });

         CommentPostFac.postComment(pId,$scope.newComment.comment);

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


.controller('PlaylistCtrl', function($scope, $stateParams) {
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
