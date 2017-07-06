

exports.getRecentActivity =function(userId){
activityCollection=[];

	knex('followingLink')
		.where('followerId',userId)
		.then(function(followers){ 
			followers.forEach(function(follower){
				knex('blogPost')
					.join('bloggingUsers', 'blogPost.ownerId', '=', 'bloggingUsers.userId')
					.select('bloggingUsers.username','blogPost.tilte','blogPost.cra')
					.where('ownerId',follower.followingId) // all post by a follower
					.then(function(posts){
						posts.forEach

					}) // end of select post by a follower
					.catch(function(){
						console.log("Database Error");
					});

			}); // end of each follower
		})  // end of select all followers
		.catch(function(){
			console.log("Database Error");
		});  // end of catch select all followers
}