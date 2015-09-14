if(ARGV[1]==nil)then ARGV[1] = "-inf" end
if(ARGV[2]==nil)then ARGV[2] = "+inf" end

local newslist = redis.pcall("zrangebyscore",KEYS[1],ARGV[1],ARGV[2]);
local results = {};

for key, value in ipairs(newslist) do

	local item = redis.call("hgetall",value);
	table.insert(item,"key");
	table.insert(item,value);
	table.insert(results, item);
	--table.insert(results[key],item);

end
return results;