var config = require('../config')
var multer = require('multer');
//实现图片上传
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public'+config.upload) //需要手动创建 否则会报错
    },
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split('.'),
            date = new Date();
        cb(null, file.fieldname + '_' + date.getTime() + '.' + fileFormat[fileFormat.length - 1]);
    }
});
var upload = multer({ storage: storage });

module.exports = upload;