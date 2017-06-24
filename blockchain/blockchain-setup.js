const solc = require('solc')
const fs = require('fs')
const TestRPC = require('ethereumjs-testrpc')
const Web3 = require('web3')


const port = 8545

const contractSource = fs.readFileSync('./contracts.sol')

console.log('-- compile contract --')
const compiled = solc.compile(contractSource.toString())
const blockstarterAbi = JSON.parse(compiled.contracts[':Blockstarter'].interface)
const blockstarterBytecode = compiled.contracts[':Blockstarter'].bytecode

let web3 = undefined
let creatorAddress = undefined

const testProjects = [
  { name: "Project X", description: "The Project of the projects", fundingGoal: 300 }
]


const server = TestRPC.server();
server.listen(port, testRPCCallback, createBlockstarter)

function testRPCCallback(err, blockchain, next) {
	if (err) {
		console.error('could not start testrpc')
		console.error(err)
	} else {
    console.log('-- start testrpc - addresses --')
    Object.keys(blockchain.unlocked_accounts).forEach(key => {
      const acc = blockchain.unlocked_accounts[key]
      if (!creatorAddress) creatorAddress = acc.address
      console.log(`  ${acc.address}`)
    })
    console.log('-- connect to blockchain --')
    web3 = new Web3(new Web3.providers.HttpProvider(`http://localhost:${port}`))
    next(web3, creatorAddress, createDummyData)
	}
}

function createBlockstarter(web3, creatorAddress, next) {
  console.log('-- create blockstarter contract --')
  const contract = web3.eth.contract(blockstarterAbi).new({
    from: creatorAddress,
    data: blockstarterBytecode,
    gas: 2100000
  }, (err, contract) => {
    if (err) {
      console.error('could not create blockstarter contract')
    } else {
      if (!contract.address) {
        console.log('  hash:', contract.transactionHash)
      } else {
        console.log(`  contract address: ${contract.address}
  address of owner: ${creatorAddress}`)
        next(contract.address)
      }
    }
  })
}

function createDummyData(contractAddress) {
  console.log(`-- connect to blockstarter contract ${contractAddress} --`)
  const blockstarter = web3.eth.contract(blockstarterAbi).at(`${contractAddress}`)
  console.log(`-- get number of projects deployed --`)
  // const numOfProjects = blockstarter.project_count.call()
  // console.log(`${numOfProjects} projects deployed`)
  console.log('-- create test projects --')
  testProjects.forEach(p => {
    blockstarter.createProject(p.name, p.description, p.fundingGoal, { gas: 2000 })
  })
  console.log('-- created dummy data --')
}

