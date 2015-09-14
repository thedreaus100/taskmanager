var Redis = require("redis");

var client = Redis.createClient();
var keydl = ":";

toggleCompletion("dreaus100", 2015, 9, 31, 24);

function toggleCompletion(username, year, month, day, hour) {

    var key = username.concat(keydl, new Date(year, month).getTime());
    var offset = (24 * (day-1)) + hour;
    console.log(key, offset);

}
