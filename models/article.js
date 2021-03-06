/**
 * 文章schema
 */
var mongoose = require('mongoose')
var BaseModel = require('./base_model')
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId       //

//定义schema
var ArticleSchema = new Schema({
    title: {type: String},
    content: {type: String},
    main_img: {type: String},
    tab_id: {type: ObjectId},
    reply_count: {type: Number, default: 0},
    visit_count: {type: Number, default: 0},
    fabulous_users:{type:Array,default:[]},  //点赞的用户ID组
    create_at: {type: Date, default: Date.now},
    update_at: {type:Date, default: Date.now},
    deleted: {type:Boolean, default: false}
})

//使用扩展
ArticleSchema.plugin(BaseModel)
//ArticleSchema.index({create_at: -1})   //建立索引 1和-1分别表示升序索引和降序索引

mongoose.model('Article',ArticleSchema)