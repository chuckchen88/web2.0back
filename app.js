var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');  //后台管理
var cookieParser = require('cookie-parser');
var apiRouterV1 = require('./routes/api_router_v1'); //api路由
var cors = require('cors');  //跨域
var config = require('./config')
var app = express();
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var auth = require('./middlewares/auth');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// 中间件
app.use(cookieParser(config.session_secret));   //session_secret:给cookie签名
let sessionMiddleware = session({
    secret: config.session_secret,
    store: new RedisStore({
        port: config.redis_port,
        host: config.redis_host,
        db: config.redis_db,
        pass: config.redis_password,
    }),
    resave: false,
    saveUninitialized: false,
});
app.use(sessionMiddleware)
app.use(auth.authUser)
//路由
app.use('/api/v1', cors(), apiRouterV1);
app.use('/', indexRouter);  //测试
app.use('/admin', adminRouter); //后台管理

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;