var express = require("express");
var bodyParser = require("body-parser");
var uuid = require("node-uuid");
var Redis = require("redis");
var _ = require("underscore");
var arrayConverter = require("./array-object-converter");
var TITLE_REQUIRED = "Items in todo list must have a title in the body";

module.exports = getServer;

function getServer(config, scripts) {

    var rclient = Redis.createClient(config);
    var app = express()
        .param("username", setParam("username"))
        .param("year", setNumParam("year"))
        .param("month", setMonthParam("month"))
        .param("day", setNumParam("day"))
        .param("hour", setNumParam("hour"))
        .param("taskid", setParam("taskid"))
        .param("to", setNumParam("to"))
        .get("/:username/task/:taskid", getTaskById)
        .get("/:username/tasks?/:year?/:month?/:day?/:hour?/to/:to",
            getRange,
            getUsersTasks)
        .get("/:username/tasks?/:year?/:month?/:day?/:hour?/",
            getRange,
            getUsersTasks)
        .put("/:username/:year/:month/:day/:hour",
            bodyParser.json(),
            createTask)
        .post("/:username/:taskid",
            bodyParser.json(),
            updateTask)
        .delete("/:username/:taskid", removeItemById)
        //create Clear Schedule!
        .get("/", sayHello)

    //shutdown
    process.on('SIGTERM', shutdownIMD);
    process.on('SIGINT', shutdown);

    console.log('created server!');
    return app;

    function sayHello(req, res, next) {

        res.json({
            msg: "Hello World"
        }).end();
    }

    function setParam(key) {

        return function(req, res, next, value) {
            req[key] = value;
            next();
        }
    }

    function setNumParam(key) {

        return function(req, res, next, value) {
            req[key] = Number(value);
            next();
        }
    }

    function setMonthParam(key) {

        return function(req, res, next, value) {
            req.month = value - 1;
            next();
        }
    }

    function getTaskById(req, res, next) {

        var map_key = req.username.concat(":").concat(req.taskid);
        rclient.hgetall(map_key, function(err, response) {
            if (err) res.json(err).end();
            else res.json(response).end();
        })
    }

    function getRange(req, res, next) {

        var start;
        var end;

        if (req.year && req.month && req.day && req.hour) {
            start = new Date(req.year, req.month, req.day, req.hour).getTime();
            if (req.to && req.to > req.hour + 1)
                end = new Date(req.year, req.month, req.day, req.to).getTime();
            else end = "(".concat(new Date(req.year, req.month, req.day, req.hour + 1).getTime());
        } else if (req.year && req.month && req.day) {
            start = new Date(req.year, req.month, req.day, 0).getTime();
            if (req.to && req.to > req.day + 1)
                end = new Date(req.year, req.month, req.to).getTime();
            else end = "(".concat(new Date(req.year, req.month, req.day + 1, 0).getTime());
        } else if (req.year && req.month) {
            start = new Date(req.year, req.month).getTime();
            if (req.to && req.to > req.month + 1)
                end = new Date(req.year, req.to).getTime();
            else end = "(".concat(new Date(req.year, req.month + 1, 0, 0).getTime());
        } else if (req.year) {
            start = new Date(req.year).getTime();
            if (req.to && req.to > req.year + 1)
                end = new Date(req.to).getTime();
            else end = "(".concat(new Date(req.year + 1, 0, 0, 0).getTime());
        } else {
            start = "-inf";
            end = "+inf";
        }

        req.start = start;
        req.end = end;
        next();
    }

    function getUsersTasks(req, res, next) {

        rclient.eval(scripts.join, 1, req.username, req.start, req.end, handleTasks);

        function handleTasks(err, tasks) {
            if (err) {
                console.error(err);
            } else {
                var task_list = _.map(tasks, function(task) {
                    return arrayConverter.toObject(task);
                });
                if (req.query.filter && req.query.filter == "complete") {
                    task_list = _.filter(task_list, function(task) {
                        var flag = (task.completed === "true" || task.completed == true);
                        return flag;
                    });
                } else if (req.query.filter == "incomplete") {
                    task_list = _.filter(task_list, function(task) {
                        var flag = (task.completed === "false" || task.completed == false);
                        return flag;
                    });
                }
                res.json(task_list).end();
            }
        }
    }

    function createTask(req, res, next) {

        if (!(req.body && req.body.title)) return res.status(400).json({
            err: TITLE_REQUIRED
        }).end();

        var z_key = req.username;
        var date_created = new Date(); //check to see if date created is before today
        var due_date = getDate(req);
        var score = due_date.getTime();
        var taskid = uuid.v1();
        var map_key = req.username.concat(":").concat(taskid);
        if (req.body.completed != undefined) {
            try {
                req.body.completed = new Boolean(req.body.completed);
            } catch (err) {
                req.body.completed = false;
            }
        } else {
            req.body.completed = false;
        }

        rclient.multi()
            .hmset([map_key,
                "title", req.body.title,
                "id", taskid,
                "date_created", date_created,
                "date_modified", date_created,
                "due_date", due_date,
                "completed", req.body.completed
            ])
            .zadd(z_key, score, map_key)
            .hgetall(map_key)
            .zrangebyscore(z_key, "-inf", "+inf")
            .exec(handleReplies)

        function handleReplies(err, replies) {
            if (err) {
                console.log(err);
                return res.status(500).json(err).end();
            } else {
                replies.map_key = map_key;
                res.json(replies).end();
            }
        }
    }

    //its possible to create a task without a due date!
    function updateTask(req, res, next) {

        var map_key = req.username.concat(":").concat(req.taskid);
        var multi = rclient.multi();
        var hmset = [map_key, "id", req.taskid];
        var z_key = req.username;

        if (req.body.completed != undefined) {
            try {
                req.body.completed = new Boolean(req.body.completed);
            } catch (err) {
                req.body.completed = false;
            }
            hmset.push("completed", req.body.completed);
        }
        if (req.body.due_date) {

            var due_date;
            try {
                due_date = new Date(req.body.due_date);
            } catch (err) {
                return res.json(new Error("Invalid date format")).end();
            }

            var score = due_date.getTime();
            hmset.push("due_date", due_date);
            multi.zadd(req.username, score, map_key)
        }

        if (req.body.title) hmset.push("title", req.body.title);
        hmset.push("date_modified", new Date());
        multi.hmset(hmset)
            .hgetall(map_key)
            .zrangebyscore(z_key, "-inf", "+inf")
            .exec(handleReplies)

        function handleReplies(err, replies) {
            if (err) {
                console.log(err);
                return res.status(500).json(err).end();
            } else {
                replies.map_key = map_key;
                res.json(replies).end();
            }
        }
    }

    //Removes specific Item according to its id
    function removeItemById(req, res, next) {

        var map_key = req.username.concat(":").concat(req.taskid);
        rclient.multi()
            .del(map_key)
            .zrem(req.username, map_key)
            .hgetall(map_key)
            .zrangebyscore(req.username, "-inf", "+inf")
            .exec(handleReplies);

        function handleReplies(err, replies) {
            if (err) {
                console.log(err);
                return res.status(500).json(err).end();
            } else {
                replies.map_key = map_key;
                res.json(replies).end();
            }
        }
    }

    function shutdown() {

        console.log("shutting down after client requests have been handled...kinda");
        rclient.unref();
    }

    function shutdownIMD() {

        console.log("shutting down immediately");
        rclient.end();
    }

    function getDate(req) {
        console.log(req.year, req.month, req.day, req.hour);
        return new Date(req.year, req.month, req.day, req.hour);
    }
}
