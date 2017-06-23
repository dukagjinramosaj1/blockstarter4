const TestRPC = require("ethereumjs-testrpc");


const port = 8545

console.log('setup testrpc')


var server = TestRPC.server();
server.listen(port, function(err, blockchain) {
	if (err) {
		console.error('error', err)
	} else {
		
		console.log(blockchain)
	}
});
