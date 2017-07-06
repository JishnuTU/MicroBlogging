var nodemailer = require("nodemailer");
const knex =require('../knex');
var emailExistence =require("email-existence");
var bcrypt =require('bcrypt-nodejs');

var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "phalcon.blogging@gmail.com",
        pass: "phalcon123"
    }
});

exports.userRegister=function(user,callback){
	knex('bloggingUsers').where('username',user.username).then(function(row){
		if(row.length==0){
			emailValidate(user.email,user.userId,user.username,function(res){
				if(res){
					user.state=2;
					user.password=bcrypt.hashSync(user.password);
					knex('bloggingUsers').insert(user,'*')
										.then(function() {
													knex('followingLink').insert({followerId:user.userId,
														followingId:user.userId})
													.then(function(){
														return callback("Account Created Successfully");
													})
													.catch(function(){
														return callback("Account Creation failed");
													});
 		 											
 	 											})
	  									.catch(function() {
 		 									return callback("Account Creation failed");
 	 								});
				}
				else
					return callback("Account Creation failed (Email doesn't exists)");
			});
		}
		else
			return callback("Username Taken");
	})
		
}

exports.emailVerification=function(token,usrname,callback){
	knex('bloggingUsers')
			.where({userId : token,
				username:usrname,
				state:2})
			.then(function(row){
					if(row.length==0)
						callback("Invalid !!!");
					else {
						knex('bloggingUsers')
							.where({userId : token,
								state:2})
							.update({
  								state:0
  							})
  							.then(function(noOfrow){
  							callback("Account Activated !!");
  						})
					}
			})
			.catch(function(){
  				callback("Invalid !!!");
  			});


}

exports.verifyUser = function(user,callback)
{
	knex('bloggingUsers')
        .where('username',user)
        .orWhere('email',user)
        .then(function(row){
          if(row.length==1)
          {   
            callback(false,row[0].userId,row[0].password);
          }
          else
            callback(true,null,null);
        })
        .catch(function(){
            callback(true,null,null);
        });
}

function emailValidate(mail,token,username,callback){
	emailExistence.check(mail, function(error, response){
		if(response)
			{
			var mailOptions={
   							to : mail,
   							subject : "Account Verification",
   							text : "click here :"+"http://localhost:3000/verify/"+token+"/"+username
							}
			smtpTransport.sendMail(mailOptions, function(error, info){
					console.log("success");
					callback(true);
			});
			}
		else	{
			console.log("failed");
			callback(false);		
		}
	});
}