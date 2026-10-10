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

    const discordResponse = await fetch(
      "/assets/img/Screenshots/discord/screenshots.json",
    );
    const discordData = await discordResponse.json();

    // Manual overrides (screenshots.json is overwritten by the external server,
    // so exclusions of e.g. duplicate uploads live in a separate file).
    let excludedDiscordIds = new Set();
    try {
      const overridesResponse = await fetch(
        "/assets/img/Screenshots/discord/screenshots-overrides.json",
      );
      if (overridesResponse.ok) {
        const overridesData = await overridesResponse.json();
        if (Array.isArray(overridesData.excluded_ids)) {
          excludedDiscordIds = new Set(overridesData.excluded_ids);
        }
      }
    } catch (overridesError) {
      console.warn("Could not load gallery overrides:", overridesError);
    }

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
        extension: "webp",
        previewSuffix: "-40xAuto.webp",
      });
    }

    // Add Discord screenshot images
    const discordScreenshotsById = new Map();

    if (Array.isArray(discordData.screenshots)) {
      discordData.screenshots.forEach((screenshot) => {
        if (screenshot && screenshot.screenshot_id) {
          discordScreenshotsById.set(screenshot.screenshot_id, screenshot);
        }
      });
    }

    for (
      let screenshotId = 1;
      screenshotId <= discordData.latest_screenshot_id;
      screenshotId++
    ) {
      const screenshot = discordScreenshotsById.get(screenshotId);

      if (!screenshot || excludedDiscordIds.has(screenshotId)) {
        continue;
      }

      allImages.push({
        name: `${screenshotId}`,
        folder: "Screenshots/discord",
        description: `Screenshot by ${screenshot.username}`,
        extension: screenshot.file_extension || "webp",
        previewSuffix: null,
        placeholderColor: "var(--Gray)",
      });
    }

    // Shuffle the array randomly if enabled
    if (isShuffleEnabled) {
      shuffleArray(allImages);
    }

    // Add all images to the gallery
    allImages.forEach((img) => {
      const item = createGalleryItem(img);
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

function createGalleryItem({
  name: imageName,
  folder,
  description,
  extension = "webp",
  previewSuffix = "-40xAuto.webp",
  placeholderColor,
}) {
  const div = document.createElement("div");
  div.className = "gallery-images-item blur-load-img";

  if (placeholderColor) {
    div.style.backgroundColor = placeholderColor;
  }

  if (previewSuffix) {
    div.style.backgroundImage = `url('/assets/img/${folder}/${imageName}${previewSuffix}')`;
  }

  const img = document.createElement("img");
  const originalSrc = `/assets/img/${folder}/${imageName}.${extension}`;
  img.setAttribute("data-original-src", originalSrc);

  // Grid thumbnails only need to be a few hundred px wide; route them through
  // the wsrv.nl edge resizer (no-op off production). The overlay pulls a larger
  // version from data-original-src.
  if (window.ImgProxy) {
    ImgProxy.apply(img, originalSrc, { w: 800, q: 78 });
  } else {
    img.src = originalSrc;
  }

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
  const imageOverlay = ImageOverlay.create({
    overlay: document.getElementById("gallery-images-overlay"),
    image: document.getElementById("gallery-overlay-image"),
  });

  // Create hover tooltip
  const hoverTooltip = document.createElement("div");
  hoverTooltip.className = "gallery-hover-tooltip";
  document.body.appendChild(hoverTooltip);

  // The overlay requests the large edge-resized version itself; we only hand it
  // the original paths and descriptions.
  const items = [];

  galleryItems.forEach((item, index) => {
    const img = item.querySelector("img");
    const description = img.getAttribute("data-description");
    items.push({
      src: img.getAttribute("data-original-src") || img.src,
      description,
    });

    item.addEventListener("click", () => {
      imageOverlay.open(items, index);
      hoverTooltip.classList.remove("show");
    });

    // Add hover listeners for tooltip (only on non-mobile)
    if (window.innerWidth > 768) {
      item.addEventListener("mouseenter", () => {
        if (!imageOverlay.isOpen() && description) {
          hoverTooltip.textContent = description;
          hoverTooltip.classList.add("show");
        }
      });

      item.addEventListener("mouseleave", () => {
        hoverTooltip.classList.remove("show");
      });
    }
  });
}
