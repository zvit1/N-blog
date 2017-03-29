var path = require('path')
var sha1 = require('sha1')
var express = require('express')
var router = express.Router()

var userManager = require('../models/users')
var checkNotLogin = require('../middlewares/check').checkNotLogin

// GET /signup 注册页
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signup')
})

// POST /signup 用户注册
router.post('/', checkNotLogin, function (req, res, next) {
  var name = req.fields.name
  var gender = req.fields.gender
  var bio = req.fields.bio
  var avatar = req.files.avatar.path.split(path.sep).pop()
  var password = req.fields.password
  var repassword = req.fields.repassword

  // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('名字请限制在 1-10 个字符内')
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('性别只能是"男","女"或者"保密"')
    }
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('个人简介请限制在 1-30 个字符内')
    }
    if (!req.files.avatar.name) {
      throw new Error('缺少头像')
    }
    if (password.length < 6) {
      throw new Error('密码少于 6 个字符')
    }
    if (password !== repassword) {
      throw new Error('两次输入的密码不一致')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('/signup')
  }

  // 明文密码加密处理
  password = sha1(password)

  // 待写入数据库的用户信息
  var user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  }

  // 用户信息写入数据库
  userManager.create(user).then(
    function (result) {
    // 返回的 result 信息是 MongoDB 的值，包含了 _id
    // 将用户信息存入 session
    delete result.password

    req.session.user = result

    // 写入 flash
    req.flash('success', '注册成功')

    // 跳转到首页
    res.redirect('/posts')
    },
    function (err) {
      if (err) {
        req.flash('error', err)
        res.redirect('/signup')
      }
    }
  )
})

module.exports = router
