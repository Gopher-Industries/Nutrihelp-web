const NOISY_ANCESTOR_SELECTOR = [
  "nav",
  "footer",
  ".navbar",
  ".main-navbar",
  ".tts-ignore",
  "[data-tts-ignore='true']",
  "[aria-hidden='true']",
  "[hidden]",
].join(",");

const NOISY_KEYWORDS = ["review", "reviews", "comment", "comments", "testimonial", "feedback"];
const MAX_READABLE_CHARACTERS = 1800;

const SKIPPED_PARENT_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "SVG",
  "PATH",
  "IMG",
  "VIDEO",
  "AUDIO",
  "CANVAS",
  "IFRAME",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "OPTION",
  "BUTTON",
]);

export const normalizeWhitespace = (text = "") =>
  String(text).replace(/\s+/g, " ").trim();

export const isElementVisibleForTts = (element) => {
  if (!element) return false;
  if (element.hidden) return false;

  const style = window.getComputedStyle(element);
  const rawOpacity = style.opacity;
  const parsedOpacity = Number.parseFloat(rawOpacity);
  const opacity = Number.isFinite(parsedOpacity) ? parsedOpacity : 1;
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    style.visibility === "collapse" ||
    opacity === 0
  ) {
    return false;
  }

  return true;
};

const isVisibleThroughAncestors = (element) => {
  let current = element;
  while (current) {
    if (!isElementVisibleForTts(current)) return false;
    current = current.parentElement;
  }
  return true;
};

const hasNoisyKeywordInAncestors = (element) => {
  let current = element;

  while (current) {
    const className =
      typeof current.className === "string" ? current.className : "";
    const ariaLabel = current.getAttribute?.("aria-label") || "";
    const id = current.id || "";
    const dataSection = current.getAttribute?.("data-section") || "";

    const searchableText = `${className} ${ariaLabel} ${id} ${dataSection}`.toLowerCase();
    if (NOISY_KEYWORDS.some((keyword) => searchableText.includes(keyword))) {
      return true;
    }

    current = current.parentElement;
  }

  return false;
};

const shouldIncludeTextNode = (textNode) => {
  const parent = textNode.parentElement;
  if (!parent) return false;
  if (SKIPPED_PARENT_TAGS.has(parent.tagName)) return false;
  if (parent.closest(NOISY_ANCESTOR_SELECTOR)) return false;
  if (hasNoisyKeywordInAncestors(parent)) return false;
  if (!isVisibleThroughAncestors(parent)) return false;

  return true;
};

/**
 * Collect readable visible text from page content while excluding noisy regions.
 */
export const collectReadablePageText = (root = document.body) => {
  if (typeof document === "undefined" || !root) return "";

  const NodeFilterRef =
    typeof NodeFilter !== "undefined" ? NodeFilter : window.NodeFilter;
  if (!NodeFilterRef) return normalizeWhitespace(root.textContent || "");

  const walker = document.createTreeWalker(
    root,
    NodeFilterRef.SHOW_TEXT,
    {
      acceptNode: (node) =>
        shouldIncludeTextNode(node)
          ? NodeFilterRef.FILTER_ACCEPT
          : NodeFilterRef.FILTER_REJECT,
    }
  );

  const collected = [];
  let previousChunk = "";

  while (walker.nextNode()) {
    const chunk = normalizeWhitespace(walker.currentNode.textContent || "");
    if (!chunk) continue;

    // Guard against repeated adjacent text emitted by mirrored/duplicated nodes.
    if (chunk === previousChunk) continue;

    collected.push(chunk);
    previousChunk = chunk;
  }

  const fullText = collected.join(" ").trim();
  if (fullText.length <= MAX_READABLE_CHARACTERS) {
    return fullText;
  }

  const sliced = fullText.slice(0, MAX_READABLE_CHARACTERS);
  const sentenceBoundary = Math.max(sliced.lastIndexOf(". "), sliced.lastIndexOf("! "), sliced.lastIndexOf("? "));
  if (sentenceBoundary > MAX_READABLE_CHARACTERS * 0.6) {
    return `${sliced.slice(0, sentenceBoundary + 1).trim()} ...`;
  }

  return `${sliced.trim()} ...`;
};
