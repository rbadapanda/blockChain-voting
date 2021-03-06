// basic example using a deployed smart contract to add a new candidate
// to a voter form.

// import required librarires ( ES5 syntax )
const express = require("express");
const path = require("path");
const solc = require("solc");
const fs = require("fs");
const Web3 = require("web3");
const bodyParser = require("body-parser");
require('mongoose').connect('mongodb://localhost/blockChainVoting');
var readCandidates = require('./routes/candidate.js').readCandidates;
var addCandidate = require('./routes/candidate.js').addCandidate;
var addVoter = require('./routes/voter.js').addVoter;
var readVoters = require('./routes/voter.js').readVoters;


// Init the app
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname + "/../public")); // blindly serve this directory to the client - no processing done on server side
app.use(function(req, res, next) {
  if (req.is("text/*")) {
    req.text = "";
    req.setEncoding("utf8");
    req.on("data", function(chunk) {
      req.text += chunk;
    });
    req.on("end", next);
  } else {
    next();
  }
});

// setup handlebars
const handlebars = require("express-handlebars").create({
  defaultLayout: "main"
}); // to name ./views/layouts/main.handlebars as rendered
app.engine("handlebars", handlebars.engine); // to plumb in handlebars framework.
app.set("view engine", "handlebars"); // to start the engine handler.


//instantiate the routes for both Candidate and voters
const candidateRoutes = require('./routes/candidate.js').apis(app);
const voterRoutes = require('./routes/voter.js').apis(app);

// ===============================================================
// get the deployed contract
const HelloContractObject = JSON.parse(
  fs.readFileSync("./build/contracts/Ballot.json", "utf8")
);

// connect to the smart contract.
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545")); // RPC server of ganache
// var net = require("net");
//var web3 = new Web3(new Web3.providers.WebsocketProvider("http://localhost:7545"));
//var web3 = new Web3(new Web3.providers.IpcProvider(ipcPath, net)); // for geth

var connectedContract = new web3.eth.Contract(
  HelloContractObject.abi, //like export symbols table. lib_func1 is found at <0x...>
  HelloContractObject.networks["5777"].address,
  { gasPrice: "2000000000" }
);

// Get the account from Ganache.  In real scenarios, we would use metamask's injected web3.currentprovider to get a real account.
var account;
var getAccountPromise = new Promise(function(resolve, reject) {
  web3.eth.getAccounts((err, acs) => {
    // When this started failing - Found: Ganache was broken on a bugcheck - restarted Ganache to fix the issue.
    if (err != null) {
      throw new Error("No valid account found.");
    }
    if (acs.length === 0) {
      throw new Error("No accounts found.  Verify your ETH node connection.");
    }
    resolve(acs[0]);
  });
});

getAccountPromise.then(result => {
  // WARNING: this fulfills after the server starts listening, as the promise is now in the callback queue!
  account = result;
});

// start listening
app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), function() {
  console.log(
    "Express started on http://localhost:" +
      app.get("port") +
      "; Press CTRL-C to terminate."
  );
});

// Ready to begin routing.
app.get("/", function (req, res) {
  readCandidates(req.query,
    (_candidateList) => {
      readVoters(req.query,
      (_voterList) =>
        res.render("ballot", {
          title: "Cast your Vote"
          , candidateList: _candidateList
          , voterList: _voterList
        })
      )
    }
  );

});

app.get("/candidate", function (req, res) {
  readCandidates(req.query,
    (_candidateList) =>
      res.render("candidate", {
        title: "Add a Candidate"
        , candidateList: _candidateList
      }));
});

app.get("/voter", function (req, res) {
  readVoters(req.query,
    (_voterList) =>
      res.render("voter", {
        title: "Add a Voter"
        , voterList: _voterList
      }));
});

app.get("/result", function (req, res) {
  connectedContract.methods
    .winnerName()
    .call({ from: account })
    .then(winnerHash => {
      let returnInfo = {
        title: "And The Winner Is...",
        winner: web3.utils.toAscii(winnerHash)
      };

      res.render("result", returnInfo);
    });
});

app.post("/v1/EnterCandidate/", (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let party = req.body.party;
  let fullName = firstName + " " + lastName;
  let name = fullName;

  // use the connected contract to call the contract's AddCandidate method
  // WARNING:
  //    We are using the event system to get the return value from ganache
  //    Real transactions can take hours to return, and post will timeout.
  //    Better to return only the transaction hash and then do something like send
  //    email!

  // actually send the transaction.
  connectedContract.methods
    .AddCandidate(web3.utils.fromAscii(fullName))
    .send({ from: account })
    .then(resultObject => {
      let transactionHash = resultObject.transactionHash;

      // Ganache test environment is in 'auto-mining' mode. In reality, the following might not be available until - anywhere between 10 mins to 10 days.
      connectedContract.methods
        .getCandidateHash()
        .call({ from: account })
        .then(resultCandidateHash => {
          let returnInfo = {
            txHash: transactionHash,
            personHash: web3.utils.toAscii(resultCandidateHash)
          };
          res.send(returnInfo);
        })
        .then(() => {
          addCandidate({ name, party });
        }

        )
    })
    .catch(err => {
      console.log(err);
    });

  //ganache does not support events
 /*  connectedContract.once("candidateAdded", null, function(error, eventJsonObject) {
    if (error) {
      console.log(error);
    }
    // here's where we'd do something with the user.
    if (eventJsonObject) {
      console.log(eventJsonObject);
    }
  });

  // another way to do it
  var candidateAddedEvent = connectedContract.events.candidateAdded(
    { filter: { from: account } },
    function(error, event) {
      console.log(event);
    }
  );
  */
});

app.post("/castVote/", (req, res) => {
  let voterAddress = req.body.voterAddress;
  let candidateIndex = Number.parseInt(req.body.candidateIndex)||0;


  connectedContract.methods
    .vote(candidateIndex)
    .send({ from: voterAddress })
    .then(resultObject => {
      let transactionHash = resultObject.transactionHash;

      res.send({ status: "Success", transactionHash });
    })
    .catch(err => {
      console.log(err);
      res.send({ status: "Failure", err});
    });
});

app.post("/EnterVoter/", (req, res) => {
  let voterAddress = req.body.address;


  connectedContract.methods
    .giveRightToVote(voterAddress)
    .send({ from: account })
    .then(resultObject => {
      let transactionHash = resultObject.transactionHash;
      addVoter(req.body);
    })
    .catch(err => {
      console.log(err);
      res.send({ status: "Failure", err});
    });
});
