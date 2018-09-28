var credStore = require('./credStore')

var URL_PATH  = '/api/now/table/',
    SNOW_BASE_URL = credStore.getBaseURL()

var request = require('request');

var snowRestClient = function(options, callback) {
        
    if (!options.resourcetype) {
        console.log('No resourcetype is given!');
        return callback(new Error('No resourcetype is given!'));
    }
    if (!options.userName || !options.password) {
        console.log('Please provide username or password');
        return callback(new Error('Please provide username or password'));
    }
    var opts = {
        uri: SNOW_BASE_URL + URL_PATH + options.resourcetype 
        , method: 'GET'
        , headers: {
            //Authorization: 'Basic dGFydW4uZ3VwdGE6SGl0YnBAbmQxMjMhQA=='
        Authorization: 'Basic ' + Buffer.from(options.userName + ':' + options.password).toString('base64')
        , 'Content-Type': 'application/json;charset=UTF-8'
        , 'Accept' : 'application/json;charset=UTF-8'
        }
        , json: true
    };

    if (!!options.id) {
        opts.uri = opts.uri + '/' + options.id;
        if (!!options.data) {
        opts.method = 'PUT';
        opts.json = options.data;
        }
    } else if (!!options.data) {
        opts.method = 'POST';
        opts.json = options.data;
        //if data cotains _id that means it is a put call
        if (options.data._id) {
        //remove the _id from data
        opts.uri = opts.uri + '/' + options.data._id;
        opts.method = 'PUT';
        }
    } else if(options.query) {
        opts.uri = opts.uri + '?sysparm_query=' + options.query
    }

    request(opts, function(error, res, body) {
        if (error) {
        return callback(new Error('Error while connecting to instance'));
        }
        verifyResponse(res, body, function(err, res){
            if(err) return callback(err)
            return callback(null, res, body);
        })
    });
};

var verifyResponse = function(res, body, callback){
    if(res.statusCode === 200){
        return callback(null, res, body)
    }
    if (res.statusCode === 401 ){
        return callback(body)
    }
    
    if(body && body.error) {
        return callback(body)
    }

    return callback({
        error: {
            details:'Unexpected error',
            message: body
        }    
    });
}

exports.request = snowRestClient

