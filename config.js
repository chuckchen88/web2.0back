var path = require('path')

var config = {
    debug: true,

    name: 'chuckClub', // 社区名字
    description: 'chuck社区', // 社区的描述
    keywords: 'nodejs, node, express, connect, socket.io',

    //mongodb数据库连接地址
    db:'mongodb://127.0.0.1/chuckblog',

    //redis 配置，默认是本地
    redis_host: '127.0.0.1',
    redis_port: 6379,
    redis_db: 0,
    redis_password: '',

    // admin 可删除话题，编辑标签。把 user_login_name 换成你的登录名
    admins: { chen_l: true },

    // 邮箱配置
    mail_opts: {
        //host: "smtp.qq.com", // 主机
        service: 'qq',
        secure: true, // 使用 SSL
        secureConnection: true, // 使用 SSL
        port: 465, // SMTP 端口
        auth: {
            user: '2811863274@qq.com',
            // 这里密码不是qq密码，是你设置的smtp授权码
            pass: 'vqueerfrejofdgaf',
        }
    },
    session_secret: 'chuck_club_secret', // 务必修改
    auth_cookie_name: 'chuck_club',
    //日志目录
    log_dir: path.join(__dirname, 'logs'),
    //域名
    host: 'localhost:3000'
}
module.exports = config