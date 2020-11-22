var express = require("express");
//merge the params with app.js里的params 比方说id; 否则这里会找不到id
var router = express.Router({ mergeParams: true });
var posts = require("../models/posts");
var comments = require("../models/comments");
const { route } = require("./posts");
/*************
COMMENT ROUTE
*************/
//Get New Comment Form
router.get("/new", isLoggedIn, function(req, res) {
    //router.get("/posts/:id/comments/new", isLoggedIn, function(req, res) {
    posts.findById(req.params.id, function(err, foundpost) {
        if (err) {
            console.log(err);
        } else {
            res.render("commenting/new", { post: foundpost });
        }
    });
});
//Post a New Comment
router.post("/", isLoggedIn, function(req, res) {
    console.log(req.params);
    //router.post("/posts/:id/comments", isLoggedIn, function(req, res) {
    //find a specific post, create Comment
    posts.findById(req.params.id, function(err, foundpost) {
        if (err) {
            console.log(err);
            redirect("/posts/" + foundpost._id);
        } else {
            //这个body里面的Comment是user填表的Comment,所以必须和ejs文件里的名字一致
            comments.create(req.body.Comment, function(err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    foundpost.Comment.push(comment);
                    foundpost.save();
                    res.redirect("/posts/" + foundpost._id);
                }
            });
        }
    });
});
//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", function(req, res) {
    comments.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("commenting/edit", { post_id: req.params.id, comment: foundComment });
        }
    });
});
//COMMENT UPDATE ROUTE  "/posts/:id/comments/:comment_id" 
router.put("/:comment_id", function(req, res) {
    //req.body.comment是edit.ejs里面的comment名字
    comments.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect('/posts/' + req.params.id);
        }
    });
});
//COMMENT DESTORY ROUTE
router.delete("/:comment_id", function(req, res) {
    comments.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/posts/" + req.params.id);
        }
    });
});
//Middleware
function checkCommentOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        comments.findById(req.params.id, function(err, foundPost) {
            if (err) {
                res.redirect("back");
            } else {
                if (foundPost.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        })
    };
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};
module.exports = router;