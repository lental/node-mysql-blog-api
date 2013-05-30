
var blog = require('./lib/blog');
console.log (blog.api);
var api = blog.api({
        host     : 'localhost',
        user     : 'root',
        database : 'lensite' });

var callback = function(err, posts) { console.log ("in callback! err: " + err + "posts: " + JSON.stringify(posts)); };

api.posts(
{
  initial: 1,
  count: 2,
  direction: "newer"
}, callback);

