//TODO read it from some way instead of reading from local json?
var configJSON = require('./config.json')

var getUserName = function() {
    return configJSON['userName']
}

var getPassword = function() {
    return configJSON['password']
}

var getBaseURL = function() {
    return configJSON['baseURL']
}

exports.getUserName = getUserName
exports.getPassword = getPassword
exports.getBaseURL = getBaseURL