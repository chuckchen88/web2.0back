/**
 *
 */
var mongoose = require('mongoose')
var BaseModel = require('./base_model')
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId

//定义schema
var CommentSchema = new Schema({
    user_id: { type: ObjectId},
    article_id: { type: ObjectId},
    comment_id: { type: ObjectId},//是否是二级回复
    content: { type: String},
    pics: { type: Array},
    fabulous: { type: Number,default:0},
    deleted: { type: Boolean, default: false },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
})
CommentSchema.plugin(BaseModel)
mongoose.model('Comment', CommentSchema)