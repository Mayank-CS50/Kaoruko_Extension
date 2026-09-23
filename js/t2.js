document.addEventListener(\DOMContentLoaded\, () => {
 const vid = document.getElementById(\vid2\);
 const btn = document.getElementById(\nxtBtn\);
 vid.addEventListener(\ended\, () => {
 setTimeout(() => {
 btn.classList.add(\show\);
 }, 400);
 });
 btn.addEventListener(\click\,()=>{
 window.location.href=chrome.runtime.getURL(\pages/trying3.html\);
 });
});
