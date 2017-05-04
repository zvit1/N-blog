module.exports = {
  port: 3000,
  session: {
    secret: 'myblog',
    key: 'myblog',
    maxAge: 2592000000 // 有效期，与 Expire 的区别是 Expire 直接指定过期的时间
  },
  mongodb: 'mongodb://localhost:27017/myblog'
}
