angular.module('mobileApp.controllers', [])

.controller('AppCtrl', function($timeout,$scope, $ionicModal,$ionicPopup, $timeout,AuthFactory) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


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



  $scope.logout =function(){
    AuthFactory.logout();
    $scope.openLogin();
  }

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    AuthFactory.login($scope.loginData);
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.$on("$ionicView.beforeEnter", function(event, data){
   // handle event
   if(!AuthFactory.isAuthenticated())
        $scope.openLogin();
    });
})

.controller('HomeCtrl', function($scope,$rootScope,AuthFactory,$ionicModal,SearchFollowFac,PostBlogFac,$ionicPopup) {
  /* Post section */
  $scope.postb={
      title: "",
      body : ""
    };

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
        $scope.postmodal.hide();
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



  /* Display post Section */
  /* Display post Section  Ends*/



  
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
