/* CHANGE COLOR IN NAV WHEN SCROLL */

window.addEventListener("scroll", function () {
  const navbar = document.querySelector("nav");
  const navlinks = document.querySelectorAll(".nav-link");
  const svgPaths = document.querySelectorAll("#logo-svg path");

  if (window.scrollY > 10) {
    navbar.classList.add("scrolled");

    svgPaths.forEach((path) => {
      path.classList.add("scrolled");
    });

    navlinks.forEach((link) => {
      link.classList.add("scrolled");
    });
  } else {
    navbar.classList.remove("scrolled");

    svgPaths.forEach((path) => {
      path.classList.remove("scrolled");
    });

    navlinks.forEach((link) => {
      link.classList.remove("scrolled");
    });
  }
});
