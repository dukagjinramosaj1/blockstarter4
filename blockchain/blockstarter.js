const Web3 = require('web3')
const config = require('./blockstarterData')

// initializing the web3
const web3 = new Web3(new Web3.providers.HttpProvider(config.networkAddress))
const blockstarter = web3.eth.contract(config.abi.blockstarter).at(config.blockstarter.address)

// provide a function to just return the project count
function getProjectCount(callback) {
  blockstarter.project_count((err, result) => {
    // we always have to work with callbacks with blockchain calls (or promises)
    callback(result.c[0])
  })
}


// return the address of project #x
function getProjectAddressAtIndex(index, callback) {
  // TODO
  blockstarter.project_address_at(index, (err, result) => {
  	if (err) {
  		callback(err)
  	} else {
  		callback(null, result)
  	}
 	
  })
}



/*function getAllProjectAddresses(callback){
	
  for (int i ... < 
	
	}*/
/*
function getAllProjectStatus(address,callback){

	

}*/

/*
function getProjectStatusForAddress(){


}*/




// export all the methods that should be provided to express
module.exports = {
  getProjectCount,
  getProjectAddressAtIndex,
  getAllProjectAddresses,
 /* getProjectStatusForAddress,
  getAllProjectStatus*/
  // TODO add other methods like 'getProjectStatus', ...
}


// just for testing, has to removed afterwards
 getProjectCount(number => console.log(`${number} projects available`));
 getProjectAddressAtIndex(0, (err, address) => console.log(`project address at 1 : ${address}`))
 getAllProjectAddresses(0, (err,project_owner) => console.log('{project_owner}'))