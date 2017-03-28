var config = require('config-lite')
var mongoose = require('mongoose')
mongoose.connect(config.mongodb)

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.on('open', function () {
  console.log('Connect to' + config.mongodb + 'successfully!')
})

module.exports.User =
