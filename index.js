var path = require('path')
var express = require('express')
var session =require('express-session')
var formidable = require('express-formidable')
var MongoStore = require('connect-mongo')(session)
var flash = require('connect-flash')
var config = require('config-lite')
var nunjucks = require('nunjucks')
var routes = require('./routes')
var pkg = require('./package')
var winston =require('winston')
var expressWinston = require('express-winston')

var app = express()

// 设置模板目录
app.set('views', path.join(__dirname, 'views'))
// 设置模板引擎为 Nunjucks
app.set('view engine', 'njk')

nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app
})

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')))
app.use('/libs', express.static(path.join(__dirname, 'node_modules')))
// session 中间件
app.use(session({
  name: config.session.key, // 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret, // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  cookie: {
    maxAge: config.session.maxAge // 过期时间，过期后 cookie 中的 sessionId 自动删除
  },
  store: new MongoStore({ // 将 session 存储到 mongodb
    url: config.mongodb // mongodb 地址
  })
}))

// flash 中间件，用于显示通知
app.use(flash())

// 处理表单及文件上传的中间件
app.use(formidable({
  uploadDir: path.join(__dirname, 'public/img'), //上传文件目录
  keepExtensions: true // 保留后缀
}))

// 设置模板全局变量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

// 添加模板必须的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

// 正常请求的日志
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}))
// 路由
routes(app)
// 出错请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}))


// error 页面
app.use(function (err, req, res, next) {
  res.render('error', {
    error: err
  })
})

// 监听端口，启动程序
app.listen(config.port, function () {
  console.log(`--------------------${pkg.name} listening on port ${config.port}--------------------`)
})
