const knex =require('../knex');
const uuidv4 = require('uuid/v4');
var mailController =require('./mailController');

exports.searchFor=function(followerId,name,callback){
	var searchResult ={};
	var user ={};
	var index =0;
	if(name=='')
		return callback(searchResult);
	
	knex.column('userId', 'email', 'name').select().from('bloggingUsers')
		.where('name', 'like', '%'+name+'%')
		.andWhereNot('userId',followerId)
		.orWhere('email','like','%'+name+'%')
		.andWhereNot('userId',followerId)
		.then(function(row){
			if(row.length==0)
				return callback(searchResult);
			row.forEach(function(record){
				
				knex('followingLink')
					.count('followingId')
					.where({'followerId':followerId,'followingId':record.userId})
					.then(function(follow){
						user.userId =record.userId;
						user.email =record.email;
						user.name =record.name;
						user.follow =parseInt(follow[0].count);
						searchResult[index++]=user;
						user={};
						if(Object.keys(searchResult).length==row.length)
						{
							return callback(searchResult);
						}
				})
				.catch(function(){
					console.log("From : activityController.searchFor : Database Error in FollowingLink");
				});
		});

	})
	.catch(function(){
		console.log("From : activityController.searchFor : Database Error in bloggingUsers");
	}); 
		//end of select
}

exports.followHim =function(fId,fgId){

	knex('followingLink').insert({followerId: fId,
									followingId:fgId})
		.then(function(){
			console.log("From : activityController.followHim :New link inserted");
		});

}

exports.unfollowHim =function(fId,fgId){
	knex('followingLink')
		.where({'followerId': fId,
				'followingId':fgId	})
		.del()
		.then(function(check){
			console.log("From : activityController.unfollowHim :link removed");
		});
}

exports.postblogs =function(oId,tle,bdy,callback){
	knex('blogPost').insert({'postId': uuidv4(),
							'ownerId':oId,
							'title':tle,
							'body':bdy,
							'noLikes':0,
							'noDislikes':0})
		.then(function(){
			console.log("From : activityController.postblogs :New post inserted");
			return callback("Posted Successfully");
		})
		.catch(function(){
			console.log("inserted"+tle);
			return callback("Posted unSuccessfully");
		});		

}





postgathering =function(user,callback){ // function to get all required post for the authenicated user
	var allposts =[];
	knex('followingLink')
		.where('followerId',user)
		.then(function(followinguser){  // all followers of user
			followinguser.forEach(function(fuser,indexf){

				knex('blogPost')
					.join('bloggingUsers', 'blogPost.ownerId', '=', 'bloggingUsers.userId')
					.select('blogPost.postId', 'blogPost.ownerId', 'bloggingUsers.name', 'blogPost.title','blogPost.body','blogPost.noLikes','blogPost.noDislikes','blogPost.createdAt')
					.where('ownerId',fuser.followingId)
					.then(function(posts){
							//console.log('checking the posts',posts);
							allposts=allposts.concat(posts);	 // posts are joined for the user to display
							//console.log('in stage',allposts);
						if(followinguser.length-1==indexf) // return when all post are gathered
							{ return callback(false,allposts); }
					})
					.catch(function(){
						return callback(true,null);
					});
			});
		})
		.catch(function(){
			return callback(true,null); // callback(error,allposts)
		});
}


exports.postpacking =function(user,callback){ // function to append all details to the post gathered
	finalPosts=[];
	var index=0;
	postgathering(user,function(error,allPost){
		//console.log('in okay stage',allPost);
		if(error)
			return callback(true,null);
		allPost.forEach(function(post){
			knex('postComment')
				.join('bloggingUsers', 'postComment.cmtById', '=', 'bloggingUsers.userId')
				.select('bloggingUsers.username', 'postComment.comment','postComment.createdAt')
				.where('postComment.cmtOfId',post.postId)
				.orderBy('postComment.createdAt', 'desc')
				.then(function(comments){
					post.comments =comments;

					knex('postInterest')
						.select('interest')
						.where({'intOfId':post.postId,'intById':user})
						.then(function(record){
							if(record.length==1)
							{
								post.interest=record[0].interest;
							}
							else
								post.interest=2;

							finalPosts.push(post);

							if(finalPosts.length==allPost.length)
								return callback(false,finalPosts);
						})
						.catch(function(){
							return callback(true,null);
						}); // end of select interests

				})
				.catch(function(){
					return callback(true,null);
				}); // end of select comments

		}); // end of allPost.forEach
	});
}


exports.deleteInterest=function(uId,pId,interest){
	knex('postInterest')
		.where({'intOfId':pId,'intById':uId})
		.del()
		.then(function(){
			if(interest==1){
			knex('blogPost')
				.where('postId',pId)
				.decrement('noLikes', 1)
				.then(function(){

				});
			}
			else{
			knex('blogPost')
				.where('postId',pId)
				.decrement('noDislikes', 1)
				.then(function(){

				});
			}
		});

}

exports.insertInterest =function(uId,pId,interest){
	
	knex('postInterest')
			.insert({intOfId:pId,
					intById:uId,
					interest:interest})
			.then(function(){
		if(interest==1){
			knex('blogPost')
				.where('postId',pId)
				.increment('noLikes', 1)
				.then(function(){
					mailController.sendMail(pId,uId,"Liked");
				});
			}
			else{
			knex('blogPost')
				.where('postId',pId)
				.increment('noDislikes', 1)
				.then(function(){
					mailController.sendMail(pId,uId,"Disiked");
				});
			}
				});

}

exports.updateInterest=function(uId,pId,interest){

	knex('postInterest')
		.where({'intOfId':pId,'intById':uId})
		.update({
  				interest:interest
  				})
		.then(function(){
		if(interest==1){
			knex('blogPost')
				.where('postId',pId)
				.increment('noLikes', 1)
				.then(function(){
						knex('blogPost')
							.where('postId',pId)
							.decrement('noDislikes', 1)
							.then(function(){
								mailController.sendMail(pId,uId,"Liked");
							});

				});

			}
			else{
			knex('blogPost')
				.where('postId',pId)
				.decrement('noLikes', 1)
				.then(function(){
					knex('blogPost')
						.where('postId',pId)
						.increment('noDislikes', 1)
						.then(function(){
							mailController.sendMail(pId,uId,"DisLiked");
						});
				});
			}
		});

}


exports.insertComment=function(uId,pId,cmt,callback){
		knex('postComment')
			.insert({cmtOfId:pId,
					cmtById:uId,
					comment:cmt})
			.then(function(){
					console.log("user commented");
					return callback("Comment submitted")
				})
			.catch(function(){
				return callback("Comment Not submitted")
			});
}


exports.reportPost=function(uId,pId,rson,callback){
	console.log(uId+pId+rson);
		knex('reportedIssue')
			.insert({byUserId:uId,
					ofPostId:pId,
					reason:rson})
			.then(function(){
					console.log("From : activityController.reportPost :New report issued");
					return callback("Report Submitted")
				})
			.catch(function(){
				return callback("Report Not submitted")
			});
}