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

function getAllAddresses(callback) {
  getProjectCount(number => {
    const array = new Array(number)
    const recursion = function(i, array) {
      getProjectAddressAtIndex(i, (err, address) => {
        array[i] = address
        if (i + 1 == number) {
          callback(null, array)
        } else {
          recursion(i + 1, array)
        }
      })
    }
    recursion(0, array)
  })
}

function getProjectStatusForAddress(address, callback) {
  const project = web3.eth.contract(config.abi.project).at(address)
  project.status((err, result) => {
  	if (err) {
  		callback(err)
  	} else {
      const status = {
        address,
        owner: result[0],
        title: result[1],
        description: result[2],
        stage: result[3],
        currentFunding: result[4].c[0],
        fundingGoal: result[5].c[0],
        fundingGoalReached: result[6]
      }
  		callback(null, status)
  	}
  })
}

function getAllStatus(callback) {
  getAllAddresses((err, addressArray) => {
    const array = []
    const recursion = function(i, array) {
      getProjectStatusForAddress(addressArray[i], (err, status) => {
        array.push(status)
        if (i + 1 == addressArray.length) {
          callback(null, array)
        } else {
          recursion(i + 1, array)
        }
      })
    }
    recursion(0, array)
  })
}

//Invest in a project
function investInProject(projectAddress, backer, amount, callback ) {
    const project = web3.eth.contract(config.abi.project).at(projectAddress)
    project.invest.sendTransaction({value:amount, gas:210000, from: backer}, (err, result) => {
        if (err) {
            callback(err)
        } else {
            callback(null, result)
        }
    })
}


// export all the methods that should be provided to express
module.exports = {
  getProjectCount,
  getProjectAddressAtIndex,
  getAllAddresses,
  getProjectStatusForAddress,
  getAllStatus
}

// just for testing, has to removed afterwards
getProjectAddressAtIndex(0, (err, pAddress) => {
    investInProject(pAddress, '0x52577834ee6ce0d6a3e1aac3b7c5ba08a3a7790e', 500, (err, result) => {
        if (err) console.log('err', err)
        getAllStatus((err, array) => array.forEach(x => console.log('status', x)))
    })
})

