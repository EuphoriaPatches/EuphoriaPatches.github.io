/**
 * Installer Utilities for Euphoria Patches
 * Common functions used for fetching and processing installer downloads
 */

/**
 * Detects if the user is on a Windows operating system
 * @returns {Promise<boolean>} True if Windows is detected
 */
async function isWindowsOS() {
  if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    try {
      const data = await navigator.userAgentData.getHighEntropyValues([
        "platform",
      ]);
      if (data.platform === "Windows") return true;
    } catch (e) {
      console.warn("userAgentData error:", e);
    }
  }

  if (navigator.platform && navigator.platform.startsWith("Win")) {
    return true;
  }

  if (navigator.userAgent && /Windows/i.test(navigator.userAgent)) {
    return true;
  }

  return false;
}

/**
 * Extract version from installer filename
 * @param {string} filename - Filename to parse
 * @returns {string|null} Extracted version or null if not found
 */
function extractVersionFromFilename(filename) {
  // Match patterns like "Complementary-Installer-1.3.0.jar"
  const match = filename.match(/[^\d]+(\d+\.\d+\.\d+)\.jar$/i);
  return match ? match[1] : null;
}

/**
 * Sort assets by version number
 * @param {Array} assets - Array of assets to sort
 */
function sortAssetsByVersion(assets) {
  if (assets.length > 0) {
    assets.sort((a, b) => {
      const versionA = extractVersionFromFilename(a.name);
      const versionB = extractVersionFromFilename(b.name);

      if (versionA && versionB) {
        const partsA = versionA.split(".").map(Number);
        const partsB = versionB.split(".").map(Number);

        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
          const partA = partsA[i] || 0;
          const partB = partsB[i] || 0;
          if (partA !== partB) {
            return partB - partA; // Descending order
          }
        }
      }

      // Fallback to upload date
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
  }
}

/**
 * Fetch installer data from GitHub
 * @returns {Promise<Object>} Object containing installer data and OS info
 */
async function fetchInstallerData() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/ComplementaryDevelopment/Complementary-Installer/releases",
    );
    const releases = await response.json();

    if (!releases || releases.length === 0) {
      throw new Error("No releases found");
    }

    // Get the first release
    const release = releases[0];

    // Find installer jar and exe files
    const jarAssets = release.assets.filter(
      (asset) =>
        asset.name.endsWith(".jar") &&
        asset.name.toLowerCase().includes("installer"),
    );

    const exeAssets = release.assets.filter(
      (asset) =>
        asset.name.endsWith(".exe") &&
        asset.name.toLowerCase().includes("installer"),
    );

    // Sort assets by version
    sortAssetsByVersion(jarAssets);
    sortAssetsByVersion(exeAssets);

    // Get the latest versions
    const latestJarAsset = jarAssets.length > 0 ? jarAssets[0] : null;
    const latestExeAsset = exeAssets.length > 0 ? exeAssets[0] : null;

    // Check if user is on Windows
    const isWindows = await isWindowsOS();

    return {
      release,
      latestJarAsset,
      latestExeAsset,
      isWindows,
    };
  } catch (error) {
    console.error("Error fetching installer data:", error);
    return {
      error: error.message,
      release: null,
      latestJarAsset: null,
      latestExeAsset: null,
      isWindows: false,
    };
  }
}

/**
 * Download file by URL with optional tracking
 * @param {string} url - URL to download
 * @param {boolean} useTracking - Whether to use tracking pages
 */
function downloadFile(url, useTracking = true) {
  if (!url) return;

  // Extract file type (exe or jar)
  const isExe = url.toLowerCase().endsWith(".exe");
  const isJar = url.toLowerCase().endsWith(".jar");

  // Use tracking pages if enabled
  if (useTracking) {
    if (isExe) {
      // Save the URL to sessionStorage so the download page can access it
      sessionStorage.setItem("installerDownloadUrl", url);
      window.open("/download-installer-exe", "_blank");
      return;
    } else if (isJar) {
      // Save the URL to sessionStorage so the download page can access it
      sessionStorage.setItem("installerDownloadUrl", url);
      window.open("/download-installer-jar", "_blank");
      return;
    }
  }

  // Direct download (fallback or when tracking disabled)
  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
