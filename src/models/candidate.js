var mongoose = require('mongoose');

var candidateSchema = mongoose.Schema({
    name: String,
    age: Number,
    party: String
});

module.exports = mongoose.model('Candidate', candidateSchema);
