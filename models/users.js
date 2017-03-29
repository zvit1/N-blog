var mongoose = require('mongoose')
var moment = require('moment')
var objectIdToTimestamp = require('objectid-to-timestamp')

var userSchema = require('../lib/mongo').userSchema

// 定义文档的 virtual 属性，这里是一个只读属性，从 _id 获得创建时间，转换成可读的形式
userSchema.virtual('createAt').get(function () {
  return moment(objectIdToTimestamp(this._id)).format('YYYY-MM-DD HH:mm')
})
userSchema.virtual('genderName').get(function () {
  return ({ 'm': '男', 'f': "女", 'x': '保密' })[this.gender]
})

// 取得user的model
var UserModel = mongoose.model('UserModel', userSchema)

module.exports = {
  // 注册一个用户
  create: function (user, callback) {
    var userDocument = new UserModel(user)

    userDocument.save(callback)
  },

  // 通过用户名获取用户信息
  getUserByName: function (name) {
    return UserModel.findOne({ name: name }).exec()
  },

  // 将 model 暴露出去
  model: UserModel
}
