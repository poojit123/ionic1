angular.module('starter.controllers', ['ionic'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('SigninCtrl', function($scope, $stateParams,$window,$state,$ionicPopup, $timeout,$ionicLoading) {
   
   $scope.signinData = {};
   $scope.signupData = {};

  // An alert dialog
  $scope.showAlert = function(message) {
    var alertPopup = $ionicPopup.alert({
      title: 'Error',
      template: message
    });
  };

  // loader
  $scope.loaderShow = function() {
    $ionicLoading.show({
      template: 'Loading...',
      duration: 3000
    }).then(function(){
       console.log("The loading indicator is now displayed");
    });
  };
  $scope.loaderHide = function(){
    $ionicLoading.hide().then(function(){
       console.log("The loading indicator is now hidden");
    });
  };

  // Perform the signin action when the user submits the signin form
  $scope.doSignin = function() {
    
    if(typeof $scope.signinData.email=="undefined" || $scope.signinData.email==""){
      $scope.showAlert('Please insert email');
    }else if($scope.signinData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/igm)== null){
      $scope.showAlert('Please enter a vaild email');
    }else if(typeof $scope.signinData.password=="undefined" || $scope.signinData.password==""){
      $scope.showAlert('Please insert password');
    }else{
      $scope.loaderShow();

      firebase.auth().signInWithEmailAndPassword($scope.signinData.email, $scope.signinData.password)
      .then(function(result) {
        $scope.loaderHide();
        $state.go('app.playlists');
       // $window.location = "/#/app/playlists";
      })
      .catch(function(error) {
        $scope.loaderHide();
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if(errorCode=='auth/user-not-found'){
          $scope.showAlert('Email & Password not match');
        }else{
          $scope.showAlert(errorMessage);
        }
      });

    }

  };

  // Perform the signup action when the user submits the signup form
  $scope.doSignup = function() {


    if(typeof $scope.signupData.fullname=="undefined" || $scope.signupData.fullname==""){
      $scope.showAlert('Please insert fullname');
    }else if(typeof $scope.signupData.email=="undefined" || $scope.signupData.email==""){
      $scope.showAlert('Please insert email');
    }else if($scope.signupData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/igm)== null){
      $scope.showAlert('Please enter a vaild email');
    }else if(typeof $scope.signupData.password=="undefined" || $scope.signupData.password==""){
      $scope.showAlert('Please insert password');
    }else if($scope.signupData.password.length < 6){
      $scope.showAlert('Password must be 6 char long');
    }else{

      $scope.loaderShow();

      firebase.auth().createUserWithEmailAndPassword($scope.signupData.email, $scope.signupData.password)
      .then(function(result) {
        $scope.loaderHide();
        $state.go('signin');
        $window.location = "/#/signin";
      })
      .catch(function(error) {
        $scope.loaderHide();
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        $scope.showAlert(errorMessage);
      });

    }

  };

});
