const knex =require('../knex');

exports.getRecentActivity =function(userId,callback){
activityCollection1=[];
activityCollection2=[];
activityCollection3=[];
actmsg ={
	'byUser':"",
	'action':"",
	'title':"",
	'onDate' :""
};
var flagfollower=false,flagpost=false,flagcomment=false,flaginterest=false;
	console.log('stage 1',userId);  // logical error tracking 
	knex('followingLink')
		.where('followerId',userId)
		.then(function(followers){ 
			followers.forEach(function(follower,indexfollower){
				knex('blogPost')
					.join('bloggingUsers', 'blogPost.ownerId', '=', 'bloggingUsers.userId')
					.select('bloggingUsers.name','blogPost.title','blogPost.createdAt')
					.where('ownerId',follower.followingId) // all post by a follower
					.then(function(posts){
						posts.forEach(function(post,indexpost){
							actmsg={};
							actmsg.byUser=post.name;
							actmsg.action="posted a blog :"
							actmsg.title=post.title;
							actmsg.onDate=post.createdAt;
							console.log('stage 2',actmsg);  // logical error tracking 
							activityCollection1.push(actmsg);
							if(posts.length-1==indexpost)
								callback(activityCollection1);
						}); //end of for each posts 
					}) // end of select post by a follower
					.catch(function(){
						console.log("Database Error 1");
					});  // end of catch select all posts

				knex('postComment')
					.join('blogPost', 'postComment.cmtOfId', '=', 'blogPost.postId')
					.select('postComment.cmtById','blogPost.title','postComment.createdAt')
					.where('blogPost.ownerId',userId)
					.then(function(comments){
						comments.forEach(function(comment,indexcomment){
							actmsg={};
							getName(comment.cmtById,function(name){
								actmsg.byUser=name;
								actmsg.action="commented on your blog :";
								actmsg.title=comment.title;
								actmsg.onDate=comment.createdAt;
								activityCollection2.push(actmsg);
								console.log('stage 3',actmsg);  // logical error tracking 
								if(comments.length-1==indexcomment)
									callback(activityCollection2);
							});
						}); //end of for each comments 
					})
					.catch(function(){
						console.log("Database Error 2");
					}); // end of catch select all comments

				knex('postInterest')
					.join('blogPost', 'postInterest.intOfId', '=', 'blogPost.postId')
					//.select('postInterest.intById','postInterest.interest','blogPost.title','postInterest.createdAt')
					.where('blogPost.ownerId',userId)
					.then(function(interests){
						interests.forEach(function(interest,indexinterest){
							actmsg={};
							getName(interest.intById,function(name){
								actmsg.byUser=name;
								if(interest.interest==1)
									actmsg.action="liked your blog :";
								else
									actmsg.action="disliked your blog :";
								actmsg.title=interest.title;
								actmsg.onDate=interest.createdAt;
								console.log('stage 4',actmsg);  // logical error tracking 
								activityCollection3.push(actmsg);
								if(interests.length-1==indexinterest)
									callback(activityCollection3);
							});
						}); //end of for each interests
					})
					.catch(function(){
						console.log("Database Error 3");
					}); // end of catch select all interests


			if(followers.length-1==indexfollower)
						flagfollower=true;
			console.log(flagfollower,flagpost,flagpost,flagcomment);
			if(flagfollower && flagpost && flaginterest && flagcomment){
				console.log('stage 5',activityCollection);  // logical error tracking 
				return callback(activityCollection);
			}
			}); // end of for each follower
		})  // end of select all followers
		.catch(function(){
			console.log("Database Error 4");
		});  // end of catch select all followers
}



getName = function(id,callback){
	knex('bloggingUsers')
		.select('name')
		.where('userId',id)
		.then(function(usr){
			return callback(usr[0].name);
		})
		.catch(function(){
			return callback(null);
		});
}