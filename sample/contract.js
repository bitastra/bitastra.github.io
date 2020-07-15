const forwarderOrigin = 'http://localhost:9010'
const casinoABI = [{"constant":false,"inputs":[{"name":"_addr","type":"address"}],"name":"addCitizen","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"}],"name":"addSenator","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"}],"name":"delCitizen","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"}],"name":"delSenator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_length","type":"uint256"},{"name":"_seed","type":"uint256"}],"name":"getRandInt","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_seed","type":"uint256"}],"name":"getRandom","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_target","type":"uint256"}],"name":"roll","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"t","type":"uint256"},{"indexed":true,"name":"addr","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"GTE","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"addr","type":"address"},{"indexed":false,"name":"counter","type":"uint256"},{"indexed":false,"name":"blockNumber","type":"uint256"},{"indexed":false,"name":"lastRandom","type":"bytes32"}],"name":"UpdateRandom","type":"event"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"allMembers","outputs":[{"name":"miner","type":"address"},{"name":"official","type":"bool"},{"name":"pledge","type":"uint256"},{"name":"update","type":"uint256"},{"name":"random","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"chipToken","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"citizens","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"counter","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_addr","type":"address"}],"name":"isROExist","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRandom","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minPledge","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"senators","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"updateNum","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]
const casinoAddress = '0x4c3f06B24b5126A1Db69813a67e26E4a531583D2'

const isMetaMaskInstalled = () => {
  return Boolean(window.ethereum && window.ethereum.isMetaMask)
}
//Dapp Status Section
const networkDiv = document.getElementById('network')
const accountsDiv = document.getElementById('accounts')

//Basic Actions Section
const onboardButton = document.getElementById('connectButton')
const getAccountsButton = document.getElementById('getAccounts')
const getAccountsResults = document.getElementById('getAccountsResult')

//Contract Section
const numberInput = document.getElementById('numberInput')
const amountInput = document.getElementById('amountInput')
const rollButton = document.getElementById('rollButton')
const contractStatus = document.getElementById('contractStatus')
const tokenAddress = document.getElementById('tokenAddress')

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const initialize = () => {

  let onboarding
  try {
    onboarding = new MetamaskOnboarding({ forwarderOrigin })
  } catch (error) {
    console.error(error)
  }
  let accounts
  let piggybankContract
  let accountButtonsInitialized = false

  const accountButtons = [
    rollButton,
  ]

  const isMetaMaskConnected = () => accounts && accounts.length > 0

  const onClickConnect = async () => {
    try {
      await ethereum.enable()
    } catch (error) {
      console.error(error)
    }
  }

  const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress'
    onboardButton.disabled = true
    onboarding.startOnboarding()
  }

  const updateButtons = () => {
    const accountButtonsDisabled = !isMetaMaskInstalled() || !isMetaMaskConnected()
    if (accountButtonsDisabled) {
      for (const button of accountButtons) {
        button.disabled = true
      }
    } else {
      rollButton.disabled = false
    }

    if (!isMetaMaskInstalled()) {
      onboardButton.innerText = 'Click here to install MetaMask!'
      onboardButton.onclick = onClickInstall
      onboardButton.disabled = false
    } else if (isMetaMaskConnected()) {
      onboardButton.innerText = 'Connected'
      onboardButton.disabled = true
      if (onboarding) {
        onboarding.stopOnboarding()
      }
    } else {
      onboardButton.innerText = 'Connect'
      onboardButton.onclick = onClickConnect
      onboardButton.disabled = false
    }
  }

  const initializeAccountButtons = () => {

    if (accountButtonsInitialized) {
      return
    }
    accountButtonsInitialized = true

    casinoContract = web3.eth.contract(casinoABI)
    contract = casinoContract.at(casinoAddress)

    tokenAddress.innerHTML = contract.address
    contractStatus.innerHTML = 'Deployed'

    rollButton.onclick = async () => {
      contractStatus.innerHTML = 'Number : ' + web3.toHex(numberInput.value) + " Amount : " + web3.toWei(amountInput.value)
      const roll = await contract.roll(
        web3.toHex(numberInput.value),
        {
          from: accounts[0],
          value: web3.toWei(amountInput.value),
        },
        async (err, txHash) => {
          if (err != null) {
            console.log(err)
            return
          }
          var receiptStatus = false
          for (i=0;i<100;i++) {
            await sleep(1000)
            web3.eth.getTransactionReceipt(txHash, (err, receipt) =>{
              if (receipt != null && receipt.status == true) {
                receiptStatus = true
              }
            })
            if (receiptStatus) {
              await web3.eth.getBlockNumber(async (err, number) => {
                await contract.GTE({fromBlock:number}, (err, e) => {
                  console.log("events", e)
                    if (e.args.t == 1) {
                      contractStatus.innerHTML = 'You Win!!! ' + e.args.amount
                    } else {
                      contractStatus.innerHTML = 'Sorry You Lose ;-('
                    }
                })
              })
              break
            }
          }
          if (!receiptStatus){
            contractStatus.innerHTML = 'Roll unknown'
          }
        },
      )
      console.log(roll)
    }

    getAccountsButton.onclick = () => {
      ethereum.sendAsync({ method: 'eth_accounts' }, (error, response) => {
        if (error) {
          console.error(error)
          getAccountsResults.innerHTML = `Error: ${error}`
        } else {
          getAccountsResults.innerHTML = response.result[0] || 'Not able to get accounts'
        }
      })
    }
  }

  const handleNewAccounts = (newAccounts) => {
    accounts = newAccounts
    accountsDiv.innerHTML = accounts
    if (isMetaMaskConnected()) {
      initializeAccountButtons()
    }
    updateButtons()
  }

  const handleNewNetwork = (networkId) => {
    networkDiv.innerHTML = networkId
  }

  const getNetworkId = () => {
    ethereum.sendAsync({ method: 'net_version' }, (err, response) => {
      if (err) {
        console.error(err)
      } else {
        handleNewNetwork(response.result)
      }
    })
  }

  updateButtons()

  if (isMetaMaskInstalled()) {
    ethereum.autoRefreshOnNetworkChange = false
    getNetworkId()
    ethereum.on('networkChanged', handleNewNetwork)
    ethereum.on('accountsChanged', handleNewAccounts)
  }
}
window.addEventListener('DOMContentLoaded', initialize)
