/**
 * Generates optimized image URLs using wsrv.nl (Cloudflare edge proxy) to resize,
 * compress, and convert site images to WebP on the fly.
 *
 * Usage:
 *   ImgProxy.optimize('/assets/img/foo.png', { w: 900, q: 78 }) -> proxied URL
 *   ImgProxy.apply(imgEl, '/assets/img/foo.png', { w: 900 })    -> updates <img> with fallback
 */
(function (global) {
  "use strict";

  var PROD_HOSTS = [
    "www.euphoriapatches.com",
    "euphoriapatches.com",
    "euphoriapatches.github.io",
  ];

  var ENABLED = PROD_HOSTS.indexOf(global.location.hostname) !== -1;

  // wsrv.nl only handles raster images - never route video (or already-proxied
  // URLs / data URIs) through it.
  var SKIP_RE = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;
  var ALREADY_RE = /(?:wsrv\.nl|images\.weserv\.nl)/i;

  function isProxyable(src) {
    if (!src || typeof src !== "string") return false;
    if (/^data:/i.test(src)) return false;
    if (SKIP_RE.test(src)) return false;
    if (ALREADY_RE.test(src)) return false;
    return true;
  }

  /**
   * @param {string} src - absolute or root-relative image URL
   * @param {{w?:number,h?:number,q?:number,output?:string,fit?:string}} [opts]
   * @returns {string} the proxied URL, or the original src when proxying is off
   */
  function optimize(src, opts) {
    if (!ENABLED || !isProxyable(src)) return src;
    opts = opts || {};

    var abs;
    try {
      abs = new URL(src, global.location.href);
    } catch (e) {
      return src;
    }

    // wsrv wants the target without a scheme, e.g. "example.com/a/b.png"
    var target = abs.host + abs.pathname + abs.search;
    var params = ["url=" + encodeURIComponent(target)];

    if (opts.w) params.push("w=" + opts.w);
    if (opts.h) params.push("h=" + opts.h);
    if (opts.fit) params.push("fit=" + opts.fit);
    params.push("q=" + (opts.q || 80));
    params.push("output=" + (opts.output || "webp"));
    params.push("we"); // "without enlargement" - don't upscale past the source

    return "https://wsrv.nl/?" + params.join("&");
  }

  /**
   * Point an <img> at the optimized URL, falling back to the original if the
   * proxy request fails for any reason.
   */
  function apply(img, src, opts) {
    var optimized = optimize(src, opts);
    if (optimized === src) {
      img.src = src;
      return;
    }
    img.addEventListener("error", function onErr() {
      img.removeEventListener("error", onErr);
      if (img.getAttribute("src") !== src) img.src = src;
    });
    img.src = optimized;
  }

  global.ImgProxy = { optimize: optimize, apply: apply, enabled: ENABLED };
})(window);
