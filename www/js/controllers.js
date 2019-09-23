angular.module('starter.controllers', ['ionic','firebase'])

.controller('AppCtrl', function($scope,$state, $ionicModal, $timeout,$ionicPopup,$ionicLoading) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if(currentUser==null || currentUser.userId==''){
    $state.go('signin');
  }

  $scope.userData = {};
  $scope.userData = JSON.parse(localStorage.getItem("currentUser"));

  $scope.logout =function(){
    localStorage.clear();
    $state.go('signin');
  }

  $ionicModal.fromTemplateUrl('templates/createNews.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

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
    }).then(function(){
       console.log("The loading indicator is now displayed");
    });
  };
  $scope.loaderHide = function(){
    $ionicLoading.hide().then(function(){
       console.log("The loading indicator is now hidden");
    });
  };

  $scope.postPic = "";
  $scope.uploadPhoto = function(files){
    $scope.postPic = files[0];
  }

  $scope.postData = {}
  $scope.doPost = function(){
    if(typeof $scope.postData.title=="undefined" || $scope.postData.title==""){
      $scope.showAlert('Please insert title');
    }else if(typeof $scope.postData.description=="undefined" || $scope.postData.description==""){
      $scope.showAlert('Please insert description');
    }else if($scope.postPic == ""){
      $scope.showAlert('Please upload post picture');
    }else{
      $scope.loaderShow();

      var storageRef = firebase.storage().ref();
        var uploadTask = storageRef.child('user_post/' + Date.now()).put($scope.postPic);

        uploadTask.on('state_changed', function(snapshot) {

            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            console.log('Upload is ' + progress + '% done');

            switch (snapshot.state) {

                case firebase.storage.TaskState.PAUSED:

                    console.log('Upload is paused');
                    break;

                case firebase.storage.TaskState.RUNNING:

                    console.log('Upload is running');
                    break;
            }

        }, function(error) {

            alert(error)

        }, function() {

            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {

              let postData = {
                title: $scope.postData.title,
                description: $scope.postData.description,
                postPic: downloadURL,
                userId: currentUser.userId,
                timestamp:Date.now()
              }
              firebase.database().ref().child('posts').push(postData);

              $scope.postData = {};
              $scope.postPic = "";
              $scope.loaderHide();
              $scope.modal.hide();
            });
        }); 


    }
  }
})

.controller('PlaylistsCtrl', function($scope,$firebaseArray) {

  var ref = firebase.database().ref("posts");
  $scope.playlists = $firebaseArray(ref);
  
  var d = Date(Date.now()); 
  
  // Converting the number of millisecond in date string 
  a = d.toString() 
  
  // Printing the current date                     
  console.log(a);

})

.controller('PlaylistCtrl', function($scope, $stateParams,$firebaseObject) {

  var post = firebase.database().ref("posts").child($stateParams.playlistId);
  $scope.postData = $firebaseObject(post);

  $scope.postData.$loaded().then(function(data) {
    
    
    var user = firebase.database().ref("users").child(data.userId);
    $scope.userData = $firebaseObject(user);
    // DO WHATEVER
  }).catch(function(error) {
    console.error("Error:", error);
  });
  
})

.controller('SigninCtrl', function($scope, $stateParams,$window,$state,$ionicPopup, $timeout,$ionicLoading) {
   
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if(currentUser!=null && currentUser.userId!=''){
    $state.go('app.playlists');
  }

   $scope.signinData = {};
   $scope.signupData = {};
   $scope.profilePic = "";

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
    }).then(function(){
       console.log("The loading indicator is now displayed");
    });
  };
  $scope.loaderHide = function(){
    $ionicLoading.hide().then(function(){
       console.log("The loading indicator is now hidden");
    });
  };

  $scope.uploadPhoto = function(files){
    $scope.profilePic = files[0];
  }

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

        firebase.database().ref("users").child(result.user.uid).once('value', function(snapshot) {
            if(snapshot.val()){
                let userData = snapshot.val();
                userData = {
                  userId: userData.userId,
                  profilePic: userData.profilePic,
                  name: userData.name,
                }
                localStorage.setItem("currentUser",JSON.stringify(userData));
                $scope.loaderHide();
                $state.go('app.playlists');
            }
        });
        
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
    }else if($scope.profilePic == ""){
      $scope.showAlert('Please upload profile picture');
    }else{

      $scope.loaderShow();

      firebase.auth().createUserWithEmailAndPassword($scope.signupData.email, $scope.signupData.password)
      .then(function(result) {

        var storageRef = firebase.storage().ref();
        var uploadTask = storageRef.child('user_profile/' + Date.now()).put($scope.profilePic);

        uploadTask.on('state_changed', function(snapshot) {

            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            console.log('Upload is ' + progress + '% done');

            switch (snapshot.state) {

                case firebase.storage.TaskState.PAUSED:

                    console.log('Upload is paused');
                    break;

                case firebase.storage.TaskState.RUNNING:

                    console.log('Upload is running');
                    break;
            }

        }, function(error) {

            alert(error)

        }, function() {

            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
              let userData = {
                userId:result.user.uid,
                name:$scope.signupData.fullname,
                profilePic:downloadURL,
              }
              
              firebase.database().ref().child('users').child(result.user.uid).set(userData);

              $scope.loaderHide();
              $state.go('signin');
            });
        });  

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
