var PostModel = require('../lib/mongo').PostModel
var commentsManager = require('./comments')

// 写一个函数，将查找文章得到的 promise 实例添加 commentsCount 后再返回新的 promise
// function addCommentsCount (promise) {
//   return promise.then(function (posts) {
//     // 如果是一个数组说明是在进行多文档查询，否则是在进行单文档查询 ( 分别对应 getPosts 和 getPostById )
//     if (Object.prototype.toString.apply(posts) === '[object Array]') {
//
//     } else {
//       var post = posts
//       commentsManager.getCommentsCount(post._id)
//         .then(function (count) {
//
//         })
//     }
//   })
// }

module.exports = {
  // 创建一篇文章
  create: function (post) {
    var postDocument = new PostModel(post)

    return postDocument.save()
  },

  // 通过文章 id 获取一篇文章
  getPostById: function (postId) {
    return PostModel
      .findOne({ _id: postId })
      .populate('author', 'name bio avatar gender _id', 'UserModel')
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
      .populate('author', 'name bio avatar gender _id', 'UserModel')
      .sort({ _id: -1 })
      .exec()
  },

  // 通过文章 id 给 pv 加 1
  incPv: function (postId) {
    return PostModel
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec()
  },

  // 通过用户 id 和文章 id 更新一篇文章文章
  updatePostById: function (postId, author, data) {
    return PostModel
      .update({ author: author, _id: postId }, { $set: data })
      .exec()
  },

  // 通过用户 id 和 文章 id 删除一篇文章
  delPostById: function (postId, author) {
    return PostModel.remove({ author: author, _id: postId }).exec()
  }
}
