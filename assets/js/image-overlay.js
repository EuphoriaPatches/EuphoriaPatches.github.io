/**
 * Shared fullscreen image overlay used by the gallery, screenshot contest,
 * changelogs and support pages.
 *
 * Usage:
 *   const imageOverlay = ImageOverlay.create({
 *     overlay: document.getElementById("image-overlay"),
 *     image: document.getElementById("overlay-image"),
 *   });
 *   imageOverlay.open([{ src: "/assets/img/foo.webp", description: "Optional" }], 0);
 */
(function (global) {
  "use strict";

  var FULL_SRC_OPTS = { w: 2160, q: 82 };

  function create(opts) {
    var overlay = opts.overlay;
    var image = opts.image;
    var description = overlay.querySelector(".image-description");
    var closeBtn = overlay.querySelector(".gallery-images-overlay-close");
    var prevBtn = overlay.querySelector(".gallery-prev-btn");
    var nextBtn = overlay.querySelector(".gallery-next-btn");

    var items = [];
    var currentIndex = 0;

    // "Full resolution" button, injected so each page only needs the base markup.
    var fullResBtn = document.createElement("a");
    fullResBtn.className = "gallery-images-overlay-fullres";
    fullResBtn.target = "_blank";
    fullResBtn.rel = "noopener noreferrer";
    fullResBtn.innerHTML =
      '<i class="fa fa-external-link"></i><span>Full resolution</span>' +
      '<span class="gallery-images-overlay-fullres-tip">To save mobile data, ' +
      "images are shown compressed. Click here to open the original " +
      "full-resolution image in a new tab.</span>";
    overlay.insertBefore(
      fullResBtn,
      closeBtn ? closeBtn.nextSibling : overlay.firstChild,
    );

    function isOpen() {
      return overlay.classList.contains("show");
    }

    function close() {
      overlay.classList.remove("show");
    }

    function show(index) {
      if (index < 0 || index >= items.length) return;
      currentIndex = index;

      var item = items[index];
      image.src = global.ImgProxy
        ? global.ImgProxy.optimize(item.src, FULL_SRC_OPTS)
        : item.src;
      fullResBtn.href = item.src;

      if (description) {
        description.textContent = item.description || "";
        description.style.opacity = item.description ? "1" : "0";
      }
    }

    function open(newItems, index) {
      items = newItems;
      show(index || 0);
      overlay.classList.add("show");
    }

    // If the edge-resized version fails to load, fall back to the original file.
    image.addEventListener("error", function () {
      var item = items[currentIndex];
      if (item && image.getAttribute("src") !== item.src) {
        image.src = item.src;
      }
    });

    if (closeBtn) closeBtn.addEventListener("click", close);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!isOpen()) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(currentIndex - 1);
      else if (e.key === "ArrowRight") show(currentIndex + 1);
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        show(currentIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        show(currentIndex + 1);
      });
    }

    // Swipe navigation for mobile devices
    var touchStartX = 0;
    var touchEndX = 0;
    var swipeThreshold = 50;

    overlay.addEventListener("touchstart", function (e) {
      touchStartX = touchEndX = e.changedTouches[0].screenX;
    });
    overlay.addEventListener("touchmove", function (e) {
      touchEndX = e.changedTouches[0].screenX;
    });
    overlay.addEventListener("touchend", function (e) {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - swipeThreshold) show(currentIndex + 1);
      else if (touchEndX > touchStartX + swipeThreshold) show(currentIndex - 1);
    });

    return { open: open, close: close, show: show, isOpen: isOpen };
  }

  global.ImageOverlay = { create: create };
})(window);
