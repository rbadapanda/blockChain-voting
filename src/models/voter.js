var mongoose = require('mongoose');

var voterSchema = mongoose.Schema({
    name: String,
    age: Number,
    canVote: Boolean,
    voted: Boolean
});

module.exports = mongoose.model('Voter', voterSchema);
