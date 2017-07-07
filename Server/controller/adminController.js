const knex =require('../knex');


exports.gatherReports = function(callback){
	console.log("stage 1");
	knex.select().table('reportedIssue')
		.then(function(Rissue){
			reportedallpost=[];
			console.log("stage 2",Rissue);
			Rissue.forEach(function(row){				
				getUsername(row.byUserId,function(nm){
					knex('blogPost')
						.join('bloggingUsers', 'blogPost.ownerId', '=', 'bloggingUsers.userId')
						//.select('bloggingUsers.username', 'blogPost.title','blogPost.body')
						.where('blogPost.postId',row.ofPostId)
						.then(function(post){
							reportedpost={};
							reportedpost.byUser =nm;
							reportedpost.reason=row.reason;
							reportedpost.onDate=row.reportedAt;
							reportedpost.postId=row.ofPostId;
							reportedpost.userstate=post[0].state;
							reportedpost.ofUser=post[0].username;
							reportedpost.title=post[0].title;
							reportedpost.body=post[0].body;
							console.log("issue in here :",reportedpost);
							reportedallpost.push(reportedpost);
							if(Rissue.length==reportedallpost.length)
								return callback(false,reportedallpost);
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