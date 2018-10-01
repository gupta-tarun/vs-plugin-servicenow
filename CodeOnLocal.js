var buildQuery = function(input, fastQuery) {
    var query = ''
    //TODO Add pagination support

    tokens = input.split('@')
    if (tokens.length === 1) {
        //we need to build the query in name and description
        query = 'nameLIKE' + input + '^ORdescriptionLIKE' + input;
        input = fastQuery ? query + '&sysparm_fields=sys_class_name,sys_id,sys_update_name,api_name,name,sys_name' : query;
    } else {
        tempQuery = []
        for (var i=0; i<tokens.length; i++) {
            if (tokens[i] !== '') {
                var filter = tokens[i].split(':')
                if (filter.length === 1) {
                    //no query
                    continue;
                }
                tempQuery.push(filter[0] + 'LIKE' + filter[1].trim());
            }
        }
        query = tempQuery.join('^OR')
    }
    input = fastQuery ? query + '&sysparm_fields=sys_class_name,sys_id,sys_update_name,api_name,name,sys_name' : query;
    input = input + '&sysparm_limit=200'
    return input
}

var getDefaultOptionsForSearch = function() {
    creds = require('./credStore')
    return {
        userName: creds.getUserName(),
        password: creds.getPassword(),
        resourcetype: 'sys_script_include'
    }
}
validateInput = function () {
    //TODO add validations for input query
    return true
}

var utils = require('./utils')
commands = {
    /**
     *  @name name of script
     *  @createdBy
     * 
     */
    //@name:ajax OR @createdBy:tarun OR @updatedBy:xyz
    //version 1 will search for name or description
    search: function(input, callback){
        //check if input contains '@'
        validateInput({operation: 'search'});
        var query = buildQuery(input, 'fast')
        //set options for rest client
        var options = getDefaultOptionsForSearch()
        options.query = query
        //load restClient
        snowRestClient = require('./snowRestClient')
        snowRestClient.request(options, function(err, res, body) {
            if(err) {
                return callback(err)
            }
            //TODO save search result in local disk for future fast access? 
            return callback(null, body)
        })
    },

    searchAndDownload: function(input, callback) {
        validateInput({operation: 'search'});
        var query = buildQuery(input)
        //set options for rest client
        var options = getDefaultOptionsForSearch()
        options.query = query
        //load restClient
        snowRestClient = require('./snowRestClient')
        snowRestClient.request(options, function(err, res, body) {
            if(err) {
                return callback(err)
            }
            //TODO download search result in local disk
            //for each result in body.result
            //save results on disk
            if(body && body.result && body.result.length > 0){
                for (var i =0; i<body.result.length; i++){
                    commands.saveOnDisk(body.result[i])
                }
            }

        })
    },

    saveOnDisk: function(input) {
        validateInput({'operations':'saveOnDisk'})

        var properties = require('./prefrences')
        var fullPath = ''
        userPrefs = properties.loadPreference()

        //check if the directoryPathForLocalScripts exist
        var fullPath = userPrefs.directoryPathForLocalScripts
        if(input.api_name){
            //create api folder for the file
            var apiNameSpacePath = input.api_name.split('.').join('/')
            fullPath = fullPath + '/' + apiNameSpacePath
        }

        utils.ensureDirectoryExistence(fullPath)
        fullPath = fullPath + '/' + utils.generateFileName(input)

        if(input.script) {
            utils.saveFileOnDisk(fullPath, input.script)
            //TODO save links for this file in our cache
        }
        
    }
};
//Example
// commands.search('@name:ajax')
// commands.search('ajax')
// .search('@createdBy:ajax')
//commands.searchAndDownload('@sys_updated_by:venkatreddy.b @sys_created_by:venkatreddy.b')

module.exports = commands
