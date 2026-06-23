const menu = document.querySelector(".menu-toggle");
const links = document.querySelector(".nav-links");

if (menu && links) {
    menu.addEventListener("click", () => {
        links.classList.toggle("active");
    });
}