var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


var mongoose = require('mongoose');
var conn = mongoose.createConnection('mongodb://localhost/test');
var users = mongoose.Schema({}, {
    strict: false,
    collection: 'users'
});
var table_users = conn.model('users', users);

var polls = mongoose.Schema({}, {
    strict: false,
    collection: 'polls'
});
var table_polls = conn.model('polls', polls);


router.all('/add_user', function (req, res, next) {
    var username = req.query.username;
    var password = req.query.password;
    var role = req.query.role;
    
    var userObj = {
        username : username,
        password : password,
        role : role
    };

    table_users.findOne({
        username : username
    }).exec(function (err, user) {
            if (err) {
                next(err);
            } else {
                if (user) {
                    res.json({
                        error: 1,
                        message: 'Account Already Exists!'
                    });
                } else {
                    var model = new table_users(userObj);
                    model.save(function (err) {
                        if (err) {
                            next(err);
                        } else {
                            var id = model._id;
                            userObj.id = id;
                            res.json({
                                error: 0,
                                data: userObj
                            });
                        }
                    });
                }
            }
        });
});

router.all('/login', function (req, res, next) {
    var username = req.query.username;
    var password = req.query.password;
    
    var userObj = {
        username : username,
        password : password,
    };

    table_users.findOne({
        username : username,
        password : password
    }).exec(function (err, user) {
            if (err) {
                next(err);
            } else {
                if (user) {
                    res.json({
                        error: 0,
                        data : user
                    });
                } else {
                    res.json({
                        error: 1,
                        data : 'user not exists'
                    });
                }
            }
        });
});

router.all('/list_users', function (req, res, next) {
    table_users.find({
    }).exec(function (err, users) {
            if (err) {
                next(err);
            } else {
                if (users) {
                    res.json({
                        error: 0,
                        data : users
                    });
                } else {
                    res.json({
                        error: 1,
                        data : 'no user found'
                    });
                }
            }
        });
});


router.all('/add_poll', function (req, res, next) {
    var title = req.query.title;
    var options = req.query.options;

    var final_options = [];

    split_options = options.split('____');

    for( var k in split_options ){
        kk = split_options[k];
        final_options.push({
            option : kk,
            vote : 0*1
        })
    }

    var pollObj = {
        title : title,
        options : final_options
    };


    var model = new table_polls(pollObj);
    model.save(function (err) {
        if (err) {
            next(err);
        } else {
            var id = model._id;
            pollObj.id = id;
            res.json({
                error: 0,
                data: pollObj
            });
        }
    });

});

router.all('/list_polls', function (req, res, next) {
    table_polls.find({
    }).exec(function (err, polls) {
            if (err) {
                next(err);
            } else {
                if (polls) {
                    res.json({
                        error: 0,
                        data : polls
                    });
                } else {
                    res.json({
                        error: 1,
                        data : 'no poll found'
                    });
                }
            }
        });
});



router.all('/list_poll', function (req, res, next) {
    var id = req.query.id;
    table_polls.findOne({
        '_id' : id
    }).exec(function (err, poll) {
            if (err) {
                next(err);
            } else {
                if (poll) {
                    res.json({
                        error: 0,
                        data : poll
                    });
                } else {
                    res.json({
                        error: 1,
                        data : 'poll not found'
                    });
                }
            }
        });
});



router.all('/do_vote', function (req, res, next) {
    var id = req.query.id;
    var option_text = req.query.option_text;
    table_polls.findOne({
        '_id' : id
    }).exec(function (err, poll) {
            if (err) {
                next(err);
            } else {
                if (poll) {
                    poll_options = poll.get('options');
                    var new_options = [];
                    for( var k in poll_options ){
						opt = poll_options[k];
						if( opt.option == option_text ){
							opt.vote = opt.vote + 1;
						}
						new_options.push( opt );
                    }
                    table_polls.update({
                        _id: id
                    }, {
                        $set: {
                            options: new_options
                        }
                    }, function (err) {
                        if (err) {
                            res.json({
                                error: 1
                            });
                        } else {
                            res.json({
                                error: 0
                            });
                        }
                    });
                    
                } else {
                    res.json({
                        error: 1,
                        data : 'poll not found'
                    });
                }
            }
        });
});


module.exports = router;
