var express = require("express");
var router = express.Router();
var posts = require("../models/posts");
// NEW POST ROUTE
/*because these routes all started with /posts, we can delete posts here and 
app.use("/posts",postsRoutes)在app.js文件中；*/

router.get("/", function(req, res) {
    //router.get("/posts", function(req, res) {
    //Get all posts from DB
    posts.find({}, function(err, allposts) {
        if (err) {
            console.log(err);
        } else {
            //inside the template we'll call it posts,//console.log(req.user);pass the user to header.ejs
            res.render("posting/posts", { posts: allposts });
        }
    });
});
//GET NEW POST FORM
router.get("/new", isLoggedIn, function(req, res) {
    res.render("posting/new");
});
//POST A NEW POST ROUTE
router.post("/", isLoggedIn, function(req, res) {
    //get data from form and add it to posts collection
    //req.body.post.description=req.sanitizer(req.body.post.description);
    var author = {
            id: req.user._id,
            username: req.user.username
        }
        //把author加上
    req.body.post.author = author;
    posts.create(req.body.post, function(err, newPost) {
        if (err) {
            res.render('posting/new');
        } else {
            //redirect back to main page
            console.log(newPost);
            res.redirect('/posts');
        }
    });
});
//SHOW (show a particular id post) ROUTE
router.get("/:id", function(req, res) {
    //find the post with provided ID
    //populate the Comment for this specific post
    posts.findById(req.params.id).populate("Comment").exec(function(err, foundpost) {
        if (err) {
            console.log(err);
        } else {
            //inside the ejs template we'll call it post
            res.render("posting/show", { post: foundpost });
        }
    });
    //render show template with that campground
});
//EDIT ROUTE
router.get("/:id/edit", checkPostOwnership, function(req, res) {
    //is user logged in?
    //does the user own the post?
    posts.findById(req.params.id, function(err, foundPost) {
        if (err) {
            res.redirect("/posts");
        } else {
            res.render("posting/edit", { post: foundPost });
        }
    });
});
//UPDATE ROUTE: only edit not enough, after edit update the posts
/*HTML only support get/post request, don't support put request,when you 
submmit a put request, html actually treat it as get request;but
there is a WorkAround: ADD "METHOD-OVERRIDE" by :npm install method-override --save
we'll use POST ejs,but use?_method=PUT means when request is PUT treat it as put
*/
router.put("/:id", checkPostOwnership, function(req, res) {
    posts.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatePost) {
        if (err) {
            res.redirect("/posts");
        } else {
            res.redirect("/posts/" + req.params.id);
        }
    });
});
//DESTORY(delete) ROUTE
router.delete("/:id", checkPostOwnership, function(req, res) {
    posts.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/posts");
        } else {
            res.redirect("/posts");
        }
    })
});
//Middleware
function checkPostOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        posts.findById(req.params.id, function(err, foundpost) {
            if (err) {
                res.redirect("/posts");
            } else {
                //mongoose里面的方法equals;因为req.user._id是String但foundpost.author.id是object
                if (foundpost.author.id.equals(req.user._id)) {
                    // res.render("posts/edit", { post: foundpost });
                    next();
                } else {
                    //res.send("Please login first.");
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

module.exports = router;