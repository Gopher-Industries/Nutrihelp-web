import React, { useEffect, useMemo, useState } from "react";
import "./FoodPreferences.css";
import preferenceHeroPanel from "../../images/mealPlan/banner_image.jpg";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

const OPTION_METADATA = {
  milk: {
    label: "Milk allergy?",
    desc: "Stay safe by avoiding dairy like milk, cheese, and yogurt.",
    icon: "milk.png",
  },
  egg: {
    label: "Egg allergy?",
    desc: "Egg can appear in baked goods, sauces, and many processed foods.",
    icon: "egg.jpeg",
  },
  tree_nut: {
    label: "Tree nut allergy?",
    desc: "Avoid almonds, cashews, walnuts, and products containing nut oils.",
    icon: "treenut.jpg",
  },
  shellfish: {
    label: "Shellfish allergy?",
    desc: "Avoid shrimp, crab, lobster, and related seafood ingredients.",
    icon: "shellfish.png",
  },
  shrimp: {
    label: "Shrimp allergy?",
    desc: "Avoid foods that contain shrimp.",
    icon: "shrimp.png",
  },
  fish: {
    label: "Fish allergy?",
    desc: "Avoid foods that contain fish.",
    icon: "fish.png",
  },
  wheat: {
    label: "Wheat allergy?",
    desc: "Wheat can appear in breads, pastas, sauces, and processed foods.",
    icon: "wheat.jpeg",
  },
  soy: {
    label: "Soy allergy?",
    desc: "Soy is common in tofu, soy sauce, and many packaged foods.",
    icon: "soy.jpeg",
  },
  sesame: {
    label: "Sesame allergy?",
    desc: "Watch sesame seeds, oils, tahini, and breads with seeded toppings.",
    icon: "sesame.jpg",
  },
  lactose_intolerance: {
    label: "Lactose intolerance?",
    desc: "Dairy products may cause bloating or discomfort.",
    icon: "lactose_intolerant.jpg",
  },
  fructose_intolerance: {
    label: "Fructose intolerance?",
    desc: "High-fructose foods and drinks can trigger digestive discomfort.",
    icon: "fructose_intolerance.png",
  },
  histamine_intolerance: {
    label: "Histamine intolerance?",
    desc: "Aged and fermented foods may trigger headaches, rashes, or congestion.",
    icon: "histamine_intolerance.png",
  },
  fodmap_intolerance: {
    label: "FODMAP intolerance?",
    desc: "Some carbohydrates can lead to bloating, gas, or stomach pain.",
    icon: "FODMAP.png",
  },
  gluten_intolerance: {
    label: "Gluten intolerance?",
    desc: "Wheat, barley, and rye can trigger digestive or fatigue symptoms.",
    icon: "gluten_intolerance.png",
  },
  caffeine_sensitivity: {
    label: "Caffeine sensitivity?",
    desc: "Coffee, tea, and energy drinks may cause jitters or poor sleep.",
    icon: "caffeine_sensitivity.png",
  },
  msg_sensitivity: {
    label: "MSG sensitivity?",
    desc: "Some processed or takeaway foods may trigger discomfort.",
    icon: "MSG_sensitivity.png",
  },
  coconut: {
    label: "Coconut?",
    desc: "Avoid foods that contain coconut.",
    icon: "coconut.png",
  },
  corn: {
    label: "Corn?",
    desc: "Avoid foods that contain corn.",
    icon: "corn.png",
  },
  alcohol_fermented_products: {
    label: "Alcohol/Fermented Products?",
    desc: "Avoid foods that contain alcohol/fermented products.",
    icon: "alcohol_fermented_products.png",
  },
  sulfites_or_preservatives: {
    label: "Sulfites Or Preservatives?",
    desc: "Avoid foods that contain sulfites or preservatives.",
    icon: "sulfites_or_preservatives.png",
  },
  spices_e_g_mustard_cinnamon: {
    label: "Spices (e.g., Mustard, Cinnamon)?",
    desc: "Avoid foods that contain spices (e.g., mustard, cinnamon).",
    icon: "spices_e_g_mustard_cinnamon.png",
  },
  vegetables_specific_allergens: {
    label: "Vegetables (Specific Allergens)?",
    desc: "Avoid foods that contain vegetables (specific allergens).",
    icon: "vegetables_specific_allergens.png",
  },
  fruits_specific_allergens: {
    label: "Fruits (Specific Allergens)?",
    desc: "Avoid foods that contain fruits (specific allergens).",
    icon: "fruits_specific_allergens.png",
  },
  meat_specific_allergens: {
    label: "Meat (Specific Allergens)?",
    desc: "Avoid foods that contain meat (specific allergens).",
    icon: "meat_specific_allergens.png",
  },
  herbs_leafy_greens: {
    label: "Herbs/Leafy Greens?",
    desc: "Avoid foods that contain herbs/leafy greens.",
    icon: "herbs_leafy_greens.png",
  },
  cooking_oils_specific_allergens: {
    label: "Cooking Oils (Specific Allergens)?",
    desc: "Avoid foods that contain cooking oils (specific allergens).",
    icon: "cooking_oils_specific_allergens.png",
  },
  additives_flavorings_or_enzymes: {
    label: "Additives (Flavorings or Enzymes)?",
    desc: "Avoid foods that contain additives (flavorings or enzymes).",
    icon: "additives_flavorings_or_enzymes.png",
  },
  not_categorized: {
    label: "Not categorized?",
    desc: "Avoid foods that are not categorized.",
    icon: "not_categorized.png",
  },
};

