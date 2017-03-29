var UserModel = require('../lib/mongo').UserModel

module.exports = {
  // 注册一个用户
  create: function (user) {
    var userDocument = new UserModel(user)

    return userDocument.save()
  },

  // 通过用户名获取用户信息
  getUserByName: function (name) {
    return UserModel.findOne({ name: name }).exec()
  }
}
