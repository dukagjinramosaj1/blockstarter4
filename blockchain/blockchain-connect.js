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
          fundingGoalReached: result[6],
          poll: result[7],
          proPoll: result[8].c[0],
          contraPoll: result[9].c[0]
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
  console.log('getAllFundedStatus', funder)
  return getAllProjectsForFunder(funder)
    .then(addresses => {
      const map = addresses.map(a => {
        const commonStatusPromise = getProjectStatusForAddress(a)
        const tokenPromise = getTokenForProjectForUser(a, funder)
        return Promise.all([commonStatusPromise, tokenPromise])
      })
      return Promise.all(map)
        .then(statusTokenPairs => {
          return statusTokenPairs.map(pair => {
            const status = pair[0]
            const token = pair[1]
            status.token = token
            return status
          })
        })
    })
}

function getAllOwnedStatus(owner) {
  return getAllStatus()
    .then(projects => projects.filter(p => p.owner === owner))
}

//Invest in a project - unsigned transaction
function investInProject(projectAddress, backer, amount) {
  return new Promise((resolve, reject) => {
    const project = web3.eth.contract(config.abi.project).at(projectAddress)
    project.invest.sendTransaction(
      {value:amount, gas:2100000, from: backer},
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
    blockstarter.create_project(title, description, fundingGoal, {
      from: creator,
      gas: 2100000
    }, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function isFunderInProject(funder, projectAddress) {
  console.log('is funder', funder, projectAddress)
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

function cancelAndRefundProject(projectAddress, owner) {
  return new Promise((resolve, reject) => {
    const project = web3.eth.contract(config.abi.project).at(projectAddress)
    project.kill({from: owner, gas: 210000}, (err) => {
      if (err) {
        reject(err)
      } else {
        blockstarter.remove_project(projectAddress, {from: owner, gas: 210000}, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      }
    })
  })
}

function endFunding(projectAddress, owner) {
  return new Promise((resolve, reject) => {
    const project = web3.eth.contract(config.abi.project).at(projectAddress)
    project.endFunding({from: owner, gas: 210000}, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function startPoll(projectAddress, owner, poll) {
  return new Promise((resolve, reject) => {
    const project = web3.eth.contract(config.abi.project).at(projectAddress)
    console.log('start poll', poll)
    project.start_poll(poll, {from: owner, gas: 210000}, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function votePoll(projectAddress, voter, vote) {
  return new Promise((resolve, reject) => {
    const project = web3.eth.contract(config.abi.project).at(projectAddress)
    project.vote_poll(vote, {from: voter, gas: 210000}, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function transferToken(projectAddress, sender, receiver, amount) {
  return new Promise((resolve, reject) => {
    const project = web3.eth.contract(config.abi.project).at(projectAddress)
    project.transfer_token(receiver, amount, {from: sender, gas: 210000}, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function getTokenForProjectForUser(projectAddress, user) {
  return new Promise((resolve, reject) => {
    const project = web3.eth.contract(config.abi.project).at(projectAddress)
    project.get_token({from: user, gas: 210000}, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result.c[0])
      }
    })
  })
}

// export all the methods that should be provided to express
module.exports = {
  getProjectCount,
  getAllStatus,
  getAllFundedStatus,
  getAllOwnedStatus,
  getProjectStatusForAddress,
  investInProject,
  createProject,
  endFunding,
  cancelAndRefundProject,
  startPoll,
  transferToken,
  votePoll,
  getTokenForProjectForUser
}
