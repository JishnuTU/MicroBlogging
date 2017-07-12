const knex =require('../knex');

postgatheringBefore =function(user,onBeforeTime,callback){ // function to get all old post for the authenicated user
	var allposts =[];
	knex('followingLink')
		.where('followerId',user)
		.then(function(followinguser){  // all followers of user
			followinguser.forEach(function(fuser,indexf){

				knex('blogPost')
					.join('bloggingUsers', 'blogPost.ownerId', '=', 'bloggingUsers.userId')
					.select('blogPost.postId', 'blogPost.ownerId', 'bloggingUsers.name','bloggingUsers.username', 'blogPost.title','blogPost.body','blogPost.noLikes','blogPost.noDislikes','blogPost.createdAt','blogPost.slno')
					.whereNot('blogPost.slno', onBeforeTime)
					.andWhere('ownerId',fuser.followingId)
					.andWhere('blogPost.slno', '>',onBeforeTime)
					.orderBy('blogPost.slno', 'asc')
					.then(function(posts){
							//console.log('checking the posts',posts.slno);
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
		if(allPost.length==0)
			callback(false,{});
		//console.log("from loadController.postpackingBefore :post",allPost);
		allPost.sort(function(a, b){return a.slno-b.slno})
		.slice(0, 5) // limiting the entry only to 5
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
					.select('blogPost.postId', 'blogPost.ownerId', 'bloggingUsers.name','bloggingUsers.username', 'blogPost.title','blogPost.body','blogPost.noLikes','blogPost.noDislikes','blogPost.createdAt','blogPost.slno')
					.where('ownerId',fuser.followingId)
					.andWhere('blogPost.slno', '<',onAfterTime)
					.orderBy('blogPost.slno', 'desc')
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
		if(allPost.length==0)
			callback(false,{});
		allPost.sort(function(a, b){return b.slno-a.slno; })
		.slice(0, 1) // limiting the entry only to 5
		.forEach(function(post){
			knex('postComment')
				.join('bloggingUsers', 'postComment.cmtById', '=', 'bloggingUsers.userId')
				.select('bloggingUsers.username', 'postComment.comment','postComment.createdAt')
				.where('postComment.cmtOfId',post.postId)
				.orderBy('postComment.createdAt', 'desc')
				.limit(1)
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
							//console.log('checking the old posts',post.slno);
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



postgatheringWeb =function(user,callback){ // function to get all required post for the authenicated user
	var allposts =[];
	knex('followingLink')
		.where('followerId',user)
		.then(function(followinguser){  // all followers of user
			followinguser.forEach(function(fuser,indexf){

				knex('blogPost')
					.join('bloggingUsers', 'blogPost.ownerId', '=', 'bloggingUsers.userId')
					.select('blogPost.postId', 'blogPost.ownerId', 'bloggingUsers.name','bloggingUsers.username', 'blogPost.title','blogPost.body','blogPost.noLikes','blogPost.noDislikes','blogPost.createdAt','blogPost.slno')
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


exports.postpackingWeb =function(user,callback){ // function to append all details to the post gathered
	finalPosts=[];
	var index=0;
	postgatheringWeb(user,function(error,allPost){
		//console.log('in okay stage',allPost);
		if(error)
			return callback(true,null);
		if(allPost.length==0)
			callback(false,{})
	allPost
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
							//console.log('checking the posts',post.slno);
							callback(false,post);

							/*if(finalPosts.length==allPost.length)
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