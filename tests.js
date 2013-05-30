//should give just the newest post
api.posts(
{
  
})

//should give the post of ID 3
api.posts(
{
  initial: 3
})

api.posts(
{
  initial: 3,
  count: 1
})

//should give the post of ID 3, as well as one older post
api.posts(
{
  initial: 3,
  count: 2
})

api.posts(
{
  initial: 3
  count: 2,
  offsetDirection: "older"
})

//should give the post of ID 3, as well as one newer post
api.posts(
{
  initial: 3
  count: 2,
  offsetDirection: "newer"
})

//should give a post thats 2 older than id 5
api.posts(
{
  initial: 5,
  offset: 2
})

api.posts(
{
  initial: 5,
  offset: 2,
  offsetDirection: "older"
})

