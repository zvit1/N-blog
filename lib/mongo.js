var config = require('config-lite')
var mongoose = require('mongoose')

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

// 定义文章的 schema
var postSchema = new mongoose.Schema({
  author: mongoose.Schema.Types.ObjectId,
  title: String,
  content: String,
  pv: Number
})

postSchema.index({ author: 1, _id: -1 })

// 把模块的各个组件暴露出去
module.exports.userSchema = userSchema
module.exports.postSchema = postSchema
