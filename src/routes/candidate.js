var _ = require('lodash');
var Candidate = require('../models/candidate.js');

exports.readCandidates = function (queryObj, callback = ()=> { }){
    Candidate.find(queryObj||{}, function(err, candidates){
        if (err) {
            return callback({error: err})
        }else{
            return callback(candidates);
        }
    })
}

exports.addCandidate = function (candidate, callback = ()=> { }){
    var newCandidate = new Candidate(candidate);

    newCandidate.save(function (err) {
        if (err) {
            return callback({error: err})
        }else{
            return callback("candidate created successfully");
        }
    })
}


exports.apis = function(app) {

    /* Create */
    app.post('/api/candidate', function (req, res) {
        var newCandidate = new Candidate(req.body);
        newCandidate.save(function(err) {
            if (err) {
                res.json({info: 'error during candidate create', error: err});
            };
            res.json({info: 'candidate created successfully'});
        });
    });

    /* Read */
    app.get('/api/candidate', function (req, res) {
        Candidate.find(req.query||{}, function(err, candidates) {
            if (err) {
                res.json({info: 'error during find candidates', error: err});
            };
            res.json({info: 'candidates found successfully', data: candidates});
        });
    });

    app.get('/api/candidate/:id', function (req, res) {
        Candidate.findById(req.params.id, function(err, candidate) {
            if (err) {
                res.json({info: 'error during find candidate', error: err});
            };
            if (candidate) {
                // res.json({info: 'candidate found successfully', data: candidate});
                setTimeout(function(){
                    res.json({info: 'candidate found successfully', data: candidate});
                }, 10000);
            } else {
                res.json({info: 'candidate not found'});
            }
        });
    });

    /* Update */
    app.put('/api/candidate/:id', function (req, res) {
        Candidate.findById(req.params.id, function(err, candidate) {
            if (err) {
                res.json({info: 'error during find candidate', error: err});
            };
            if (candidate) {
                _.merge(candidate, req.body);
                candidate.save(function(err) {
                    if (err) {
                        res.json({info: 'error during candidate update', error: err});
                    };
                    res.json({info: 'candidate updated successfully'});
                });
            } else {
                res.json({info: 'candidate not found'});
            }

        });
    });

    /* Delete */
    app.delete('/api/candidate/:id', function (req, res) {
        Candidate.findByIdAndRemove(req.params.id, function(err) {
            if (err) {
                res.json({info: 'error during remove candidate', error: err});
            };
            res.json({info: 'candidate removed successfully'});
        });
    });


};
