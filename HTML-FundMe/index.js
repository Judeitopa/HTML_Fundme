import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./Constants.js"
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")

const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if(typeof window.ethereum == "undefined"){
      connectButton.innerHTML = "Please install metamask!"
    } else {
      await window.ethereum.request({method: "eth_requestAccounts"})
      connectButton.innerHTML= "Connected Successfully!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined"){
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

//fund function
async function fund(){
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}`);
    if (typeof window.ethereum !== "undefined"){
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner() //this gets the address of the account connected from metamask
        const contract = new ethers.Contract(contractAddress, abi, signer)
       try{
        //Now, making transactions
        const transactionResponse = await contract.fund({
            value: ethers.utils.parseEther(ethAmount),
        })
        //wait for transaction to finish
        await listenForTransactionMine(transactionResponse, provider)
        console.log("Done!")
       } catch (error) {
        console.log(error)   
    }
    }    
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    //listen for this transaction to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(`Completed with ${transactionReceipt.confirmations} confirmations`)
            resolve()
        })
    })
}

async function withdraw() {
    const withdrawAmount = document.getElementById("withdrawAmount").value
  console.log(`withdrawing ${withdrawAmount}`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
        
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
      // await transactionResponse.wait(1)
    } catch (error) {
      console.log(error)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}
