document.addEventListener("DOMContentLoaded", () => {
    const vid = document.getElementById("vid1");
    vid.addEventListener('ended', () => {
        setTimeout(() => {
            window.history.go(-3);
        }, 400);

    })
});