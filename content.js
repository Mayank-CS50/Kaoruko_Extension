// Redirect to Google.com if on YouTube or WhatsApp
if (!sessionStorage.getItem("redirected")) {
    setTimeout(() => {
        sessionStorage.setItem("redirected", "true");
        window.location.href = chrome.runtime.getURL("trying1.html");
    }, 4000);
}