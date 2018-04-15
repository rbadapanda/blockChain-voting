pragma solidity ^0.4.16;
///@title Simple Voting - no delegation. 
contract Ballot {
    // This declares a new complex type which will 
    // be used for variables later.
    // It will represent a single voter.
    struct Voter {
        uint canVote; // canVote after being give(n)RightToVote
        bool voted; // if true, that person already voted 
        uint vote; // index of the voted proposal
    }
    // This is a type for a single proposal.
    struct Proposal {
        bytes32 name; // short name (up to 32 bytes) 
        uint voteCount; // number of accumulated votes
    }
    address public chairperson;

    // This declares a state variable that
    // stores a `Voter` struct for each possible address. 
    mapping(address => Voter) public voters;

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;

    ///Create a new ballot to choose one of `proposalNames`.
    function Ballot(bytes32[] proposalNames) public { 
        chairperson = msg.sender; 
        voters[chairperson].canVote = 1;

        // For each of the provided proposal names,
        // create a new proposal object and add it
        // to the end of the array.
        for (uint i = 0; i < proposalNames.length; i++) {
            // `Proposal({...})` creates a temporary
            // Proposal object and `proposals.push(...)`
            // appends it to the end of `proposals`.
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            })); 
        }
    }

    // Give a list of voters the right to vote on this ballot. 
    // ***Solidity-ism: voters is not allowed -- shadows declaration of voters: mapping(address => Voter) public voters
    // May only be called by `chairperson`.
    function giveRightToVote(address[] voters1) public {
        // If the argument of `require` evaluates to `false`,
        // it terminates and reverts all changes to
        // the state and to Ether balances.
        // This consumes all gas in old EVM versions, but not anymore.
        // It is often a good idea to use this if functions are
        // called incorrectly.
        for (uint i = 0; i < voters1.length; i++) {
            address voter = voters1[i];
            require(
                (msg.sender == chairperson) &&
                !voters[voter].voted &&
                (voters[voter].canVote == 0)
            );
            voters[voter].canVote = 1;
        }
    }

    // to proposal `proposals[proposal].name`.
    function vote(uint proposal) public {
        Voter storage sender = voters[msg.sender]; 
        require(!sender.voted);
        sender.voted = true;
        sender.vote = proposal;
        
        // If `proposal` is out of the range of the array, 
        // this will throw automatically and revert all
        // changes.
        proposals[proposal].voteCount += sender.canVote;
    }

    // @dev Computes the winning proposal taking all
    // previous votes into account.
    function winningProposal() public view returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount; 
                winningProposal_ = p;
            } 
        }
    }

    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array and then 
    // returns the name of the winner previous votes into account.
    function winnerName() public view returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}