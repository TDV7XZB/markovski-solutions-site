(function () {
  function hidePreloader() {
    var preloader = document.getElementById("msol-preloader");
    if (!preloader) {
      return;
    }

    preloader.classList.add("msol-hidden");
    document.body.classList.remove("msol-loading");

    window.setTimeout(function () {
      if (preloader && preloader.parentNode) {
        preloader.parentNode.removeChild(preloader);
      }
    }, 380);
  }

  if (document.body) {
    document.body.classList.add("msol-loading");
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      document.body.classList.add("msol-loading");
    });
  }

  window.addEventListener("load", hidePreloader);
  window.setTimeout(hidePreloader, 1800);
})();
