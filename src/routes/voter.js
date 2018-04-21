var _ = require('lodash');
var Voter = require('../models/voter.js');

exports.readVoters = function (queryObj, callback) {
    Voter.find(queryObj || {}, function(err, voters) {
        if (err) {
            return callback({ error: err })
        } else {
            return callback(voters);
        }
    })
}

exports.addVoter = function (voter, callback = () => { }) {
    var newVoter = new Voter(voter);

    newVoter.save(function (err) {
        if (err) {
            return callback({ error: err })
        } else {
            return callback("voter created successfully");
        }
    })
}

exports.apis = function (app) {

    /* Create */
    app.post('/api/voter', function (req, res) {
        var newVoter = new Voter(req.body);
        newVoter.save(function(err) {
            if (err) {
                res.json({info: 'error during voter create', error: err});
            };
            res.json({info: 'voter created successfully'});
        });
    });

    /* Read */
    app.get('/api/voter', function (req, res) {
        Voter.find(req.query || {}, function(err, voters) {
            if (err) {
                res.json({info: 'error during find voters', error: err});
            };
            // res.json({info: 'voters found successfully', data: voters});
            setTimeout(function(){
                res.json({info: 'voters found successfully', data: voters});
            }, 10000);
        });
    });

    app.get('/api/voter/:id', function (req, res) {
        Voter.findById(req.params.id, function(err, voter) {
            if (err) {
                res.json({info: 'error during find voter', error: err});
            };
            if (voter) {
                res.json({info: 'voter found successfully', data: voter});
            } else {
                res.json({info: 'voter not found'});
            }
        });
    });

    /* Update */
    app.put('/api/voter/:id', function (req, res) {
        Voter.findById(req.params.id, function(err, voter) {
            if (err) {
                res.json({info: 'error during find voter', error: err});
            };
            if (voter) {
                _.merge(voter, req.body);
                voter.save(function(err) {
                    if (err) {
                        res.json({info: 'error during voter update', error: err});
                    };
                    res.json({info: 'voter updated successfully'});
                });
            } else {
                res.json({info: 'voter not found'});
            }

        });
    });

    /* Delete */
    app.delete('/api/voter/:id', function (req, res) {
        Voter.findByIdAndRemove(req.params.id, function(err) {
            if (err) {
                res.json({info: 'error during remove voter', error: err});
            };
            res.json({info: 'voter removed successfully'});
        });
    });


};
