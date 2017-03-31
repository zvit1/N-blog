var PostModel = require('../lib/mongo').PostModel
var commentsManager = require('./comments')

// 写一个函数，将查找文章得到的 promise 实例添加 commentsCount 后再返回新的 promise
async function addCommentsCount (postPromise) {
  // 得到文章
  let posts = await postPromise.catch((err) => { console.error(err) })

  // 判断是一篇文章还是多篇文章，数组就是多篇，对象就是一篇，之后为 post 添加字段 commentsCount
  if (Object.prototype.toString.apply(posts) === '[object Array]') {
    let commentsPromise = posts.map(function (post) {
      return commentsManager.getCommentsCount(post._id).catch((err) => { console.error(err) })
    })
    let commentsCounts = await Promise.all(commentsPromise).catch((err) => { console.error(err) })
    posts.forEach(function (post, i) {
      post.commentsCount = commentsCounts[i]
    })
    return posts
  } else {
    let post = posts // 只有一篇文章
    let commentsCount = await commentsManager.getCommentsCount(post._id).catch((err) => { console.error(err) })

    post.commentsCount = commentsCount
    return post
  }
}

module.exports = {
  // 创建一篇文章
  create: function (post) {
    var postDocument = new PostModel(post)

    return postDocument.save()
  },

  // 通过文章 id 获取一篇文章
  getPostById: function (postId) {
    // 添加文章的评论数后 return 一个 promise 出去
    return addCommentsCount(
      PostModel
        .findOne({ _id: postId })
        .populate('author', 'name bio avatar gender _id', 'UserModel')
        .exec()
    )
  },

  // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
  getPosts: function (author) {
    var query = {}
    if (author) {
      query.author = author
    }

    // 添加文章的评论数后 return 一个 promise 出去
    return addCommentsCount(
      PostModel
        .find(query)
        .populate('author', 'name bio avatar gender _id', 'UserModel')
        .sort({ _id: -1 })
        .exec()
    )
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