const OPTION_ALIASES = {
  peanuts: "tree_nut",
  peanut: "tree_nut",
  tree_nuts: "tree_nut",
  dairy: "milk",
  eggs: "egg",
  seasame: "sesame",
  gluten: "wheat",
};

const INTOLERANCE_KEYWORDS = [
  "intolerance",
  "sensitivity",
  "lactose",
  "fructose",
  "histamine",
  "fodmap",
  "gluten",
  "caffeine",
  "msg",
];

const SCROLLABLE_OPTIONS_THRESHOLD = 18;

function normalizeKey(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function titleCase(value = "") {
  return String(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function isIntoleranceName(name = "") {
  const key = normalizeKey(name);
  return INTOLERANCE_KEYWORDS.some((keyword) => key.includes(keyword));
}

function resolveMetadataKey(name = "") {
  const key = normalizeKey(name);

  if (OPTION_METADATA[key]) return key;
  if (OPTION_ALIASES[key]) return OPTION_ALIASES[key];

  if (key.includes("coconut")) return "coconut";
  if (key.includes("peanut")) return "tree_nut";
  if (key.includes("tree_nut") || key.includes("nut")) return "tree_nut";
  if (key.includes("dairy") || key.includes("milk")) return "milk";
  if (key.includes("egg")) return "egg";
  if (key.includes("soy")) return "soy";
  if (key.includes("sesame") || key.includes("seasame")) return "sesame";
  if (key.includes("wheat") || key.includes("gluten")) return "wheat";
  if (key.includes("shellfish")) return "shellfish";
  if (key.includes("shrimp") || key.includes("prawn")) return "shrimp";
  if (key.includes("fish")) return "fish";

  return null;
}

function toIdArray(items) {
  if (!Array.isArray(items)) return [];
  return [
    ...new Set(
      items
        .map((item) => {
          if (typeof item === "number") return item;
          if (typeof item === "string") {
            const numeric = Number(item);
            return Number.isInteger(numeric) ? numeric : null;
          }
          if (item && typeof item === "object") {
            const numeric = Number(item.id);
            return Number.isInteger(numeric) ? numeric : null;
          }
          return null;
        })
        .filter((value) => Number.isInteger(value) && value > 0)
    ),
  ];
}

function parseJwtUserId(token = "") {
  if (typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, "=");
    const decoder = typeof atob === "function" ? atob : null;
    if (!decoder) return null;

    const payload = JSON.parse(decoder(padded));
    const rawId = Number(payload?.userId || payload?.user_id || payload?.sub || 0);
    return Number.isInteger(rawId) && rawId > 0 ? rawId : null;
  } catch {
    return null;
  }
}

function getSession() {
  const rawUser =
    localStorage.getItem("user_session") ||
    sessionStorage.getItem("user_session") ||
    localStorage.getItem("user");

  let user = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }

  const token = localStorage.getItem("auth_token") || user?.token || "";
  const storageUserId = Number(user?.user_id || user?.id || user?.uid || user?.sub || 0);
  const userId =
    Number.isInteger(storageUserId) && storageUserId > 0
      ? storageUserId
      : parseJwtUserId(token);

  return {
    userId,
    token,
  };
}

function parseAllergyOptions(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((item) => {
      const id = Number(item?.id);
      const name = String(item?.name || "").trim();
      if (!Number.isInteger(id) || id <= 0 || !name) return null;

      const key = normalizeKey(name);
      const metaKey = resolveMetadataKey(name);
      const meta = metaKey ? OPTION_METADATA[metaKey] : null;
      const useMetaCopy = Boolean(meta && metaKey === key);
      const kind = isIntoleranceName(name) ? "intolerance" : "allergy";

      return {
        id,
        key,
        name,
        kind,
        label: useMetaCopy ? meta.label : `${titleCase(name)}?`,
        desc: useMetaCopy
          ? meta.desc
          : `Avoid foods that contain ${name.toLowerCase()}.`,
        icon: meta?.icon || null,
      };
    })
    .filter(Boolean);
}

function parseDietaryOptions(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((item) => {
      const id = Number(item?.id);
      const name = String(item?.name || "").trim();
      if (!Number.isInteger(id) || id <= 0 || !name) return null;
      return { id, name };
    })
    .filter(Boolean);
}

function extractOptionName(item) {
  if (!item || typeof item !== "object") return "";

  const candidates = [
    item.name,
    item.label,
    item.title,
    item.description,
    item.level,
    item.spice_level,
    item.cuisine,
    item.method,
    item.condition,
  ];

  const value = candidates.find((candidate) => candidate != null && String(candidate).trim());
  return value ? String(value).trim() : "";
}

function parseNamedOptions(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((item) => {
      const id = Number(item?.id);
      const name = extractOptionName(item);
      if (!Number.isInteger(id) || id <= 0 || !name) return null;
      return { id, name };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildSelectedNames(ids, optionMap) {
  return ids
    .map((id) => optionMap.get(id))
    .filter(Boolean)
    .map((name) => titleCase(name));
}

async function readApiError(response, fallbackMessage) {
  if (!response) return fallbackMessage;

  try {
    const data = await response.clone().json();
    if (data && typeof data === "object") {
      return data.error || data.message || fallbackMessage;
    }
  } catch {
    // no-op
  }

  try {
    const text = await response.text();
    return text || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url,
  options = {},
  {
    attempts = 3,
    retryStatuses = [408, 429, 500, 502, 503, 504],
  } = {}
) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;

      if (attempt < attempts && retryStatuses.includes(response.status)) {
        await sleep(120 * attempt);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await sleep(120 * attempt);
    }
  }

  throw lastError || new Error("Network request failed");
}

export default function FoodPreferences() {
  const [allergyOptions, setAllergyOptions] = useState([]);
  const [dietaryOptions, setDietaryOptions] = useState([]);
  const [cuisineOptions, setCuisineOptions] = useState([]);
  const [dislikeOptions, setDislikeOptions] = useState([]);
  const [healthConditionOptions, setHealthConditionOptions] = useState([]);
  const [spiceLevelOptions, setSpiceLevelOptions] = useState([]);
  const [cookingMethodOptions, setCookingMethodOptions] = useState([]);

  const [selectedAllergyIds, setSelectedAllergyIds] = useState([]);
  const [selectedDietaryIds, setSelectedDietaryIds] = useState([]);
  const [selectedCuisineIds, setSelectedCuisineIds] = useState([]);
  const [selectedDislikeIds, setSelectedDislikeIds] = useState([]);
  const [selectedHealthConditionIds, setSelectedHealthConditionIds] = useState([]);
  const [selectedSpiceLevelIds, setSelectedSpiceLevelIds] = useState([]);
  const [selectedCookingMethodIds, setSelectedCookingMethodIds] = useState([]);

  const [showBanner, setShowBanner] = useState(false);
  const [showWarnings, setShowWarnings] = useState(true);
  const [hideMeals, setHideMeals] = useState(true);
  const [dislikeQuery, setDislikeQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setErrorMessage("");

      const { token } = getSession();

      try {
        const optionRequests = [
          {
            key: "allergies",
            url: `${API_BASE}/api/fooddata/allergies`,
            parser: parseAllergyOptions,
            setter: setAllergyOptions,
            fallbackError: "Failed to load allergy options",
          },
          {
            key: "dietary requirements",
            url: `${API_BASE}/api/fooddata/dietaryrequirements`,
            parser: parseDietaryOptions,
            setter: setDietaryOptions,
            fallbackError: "Failed to load dietary requirement options",
          },
          {
            key: "cuisines",
            url: `${API_BASE}/api/fooddata/cuisines`,
            parser: parseNamedOptions,
            setter: setCuisineOptions,
            fallbackError: "Failed to load cuisine options",
          },
          {
            key: "ingredients",
            url: `${API_BASE}/api/fooddata/ingredients`,
            parser: parseNamedOptions,
            setter: setDislikeOptions,
            fallbackError: "Failed to load ingredient options",
          },
          {
            key: "health conditions",
            url: `${API_BASE}/api/fooddata/healthconditions`,
            parser: parseNamedOptions,
            setter: setHealthConditionOptions,
            fallbackError: "Failed to load health condition options",
          },
          {
            key: "spice levels",
            url: `${API_BASE}/api/fooddata/spicelevels`,
            parser: parseNamedOptions,
            setter: setSpiceLevelOptions,
            fallbackError: "Failed to load spice level options",
          },
          {
            key: "cooking methods",
            url: `${API_BASE}/api/fooddata/cookingmethods`,
            parser: parseNamedOptions,
            setter: setCookingMethodOptions,
            fallbackError: "Failed to load cooking method options",
          },
        ];

        const optionResults = await Promise.allSettled(
          optionRequests.map(async (request) => {
            const response = await fetchWithRetry(request.url);
            if (!response.ok) {
              const reason = await readApiError(response, request.fallbackError);
              throw new Error(reason);
            }

            const payload = await response.json();
            return {
              request,
              rows: request.parser(payload),
            };
          })
        );

        const optionFailures = [];
        if (mounted) {
          optionRequests.forEach(({ setter }) => setter([]));

          optionResults.forEach((result, index) => {
            if (result.status === "fulfilled") {
              result.value.request.setter(result.value.rows);
              return;
            }

            const fallback = optionRequests[index].fallbackError;
            const reason = result.reason?.message || fallback;
            optionFailures.push(reason);
          });
        }

        let preferenceError = "";

        if (!token) {
          if (mounted) setPreferencesLoaded(true);
        } else {
          const preferenceRes = await fetchWithRetry(
            `${API_BASE}/api/user/preferences`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (preferenceRes.ok) {
            const preferenceData = await preferenceRes.json();

            if (mounted) {
              setSelectedAllergyIds(toIdArray(preferenceData?.allergies));
              setSelectedDietaryIds(toIdArray(preferenceData?.dietary_requirements));
              setSelectedCuisineIds(toIdArray(preferenceData?.cuisines));
              setSelectedDislikeIds(toIdArray(preferenceData?.dislikes));
              setSelectedHealthConditionIds(toIdArray(preferenceData?.health_conditions));
              setSelectedSpiceLevelIds(toIdArray(preferenceData?.spice_levels));
              setSelectedCookingMethodIds(toIdArray(preferenceData?.cooking_methods));
              setPreferencesLoaded(true);
            }
          } else if (preferenceRes.status === 401) {
            preferenceError = "Session expired or invalid. Please sign in again.";
            if (mounted) setPreferencesLoaded(false);
          } else if (preferenceRes.status === 403 || preferenceRes.status === 404) {
            if (mounted) setPreferencesLoaded(true);
          } else {
            preferenceError = await readApiError(
              preferenceRes,
              "Failed to load current user preferences"
            );
            if (mounted) setPreferencesLoaded(false);
          }
        }

        if (mounted) {
          const mergedErrors = [...optionFailures, preferenceError].filter(Boolean);
          setErrorMessage(mergedErrors[0] || "");
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(error?.message || "Failed to load preferences");
          setPreferencesLoaded(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const allergies = useMemo(
    () => allergyOptions.filter((item) => item.kind === "allergy"),
    [allergyOptions]
  );

  const intolerances = useMemo(
    () => allergyOptions.filter((item) => item.kind === "intolerance"),
    [allergyOptions]
  );

  const allergyOptionMap = useMemo(() => {
    return new Map(allergyOptions.map((item) => [item.id, item]));
  }, [allergyOptions]);

  const allergyNameMap = useMemo(() => {
    return new Map(allergyOptions.map((item) => [item.id, item.name]));
  }, [allergyOptions]);

  const dietaryOptionMap = useMemo(() => {
    return new Map(dietaryOptions.map((item) => [item.id, item.name]));
  }, [dietaryOptions]);

  const cuisineOptionMap = useMemo(() => {
    return new Map(cuisineOptions.map((item) => [item.id, item.name]));
  }, [cuisineOptions]);

  const dislikeOptionMap = useMemo(() => {
    return new Map(dislikeOptions.map((item) => [item.id, item.name]));
  }, [dislikeOptions]);

  const healthConditionOptionMap = useMemo(() => {
    return new Map(healthConditionOptions.map((item) => [item.id, item.name]));
  }, [healthConditionOptions]);

  const spiceLevelOptionMap = useMemo(() => {
    return new Map(spiceLevelOptions.map((item) => [item.id, item.name]));
  }, [spiceLevelOptions]);

  const cookingMethodOptionMap = useMemo(() => {
    return new Map(cookingMethodOptions.map((item) => [item.id, item.name]));
  }, [cookingMethodOptions]);

  const selectedAllergyNames = useMemo(
    () => buildSelectedNames(selectedAllergyIds, allergyNameMap),
    [allergyNameMap, selectedAllergyIds]
  );

  const selectedDietaryNames = useMemo(
    () => buildSelectedNames(selectedDietaryIds, dietaryOptionMap),
    [dietaryOptionMap, selectedDietaryIds]
  );

  const selectedCuisineNames = useMemo(
    () => buildSelectedNames(selectedCuisineIds, cuisineOptionMap),
    [cuisineOptionMap, selectedCuisineIds]
  );

  const selectedDislikeNames = useMemo(
    () => buildSelectedNames(selectedDislikeIds, dislikeOptionMap),
    [dislikeOptionMap, selectedDislikeIds]
  );

  const selectedHealthConditionNames = useMemo(
    () => buildSelectedNames(selectedHealthConditionIds, healthConditionOptionMap),
    [healthConditionOptionMap, selectedHealthConditionIds]
  );

  const selectedSpiceLevelNames = useMemo(
    () => buildSelectedNames(selectedSpiceLevelIds, spiceLevelOptionMap),
    [selectedSpiceLevelIds, spiceLevelOptionMap]
  );

  const selectedCookingMethodNames = useMemo(
    () => buildSelectedNames(selectedCookingMethodIds, cookingMethodOptionMap),
    [cookingMethodOptionMap, selectedCookingMethodIds]
  );

  const totalSelectedCount = useMemo(
    () =>
      selectedDietaryIds.length +
      selectedAllergyIds.length +
      selectedCuisineIds.length +
      selectedDislikeIds.length +
      selectedHealthConditionIds.length +
      selectedSpiceLevelIds.length +
      selectedCookingMethodIds.length,
    [
      selectedDietaryIds.length,
      selectedAllergyIds.length,
      selectedCuisineIds.length,
      selectedDislikeIds.length,
      selectedHealthConditionIds.length,
      selectedSpiceLevelIds.length,
      selectedCookingMethodIds.length,
    ]
  );

  const displayedDislikeOptions = useMemo(() => {
    const keyword = dislikeQuery.trim().toLowerCase();
    const base = keyword
      ? dislikeOptions.filter((item) => item.name.toLowerCase().includes(keyword)).slice(0, 60)
      : dislikeOptions.slice(0, 60);

    const selected = dislikeOptions.filter((item) => selectedDislikeIds.includes(item.id));
    return Array.from(new Map([...selected, ...base].map((item) => [item.id, item])).values());
  }, [dislikeOptions, dislikeQuery, selectedDislikeIds]);

  const summaryGroups = [
    { label: "Dietary Requirements", names: selectedDietaryNames },
    { label: "Allergies & Intolerances", names: selectedAllergyNames },
    { label: "Preferred Cuisines", names: selectedCuisineNames },
    { label: "Disliked Ingredients", names: selectedDislikeNames },
    { label: "Health Conditions", names: selectedHealthConditionNames },
    { label: "Spice Levels", names: selectedSpiceLevelNames },
    { label: "Cooking Methods", names: selectedCookingMethodNames },
  ];

  const toggleId = (setter, id) => {
    setter((prev) => (
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    ));
  };

  const toggleAllergyItem = (id) => {
    toggleId(setSelectedAllergyIds, id);
  };

  const toggleDietaryItem = (id) => {
    toggleId(setSelectedDietaryIds, id);
  };

  const handleSave = async () => {
    const { userId, token } = getSession();

    if (!token) {
      const hasSsoSession = Boolean(localStorage.getItem("sso_session"));
      setErrorMessage(
        hasSsoSession
          ? "Google session found but API token is missing. Please sign in with email/password."
          : "Please log in to save your preferences."
      );
      return;
    }

    if (!userId) {
      setErrorMessage("Unable to resolve your account. Please sign in again.");
      return;
    }

    if (!preferencesLoaded) {
      setErrorMessage("Current preferences are not loaded yet. Please refresh and try again.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const payload = {
        user: { userId },
        dietary_requirements: [...new Set(selectedDietaryIds)],
        allergies: [...new Set(selectedAllergyIds)],
        cuisines: [...new Set(selectedCuisineIds)],
        dislikes: [...new Set(selectedDislikeIds)],
        health_conditions: [...new Set(selectedHealthConditionIds)],
        spice_levels: [...new Set(selectedSpiceLevelIds)],
        cooking_methods: [...new Set(selectedCookingMethodIds)],
      };

      const res = await fetch(`${API_BASE}/api/user/preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const reason = await readApiError(res, "Unable to save preferences");
        throw new Error(reason);
      }

      setShowBanner(true);
    } catch (error) {
      setErrorMessage(error?.message || "Unable to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const renderItemCard = (item) => (
    <div key={item.id} className="item-card">
      {item.icon ? (
        <img
          src={`/images/allergy-icons/${item.icon}`}
          alt={item.label}
          className="item-icon"
        />
      ) : (
        <div className="item-icon" aria-hidden="true">
          {item.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="details">
        <strong>{item.label}</strong>
        <p>{item.desc}</p>
      </div>
      <label className="switch">
        <input
          type="checkbox"
          checked={selectedAllergyIds.includes(item.id)}
          onChange={() => toggleAllergyItem(item.id)}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );

  const renderPillGroup = ({ title, options, selectedIds, onToggle, emptyText = "No options found." }) => (
    <article className="preference-group-card">
      <h4>{title}</h4>
      {options.length === 0 ? (
        <p className="preference-group-empty">{emptyText}</p>
      ) : (
        <div
          className={`preference-group-pills ${
            options.length > SCROLLABLE_OPTIONS_THRESHOLD
              ? "preference-group-pills--scrollable"
              : ""
          }`}
        >
          {options.map((item) => {
            const active = selectedIds.includes(item.id);
            return (
              <button
                key={`${title}-${item.id}`}
                type="button"
                className={`dietary-pill ${active ? "dietary-pill--active" : ""}`}
                onClick={() => onToggle(item.id)}
              >
                {titleCase(item.name)}
              </button>
            );
            })}
        </div>
      )}
      {options.length > SCROLLABLE_OPTIONS_THRESHOLD ? (
        <p className="preference-scroll-hint">Scroll to view more options</p>
      ) : null}
    </article>
  );

  return (
    <div className="page-wrapper">
      <div className="purple-box">
        <section className="form-hero-panel" aria-label="Food preference form banner">
          <img
            src={preferenceHeroPanel}
            alt="Healthy nutrition ingredients on a wooden table"
            className="form-hero-image"
          />
          <div className="form-hero-overlay">
            <span className="form-hero-badge">Nutrition Profile</span>
            <h2>Build your personal food profile</h2>
            <p>Set restrictions and taste preferences to get safer meal suggestions.</p>
          </div>
        </section>

        <div className="section-heading">
          <div className="heading-meta">
            <span className="heading-chip">Approx. 2 minutes</span>
            <span className="heading-chip heading-chip--soft">
              {totalSelectedCount} selections
            </span>
          </div>
          <h1>Food Allergies, Intolerances & Dietary Requirements</h1>
          <p className="subtitle">
            <strong>Know what to avoid. Stay safe, eat smart.</strong>
          </p>
          <p>
            Select dietary requirements, allergens, and intolerances to personalize
            safer meal recommendations.
          </p>
          <span className="start-btn">START SELECTING</span>
        </div>

        {errorMessage ? (
          <p role="alert" className="error-banner">{errorMessage}</p>
        ) : null}

        <div className="selection-summary selection-summary--dietary">
          <h4>
            <strong>Dietary Requirements</strong>
          </h4>
          <p className="dietary-note">Choose all that apply.</p>
          <div className="dietary-pills">
            {dietaryOptions.length === 0 ? (
              <span className="tag">No dietary requirement options found.</span>
            ) : (
              dietaryOptions.map((item) => {
                const active = selectedDietaryIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`dietary-pill ${active ? "dietary-pill--active" : ""}`}
                    onClick={() => toggleDietaryItem(item.id)}
                  >
                    {titleCase(item.name)}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="selection-summary selection-summary--taste">
          <h4>
            <strong>Taste & Cooking Preferences</strong>
          </h4>
          <p className="dietary-note">
            Optional, but recommended for more accurate meal suggestions.
          </p>

          <div className="preference-groups-grid">
            {renderPillGroup({
              title: "Preferred Cuisines",
              options: cuisineOptions,
              selectedIds: selectedCuisineIds,
              onToggle: (id) => toggleId(setSelectedCuisineIds, id),
            })}

            <article className="preference-group-card preference-group-card--dislike">
              <h4>Disliked Ingredients</h4>
              <input
                type="text"
                className="preference-search"
                placeholder="Search ingredient name..."
                value={dislikeQuery}
                onChange={(event) => setDislikeQuery(event.target.value)}
              />
              {displayedDislikeOptions.length === 0 ? (
                <p className="preference-group-empty">No ingredient options found.</p>
              ) : (
                <div
                  className={`preference-group-pills ${
                    displayedDislikeOptions.length > SCROLLABLE_OPTIONS_THRESHOLD
                      ? "preference-group-pills--scrollable"
                      : ""
                  } preference-group-pills--dislike`}
                >
                  {displayedDislikeOptions.map((item) => {
                    const active = selectedDislikeIds.includes(item.id);
                    return (
                      <button
                        key={`dislike-${item.id}`}
                        type="button"
                        className={`dietary-pill ${active ? "dietary-pill--active" : ""}`}
                        onClick={() => toggleId(setSelectedDislikeIds, item.id)}
                      >
                        {titleCase(item.name)}
                      </button>
                    );
                  })}
                </div>
              )}
              {displayedDislikeOptions.length > SCROLLABLE_OPTIONS_THRESHOLD ? (
                <p className="preference-scroll-hint">Scroll to view more options</p>
              ) : null}
            </article>

            {renderPillGroup({
              title: "Health Conditions",
              options: healthConditionOptions,
              selectedIds: selectedHealthConditionIds,
              onToggle: (id) => toggleId(setSelectedHealthConditionIds, id),
            })}

            {renderPillGroup({
              title: "Spice Levels",
              options: spiceLevelOptions,
              selectedIds: selectedSpiceLevelIds,
              onToggle: (id) => toggleId(setSelectedSpiceLevelIds, id),
            })}

            {renderPillGroup({
              title: "Cooking Methods",
              options: cookingMethodOptions,
              selectedIds: selectedCookingMethodIds,
              onToggle: (id) => toggleId(setSelectedCookingMethodIds, id),
            })}
          </div>
        </div>

        {loading ? (
          <p className="loading-note">Loading preference options...</p>
        ) : (
          <div className="grid">
            <div className="column white-card white-card--allergies">
              <h3>Common Allergies</h3>
              {allergies.length === 0 ? (
                <p>No allergy options found.</p>
              ) : (
                <div className="allergy-items-grid">
                  {allergies.map(renderItemCard)}
                </div>
              )}
            </div>

            <div className="column white-card white-card--intolerances">
              <h3>Common Intolerances</h3>
              {intolerances.length === 0
                ? <p>No intolerance options found.</p>
                : intolerances.map(renderItemCard)}
            </div>
          </div>
        )}

        <div className="selection-summary selection-summary--preview">
          <h4>
            <strong>Your selections preview</strong>
          </h4>

          <div className="selection-group-grid">
            {summaryGroups.map((group) => (
              <div className="selection-group-card" key={group.label}>
                <h5>{group.label}</h5>
                <div className="tags">
                  {group.names.length ? (
                    group.names.map((name) => (
                      <span className="tag" key={`${group.label}-${name}`}>
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="tag tag--empty">Not set</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="preference-options">
          <h4>Preferences</h4>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={showWarnings}
              onChange={(event) => setShowWarnings(event.target.checked)}
            />
            Show warnings on recipes with my allergens
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={hideMeals}
              onChange={(event) => setHideMeals(event.target.checked)}
            />
            Hide meals that contain my selected allergens
          </label>
        </div>

        <div className="save-btn-wrapper">
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={loading || saving || !preferencesLoaded}
          >
            {saving ? "SAVING..." : "SAVE PREFERENCES"}
          </button>
          {showBanner && (
            <div className="styled-alert">
              <p className="alert-message">
                <strong>NutriHelp says</strong>
                <br />
                Preferences saved successfully!
              </p>
              <button className="alert-ok" onClick={() => setShowBanner(false)}>
                OK
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
