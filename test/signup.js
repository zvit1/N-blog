var path = require('path')
var assert = require('assert')
var request = require('supertest')
var app = require('../index')
var UserModel = require('../lib/mongo').UserModel

describe('signup', function () {
  describe('POST /signup', function () {
    var agent = request.agent(app) // persist cookie when redirect
    beforeEach(function (done) {
      // 创建一个用户
      UserModel.create({
        name: 'aaa',
        password: '123456',
        avatar: '',
        gender: 'x',
        bio: ''
      })
      .then(function () {
        done()
      })
      .catch(done)
    })

    afterEach(function (done) {
      // 清空 user 表
      UserModel.remove()
        .exec()
        .then(function () {
          done()
        })
        .catch(done)
    })

    // 用户名错误的情况
    if ('wrong name', function (done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: '' })
        .redirects()
        .end(function (err, res) {
          if (err) {
            return done(err)
          }
          assert(res.text.match(/名字请限制在 1 - 10 个字符/))
          done()
        })
    })

    // 性别错误的情况
    it('wrong gender', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: 'zvit', gender: 'n' })
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/性别只能是 m、f 或 x/));
          done();
        });
    });

    // 其余的参数测试自行补充
    // 用户名被占用的情况
    it('duplicate name', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: 'aaa', gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/用户名已被占用/));
          done();
        });
    })

    // 注册成功的情况
    it('success', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: 'zvit', gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/注册成功/));
          done();
        });
    });
  })
})
