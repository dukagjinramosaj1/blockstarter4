console.log('-- init --')

const solc = require('solc')
const fs = require('fs')
const path = require('path')
const TestRPC = require('ethereumjs-testrpc')
const Web3 = require('web3')


const port = 8545
const networkAddress = `http://localhost:${port}`

const data = {
  blockstarter: {
    creator: undefined
  },
  project: {},
  testProjects: [
    {
      title: "Project X",
      description: "The Project of the projects",
      fundingGoal: 300
    },
    {
      title: "Fund my Mom",
      description: "My Mom is broke and needs money",
      fundingGoal: 6000
    }
  ],
  web3: undefined,
  accounts: [],
}



// program startup
compileContract(data)
  .then(data => createServer(data))
  .then(data => createBlockstarter(data))
  .then(data => createDummyData(data))
  .then(data => createConfig(data))
  .then(() => console.log('-- startup done--'))
  .catch(console.error)

function compileContract(data) {
  return new Promise((resolve, reject) => {
    const contractSource = fs.readFileSync(path.join(__dirname, 'contracts.sol'))

    console.log('-- compile contract --')
    const compiled = solc.compile(contractSource.toString())
    data.blockstarter.abi = JSON.parse(compiled.contracts[':Blockstarter'].interface)
    data.blockstarter.bytecode = compiled.contracts[':Blockstarter'].bytecode
    data.project.abi = JSON.parse(compiled.contracts[':Project'].interface)
    data.project.bytecode = compiled.contracts[':Project'].bytecode
    console.log(compiled)
    resolve(data)
  })
}

function createServer(data) {
  return new Promise((resolve, reject) => {
    TestRPC.server().listen(port, (err, blockchain) => {
      if (err) {
        console.error('could not start testrpc')
        reject(err)
      } else {
        console.log('-- start testrpc - addresses --')
        Object.keys(blockchain.unlocked_accounts).forEach(key => {
          const acc = blockchain.unlocked_accounts[key]
          console.log(`  ${acc.address}${data.blockstarter.creator ? '' : ' (blockstarter owner)'}`)
          if (!data.blockstarter.creator) data.blockstarter.creator = acc.address
          data.accounts.push(acc.address)
        })
        resolve(data)
      }
    })
  })
}

function createBlockstarter(data) {
  return new Promise((resolve, reject) => {
    data.web3 = new Web3(new Web3.providers.HttpProvider(networkAddress))
    console.log('-- create blockstarter contract --')
    const contract = data.web3.eth.contract(data.blockstarter.abi).new({
      from: data.blockstarter.creator,
      data: data.blockstarter.bytecode,
      gas: 2100000
    }, (err, contract) => {
      if (err) {
        console.error('could not create blockstarter contract')
        reject(err)
      } else {
        if (contract.address) {
          console.log(`  contract address: ${contract.address}`)
          data.blockstarter.address = contract.address
          data.blockstarter.contract = contract
          resolve(data)
        }
      }
    })
  })
}

function createDummyData(data) {
  return new Promise((resolve, reject) => {
    const blockstarter = data.blockstarter.contract
    console.log('-- create test projects --')
    projectsCreated = 0
    data.testProjects.forEach(p => {
      createProject(data, p, (project, creator) => {
        blockstarter.add_project(project, {from: creator, gas: 2100000}, () => {
          p.address = project
          projectsCreated++
          if (projectsCreated === data.testProjects.length) {
            resolve(data)
          }
        })
      })
    })
  })
}

function createProject(data, project, next) {
  const randomInt = Math.floor((Math.random() * data.accounts.length))
  const projectContract = data.web3.eth.contract(data.project.abi).new(project.title, project.description, project.fundingGoal, {
    from: data.accounts[randomInt],
    data: data.project.bytecode,
    gas: 2100000
  }, (err, contract) => {
    if (err) {
      console.error('could not create project contract')
    } else {
      if (contract.address) {
        // TODO do dummy transactions at initializing
        next(contract.address, data.accounts[randomInt])
      }
    }
  })
}

function createConfig(data) {
  return new Promise((resolve, reject) => {
    const writeData = {
      networkAddress,
      blockstarter: {
        address: data.blockstarter.address
      },
      abi: {
        blockstarter: data.blockstarter.abi,
        project: data.project.abi
      },
      bytecode: {
        project: data.project.bytecode
      },
      accounts: data.accounts,
    }
    fs.writeFileSync(path.join(__dirname, 'blockstarterData.json'), JSON.stringify(writeData))
    data.blockstarter.contract.project_count((err, result) => {
      console.log(`    ${result.c[0]} projects deployed successfully`)
      resolve()
    })
  })
}

