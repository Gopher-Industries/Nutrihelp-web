const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
const DISH_IMAGE_CACHE_KEY = "nutrihelp_dish_image_cache_v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY || "";

const SEARCH_REJECT_WORDS = [
  "logo",
  "icon",
  "symbol",
  "diagram",
  "map",
  "packaging",
  "menu",
  "sign",
  "poster",
  "plant",
  "flower",
  "tree",
  "garden",
  "leaf",
  "leaves",
  "person",
  "portrait",
  "animal",
];

const FOOD_CONTEXT_WORDS = [
  "food",
  "dish",
  "meal",
  "cuisine",
  "soup",
  "bowl",
  "plate",
  "noodle",
  "rice",
  "pasta",
  "salad",
  "stew",
  "curry",
  "sandwich",
  "dessert",
];

const TOKEN_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "of",
  "with",
  "style",
  "dish",
  "food",
  "meal",
]);

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getDishTokens(dishName) {
  return normalizeText(dishName)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !TOKEN_STOPWORDS.has(token));
}

function readCache() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DISH_IMAGE_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeCache(cache) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DISH_IMAGE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Cache failure should not block navigation.
  }
}

function getCacheKey(dishName, cuisine) {
  return normalizeText(`${dishName} ${cuisine || ""}`);
}

function isAllowedImageSource(candidate) {
  const normalizedSource = normalizeText(candidate?.source || "");
  const normalizedUrl = normalizeText(candidate?.sourceUrl || candidate?.imageUrl || "");
  return (
    normalizedSource.includes("unsplash") ||
    normalizedUrl.includes("unsplash.com")
  );
}

function getCachedDishImage(dishName, cuisine) {
  const cacheKey = getCacheKey(dishName, cuisine);
  const cached = readCache()[cacheKey];
  if (!cached || Date.now() - Number(cached.cachedAt || 0) > CACHE_TTL_MS) return null;
  if (!isAllowedImageSource(cached)) return null;
  return cached;
}

function cacheDishImage(dishName, cuisine, value) {
  const cache = readCache();
  cache[getCacheKey(dishName, cuisine)] = {
    ...value,
    cachedAt: Date.now(),
  };
  writeCache(cache);
}

function buildSearchQueries(dishName, cuisine) {
  const cleanDishName = String(dishName || "").trim();
  const cleanCuisine = String(cuisine || "").trim();
  return Array.from(
    new Set(
      [
        cleanCuisine ? `${cleanDishName} ${cleanCuisine}` : cleanDishName,
        cleanCuisine ? `${cleanCuisine} ${cleanDishName} dish` : `${cleanDishName} food dish`,
        `${cleanDishName} cuisine`,
      ].filter(Boolean)
    )
  );
}

async function fetchJsonWithTimeout(url, { timeoutMs = 4500, fetchOptions = {} } = {}) {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

function hasRejectedContent(text) {
  const normalized = normalizeText(text);
  return SEARCH_REJECT_WORDS.some((word) => normalized.includes(word));
}

function scoreTextCandidate(text, dishName, position = 0) {
  const candidateText = normalizeText(text);
  const dishPhrase = normalizeText(dishName);
  const tokens = getDishTokens(dishName);
  let score = Math.max(12, 42 - position * 3);

  if (!candidateText || hasRejectedContent(candidateText)) return -100;
  if (dishPhrase && candidateText.includes(dishPhrase)) score += 40;

  tokens.forEach((token) => {
    if (candidateText.includes(token)) score += 10;
  });

  if (FOOD_CONTEXT_WORDS.some((word) => candidateText.includes(word))) score += 12;
  return score;
}

function pickBestCandidate(candidates) {
  return candidates.sort((a, b) => b.confidence - a.confidence)[0] || null;
}

async function fetchUnsplashDishImage(dishName, cuisine) {
  if (!UNSPLASH_ACCESS_KEY) return null;

  const candidates = [];
  for (const query of buildSearchQueries(dishName, cuisine)) {
    const params = new URLSearchParams({
      query,
      per_page: "8",
      orientation: "landscape",
      content_filter: "high",
    });

    const data = await fetchJsonWithTimeout(`${UNSPLASH_API_URL}?${params.toString()}`, {
      fetchOptions: {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      },
    });

    (data?.results || []).forEach((photo, index) => {
      const tags = (photo.tags || []).map((tag) => tag.title).join(" ");
      const text = `${photo.alt_description || ""} ${photo.description || ""} ${tags}`;
      const score = scoreTextCandidate(text, dishName, index);
      if (score < 20) return;

      candidates.push({
        imageUrl: photo.urls?.regular || photo.urls?.full || photo.urls?.raw,
        originalUrl: photo.urls?.full || photo.urls?.raw || photo.urls?.regular,
        sourceUrl: photo.links?.html || "",
        source: "Unsplash",
        title: photo.alt_description || dishName,
        license: "Unsplash License",
        attribution: photo.user?.name || "",
        confidence: Math.max(0, Math.min(1, score / 100)),
      });
    });

    const best = pickBestCandidate(candidates);
    if (best?.confidence >= 0.55 && best.imageUrl) return best;
  }

  return pickBestCandidate(candidates);
}

export async function fetchDishImage(dishName, { cuisine = "" } = {}) {
  const cleanDishName = String(dishName || "").trim();
  if (!cleanDishName) return null;

  const cached = getCachedDishImage(cleanDishName, cuisine);
  if (cached?.imageUrl) {
    const cachedSource = normalizeText(cached?.source || "");
    if (cachedSource.includes("unsplash")) return cached;

    // Cache source is not Unsplash; try upgrading to Unsplash.
    const unsplashResult = await fetchUnsplashDishImage(cleanDishName, cuisine);
    if (unsplashResult?.imageUrl && isAllowedImageSource(unsplashResult)) {
      cacheDishImage(cleanDishName, cuisine, unsplashResult);
      return unsplashResult;
    }

    return cached;
  }

  const providers = [fetchUnsplashDishImage];

  for (const provider of providers) {
    const result = await provider(cleanDishName, cuisine);
    if (result?.imageUrl && isAllowedImageSource(result)) {
      cacheDishImage(cleanDishName, cuisine, result);
      return result;
    }
  }

  return null;
}
