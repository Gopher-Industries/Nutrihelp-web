import React, { useCallback, useEffect, useRef, useState } from "react";
import { searchRecipeSources, mapRecipeSource } from "../../services/recipeSourcesApi";
import "./ExternalRecipeSearch.css";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 400;

export default function ExternalRecipeSearch({ onPrefill, onError }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mappingTitle, setMappingTitle] = useState("");
  const latestQueryRef = useRef("");

  useEffect(() => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearched(false);
      return undefined;
    }

    const trimmed = query.trim();
    latestQueryRef.current = trimmed;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const rows = await searchRecipeSources(trimmed);
      // Ignore a slow response for a query the user has already moved past.
      if (latestQueryRef.current !== trimmed) return;
      setResults(rows);
      setSearched(true);
      setIsSearching(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    async (row) => {
      const previousResults = results;
      setMappingTitle(row.title);
      setResults([]);
      try {
        const mapped = await mapRecipeSource(row.source, row.external_id);
        onPrefill?.(mapped);
      } catch (error) {
        onError?.(error.message || "Couldn't map this recipe — try another or fill it in manually.");
        // Restore the prior results so a failed map doesn't fall through to the
        // misleading "No recipes found" empty-state — the matches still exist,
        // only the mapping attempt failed.
        setResults(previousResults);
      } finally {
        setMappingTitle("");
      }
    },
    [onPrefill, onError, results]
  );

  return (
    <div className="external-recipe-search">
      <label className="external-recipe-search__label" htmlFor="external-recipe-search-input">
        Start from a real recipe <span className="external-recipe-search__optional">(optional)</span>
      </label>

      <input
        id="external-recipe-search-input"
        type="text"
        className="external-recipe-search__input"
        placeholder="Start from a real recipe — search TheMealDB"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
        disabled={Boolean(mappingTitle)}
      />

      {mappingTitle && (
        <p className="external-recipe-search__status" role="status">
          Mapping recipe “{mappingTitle}” — this can take up to a minute. You can keep filling the
          form in manually instead.
        </p>
      )}

      {!mappingTitle && isSearching && (
        <p className="external-recipe-search__status">Searching…</p>
      )}

      {!mappingTitle && searched && results.length === 0 && !isSearching && (
        <p className="external-recipe-search__status">
          No recipes found — you can create it manually below.
        </p>
      )}

      {!mappingTitle && results.length > 0 && (
        <ul className="external-recipe-search__results">
          {results.map((row) => (
            <li key={`${row.source}-${row.external_id}`}>
              <button
                type="button"
                className="external-recipe-search__result"
                onClick={() => handleSelect(row)}
              >
                {row.thumbnail && (
                  <img src={row.thumbnail} alt="" className="external-recipe-search__thumb" />
                )}
                <span className="external-recipe-search__meta">
                  <span className="external-recipe-search__title">{row.title}</span>
                  <span className="external-recipe-search__sub">
                    {[row.cuisine, row.category].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="external-recipe-search__badge">{row.source}</span>
              </button>
            </li>
          ))}
          <li className="external-recipe-search__attribution">Recipes from TheMealDB</li>
        </ul>
      )}
    </div>
  );
}
