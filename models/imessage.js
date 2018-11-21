var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

/*
 * type:
 * time 时间
 * text 文本 包含图片
 * into 某人进入
 */

var ImessageSchema = new Schema({
    type: { type: String },
    user_id: { type: ObjectId},
    content: { type: String },
    deleted: {type:Boolean,default:false},
    create_at: { type: Date, default: Date.now }
});
ImessageSchema.plugin(BaseModel)

mongoose.model('Imessage', ImessageSchema);