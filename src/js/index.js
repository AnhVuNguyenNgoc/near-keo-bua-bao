import 'regenerator-runtime/runtime'
import { initContract, login, logout } from './walletaction'
import getConfig from '../config'

const { networkId } = getConfig(process.env.NODE_ENV || 'development')
const submitButton = document.querySelector('form button')

document.querySelector('form').onsubmit = async (event) => {
    event.preventDefault()

    const { toAccount, title, content } = event.target.elements

    submitButton.disabled = true

    console.log(" event.target.elements ", event.target.elements)
    await sendMessage(toAccount.value, title.value, content.value);
    resetNewMsgBox();

    await fetchMessages();

    // show notification
    document.querySelector('[data-behavior=notification]').style.display = 'block'
    setTimeout(() => {
        document.querySelector('[data-behavior=notification]').style.display = 'none'
    }, 11000)
}

function checkSubmitButton() {
    let value1 = document.querySelector('input#toAccount').value;
    let value2 = document.querySelector('input#title').value;
    let value3 = document.querySelector('input#content').value;

    console.log("anhvu value1 ", value1)
    console.log("anhvu value2 ", value2)
    console.log("anhvu value3 ", value3)
    if (value1 && value2 && value3) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}
document.querySelector('input#toAccount').oninput = (event) => { checkSubmitButton(); }
document.querySelector('input#title').oninput = (event) => { checkSubmitButton(); }
document.querySelector('input#content').oninput = (event) => { checkSubmitButton(); }

function showHideNewMsg() {
    let obj = document.querySelector('#btnShowHideNewMsg');
    let msgBoard = document.querySelector('#newMsgBoard');
    if (msgBoard.style.display == "none") {
        msgBoard.style.display = "block";
        obj.innerHTML = "&#9195;";
    } else {
        msgBoard.style.display = "none";
        obj.innerHTML = "&#9196;";
    }
}
// Handle user action events
document.querySelector('#sign-in-button').onclick = login;
document.querySelector('#sign-out-button').onclick = logout;
document.querySelector('#btnShowHideNewMsg').onclick = showHideNewMsg;

// Display the signed-out-flow container
function signedOutFlow() {
    document.querySelector('#signed-out-flow').style.display = 'block'
}

function signedInFlow() {
    document.querySelector('#signed-in-flow').style.display = 'block'
    document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
        el.innerText = window.accountId
    })
    populateLinkToNotiBox()
    fetchMessages()

    console.log("signedInFlow")
}

async function fetchMessages() {
    // Fetch sent messages and show messages to UI
    let viewMsgNum = 5;
    let sentMsgNum = await contract.getSentMsgNum({
        accountId: window.accountId
    });
    let sentMessages = await contract.getSentMessages({
        accountId: window.accountId,
        fromIndex: sentMsgNum - viewMsgNum,
        toIndex: sentMsgNum - 1
    });
    console.log("Sent:", sentMsgNum, sentMessages);
    showSentMessages(sentMsgNum, sentMessages);

    // Fetch inbox messages and show messages to UI
    let inboxMsgNum = await contract.getInboxMsgNum({
        accountId: window.accountId
    });
    let inboxMessages = await contract.getInboxMessages({
        accountId: window.accountId,
        fromIndex: inboxMsgNum - viewMsgNum,
        toIndex: inboxMsgNum - 1
    });
    console.log("Inbox:", inboxMsgNum, inboxMessages);
    showInboxMessages(inboxMsgNum, inboxMessages);
}

function showSentMessages(sentMsgNum, sentMessages) {
    document.querySelector('#sentInfo').innerHTML = `(${sentMessages.length}/${sentMsgNum})`;
    let html = "";
    sortMessages(sentMessages);
    for (let idx = 0; idx < sentMessages.length; idx++) {
        let msg = sentMessages[idx];
        let itemHtml = `<div id="sentMsg-${idx}" class="msgItem${idx % 2}">`;
        itemHtml += `<b>To:</b> ${msg.to}`;
        itemHtml += `<br /><b>Time:</b> ${(new Date(msg.timestamp / 10 ** 6)).toLocaleString()}`;
        itemHtml += `<br /><b>Title:</b> ${msg.title}`;
        itemHtml += `<br /><b>Content:</b>`;
        itemHtml += `<br />${msg.content}`;
        itemHtml += "</div>";
        html += itemHtml;
    }
    document.querySelector('#sentMessages').innerHTML = html;
}

function showInboxMessages(inboxMsgNum, inboxMessages) {
    document.querySelector('#inboxInfo').innerHTML = `(${inboxMessages.length}/${inboxMsgNum})`;
    let html = "";
    sortMessages(inboxMessages);
    for (let idx = 0; idx < inboxMessages.length; idx++) {
        let msg = inboxMessages[idx];
        let itemHtml = `<div id="inboxMsg-${idx}" class="msgItem${idx % 2}">`;
        itemHtml += `<b>From:</b> ${msg.from}`;
        itemHtml += `<br /><b>Time:</b> ${(new Date(msg.timestamp / 10 ** 6)).toLocaleString()}`;
        itemHtml += `<br /><b>Title:</b> ${msg.title}`;
        itemHtml += `<br /><b>Content:</b>`;
        itemHtml += `<br />${msg.content}`;
        itemHtml += "</div>";
        html += itemHtml;
    }
    document.querySelector('#inboxMessages').innerHTML = html;
}

function populateLinkToNotiBox() {
    const accountLink = document.querySelector('[data-behavior=notification] a:nth-of-type(1)')
    accountLink.href = accountLink.href + window.accountId
    accountLink.innerText = '@' + window.accountId
    const contractLink = document.querySelector('[data-behavior=notification] a:nth-of-type(2)')
    contractLink.href = contractLink.href + window.contract.contractId
    contractLink.innerText = '@' + window.contract.contractId

    // update with selected networkId
    accountLink.href = accountLink.href.replace('testnet', networkId)
    contractLink.href = contractLink.href.replace('testnet', networkId)
}


function resetNewMsgBox() {
    document.querySelector('input#toAccount').value = "";
    document.querySelector('input#title').value = "";
    document.querySelector('input#content').value = "";
    submitButton.disabled = false;
}

async function sendMessage(toAccount, title, content) {
    await contract.sendMessage({
        to: toAccount,
        title: title,
        content: content
    });
}


// Sort messages so that recent messages show first
function sortMessages(messages) {
    if (!messages) return;

    messages.sort(function(item1, item2) {
        return item2.timestamp - item1.timestamp;
    });
}

// Show sent messages on UI
function showSentMessages(sentMsgNum, sentMessages) {
    document.querySelector('#sentInfo').innerHTML = `(${sentMessages.length}/${sentMsgNum})`;
    let html = "";
    sortMessages(sentMessages);
    for (let idx=0; idx<sentMessages.length; idx++) {
        let msg = sentMessages[idx];
        let itemHtml = `<div id="sentMsg-${idx}" class="msgItem${idx%2}">`;
        itemHtml += `<b>To:</b> ${msg.to}`;
        itemHtml += `<br /><b>Time:</b> ${(new Date(msg.timestamp/10**6)).toLocaleString()}`;
        itemHtml += `<br /><b>Title:</b> ${msg.title}`;
        itemHtml += `<br /><b>Content:</b>`;
        itemHtml += `<br />${msg.content}`;
        itemHtml += "</div>";
        html += itemHtml;
    }
    document.querySelector('#sentMessages').innerHTML = html;
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
