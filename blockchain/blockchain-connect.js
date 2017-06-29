const Web3 = require('web3')
const config = require('./blockstarterData')

// initializing the web3
const web3 = new Web3(new Web3.providers.HttpProvider(config.networkAddress))
const blockstarter = web3.eth.contract(config.abi.blockstarter).at(config.blockstarter.address)

// provide a function to just return the project count
function getProjectCount() {
  return new Promise((resolve, reject) => {
    blockstarter.project_count((err, result) => {
      if (err) reject(err)
      else resolve(result.c[0])
    })
  })
}

function getProjectAddressAtIndex(index) {
  return new Promise((resolve, reject) => {
    blockstarter.project_address_at(index, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

function range(size) {
  return Array.from(new Array(size), (x,i) => i)
}

function getAllAddresses() {
  return getProjectCount()
    .then(number => range(number))
    .then(array => Promise.all(array.map(x => getProjectAddressAtIndex(x))))
}

function getProjectStatusForAddress(address) {
  const project = web3.eth.contract(config.abi.project).at(address)

  return new Promise((resolve, reject) => {
    project.status((err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          address,
          owner: result[0],
          title: result[1],
          description: result[2],
          stage: result[3],
          currentFunding: result[4].c[0],
          fundingGoal: result[5].c[0],
          fundingGoalReached: result[6]
        })
      }
    })
  })
}


function getAllStatus() {
  return getAllAddresses()
    .then(addresses => {
      const map = addresses.map(a => getProjectStatusForAddress(a))
      return Promise.all(map)
    })
}

function getAllFundedStatus(funder) {
  return getAllProjectsForFunder(funder)
    .then(addresses => {
      const map = addresses.map(a => getProjectStatusForAddress(a))
      return Promise.all(map)
    })
}

function getAllOwnedStatus(owner) {
  return getAllStatus()
    .then(projects => projects.filter(projects.owner === owner))
}

//Invest in a project - unsigned transaction
function investInProject(projectAddress, backer, amount) {
  return new Promise((resolve, reject) => {
    const project = web3.eth.contract(config.abi.project).at(projectAddress)
    project.invest.sendTransaction(
      {value:amount, gas:210000, from: backer},
      (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
  })
}

function createProject(creator, title, description, fundingGoal) {
  return new Promise((resolve, reject) => {
    web3.eth.contract(config.abi.project).new(title, description, fundingGoal, {
      from: creator,
      data: config.bytecode.project,
      gas: 2100000
    }, (err, contract) => {
      if (err) {
        reject(err)
      } else {
        if (contract.address) {
          // register in global contract
          registerProject(contract.address, creator)
            .then(() => resolve(contract.address))
            .catch(reject)
        }
      }
    })
  })
}

function registerProject(address, creator) {
  return new Promise((resolve, reject) => {
    blockstarter.add_project(address, {from: creator, gas: 210000}, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

function isFunderInProject(funder, projectAddress) {
  return new Promise((resolve, reject) => {
    const project = web3.eth.contract(config.abi.project).at(projectAddress)
    project.is_funder(funder, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

function getAllProjectsForFunder(funder) {
  return getAllAddresses()
    .then(array => {
      const promises = array.map(pAdd => isFunderInProject(funder, pAdd))
      return Promise.all(promises)
        .then(funderBools => {
          return array.filter(pAdd => funderBools[array.indexOf(pAdd)])
        })
    })
}

// export all the methods that should be provided to express
module.exports = {
  getProjectCount,
  getProjectAddressAtIndex,
  getAllAddresses,
  getAllStatus,
  getAllFundedStatus,
  getAllOwnedStatus,
  getProjectStatusForAddress,
  getAllProjectsForFunder,
  investInProject,
  createProject
}

// just for testing, has to removed afterwards
// createProject(config.accounts[4], 'TestProject', 'This is just a test', 359324)

// getAllFundedStatus(config.accounts[9])
//   .then(console.log)


