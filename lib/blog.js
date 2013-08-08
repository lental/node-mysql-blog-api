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
  this._defaultPageLimit = 1;
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
    if (config.direction == "exact") {
      return 'You cannot ask for exact post and have an offset';
    }

    if (config.direction != 'older' && config.direction != 'newer') {
      return 'if offset is defined, direction must be "older" or "newer"';
    }
  }

  if (config.count > 1 && config.direction == "exact") {
    return 'You cannot ask for exact post and ask for more than one post';
  }

  return;
}

Blog.prototype.posts = function(config, callback) {
  console.log("about to start posts: " +  JSON.stringify(config));

  //Set default values
  config = config ? config : {};
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

  //If we specified a starting point, start there.  Choose direction of search based on provided direction
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

  //We have to make sure we start our selection closest to our intial post ID
  if (config.direction == 'newer') {
    orderQuery = 'ORDER BY id ASC';
  } else if (config.direction == 'older') {
    orderQuery = 'ORDER BY id DESC';
  }

  //If we set a limit (or want to offset), we have to use a LIMIT
  limitQuery = 'LIMIT ' + this.connection.escape(config.count);

  //If we specified an offset
  if (config.offset > 0) {
    offsetQuery = 'OFFSET ' + this.connection.escape(config.offset);
  }


  var query = 'SELECT * from blog_posts_test ' + whereQuery + ' ' + orderQuery + ' ' + limitQuery  + ' ' + offsetQuery;
  console.log(query);

  //Get the blog posts
  this.connection.query(query, function(err, rows, fields) {

    callback (err, rows);
  });
};

Blog.prototype.add = function(title, body, callback) {

  var query = 'insert into blog_posts_test (title, body) values(?, ?)';
  console.log(query + ". title: " + title + ". body: " + body);

  //Get the blog posts
  this.connection.query(query, [title, body], function(err, rows, fields) {
    callback(err, rows);
  });
};
