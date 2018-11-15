/**
 * tabname  分类名称
 */
var mongoose = require('mongoose')
var BaseModel = require('./base_model')
var Schema = mongoose.Schema

//定义schema
var WorkSchema = new Schema({
    work_name: { type: String},
    work_desc: { type: String},
    main_img: { type: String},
    order_num: { type: Number},
    work_src: { type: String},
    type: { type: Number},  //0公司 1個人
    is_deleted: { type: Boolean, default: false },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
})
WorkSchema.plugin(BaseModel)
mongoose.model('Work', WorkSchema)