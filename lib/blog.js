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
 
  this.pool  = mysql.createPool({
      connectionLimit : 10,
      host    : config.host,
      user    : config.user,
      database: config.database,
      password: config.password });
  this.tableName = config.table;
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

  if(config.include == true && config.direction == "exact") {
    return 'saying direction "exact" and include true is redundant';
  }

  if (config.count > 1 && config.direction == "exact") {
    return 'You cannot ask for exact post and ask for more than one post';
  }

  if (config.direction !== "older" && config.direction !== "newer" && config.direction !== "exact" && config.direction !== null && config.direction !== "") {
    return 'invalid direction, either "older", "newer", "exact", or null'
  }
  return;
}
Blog.prototype.allTitles = function(callback) {
  console.log("about to get all titles");

    var query = 'SELECT id, title, created_at FROM ' + this.tableName + ' ORDER BY ID DESC';
    console.log(query);

    //Get the blog posts
    this.pool.query(query, function(err, rows, fields) {
      callback(err, rows);
    });
}

Blog.prototype.posts = function(config, callback) {
  console.log("about to start posts: " +  JSON.stringify(config));

  //Set default values
  config = config ? config : {};
  config.count = config.count || 1;
  config.offset = config.offset || 0;

  //Default direction:  if expecting only one post, assume exact, otherwise get older posts
  config.direction = config.direction || ((config.count > 1 || config.offset > 0) ? 'older' : 'exact');

  err = verifyPostsConfig(config)
  if(err) {
    callback(err, null);
  } else {

    var whereQuery = '';
    var offsetQuery = '';
    var limitQuery = '';
    var orderQuery = '';

    //If we specified a starting point, start there.  Choose direction of search based on provided direction
    if (config.initial) {
      var condition = '';
      if (config.direction == 'newer') {
        condition = '>';
        if(config.include) {
          condition += '=';
        }
      } else if (config.direction == 'older') {
        condition = '<';
        if(config.include) {
          condition += '=';
        }
      } else if (config.direction == 'exact') {
        condition = '=';
      }

      whereQuery=  'WHERE id ' + condition + ' '  + this.pool.escape(config.initial);

    }

    //We have to make sure we start our selection closest to our intial post ID
    if (config.direction == 'newer') {
      orderQuery = 'ORDER BY id ASC';
    } else if (config.direction == 'older') {
      orderQuery = 'ORDER BY id DESC';
    }

    //If we set a limit (or want to offset), we have to use a LIMIT
    limitQuery = 'LIMIT ' + this.pool.escape(config.count);

    //If we specified an offset
    if (config.offset > 0) {
      offsetQuery = 'OFFSET ' + this.pool.escape(config.offset);
    }


    var query = 'SELECT * from ' + this.tableName + ' ' + whereQuery + ' ' + orderQuery + ' ' + limitQuery  + ' ' + offsetQuery;
    console.log(query);

    //Get the blog posts
    this.pool.query(query, function(err, rows, fields) {
      callback(err, rows);
    });
  }
};

Blog.prototype.getBounds = function(callback) {
  var query = 'SELECT MIN(id) as min, MAX(id) as max FROM ' + this.tableName;
  console.log(query);

  //Get the blog posts
  this.pool.query(query, function(err, rows, fields) {
    callback(err, rows[0]);
  });
}

//Add a new blog post
Blog.prototype.add = function(title, body, callback) {

  var query = 'insert into ' + this.tableName + ' (title, body) values(?, ?)';
  console.log(query + ". title: " + title + ". body: " + body);

  this.pool.query(query, [title, body], function(err, rows, fields) {
    callback(err, rows);
  });
};

//Update the desired blog post
Blog.prototype.edit = function(id, title, body, callback) {

  var query = 'update ' + this.tableName +' set title=?, body=? where id=?';
  console.log(query + ". title: " + this.pool.escape(title) + ". body: " + this.pool.escape(body) + this.pool.escape(id));

  this.pool.query(query, [title, body, id], function(err, rows, fields) {
    callback(err, rows);
  });
};
