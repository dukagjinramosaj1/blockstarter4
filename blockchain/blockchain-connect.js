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
  return getAllProjectsForFunder(funder)
    .then(addresses => {
      const map = addresses.map(a => getProjectStatusForAddress(a))
      return Promise.all(map)
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


function tradeProjectShares(projectAddress,_from, _to,_amount) {
  return new Promise((resolve, reject) => {
    const project = web3.eth.contract(config.abi.project).at(projectAddress)
    project.tradeShares(_from).sendTransaction(
      {value:_amount, gas:2100000, from: _to},
      (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
  })
}

function approveTrade(projectAddress,_from, _to,_amount) {
    return new Promise((resolve, reject) => {
        const project = web3.eth.contract(config.abi.project).at(projectAddress)
        project.approveTrade(_to,_amount).sendTransaction(
            {value:_amount, gas:2100000, from: _from},
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

function getTokenForProject(projectAddress, funder) {
  return new Promise((resolve, reject) => {
    const project = web3.eth.contract(config.abi.project).at(projectAddress)
    project.getToken(funder, ((err, tokenAddress) => {
      if (err) {
        reject(err)
      } else {
        config.abi.token.at(tokenAddress).value((err, tokenValue) => {
          if (err) {
            reject(err)
          } else {
            resolve(tokenValue)
          }
        })
      }
    }))
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
  votePoll,
  tradeProjectShares
}

// just for testing, has to removed afterwards
// createProject(config.accounts[4], 'TestProject', 'This is just a test', 359324)

// getProjectAddressAtIndex(0)
//   .then(proj => investInProject(proj, config.accounts[0], 400))

// getProjectAddressAtIndex(0)
// .then(p => endFunding(p, '0x0dc840a6e0f780348647c79a4c0ac8aadf3efdd4'))

// getProjectAddressAtIndex(0)
//   .then(p => withdraw(p, '0x0dc840a6e0f780348647c79a4c0ac8aadf3efdd4', 199))

// getAllStatus().then(console.log).catch(console.error)
// cancelAndRefundProject('0x13d12a8668eff2d95bc231978cad1f16ba1b7fd1', '0x4c5cda45cbd0b5abbae84c4d77bfa5a246aa9150').catch(console.error)
