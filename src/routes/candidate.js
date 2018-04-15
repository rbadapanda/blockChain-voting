var _ = require('lodash');
var Candidate = require('../models/candidate.js');

module.exports = function(app) {

    /* Create */
    app.post('/candidateApi', function (req, res) {
        var newCandidate = new Candidate(req.body);
        newCandidate.save(function(err) {
            if (err) {
                res.json({info: 'error during candidate create', error: err});
            };
            res.json({info: 'candidate created successfully'});
        });
    });

    /* Read */
    app.get('/candidateApi', function (req, res) {
        Candidate.find(req.query||{}, function(err, candidates) {
            if (err) {
                res.json({info: 'error during find candidates', error: err});
            };
            res.json({info: 'candidates found successfully', data: candidates});
        });
    });

    app.get('/candidateApi/:id', function (req, res) {
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
    app.put('/candidateApi/:id', function (req, res) {
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
    app.delete('/candidateApi/:id', function (req, res) {
        Candidate.findByIdAndRemove(req.params.id, function(err) {
            if (err) {
                res.json({info: 'error during remove candidate', error: err});
            };
            res.json({info: 'candidate removed successfully'});
        });
    });


};
