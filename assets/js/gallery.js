// Gallery image generator
document.addEventListener("DOMContentLoaded", async () => {
  const galleryGrid = document.querySelector(".gallery-images-grid");

  // Initialize shuffle state from localStorage (default: true)
  let isShuffleEnabled =
    localStorage.getItem("galleryShuffleEnabled") !== "false";

  // Setup gallery title toggle
  const galleryTitle = document.getElementById("gallery-title");
  if (galleryTitle) {
    // Set initial title text based on state
    galleryTitle.textContent = isShuffleEnabled
      ? "Shuffled Gallery"
      : "Linear Gallery";

    // Add click handler
    galleryTitle.addEventListener("click", () => {
      isShuffleEnabled = !isShuffleEnabled;
      localStorage.setItem("galleryShuffleEnabled", isShuffleEnabled);

      // Reload gallery with new setting
      location.reload();
    });
  }

  try {
    // Fetch image data
    const response = await fetch("/gallery/imageData.json");
    const imageData = await response.json();

    // Collect all images into one array
    const allImages = [];

    // Add contest images
    for (let i = 1; i <= imageData.maxContestImages; i++) {
      const description = imageData.descriptions[`contest${i}`];
      allImages.push({
        name: `${i}`,
        folder: "Screenshots/contest",
        description,
      });
    }

    // Add background images
    const backgroundImages = [
      { name: "donateBackground", folder: "backgrounds" },
      { name: "mainBackground", folder: "backgrounds" },
      { name: "downloadBackground", folder: "backgrounds" },
      { name: "changelogsBackground", folder: "backgrounds" },
      { name: "contactBackground", folder: "backgrounds" },
      { name: "howToInstallBackground", folder: "backgrounds" },
      { name: "faqBackground", folder: "backgrounds" },
      { name: "policyBackground", folder: "backgrounds" },
      { name: "creditsBackground", folder: "backgrounds" },
    ];

    backgroundImages.forEach((bg) => {
      const description = imageData.descriptions[bg.name];
      allImages.push({ name: bg.name, folder: bg.folder, description });
    });

    // Add numbered screenshot images
    for (let i = 1; i <= imageData.maxImages; i++) {
      const description = imageData.descriptions[i.toString()];
      allImages.push({
        name: `${i}_euphoria_patches`,
        folder: "Screenshots",
        description,
      });
    }

    // Shuffle the array randomly if enabled
    if (isShuffleEnabled) {
      shuffleArray(allImages);
    }

    // Add all images to the gallery
    allImages.forEach((img) => {
      const item = createGalleryItem(img.name, img.folder, img.description);
      galleryGrid.appendChild(item);
    });

    // Initialize blur loading after all images are added
    initializeBlurLoading();

    // Initialize gallery overlay after images are loaded
    initializeGalleryOverlay();
  } catch (error) {
    console.error("Error loading gallery images:", error);
  }
});

function shuffleArray(array) {
  // Fisher-Yates shuffle algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createGalleryItem(imageName, folder, description) {
  const div = document.createElement("div");
  div.className = "gallery-images-item blur-load-img";
  div.style.backgroundImage = `url('/assets/img/${folder}/${imageName}-40xAuto.webp')`;

  const img = document.createElement("img");
  img.src = `/assets/img/${folder}/${imageName}.webp`;

  if (description) {
    img.setAttribute("data-description", description);
  }

  div.appendChild(img);
  return div;
}

function initializeBlurLoading() {
  const galleryImageDivs = document.querySelectorAll(".gallery-images-item");

  galleryImageDivs.forEach((div) => {
    const img = div.querySelector("img");

    function loaded() {
      div.classList.add("loaded");

      if (div.classList.contains("blur-load-img")) {
        div.classList.add("loaded");
      }
    }

    if (img.complete && img.naturalHeight !== 0) {
      loaded();
    } else {
      img.addEventListener("load", loaded);
    }
  });
}

function initializeGalleryOverlay() {
  const galleryItems = document.querySelectorAll(".gallery-images-item");
  const overlay = document.getElementById("gallery-images-overlay");
  const overlayImage = document.getElementById("gallery-overlay-image");
  const overlayClose = document.querySelector(".gallery-images-overlay-close");
  const imageDescription = document.getElementById("image-description");

  // Create hover tooltip
  const hoverTooltip = document.createElement("div");
  hoverTooltip.className = "gallery-hover-tooltip";
  document.body.appendChild(hoverTooltip);

  // Store image sources and descriptions
  let imageSources = [];
  let imageDescriptions = [];
  let currentIndex = 0;

  galleryItems.forEach((item, index) => {
    const img = item.querySelector("img");
    const fullSrc = img.src;
    const description = img.getAttribute("data-description");
    imageSources.push(fullSrc);
    imageDescriptions.push(description ? description : null);

    item.addEventListener("click", () => {
      currentIndex = index;
      overlayImage.src = fullSrc;
      updateDescription(currentIndex);
      overlay.classList.add("show");
      hoverTooltip.classList.remove("show");
    });

    // Add hover listeners for tooltip (only on non-mobile)
    if (window.innerWidth > 768) {
      item.addEventListener("mouseenter", () => {
        if (!overlay.classList.contains("show") && description) {
          hoverTooltip.textContent = description;
          hoverTooltip.classList.add("show");
        }
      });

      item.addEventListener("mouseleave", () => {
        hoverTooltip.classList.remove("show");
      });
    }
  });

  function updateDescription(index) {
    const description = imageDescriptions[index];
    if (description) {
      imageDescription.textContent = description;
      imageDescription.style.opacity = "1";
    } else {
      imageDescription.textContent = "";
      imageDescription.style.opacity = "0";
    }
  }

  function showImage(index) {
    if (index >= 0 && index < imageSources.length) {
      currentIndex = index;
      overlayImage.src = imageSources[currentIndex];
      updateDescription(currentIndex);
    }
  }

  overlayClose.addEventListener("click", () => {
    overlay.classList.remove("show");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("show");
    }
  });

  // Handle escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      overlay.classList.remove("show");
    }
  });

  // Handle arrow navigation
  document.addEventListener("keydown", (e) => {
    if (overlay.classList.contains("show")) {
      if (e.key === "ArrowLeft") {
        showImage(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        showImage(currentIndex + 1);
      }
    }
  });

  // Swipe functionality for mobile devices
  let touchStartX = 0;
  let touchEndX = 0;

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      showImage(currentIndex + 1);
    } else if (touchEndX > touchStartX + swipeThreshold) {
      showImage(currentIndex - 1);
    }
  }

  overlay.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  overlay.addEventListener("touchmove", (e) => {
    touchEndX = e.changedTouches[0].screenX;
  });

  overlay.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  // Navigation button handlers
  const prevBtn = document.querySelector(".gallery-prev-btn");
  const nextBtn = document.querySelector(".gallery-next-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      showImage(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      showImage(currentIndex + 1);
    });
  }
}
