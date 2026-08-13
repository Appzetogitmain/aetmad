/**
 * Utility for Cloudinary image transformations.
 * Ensures images are served in WebP with optimized quality whenever possible.
 */

/**
 * Optimizes a Cloudinary URL by injecting transformations.
 * @param {string} url - The original Cloudinary URL.
 * @param {Object} options - Transformation options.
 * @param {string} options.format - File format (default: 'webp').
 * @param {string} options.quality - Quality (default: 'auto').
 * @param {number} options.width - Optional width.
 * @param {number} options.height - Optional height.
 * @param {string} options.crop - Optional crop mode (default: 'fill' if width/height provided).
 * @returns {string} - The optimized URL.
 */
export const stripCloudinaryTransformations = (url) => {
  if (!url || typeof url !== "string") return url || "";
  if (!/res\.cloudinary\.com/i.test(url) || !/\/image\/upload\//i.test(url)) {
    return url;
  }

  try {
    const parts = url.split("/upload/");
    if (parts.length !== 2) return url;

    const [prefix, suffix] = parts;
    const segments = suffix.split("/");
    
    // Filter out transformation segments (segments containing commas or transformation flags like f_, q_, w_, h_, c_, dpr_)
    const cleanSegments = segments.filter((seg) => {
      if (/^v\d+$/i.test(seg)) return true;
      if (
        seg.includes(",") ||
        seg.includes("f_") ||
        seg.includes("q_") ||
        seg.includes("w_") ||
        seg.includes("h_") ||
        seg.includes("c_") ||
        seg.includes("dpr_")
      ) {
        return false;
      }
      return true;
    });

    return `${prefix}/upload/${cleanSegments.join("/")}`;
  } catch (err) {
    return url;
  }
};

/**
 * Optimizes a Cloudinary URL by cleaning transformation flags.
 * Strips transformations to avoid 401 Unauthorized errors.
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || typeof url !== "string") return url || "";
  return stripCloudinaryTransformations(url);
};

/**
 * Specifically ensures auto format (WebP/AVIF) for a Cloudinary URL.
 */
export const ensureWebp = (url) => optimizeCloudinaryUrl(url, { format: "auto" });

/**
 * Generates a srcSet for Cloudinary images.
 * @param {string} url - Original Cloudinary URL.
 * @param {number[]} widths - Array of widths.
 * @returns {string} - srcSet string.
 */
export const getCloudinarySrcSet = (url, widths = [300, 600, 900, 1200]) => {
  if (!url || !/res\.cloudinary\.com/i.test(url)) return null;

  return widths
    .map((w) => {
      const optimized = optimizeCloudinaryUrl(url, { width: w, crop: "limit", format: "auto", quality: "auto:good" });
      return `${optimized} ${w}w`;
    })
    .join(", ");
};

/**
 * Optimizes a Cloudinary Video URL by injecting transformations.
 */
export const optimizeCloudinaryVideoUrl = (url, options = {}) => {
  if (!url || typeof url !== "string") return url || "";

  // Process Cloudinary Video URLs
  if (!/res\.cloudinary\.com/i.test(url) || !/\/video\/upload\//i.test(url)) {
    return url;
  }

  const {
    format = "auto",
    quality = "auto",
    width,
    height,
    crop,
  } = options;

  try {
    const parts = url.split("/upload/");
    if (parts.length !== 2) return url;

    const [prefix, suffix] = parts;
    let transformStr = `f_${format},q_${quality}`;
    if (width) transformStr += `,w_${width}`;
    if (height) transformStr += `,h_${height}`;
    if (crop) transformStr += `,c_${crop}`;

    return `${prefix}/upload/${transformStr}/${suffix}`;
  } catch (err) {
    console.error("Error optimizing Cloudinary Video URL:", err);
    return url;
  }
};
