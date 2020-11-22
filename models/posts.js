var mongoose = require("mongoose");


//MONGOOSE/MODEL CONFIG
var postingSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        username: String
    },
    Comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments"
    }]
});
//model this schema to this posts collection
module.exports = mongoose.model("posts", postingSchema);

/* posts.create({
    title: "酸爽",
    image: "/images/Screen Shot 2020-07-26 at 8.18.25 pm.png",
    description: "nice"
}, function(err, posts) {
    if (err) {
        console.log(err);
    } else {
        console.log("newly created posting.");
        console.log(posts);
    }
}); */