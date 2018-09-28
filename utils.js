var path = require('path'),
fs = require('fs');
var mkdirp = require('mkdirp');

var utilities = {
    ensureDirectoryExistence: function (dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        }
        mkdirp.sync(dirname);
    },
    saveFileOnDisk: function (filename, content) {
        if(filename.indexOf('.js')<0)
            filename = filename + '.js'
        fs.writeFileSync( filename, content)
    },
    generateFileName: function (input) {
        return input.name
    },
}

module.exports = utilities