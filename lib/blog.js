
/*!
 * Stylus
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

/*
var Renderer = require('./renderer')
  , Parser = require('./parser')
  , nodes = require('./nodes')
  , utils = require('./utils');
  */

/**
 * Export render as the module.
 */

//exports = module.exports = render;

/**
 * Library version.
 */

//module.exports.version = '0.0.1';


/**
 * Expose nodes.
 */

//exports.nodes = nodes;

/**
 * Config requires host, username, and db name
 *   optional: password, port, socket
 */
module.exports.api = function(config) {
 
  console.log("blog initialization!");
  return new Blog(config); };

function Blog(config) {
  var mysql      = require('mysql');
  console.log("about to start connection: " + config);
  this.connection = mysql.createConnection(config);
  this.connection.connect();
  this._defaultPageLimit = 2;
}


/**
 * config.count  : number of posts desired, default 1
 * config.offset : number of posts away from current, default 0
 * config.direction : direction of offset "older", "newer", or "exact", default exact
 * config.initial : initial ID of post, default to newest post
 *
 */

function verifyPostsConfig(config) {
  //if (config.count <= 0) return 'You cannot query for less than 1 post'
  //if (config.offset < 0) return 'You cannot have negative offset.  Use other direction'

  if (config.offset > 0) {
    if (config.direction != 'older' ||
        config.direction != 'newer' ||
        config.direction != 'exact')
      return 'if offset is defined, direction must be "older", "newer", or "exact"';
  }
  
  if (config.count > 1 && config.direction == "exact") {
    return 'You cannot ask for exact post and ask for more than one post';
  }

  return;
}

Blog.prototype.posts = function(config, callback) {
  console.log("about to start posts: " +  JSON.stringify(config));
  config = config ? config : {}
  config.count = config.count || 1;
  config.offset = config.offset || 0;
  
  //Default direction:  if expecting only one post, assume exact, otherwise get older posts
  config.direction = config.direction || ((config.count > 1 || config.offset > 0) ? 'older' : 'exact');

  console.log (config.direction);
  err = verifyPostsConfig(config)
  if(err) {
    callback(err, null);
  }


  var whereQuery = '';
  var offsetQuery = '';
  var limitQuery = '';
  var orderQuery = '';

  //If we specified a starting point, start there
  if (config.initial) {
    var condition = '';
    if (config.direction == 'newer') {
      condition = '>=';
    } else if (config.direction == 'older') {
      condition = '<=';
    } else if (config.direction == 'exact') {
      condition = '=';
    }

    whereQuery=  'WHERE id ' + condition + ' '  + this.connection.escape(config.initial);

  }

  //If we specified an offset
  if (config.offset) {
    offsetQuery = 'OFFSET ' + this.connection.escape(config.offset);
  }

  //If we set a limit, we have to order then query
  if (config.count > 1) {
    limitQuery = 'LIMIT ' + this.connection.escape(config.count);

    if (config.direction == 'newer') {
      orderQuery = 'ORDER BY id ASC';
    } else if (config.direction == 'older') {
      orderQuery = 'ORDER BY id DESC';
    }
  }

  var query = 'SELECT * from blog_posts_test ' + whereQuery + ' ' + orderQuery + ' ' + limitQuery  + ' ' + offsetQuery;
  console.log(query);

  //Get the blog posts
  this.connection.query(query, function(err, rows, fields) {

    //If we didn't find enough posts, no need for a next
    if(rows.length < config.count) { 
      callback (err, {"posts" : rows});
    }
    else {
      callback (err, {"posts" : rows});
    }
  });
};
