/**
 *
 */
var mongoose = require('mongoose')
var BaseModel = require('./base_model')
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId

//定义schema
var LeaveWordSchema = new Schema({
    user_id: { type: ObjectId},
    reply_id: { type: ObjectId},//有则添加 没有则无
    content: { type: String},
    pics: { type: Array},
    fabulous: { type: Number,default:0},
    deleted: { type: Boolean, default: false },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
})
LeaveWordSchema.plugin(BaseModel)
mongoose.model('LeaveWord', LeaveWordSchema)