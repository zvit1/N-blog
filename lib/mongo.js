var config = require('config-lite')
var mongoose = require('mongoose')
mongoose.connect(config.mongodb)

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.on('open', function () {
  console.log('----------------->Connect to ' + config.mongodb + ' successfully!')
})

var userSchema = mongoose.Schema({
  name: String,
  password: String,
  avatar: String,
  gender: { type: String, default: ['m', 'f', 'x'] },
  bio: String
})

userSchema.index({ name: 1 })

module.exports.userSchema = userSchema
