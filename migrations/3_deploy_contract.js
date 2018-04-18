var BallotContract = artifacts.require("Ballot");

module.exports = function(deployer) {
    deployer.deploy(BallotContract);
}