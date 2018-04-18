var mongoose = require('mongoose');

var candidateSchema = mongoose.Schema({
    name: String,
    party: String
});

module.exports = mongoose.model('Candidate', candidateSchema);
