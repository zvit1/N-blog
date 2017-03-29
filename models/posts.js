var PostModel = require('../lib/mongo').PostModel

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
    return PostModel
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec()
  }
}
