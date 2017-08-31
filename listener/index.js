//initial configurations
const config = require('./config');
const redis = require('redis');
const startedTimestamp = Math.floor(Date.now() / 1000);
const redisClient = redis.createClient(config.REDIS_PORT, config.REDIS_URL);

//proccess function
function proccess(timestamp) {
    //check if the required key exists
    redisClient.lrange(['echo.' +  timestamp, 0, -1], function(err, reply) {
        if (reply.length > 0) {
            console.log(reply);

            //delete the entty after 3 seconds of the print time
            setTimeout(function() {
                redisClient.del('echo.' + timestamp);
            }, 3000);
        }
    });
}

//main entry point into the logic
//running as a demon
//sleeping for a second and waking up to do the job

setInterval(function() {
    var timestamp = Math.floor(Date.now() / 1000);

    //starting the main process with the current timestamp
    proccess(timestamp);

}, 1000);


//garbage collection
var cursor = '0';

function scan(){
  //iterate through the keys in the queue
  redisClient.scan(cursor, 'MATCH', 'echo.*', 'COUNT', config.SCAN_COUNT, function(err, reply) {
    if (err) {
        throw err;
    }

    //keeping the position
    cursor = reply[0];


    if(reply[1] && reply[1].length) {
        reply[1].forEach(function(key) {
            if (key.indexOf('echo.') !== 0)
                return;

            //mark the key as inactive
            key = parseInt(key.replace('echo.', ''));
            if (key < startedTimestamp) {
                proccess(key);
            }
        });
    }
    if(cursor === '0') {
        return ;
    } else {
        return scan();
    }
  });
}

//start the collection
scan();
