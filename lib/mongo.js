var config = require('config-lite')
var mongoose = require('mongoose')
var moment = require('moment')
var objectIdToTimestamp = require('objectid-to-timestamp')
var marked = require('marked')
var xss = require('xss')

// 替换掉 mongoose 的 PostPromise
mongoose.Promise = global.Promise

var Schema = mongoose.Schema
// 连接数据库
mongoose.connect(config.mongodb)

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.on('open', function () {
  console.log('----------------->Connect to ' + config.mongodb + ' successfully!')
})

// 定义用户的 schema
var userSchema = Schema({
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
userSchema.virtual('title').get(function () {
  return this.name ? this.name : ({ 'm': '男', 'f': "女", 'x': '保密' })[this.gender]
})
// 取得 user 的 model
var UserModel = mongoose.model('UserModel', userSchema)

// 定义文章的 schema
var postSchema = Schema({
  author: mongoose.Schema.Types.ObjectId,
  title: String,
  content: String,
  pv: Number
})
postSchema.index({ author: 1, _id: -1 })
// 把文章从 markdown 文本转换成 HTML 文本
postSchema.virtual('htmlString').get(function () {
  return xss(marked(this.content))
})
postSchema.virtual('createdAt').get(function () {
  return moment(objectIdToTimestamp(this._id)).format('YYYY-MM-DD HH:mm')
})
var PostModel = mongoose.model('PostModel', postSchema)

// 定义评论的 schema
var commentSchema = Schema({
  author: mongoose.Schema.Types.ObjectId,
  content: String,
  postId: mongoose.Schema.Types.ObjectId
})
commentSchema.index({ postId: 1, _id: 1 }) // 通过文章 id 获取文章下的所有留言，并按时间升序排序
commentSchema.index({ author: 1, _id: 1 })// 通过文章作者通过用户 id 和留言 id 删除一个留言
commentSchema.virtual('htmlString').get(function () {
  return xss(marked(this.content))
})
commentSchema.virtual('createdAt').get(function () {
  return moment(objectIdToTimestamp(this._id)).format('YYYY-MM-DD HH:mm')
})
var CommentModel = mongoose.model('CommentModel', commentSchema)

// 把模块的各个组件暴露出去
module.exports = {
  UserModel: UserModel,
  PostModel: PostModel,
  CommentModel: CommentModel
}
