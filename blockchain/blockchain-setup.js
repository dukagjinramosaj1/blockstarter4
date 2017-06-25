console.log('-- init --')

const solc = require('solc')
const fs = require('fs')
const path = require('path')
const TestRPC = require('ethereumjs-testrpc')
const Web3 = require('web3')


const port = 8545

const contractSource = fs.readFileSync('./contracts.sol')

console.log('-- compile contract --')
const compiled = solc.compile(contractSource.toString())

const data = {
  blockstarter: {
    abi: JSON.parse(compiled.contracts[':Blockstarter'].interface),
    bytecode: compiled.contracts[':Blockstarter'].bytecode,
    creator: undefined
  },
  project: {
    abi: JSON.parse(compiled.contracts[':Project'].interface),
    bytecode: compiled.contracts[':Project'].bytecode
  },
  testProjects: [
    {
      name: "Project X",
      description: "The Project of the projects",
      fundingGoal: 300
    },
    {
      name: "Fund my Mom",
      description: "My Mom is broke and needs money",
      fundingGoal: 6000
    }
  ],
  web3: undefined,
  accounts: [],
}


const server = TestRPC.server();
server.listen(port, testRPCCallback)

function testRPCCallback(err, blockchain) {
	if (err) {
		console.error('could not start testrpc')
		console.error(err)
	} else {
    console.log('-- start testrpc - addresses --')
    Object.keys(blockchain.unlocked_accounts).forEach(key => {
      const acc = blockchain.unlocked_accounts[key]
      console.log(`  ${acc.address}${data.blockstarter.creator ? '' : ' (blockstarter owner)'}`)
      if (!data.blockstarter.creator) data.blockstarter.creator = acc.address
      data.accounts.push(acc.address)
    })
    createBlockstarter(data)
	}
}

function createBlockstarter(data) {
  data.web3 = new Web3(new Web3.providers.HttpProvider(`http://localhost:${port}`))
  console.log('-- create blockstarter contract --')
  const contract = data.web3.eth.contract(data.blockstarter.abi).new({
    from: data.blockstarter.creator,
    data: data.blockstarter.bytecode,
    gas: 2100000
  }, (err, contract) => {
    if (err) {
      console.error('could not create blockstarter contract')
    } else {
      if (!contract.address) {
        console.log('  hash:', contract.transactionHash)
      } else {
        console.log(`  contract address: ${contract.address}`)
        data.blockstarter.address = contract.address
        data.blockstarter.contract = contract
        createDummyData(data)
      }
    }
  })
}

function createDummyData(data) {
  const blockstarter = data.blockstarter.contract
  console.log('-- create test projects --')
  projectsCreated = 0
  data.testProjects.forEach(p => {
    createProject(data, p, (project, creator) => {
      blockstarter.add_project(project, {from: creator, gas: 2100000}, () => {
        p.address = project
        projectsCreated++
        if (projectsCreated === data.testProjects.length) {
          ready(data)
        }
      })
    })
  })
}

function createProject(data, project, next) {
  const randomInt = Math.floor((Math.random() * data.accounts.length))
  const projectContract = data.web3.eth.contract(data.project.abi).new({
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

function ready(data) {
  const writeData = {
    blockstarter: {
      address: data.blockstarter.address
    },
    abi: {
      blockstarter: data.blockstarter.abi,
      project: data.project.abi
    },
    accounts: data.accounts,
  }
  fs.writeFileSync(path.join(__dirname, 'blockstarterData.json'), JSON.stringify(writeData))
  data.blockstarter.contract.project_count((err, result) => {
    console.log(`${result.c[0]} projects deployed successfully`)
  })
}

// const blockstarter = data.web3.eth.contract(data.blockstarter.abi).at(`${data.blockstarter.address}`)
