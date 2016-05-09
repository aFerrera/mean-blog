var app = angular.module('blog', ['ngRoute', 'ngCookies']);

app.config(function($routeProvider, $locationProvider){
  $routeProvider
  .when('/', {
    templateUrl: 'home.html',
    controller: 'HomeController'
  })
  .when('/signUp', {
    templateUrl: 'signUp.html',
    controller: 'SignUpController'
  });
});

app.run(function($rootScope, $cookies){
  if($cookies.get('token') && $cookies.get('currentUser')){
    $rootScope.token = $cookies.get('token');
    $rootScope.currentUser = $cookies.get('currentUser');
  }
});

app.controller('HomeController', function($rootScope, $scope, $http, $cookies){

  /*CREAR POST*/
  $scope.submitNewPost = function(){
    $http.post('/posts', {
      title: $scope.newPostTitle,
      text: $scope.newPostText
    }, {headers: {'authorization': $rootScope.token}}).then(function(){
      getPosts();
      Materialize.toast('Post añadido!', 4000)
    });
  };

  /*FUNCIÓN DE BORRAR POST*/
  $scope.delPost = function(postAborrar){
    $http.put('/posts/remove', {post: postAborrar}, {headers: {'authorization': $rootScope.token}}).then(function(){
      getPosts();
      Materialize.toast('Entrada eliminada!', 4000)
    });
  };

  /*FUNCIÓN DE INICIO DE SESIÓN*/
  $scope.signin = function(){
    $http.put('/users/signin', {username: $scope.username, password: $scope.password}).
    then(function(res){

      //save cookies
      $cookies.put('token', res.data.token);
      $cookies.put('currentUser', $scope.username);

      $rootScope.token = res.data.token;
      $rootScope.currentUser = $scope.username;
    }, function(err){
      alert('Error de credenciales!');
    });
  };

  /*FUNCIÓN DE LOGOUT*/
  $scope.logout = function(){
    $cookies.remove('token');
    $cookies.remove('currentUser');

    $rootScope.token = null;
    $rootScope.currentUser = null;
  };

  function getPosts(){
    $http.get('/posts').then(function(response){
      $scope.posts = response.data;
    });
  }

  getPosts();

});

app.controller('SignUpController', function($scope, $http){
  $scope.sumbitSignup = function(){
    var newUser = {
      username: $scope.username,
      password: $scope.password
    };

    $http.post('/users', newUser).then(function(){
      alert('bien echo!');
    });
  }
});
