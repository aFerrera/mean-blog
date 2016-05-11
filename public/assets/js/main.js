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
  })
  .when('/verPost', {
    templateUrl: 'verPost.html',
    controller: 'newsController'
  })
});

app.run(function($rootScope, $cookies){
  if($cookies.get('token') && $cookies.get('currentUser')){
    $rootScope.token = $cookies.get('token');
    $rootScope.currentUser = $cookies.get('currentUser');
  }
});

app.controller('HomeController', function($rootScope, $scope, $http, $cookies){

  $scope.verPost = function(){

    console.log($scope.idPost);
  };

  /*CREAR POST*/
  $scope.submitNewPost = function(){
    $http.post('/posts', {
      title: $scope.newPostTitle,
      text: $scope.newPostText,
      img: $scope.newImg
    }, {headers: {'authorization': $rootScope.token}}).then(function(res){

      /*validación del formulario*/
      var aux = res.data;

      $scope.msgs = [];

      for(var i in aux){
        $scope.msgs.push(aux[i].msg);
      }

      getPosts();

    });
  };

  /*FUNCIÓN DE BORRAR POST*/
  $scope.delPost = function(postAborrar){
    $http.put('/posts/remove', {post: postAborrar}, {headers: {'authorization': $rootScope.token}}).then(function(){
      getPosts();
    });
  };

  /*FUNCIÓN DE INICIO DE SESIÓN*/
  $scope.signin = function(){
    console.log($scope.username);
    $http.put('/users/signin', {username: $scope.username, password: $scope.password}).
    then(function(res){

      /*Mensages de validación*/
      var aux = res.data;

      $scope.msgs = [];

      if(aux.length > 0){
        for(var i in aux){
          $scope.msgs.push(aux[i].msg);
        }
      }


      //save cookies
      $cookies.put('token', res.data.token);
      $cookies.put('currentUser', $scope.username);

      $rootScope.token = res.data.token;
      $rootScope.currentUser = $scope.username;

    }, function(err){
      alert('Error de credenciales');
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

  /*controller de registro de usuario*/
  app.controller('SignUpController', function($scope, $http){
    /*función de registrar*/
    $scope.sumbitSignup = function(){
      /*valores a introducir*/
      var newUser = {
        username: $scope.username,
        password: $scope.password
      };

      /*petición al servidor*/
      $http.post('/users', newUser).then(function(res){ //pasamos el usuario entero como objeto

        var aux = res.data;

        $scope.msgs = [];

        for(var i in aux){
          $scope.msgs.push(aux[i].msg);
        }


      });


    }
  });

  /*controlador de noticias*/
  app.controller('newsController', function($rootScope, $scope, $http, $cookies){

    $scope.verPost = function(data){


      $http.get('/postsBy').then(function(response){
        //console.log(response);

        var aux = response.data;

        $rootScope.uno = [];

        for(var i in aux){

          if(aux[i]._id == data){
            $scope.uno.push(aux[i]);
          }

        }
      });


    };

    $scope.comentar = function(post, texto){

      var newComent = {
        post: post,
        text: texto,
        autor: $cookies.get('currentUser')
      };


      $http.post('/coment', newComent).then(function(res){

        $scope.verPost(post);
      });
    };
  });
