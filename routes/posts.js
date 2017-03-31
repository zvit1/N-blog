var express = require('express')
var router = express.Router()

var checkLogin = require('../middlewares/check').checkLogin
var postManager = require('../models/posts')
var commentsManager = require('../models/comments')

// GET /posts 所有用户或者特定用户的文章页
// eg: GET /posts?author=xxx
router.get('/', function (req, res, next) {
  var author = req.query.author

  postManager.getPosts(author)
    .then(function (posts) {
      console.log(posts, '===============')
      // 处理一下数据
      posts = posts.map(function (post) {
        post.author.title = post.author.name ? post.author.name : ({m: '男', f: '女', x: '保密'})[post.author.gender] // 得到文章作者的标题
        post.isAuthor = req.session.user && post.author._id && req.session.user._id === post.author._id.toString() // 判断当前文章的作者是不是登陆的用户
        return post
      })
      res.render('posts', {
        posts: posts
      })
    })
    .catch(next)
})

// POST /posts 发表一篇文章
router.post('/', checkLogin, function (req, res, next) {
  var author = req.session.user._id
  var title = req.fields.title
  var content = req.fields.content

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题')
    }
    if (!content.length) {
      throw new Error('请填写内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  var post = {
    author: author,
    title: title,
    content: content,
    pv: 0
  }

  postManager.create(post).then(
    function (result) {
      // result 是插入 MongoDB 后的文档，包含 _id 属性
      req.flash('success', '发表成功')
      // 发表成功后跳转到该文章页
      res.redirect(`/posts/${result._id}`)
    },
    function (err) {
      if (err) {
        req.flash('error', '发表失败')
        res.redirect('/posts')
      }
    }
  )
})

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
  res.render('create')
})

// GET /posts/:postId 单独一篇文章页
router.get('/:postId', function (req, res, next) {
  var postId = req.params.postId

  Promise.all([
    postManager.getPostById(postId), // 获取文章信息
    commentsManager.getComments(postId), // 获取文章留言
    postManager.incPv(postId) // pv 加 1
  ])
  .then(function (result) {
    var post = result[0]
    var comments = result[1]
    if (!post) {
      throw new Error('该文章不存在')
    }

    post.author.title = post.author.name ? post.author.name : ({m: '男', f: '女', x: '保密'})[post.author.gender] // 得到文章作者的标题
    post.isAuthor = req.session.user && post.author._id && req.session.user._id === post.author._id.toString() // 判断当前文章的作者是不是登陆的用户
    comments.forEach(function (comment) {
      comment.isCommentAuthor = req.session.user && comment.author && req.session.user._id === comment.author._id.toString() // 判断留言作者是不是登陆的用户
    })

    res.render('post', {
      post: post,
      comments: comments
    })
  })
  .catch(next)
})

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
  var postId = req.params.postId
  var author = req.session.user._id

  postManager.getPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('该文章不存在')
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('权限不足')
      }

      res.render('edit', { post: post })
    })
    .catch(next)
})

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  var postId = req.params.postId
  var author = req.session.user._id
  var title = req.fields.title
  var content = req.fields.content

  postManager.updatePostById(postId, author, { title: title, content: content })
    .then(function () {
      req.flash('success', '编辑文章成功')
      res.redirect(`/posts/${postId}`)
    })
    .catch(next)
})

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  var postId = req.params.postId
  var author = req.session.user._id

  postManager.delPostById(postId, author)
    .then(function () {
      req.flash('success', '删除文章成功')
      res.redirect('/posts')
    })
    .catch(next)
})

// POST /posts/:postId/comment 创建一条留言
router.post('/:postId/comment', checkLogin, function (req, res, next) {
  var author = req.session.user._id
  var postId = req.params.postId
  var content = req.fields.content
  var comment = {
    author: author,
    postId: postId,
    content: content
  }

  commentsManager.create(comment)
    .then(function () {
      req.flash('success', '留言成功')
      // 留言成功后跳转到上一页
      res.redirect('back')
    })
    .catch(next)
})

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/remove', checkLogin, function (req, res, next) {
  var commentId = req.params.commentId
  var author = req.session.user._id

  commentsManager.delCommentById(commentId, author)
    .then(function () {
      req.flash('success', '删除留言成功')
      // 删除成功后跳转到上一页
      res.redirect('back')
    })
    .catch(next)
})

module.exports = router
