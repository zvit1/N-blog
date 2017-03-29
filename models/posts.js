var mongoose = require('mongoose')
var marked = require('marked')
var moment = require('moment')
var objectIdToTimestamp = require('objectid-to-timestamp')

var postSchema = require('../lib/mongo').postSchema

// 把文章从 markdown 文本转换成 HTML 文本
postSchema.virtual('htmlString').get(function () {
  return marked(this.content)
})
postSchema.virtual('createAt').get(function () {
  return moment(objectIdToTimestamp(this._id)).format('YYYY-MM-DD HH:mm')
})

var PostModel = mongoose.model('PostModel', postSchema)

module.exports = {
  // 创建一篇文章
  create: function (post, callback) {
    var postDocument = new PostModel(post)

    postDocument.save(callback)
  },

  // 通过文章 id 获取一篇文章
  getPostById: function (postId) {
    return PostModel
      .findOne({ _id: postId })
      .populate('author', 'name bio avatar gender', 'UserModel')
      .exec()
  },

  // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
  getPosts: function (author) {
    var query = {}
    if (author) {
      query.author = author
    }

    return PostModel
    .find(query)
    .populate('author', 'name bio avatar gender', 'UserModel')
    .sort({ _id: -1 })
    .exec()
  },

  // 通过文章 id 给 pv 加 1
  incPv: function (postId) {
    return postModel
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec()
  }
}
