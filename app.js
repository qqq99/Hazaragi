var express = require("express");
//var expressSanitizer = require("express-sanitizer");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var posts = require("./models/posts");
var users = require("./models/users");
var comments = require("./models/comments");
var seedDB = require("./seeds");
var app = express();
//seedDB();//seed the database

//console.log(mongoose.version);
// APP CONFIG
mongoose.connect('mongodb://127.0.0.1:27017/posting', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log('connected to DB'))
    .catch(error => console.log(error.message));
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);

var path = require('path');
const { SSL_OP_TLS_BLOCK_PADDING_BUG } = require("constants");
//dirname 指 where script runs
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(expressSanitizer());
//_method: what it looks like in URL,比方_method=PUT 在edit.ejs文件里
app.use(methodOverride("_method"));
/*PASSPORT CONFIGURATION
pass an object to express-session
*/
app.use(require("express-session")({
    secret: "Best of all",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
//authenticate()是passportLocalMongoose里面的方法
passport.use(new LocalStrategy(users.authenticate()));
/*they are responsible for reading the session,
taking the data from the session 
encode and unencoded it that is deserialize;
And encode it serialize it then put it back into the session: is serialize 
*/
passport.serializeUser(users.serializeUser());
passport.deserializeUser(users.deserializeUser());
//Middleware
app.use(function(req, res, next) {
    //因为在ejs文件里读取不到req.user;所以需要在这里赋给currentUser
    res.locals.currentUser = req.user;
    next();
});
//Requring Routes
var commentsRoutes = require("./routes/comments");
var postsRoutes = require("./routes/posts");
var indexAuthRoutes = require("./routes/indexAuth");

app.use(indexAuthRoutes);
app.use("/posts", postsRoutes);
app.use("/posts/:id/comments", commentsRoutes);
//HOME PAGE
app.get("/", function(req, res) {
    res.render('mumu');
});

app.listen(3000, function() {
    console.log("Server is listening on port 3000");
});
/*
//INDEX(posts) ROUTE
app.get("/posts", function(req, res) {
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
//NEW ROUTE
app.get("/posts/new", isLoggedIn, function(req, res) {
    res.render("posting/new");
});
//CREATE ROUTE
app.post("/posts", isLoggedIn, function(req, res) {
    //get data from form and add it to posts collection
    //req.body.post.description=req.sanitizer(req.body.post.description);
    posts.create(req.body.post, function(err, newPost) {
        if (err) {
            res.render('posting/new');
        } else {
            //redirect back to main page
            res.redirect('/posts');
        }
    });
});
//SHOW (show a particular id) ROUTE
app.get("/posts/:id", function(req, res) {
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
app.get("/posts/:id/edit", isLoggedIn, function(req, res) {
    posts.findById(req.params.id, function(err, foundPost) {
        if (err) {
            res.redirect("/posting/edit");
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

app.put("/posts/:id", function(req, res) {
    posts.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatePost) {
        if (err) {
            res.redirect("/posts");
        } else {
            res.redirect("/posts/" + req.params.id);
        }
    });
});
//DESTORY(delete) ROUTE
app.delete("/posts/:id", function(req, res) {
    posts.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/posts");
        } else {
            res.redirect("/posts");
        }
    })
});
/*************
COMMENT ROUTE
************
app.get("/posts/:id/comments/new", isLoggedIn, function(req, res) {
    posts.findById(req.params.id, function(err, foundpost) {
        if (err) {
            console.log(err);
        } else {
            res.render("commenting/new", { post: foundpost });
        }
    });
});
app.post("/posts/:id/comments", isLoggedIn, function(req, res) {
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
                    foundpost.Comment.push(comment);
                    foundpost.save();
                    res.redirect("/posts/" + foundpost._id);
                }
            });
        }
    });
});
/********************
 AUTHENTICATION ROUTE
 *******************
app.get("/register", function(req, res) {
    res.render("register");
});
app.post("/register", function(req, res) {
    var newUser = new users({ username: req.body.username });
    users.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/posts");
        });
    })
});
//LOGIN ROUTE
app.get("/login", function(req, res) {
    res.render("login");
});
//handle login logic
//app.post("/login",middleware,callback)
//middleware will call possport.use(new LocalStrategy(users.authenticate()))
app.post("/login", passport.authenticate("local", {
    //应该是redirect到原 page待实现？？？？？？
    successRedirect: "/posts",
    failureRedirect: "/login"
}), function(req, res) {});
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
}); 
//Middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};
*/