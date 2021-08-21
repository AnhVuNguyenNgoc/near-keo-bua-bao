import { connect, Contract, keyStores, WalletConnection } from 'near-api-js'
import getConfig from '../config'

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

export async function initContract() {
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))

  window.walletConnection = new WalletConnection(near)
  window.accountId = window.walletConnection.getAccountId()
  window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
    viewMethods: [ 'getSentMsgNum', 'getSentMessages', 'getInboxMsgNum', 'getInboxMessages' ],
    changeMethods: ['sendMessage'],
  })
  console.log("window: accountId", window.accountId)
  console.log("window: contract", window.contract)
  console.log("window: walletConnection", window.walletConnection)
}

export function login() {
  window.walletConnection.requestSignIn(nearConfig.contractName)
}

export function logout() {
  window.walletConnection.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}
