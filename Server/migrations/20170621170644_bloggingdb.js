
exports.up = function(knex, Promise) {
return Promise.all([

        knex.schema.createTable('bloggingUsers', function(table) {
            table.uuid('userId').primary();
            table.string('email').unique();
            table.string('username').unique();
            table.string('password');
            table.string('name');
            table.integer('state');
           	table.dateTime('createdAt').defaultTo(knex.fn.now());
           	table.dateTime('activityAt');
        }),

        knex.schema.createTable('blogPost',function(table){
        	table.uuid('postId').primary();
        	table.uuid('ownerId')
        		.references('userId')
        		.inTable('bloggingUsers');
        	table.string('title');
        	table.string('body');
        	table.integer('noLikes');
        	table.integer('noDislikes');
        	table.dateTime('createdAt').defaultTo(knex.fn.now());
        }),

        knex.schema.createTable('postComment',function(table){
        	table.uuid('cmtOfId')
        		.references('postId')
        		.inTable('blogPost');
        	table.uuid('cmtById')
        		.references('userId')
        		.inTable('bloggingUsers');
        	table.string('comment');
        	table.dateTime('createdAt').defaultTo(knex.fn.now());
        }),

        knex.schema.createTable('postInterest',function(table){
        	table.uuid('intOfId')
        		.references('postId')
        		.inTable('blogPost');
        	table.uuid('intById')
        		.references('userId')
        		.inTable('bloggingUsers');
        	table.integer('interest');
        	table.dateTime('updatedAt').defaultTo(knex.fn.now());
        }),

        knex.schema.createTable('followingLink',function(table){
        	table.uuid('followerId')
        		.references('userId')
        		.inTable('bloggingUsers');
        	table.uuid('followingId')
        		.references('userId')
        		.inTable('bloggingUsers');
        	table.dateTime('createdAt').defaultTo(knex.fn.now());
        }),

        knex.schema.createTable('reportedIssue',function(table){
        	table.uuid('byUserId')
        		.references('userId')
        		.inTable('bloggingUsers');
        	table.uuid('ofPostId')
        		.references('postId')
        		.inTable('blogPost');
        	table.string('reason');
        	table.dateTime('reportedAt').defaultTo(knex.fn.now());
        })



  ])
};



exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('postComment'),
        knex.schema.dropTable('postInterest'),
        knex.schema.dropTable('followingLink'),
        knex.schema.dropTable('reportedIssue'),
        knex.schema.dropTable('blogPost'),
        knex.schema.dropTable('bloggingUsers'),
    ])
};
