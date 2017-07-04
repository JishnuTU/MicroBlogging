const env = process.env.NODE_ENV || 'development';
const config =require('./knexfile');
const environmentconfig =config[env];
const knex=require('knex');
const connection =knex(environmentconfig);

module.exports =connection;