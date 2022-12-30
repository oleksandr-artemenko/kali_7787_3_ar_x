let ppBanner = document.querySelector(".exit-pp");
let ppClose = document.querySelector(".exit-pp__close");
let ppForm = document.querySelector(".exit-pp .form");
let ppOverflow = document.querySelector(".exit-pp-overflow");
let inputEmpty = 1;
let body = document.body;

function showExitPopup(e) {
  e.preventDefault();
  if (
    e.clientY <= 0 &&
    e.relatedTarget == null &&
    e.target.nodeName.toLowerCase() !== "select" &&
    inputEmpty
  ) {
    document.removeEventListener("mouseout", showExitPopup);
    if (sessionStorage.getItem("firstVisit") != "1") {
      ppBanner.classList.add("visible");
      body.classList.add("overflow-hidden");
      ppForm.classList.add("exitpop");
      sessionStorage.setItem("firstVisit", "1");
    }
  }
}

function closeExitPopup(e) {
  e.preventDefault();
  ppBanner.classList.remove("visible");
  body.classList.remove("overflow-hidden");
}

if (ppBanner != null) {
  window.addEventListener("DOMContentLoaded", (event) => {
    document.addEventListener("mouseout", showExitPopup);
    setTimeout(function () {
      ppClose.addEventListener("click", closeExitPopup);
      ppOverflow.addEventListener("click", closeExitPopup);
    }, 3000);
  });
}
