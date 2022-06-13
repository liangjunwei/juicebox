const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next) => {
    console.log("A request is being made to /tags");

    next();
});

tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();
    
    res.send({
        tags
    });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    // read the tagname from the params
    const { tagName } = req.params;
    try {
        // use our method to get posts by tag name from the db
        const allPosts = await getPostsByTagName(tagName);
        // send out an object to the client { posts: // the posts }
        if(allPosts.length !== 0) {
            // filter posts with active === true
            const posts = allPosts.filter(post => {
                // the post is active, doesn't matter who it belongs to
                if(post.active) {
                    return true;
                }
                // the post is not active, but it belogs to the current user
                if(req.user && post.author.id === req.user.id) {
                    return true;
                }
                // none of the above are true
                return false;
            });
        
            // if all posts contain the tag name were deleted, nothing to show
            if(posts.length === 0) {
                next({
                    name: 'Posts not found',
                    message: 'No post has this tag name'
                })
            }
            else {
                res.send({ posts: posts });
            }
        }
        else {
            next({
                name: 'Posts not found',
                message: 'No post has this tag name'
            })
        }
    } 
    catch({ name, message }) {
        // forward the name and message to the error handler
        next({ name, message });
    }
  });

module.exports = tagsRouter;