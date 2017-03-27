var config = require('config-lite')
var mongoose = require('mongoose')
mongoose.connect(config.mongodb)

module.exports.User = 
