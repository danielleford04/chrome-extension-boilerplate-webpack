const generateAltTagButton = document.body.querySelector('#generate-alt-tags-button');
const closeButton = document.body.querySelector('#close-button');
const userMessage = document.body.querySelector('#user-message');

generateAltTagButton.addEventListener('click', async () => {
    chrome.runtime.sendMessage({action: 'injectContentScript'})
});

closeButton.addEventListener('click', async () => {
    window.close()
});

function renderUI(extensionState) {
    generateAltTagButton.disabled=true;
    if (extensionState === 'loading') {
        userMessage.innerHTML = '<img src="loading-icon.png" width="50" class="icon" alt=""/> New image descriptions are loading... <br> <br>Please wait. We will update you when the descriptions have loaded.'
    } else if (extensionState === 'success') {
        userMessage.innerHTML = '<img src="success-icon.png" width="50" class="icon" alt=""/> New image descriptions have been loaded! <br> <br> If you would like to return to the original image descriptions set by the web page author, please refresh the page.'
    } else if (extensionState === 'errorGeneric') {
        userMessage.innerHTML = '<img src="error-icon.png" width="50" class="icon"alt=""/> There was an error generating new image descriptions. <br> <br> Please refresh the page and try again.'
    } else if (extensionState === 'errorAuthentication') {
        userMessage.innerHTML = '<img src="error-icon.png" width="50" class="icon"alt=""/> There was an error generating new image descriptions. <br> <br> Your OpenAI key is not valid. Please double check your key and try again.'
    } else if (extensionState === 'errorMaxQuota') {
        userMessage.innerHTML = '<img src="error-icon.png" width="50" class="icon"alt=""/> There was an error generating new image descriptions. <br> <br> You\'ve either used up your current OpenAI plan and need to add more credit, or you\'ve made too many requests too quickly. Please check your plan, add funds if needed, or slow down the requests.'
    }
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "getExtensionState"}, function(response) {
        // if the content script hasn't been injected, then the code in that script hasn't been run, and we'll get an error or no response
        if (chrome.runtime.lastError || !response) {
            return;
        } else if (response) {
            // if the code in content script HAS been injected, we'll get a response which tells us what state the code is at (loading, success, error, etc)
            renderUI(response.extensionState)
        }
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    renderUI(message.action)
    }
);