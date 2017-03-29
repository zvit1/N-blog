var config = require('config-lite')
var mongoose = require('mongoose')
var moment = require('moment')
var objectIdToTimestamp = require('objectid-to-timestamp')
var marked = require('marked')

// 连接数据库
mongoose.connect(config.mongodb)

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.on('open', function () {
  console.log('----------------->Connect to ' + config.mongodb + ' successfully!')
})

// 定义用户的 schema
var userSchema = new mongoose.Schema({
  name: String,
  password: String,
  avatar: String,
  gender: { type: String, default: ['m', 'f', 'x'] },
  bio: String
})
userSchema.index({ name: 1 })
// 定义文档的 virtual 属性，这里是一个只读属性，从 _id 获得创建时间，转换成可读的形式
userSchema.virtual('createdAt').get(function () {
  return moment(objectIdToTimestamp(this._id)).format('YYYY-MM-DD HH:mm')
})
userSchema.virtual('genderName').get(function () {
  return ({ 'm': '男', 'f': "女", 'x': '保密' })[this.gender]
})
// 取得user的model
var UserModel = mongoose.model('UserModel', userSchema)

// 定义文章的 schema
var postSchema = new mongoose.Schema({
  author: mongoose.Schema.Types.ObjectId,
  title: String,
  content: String,
  pv: Number
})
postSchema.index({ author: 1, _id: -1 })
// 把文章从 markdown 文本转换成 HTML 文本
postSchema.virtual('htmlString').get(function () {
  return marked(this.content)
})
postSchema.virtual('createdAt').get(function () {
  return moment(objectIdToTimestamp(this._id)).format('YYYY-MM-DD HH:mm')
})
var PostModel = mongoose.model('PostModel', postSchema)

// 把模块的各个组件暴露出去
module.exports = {
  UserModel: UserModel,
  PostModel: PostModel
}
