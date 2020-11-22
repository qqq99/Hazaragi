var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    //因为author肯定要login是该网站的user才能够发评论
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        username: String
    }
});
module.exports = mongoose.model("comments", commentSchema);