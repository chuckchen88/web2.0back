var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

/*
 */
var SysSchema = new Schema({
    title: { type: String },
    content: { type: String},
    has_read_user_ids: { type: Array,default:[]},
    deleted: { type: Boolean,default:false},
    create_at: { type: Date, default: Date.now }
});
SysSchema.plugin(BaseModel)

mongoose.model('Sys', SysSchema)