import 'regenerator-runtime/runtime'
import { initContract, login } from './action'

import getConfig from '../config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

// document.querySelector('form').onsubmit = async (event) => {
//     event.preventDefault()
// }

// Listen for user input events

// Handle user action events
document.querySelector('#sign-in-button').onclick = login;


// Display the signed-out-flow container
function signedOutFlow() {
    document.querySelector('#signed-out-flow').style.display = 'block'
}

function signedInFlow() {
    document.querySelector('#signed-in-flow').style.display = 'block'

    console.log("signedInFlow")
    // document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
    //     el.innerText = window.accountId
    // })

    // // populate links in the notification box
    // const accountLink = document.querySelector('[data-behavior=notification] a:nth-of-type(1)')
    // accountLink.href = accountLink.href + window.accountId
    // accountLink.innerText = '@' + window.accountId
    // const contractLink = document.querySelector('[data-behavior=notification] a:nth-of-type(2)')
    // contractLink.href = contractLink.href + window.contract.contractId
    // contractLink.innerText = '@' + window.contract.contractId

    // // update with selected networkId
    // accountLink.href = accountLink.href.replace('testnet', networkId)
    // contractLink.href = contractLink.href.replace('testnet', networkId)

    // fetchMessages()
}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
    .then(() => {
        console.log("initContract !!!")

        if (window.walletConnection.isSignedIn()) {
            console.log("signedInFlow !!!")
            signedInFlow()
        }
        else {
            console.log("signedOutFlow !!!")
            signedOutFlow()
        }
    })
    .catch(console.error)
