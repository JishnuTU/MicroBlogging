var express = require('express');
var router = express.Router();
var userController = require('../controller/userController');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var bcrypt =require('bcrypt-nodejs');
const knex =require('../knex');
var Verify    = require('./verify');
var bodyParser = require('body-parser');
router.use(bodyParser.json());
        
passport.use(new LocalStrategy(
  function(username, password, done) {
        knex('bloggingUsers')
        .where('username',username)
        .orWhere('email',username)
        .then(function(user){
          if(user.length==1) //user exists
          {
            if(user[0].state==2)
            {
              return done(null, false, { message: 'User is not Activated' });//user is not activated
            }
            else if(user[0].state==3)
            {
              return done(null, false, { message: 'User is blocked' });//user blocked
            }
            else //proceed to check password
            {
                bcrypt.compare(password,user[0].password, function(err, res) {
                      if(res)
                      {
                        knex('bloggingUsers').where('userId',user[0].userId).update('state', 1)
                        .then(function(){
                              return done(null, user[0],{ message: 'User authencated' });//password is correct procced
                          })
                        .catch(function(){
                            return done(null, false, { message: 'Server Error.' });//password is Incorrect
                        });
                        
                      }
                      else
                      {
                        return done(null, false, { message: 'Incorrect password.' });//password is Incorrect
                      }

                    });
            }
          }
          else
          {
            return done(null, false, { message: "User Doesn't exists."}); //user doesnot exists
          }
        })
      .catch(function(){
        return done(err);//database error
      });
  }
));



passport.serializeUser(function(user, done) {
  done(null, user.userId);
});

passport.deserializeUser(function(id, done) {
        knex('bloggingUsers')
        .where('userId',id)
        .then(function(user) {
    done(null, user[0]);
  });
});



router.post('/login', function(req, res, next) {
   passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }

    if (!user) {return res.json({success: false ,message:info.message}); }

        req.logIn(user, function(err) {
      if (err) { return next(err); }
      var token = Verify.getToken(user);
      res.status(200).json({
        status: 'Login successful',
        userId : user.userId,
        success: true,
        token: token,
      });

    });
  })(req, res, next);

});

router.post('/logout', function(req, res) {
  console.log(req.body.userId);
    knex('bloggingUsers').where('userId',req.body.userId).update({'state': 0,'activityAt':knex.fn.now()})
    .then(function(){
          req.logout();
          res.status(200).json({
          status: true
        });
    })
    .catch(function(){
          res.status(500).json({
          status: false
        });
    });

});

router.post('/register', function(req, res, next) {
  console.log(req.body);
  userController.userRegister(req.body,function(result){
  	console.log(result);
  	res.json({message:result});
  });
});




router.get('/verify/:token/:username',function(req,res,next){
	console.log(req.params.token);
	userController.emailVerification(req.params.token,req.params.username,function(msg){
		res.render('index',{message: msg});
	});
});


module.exports = router;
