var userSchema = require('../lib/mongo').userSchema
var mongoose = require('mongoose')

// 取得user的model
var UserModel = mongoose.model('UserModel', userSchema)

module.exports = {
  create: function (user, cb) {
    var userDocument = new UserModel(user)

    userDocument.save(cb)
  }
}
