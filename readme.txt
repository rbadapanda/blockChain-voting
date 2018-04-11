Class Title:
contract/App interaction
start ganache

initial Commands:
new folder
truffle init -- as it needs an empty folder
git init .
(optionally have your .gitignore to ignore node_modules)
npm init --creates the directory structure
npm install -save web3 solc express express-handlebars body-parser keccak

copy 2_deploy_contract.js
truffle compile;truffle migrate; //code should now be deployed in ganache
node src/server.js -- start the server