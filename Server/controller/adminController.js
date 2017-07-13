const knex =require('../knex');


exports.gatherReports = function(callback){
	console.log("stage 1");
	knex.select().table('reportedIssue')
		.then(function(Rissue){
			reportedallpost=[];
			reportedUsers=[];
			Rissue.forEach(function(row,index){				
				getUsername(row.byUserId,function(nm){
					knex('blogPost')
						.join('bloggingUsers', 'blogPost.ownerId', '=', 'bloggingUsers.userId')
						//.select('bloggingUsers.username', 'blogPost.title','blogPost.body')
						.where('blogPost.postId',row.ofPostId)
						.then(function(post){
							reportedpost={};
							reportedUser={};
							reportedpost.byUser =nm;
							reportedUser.username=post[0].username;
							reportedpost.reason=row.reason;
							reportedpost.onDate=row.reportedAt;
							reportedpost.postId=row.ofPostId;
							reportedpost.userstate=post[0].state;
							reportedUser.state=post[0].state;
							reportedpost.ofUser=post[0].username;
							reportedpost.title=post[0].title;
							reportedpost.body=post[0].body;
							//console.log("issue in here :",reportedUser);
							reportedallpost.push(reportedpost);
							reportedUsers.push(reportedUser);
							//console.log("issue in here :",reportedUsers,reportedallpost);
							if(Rissue.length==reportedallpost.length){
								knex('bloggingUsers')
									.select('username','state')
									.where('state',3)
									.then(function(rows){
										console.log("From AdminController.gatherReports : blocked user");
										reportedUsers=reportedUsers.concat(rows);
										//console.log("From AdminController.gatherRepots :",reportedUsers,reportedallpost);
										return callback(false,reportedallpost,reportedUsers);	
									})
									.catch(function(){
										console.log("From AdminController.gatherReports : Database error in bloggingUsers");
									});

								
							}
						})
						.catch(function(){
							return callback(true,null);
						});
				});
			})
		})
		.catch(function(){
			return callback(true,null);
		});
}



getUsername = function(id,callback){
	knex('bloggingUsers')
		.select('username')
		.where('userId',id)
		.then(function(usr){
			return callback(usr[0].username);
		})
		.catch(function(){
			return callback(null);
		});
}


exports.blockUser =function(uID,callback){
	console.log("From AdminController.blockUser");
	knex('bloggingUsers')
		.where('username',uID)
		.update({state: 3})
		.then(function(){
			console.log("From AdminController.blockUser : A user blocked");
			callback();
		})
		.catch(function(){
			console.log("From AdminController.blockUser : Database error");
		});
}

exports.unblockUser =function(uID,callback){
	console.log("From AdminController.unblockUser");
	knex('bloggingUsers')
		.where('username',uID)
		.update({state: 0})
		.then(function(){
			console.log("From AdminController.unblockUser : A user unblocked");
			callback();
		})
		.catch(function(){
			console.log("From AdminController.unblockUser : Database error");
		});

}

exports.removeBlog = function(pID,callback){

	knex('reportedIssue')
	.where('ofPostId', pID)
	.del()
	.then(function(){
		knex('postInterest')
		.where('intOfId', pID)
		.del()
		.then(function(){
			knex('postComment')
			.where('cmtOfId', pID)
			.del()
			.then(function(){
				knex('blogPost')
				.where('postId', pID)
				.del()
				.then(function(){
					console.log("From AdminController.removeBlog : blog removed");
					return callback();
				})
				.catch(function(){
					console.log("From AdminController.removeBlog : Database error in blogPost");
				});

			})
			.catch(function(){
				console.log("From AdminController.removeBlog : Database error in postComment");
			});
		})
		.catch(function(){
			console.log("From AdminController.removeBlog : Database error in postInterest");
		});
	})
	.catch(function(){
		console.log("From AdminController.removeBlog : Database error in reportedIssue");
	});

}