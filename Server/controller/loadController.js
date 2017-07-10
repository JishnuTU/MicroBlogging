const knex =require('../knex');

postgatheringBefore =function(user,onBeforeTime,callback){ // function to get all old post for the authenicated user
	var allposts =[];
	knex('followingLink')
		.where('followerId',user)
		.then(function(followinguser){  // all followers of user
			followinguser.forEach(function(fuser,indexf){

				knex('blogPost')
					.join('bloggingUsers', 'blogPost.ownerId', '=', 'bloggingUsers.userId')
					.select('blogPost.postId', 'blogPost.ownerId', 'bloggingUsers.name','bloggingUsers.username', 'blogPost.title','blogPost.body','blogPost.noLikes','blogPost.noDislikes','blogPost.createdAt')
					.whereNot('blogPost.createdAt', onBeforeTime)
					.andWhere('ownerId',fuser.followingId)
					.andWhere('blogPost.createdAt', '>',onBeforeTime)
					.orderBy('blogPost.createdAt', 'desc')
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


exports.postpackingBefore =function(user,timeBack,callback){ // function to append all details to the post gathered
	finalPosts=[];
	var index=0;
	console.log("from loadController.postpackingBefore :date",timeBack);
	postgatheringBefore(user,timeBack,function(error,allPost){
		//console.log('in okay stage',allPost);
		if(error)
			return callback(true,null);
		console.log("from loadController.postpackingBefore :post",allPost);
		allPost.sort (function (a, b){  // sorting the array by field dateTime
       				return new Date(b.createdAt) - new Date(a.createdAt);
					})
		.slice(0, 2) // limiting the entry only to 5
		.forEach(function(post){
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

							callback(false,post);
/*
							if(finalPosts.length==allPost.length)
								return callback(false,finalPosts); */
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



postgatheringAfter =function(user,onAfterTime,callback){ // function to get all new post for the authenicated user
	var allposts =[];
	knex('followingLink')
		.where('followerId',user)
		.then(function(followinguser){  // all followers of user
			followinguser.forEach(function(fuser,indexf){

				knex('blogPost')
					.join('bloggingUsers', 'blogPost.ownerId', '=', 'bloggingUsers.userId')
					.select('blogPost.postId', 'blogPost.ownerId', 'bloggingUsers.name','bloggingUsers.username', 'blogPost.title','blogPost.body','blogPost.noLikes','blogPost.noDislikes','blogPost.createdAt')
					.where('ownerId',fuser.followingId)
					.andWhere('blogPost.createdAt', '>',onAfterTime)
					.orderBy('blogPost.createdAt', 'desc')
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


exports.postpackingAfter =function(user,timefront,callback){ // function to append all details to the post gathered
	finalPosts=[];
	var index=0;
	postgatheringAfter(user,timefront,function(error,allPost){
		//console.log('in okay stage',allPost);
		if(error)
			return callback(true,null);

		allPost.sort (function (a, b){  // sorting the array by field dateTime
       				return new Date(a.createdAt) - new Date(b.createdAt);
					});
		allPost.slice(0, 5); // limiting the entry only to 5
		
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

							callback(false,post);
/*
							if(finalPosts.length==allPost.length)
								return callback(false,finalPosts); */
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
