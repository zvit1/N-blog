var CommentModel = require('../lib/mongo').CommentModel

module.exports = {
  // 创建一个留言
  create: function (comment) {
    var commentDocument = new CommentModel(comment)
    return commentDocument.save()
  },

  // 通过用户 id 和留言 id 删除一个留言
  delCommentById: function (commentId, author) {
    return CommentModel.remove({ _id: commentId, author: author }).exec()
  },

  // 通过文章 id 删除文章下所有留言
  delCommentsByPostId: function (postId) {
    return CommentModel.remove({ postId: postId }).exec()
  },

  // 通过文章 id 获取该文章下的所有留言，按留言创建时间升序排序
  getComments: function (postId) {
    return CommentModel
      .find({ postId: postId })
      .populate('author', 'name avatar gender bio', 'UserModel')
      .sort({ _id: 1 })
      .exec()
  },

  // 通过文章 id 获取该文章下的留言数
  getCommentsCount: function (postId) {
    return CommentModel.count({ postId: postId }).exec()
  }
}
