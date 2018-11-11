var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

/*
 * type:
 * artReply: xx 在文章中回复了你
 * leaveReply: xx 回复了你的留言
 */

var MessageSchema = new Schema({
    type: { type: String },
    master_id: { type: ObjectId},
    author_id: { type: ObjectId },
    article_id: { type: ObjectId},
    reply_id: { type: ObjectId },
    has_read: { type: Boolean, default: false },
    create_at: { type: Date, default: Date.now }
});
MessageSchema.plugin(BaseModel)

mongoose.model('Message', MessageSchema);