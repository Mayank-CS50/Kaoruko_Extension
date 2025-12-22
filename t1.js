document.addEventListener("DOMContentLoaded", () => {
    const vid = document.getElementById("vid1");
    const btn1 = document.getElementById("nxtBtn");
    vid.addEventListener('ended', () => {
        setTimeout(() => {
            btn1.classList.add('show');
        }, 400);
    });
    btn1.addEventListener('click',()=>{
        window.location.href=chrome.runtime.getURL("trying2.html");
    });
});