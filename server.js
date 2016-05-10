/*WEB SERVER*/
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var expressValidator = require('express-validator');
var app = express();

/*contra para jwt*/
var secret = 'blogsecret';

var db = null;

/*mongo connexion*/
MongoClient.connect("mongodb://localhost:27017/blog", function (err, dbconn){
  if(!err){
    console.log("connected to database");
    db = dbconn;
  }
});

/*uses, inciar componentes*/
app.use(bodyParser.json());

app.use(expressValidator());

app.use(express.static('public'));


/*buscar posts en mongo*/
app.get('/posts', function(req, res, next){

  db.collection('posts', function (err, postsCollection){
    postsCollection.find().sort( { _id: -1 } ).toArray(function(err, posts){

      return res.send(posts);
    });
  });

});

/*Insertar post en mongo*/
app.post('/posts', function(req, res, next){
  /*
  req.checkBody('titulo', 'Debes introducir un título').notEmpty(); //titulo requerido
  req.checkBody('texto', 'Debes introducir algo de contenido').notEmpty(); //contenido requerido

  var errors = req.validationErrors();
  if (errors) {
  res.json(errors);
  return;
} else {
*/
var token = req.headers.authorization;
var user = jwt.decode(token, secret);


db.collection('posts', function (err, postsCollection){

  var newPost = {
    title: req.body.title,
    text: req.body.text,
    user: user.username,
    date: Date.now()
  };
  postsCollection.insert(newPost, {w:1}, function(err){
    return res.send();
  });
});

});


/*Insertar USUARIO en mongo*/
app.post('/users', function(req, res, next){

  req.checkBody('password', 'Contraseña incorrecta, de 4 a 30 carácteres').len(4, 30); //contraseña valida
  req.checkBody('password', 'Debes introducir una contraseña').notEmpty(); //contraseña requerida
  req.checkBody('username', 'Debes introducir un nombre de usuario').notEmpty(); //usuario requerido

  var errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  } else {
    db.collection('users', function (err, usersCollection){


      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(req.body.password, salt, function(err, hash){

          var newUser = {
            username: req.body.username,
            password: hash
          };

          usersCollection.insert(newUser, {w:1}, function(err){
  
            return res.send();
          });
        });
      });
    });
  };
});


/*COMPROBAR INICIO DE SESIÓN*/
app.put('/users/signin', function(req, res, next){

  req.checkBody('password', 'Debes introducir una contraseña').notEmpty(); //contraseña requerida
  req.checkBody('username', 'Debes introducir un nombre de usuario').notEmpty(); //usuario requerido

  var errors = req.validationErrors();
  if (errors) {
    res.json(errors);
    return;
  } else {

    //conectamos con users en mongo
    db.collection('users', function (err, usersCollection){

      //buscamos el usuario por el nombre
      usersCollection.findOne({username: req.body.username},function(err, user){

        //comparamos password encriptada
        bcrypt.compare(req.body.password, user.password, function(err, result){

          if(result){
            //success
            // encode
            var token = jwt.encode(user, secret);
            return res.json({token: token});
          }else{
            //error
            return res.status(400).send();
          }
        });
      });
    });
  };
});


/*borrar posts en mongo*/
app.put('/posts/remove', function(req, res, next){

  var token = req.headers.authorization;
  var user = jwt.decode(token, secret);

  db.collection('posts', function (err, postsCollection){

    var postId = req.body.post._id;

    postsCollection.remove({_id: ObjectId(postId), user: user.username}, {w:1}, function(err){
      return res.send();
    });

  });
});


app.listen(3000, function(){
  console.log('example app listening on port 3000.');
});
