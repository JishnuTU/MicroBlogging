var nodemailer = require("nodemailer");
const knex =require('../knex');

var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "phalcon.blogging@gmail.com",
        pass: "phalcon123"
    }
});


exports.sendMail =function(ofPost,byUser,action){
	
	knex('blogPost')
		.join('bloggingUsers', 'blogPost.ownerId', '=', 'bloggingUsers.userId')
		.select('bloggingUsers.email','blogPost.title','blogPost.noLikes','blogPost.noDislikes')
		.where('postId',ofPost)
		.then(function(sendusr){
					console.log("From MailController.sendMail :result",sendusr);
					knex('bloggingUsers')
						.where('userId',byUser)
						.then(function(byusrname){
							
							var mailOptions={
   								to : sendusr[0].email,
   								subject : "Blog Notification",
   								text : "Your Blog ,titled : ' "+sendusr[0].title+ " ' is "+action+ " by "+ byusrname[0].name +"\n Total Number of Likes :" +sendusr[0].noLikes +"\n Total Number of DisLikes :" +sendusr[0].noDislikes
   							};
   							smtpTransport.sendMail(mailOptions, function(error, info){
							console.log("success");
							});

						})
						.catch(function(){
							console.log("From : MailController.sendMail : Database Error in bloggingUsers");
						});
		})
		.catch(function(){
			console.log("From : MailController.sendMail : Database Error in blogPost");
		});



							

}