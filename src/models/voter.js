var mongoose = require('mongoose');

var voterSchema = mongoose.Schema({
    name: String,
    address: String,
    voted: Boolean
});

module.exports = mongoose.model('Voter', voterSchema);
