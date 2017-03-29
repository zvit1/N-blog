var express = require('express')
var router = express.Router()

var checkLogin = require('../middlewares/check').checkLogin
var postManager = require('../models/posts')

// GET /posts 所有用户或者特定用户的文章页
// eg: GET /posts?author=xxx
router.get('/', function (req, res, next) {
  var author = req.query.author

  postManager.getPosts(author)
    .then(function (posts) {
      // 处理一下数据
      posts = posts.map(function (post, index) {
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
    postManager.incPv(postId) // pv 加 1
  ])
  .then(function (result) {
    var post = result[0]
    if (!post) {
      throw new Error('该文章不存在')
    }

    res.render('post', {
      post: post
    })
  })
  .catch(next)
})

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
  res.send(req.flash())
})

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  res.send(req.flash())
})


// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  res.send(req.flash())
})

// POST /posts/:postId/comment 创建一条留言
router.post('/:postId/comment', checkLogin, function (req, res, next) {
  res.send(req.flash())
})

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.post('/:postId/comment/:commentId/remove', checkLogin, function (req, res, next) {
  res.send(req.flash())
})

module.exports = router
