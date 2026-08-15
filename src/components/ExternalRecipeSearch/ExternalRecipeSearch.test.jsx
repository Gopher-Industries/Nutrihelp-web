import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import ExternalRecipeSearch from "./ExternalRecipeSearch";
import { searchRecipeSources, mapRecipeSource } from "../../services/recipeSourcesApi";

jest.mock("../../services/recipeSourcesApi");

const ROW = {
  source: "themealdb",
  external_id: "52771",
  title: "Spicy Arrabiata Penne",
  thumbnail: "https://example.com/t.jpg",
  cuisine: "Italian",
  category: "Vegetarian",
};

function typeQuery(value) {
  fireEvent.change(screen.getByPlaceholderText(/start from a real recipe/i), {
    target: { value },
  });
}

// Jest 27's fake timers don't ship `advanceTimersByTimeAsync`, so a plain
// `jest.advanceTimersByTime(400)` inside `act(async () => {...})` fires the
// debounced setTimeout callback but returns before the awaited API-call
// promise chain inside it (setIsSearching -> await search -> setResults/...)
// has drained through the microtask queue. That leaves those state updates
// outside act's tracking, producing "not wrapped in act(...)" warnings even
// though the tests still pass (RTL's findBy* polls and re-wraps later). This
// helper drains the microtask queue explicitly, inside the same act() call,
// so every state update settles before act (and the test) moves on.
async function flushMicrotasks() {
  for (let i = 0; i < 4; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
}

async function advanceDebounce(ms = 400) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    await flushMicrotasks();
  });
}

describe("ExternalRecipeSearch", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    searchRecipeSources.mockResolvedValue([ROW]);
    mapRecipeSource.mockResolvedValue({
      draft: { recipe_name: "Spicy Arrabiata Penne" },
      unmapped_fields: ["calories"],
      source_meta: { attribution: "TheMealDB" },
      mapper: { strategy: "llm" },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it("does not search below three characters", () => {
    render(<ExternalRecipeSearch onPrefill={jest.fn()} />);

    typeQuery("ab");
    act(() => { jest.advanceTimersByTime(1000); });

    expect(searchRecipeSources).not.toHaveBeenCalled();
  });

  it("debounces typing into a single search", async () => {
    render(<ExternalRecipeSearch onPrefill={jest.fn()} />);

    typeQuery("arr");
    typeQuery("arra");
    typeQuery("arrab");
    // "arrab" resolves to a real search (length >= MIN_QUERY_LENGTH), so the
    // debounced callback's promise chain must be flushed, same as every
    // other timer advance in this file — a plain synchronous act() here
    // would let setIsSearching/setResults/setSearched land outside act.
    await advanceDebounce();

    expect(searchRecipeSources).toHaveBeenCalledTimes(1);
    expect(searchRecipeSources).toHaveBeenCalledWith("arrab");
  });

  it("shows results with cuisine and source attribution", async () => {
    render(<ExternalRecipeSearch onPrefill={jest.fn()} />);

    typeQuery("arrabiata");
    await advanceDebounce();

    expect(await screen.findByText("Spicy Arrabiata Penne")).toBeTruthy();
    expect(screen.getByText(/Italian/)).toBeTruthy();
    expect(screen.getByText(/Recipes from TheMealDB/i)).toBeTruthy();
  });

  it("tells the user when nothing matched", async () => {
    searchRecipeSources.mockResolvedValue([]);
    render(<ExternalRecipeSearch onPrefill={jest.fn()} />);

    typeQuery("zzzznope");
    await advanceDebounce();

    expect(await screen.findByText(/No recipes found/i)).toBeTruthy();
  });

  it("maps the chosen recipe and hands the result upward", async () => {
    const onPrefill = jest.fn();
    render(<ExternalRecipeSearch onPrefill={onPrefill} />);

    typeQuery("arrabiata");
    await advanceDebounce();
    fireEvent.click(await screen.findByText("Spicy Arrabiata Penne"));
    await act(async () => { await flushMicrotasks(); });

    await waitFor(() => expect(onPrefill).toHaveBeenCalledTimes(1));
    expect(mapRecipeSource).toHaveBeenCalledWith("themealdb", "52771");
    expect(onPrefill.mock.calls[0][0].draft.recipe_name).toBe("Spicy Arrabiata Penne");
  });

  it("does not show the no-results message after a successful prefill", async () => {
    render(<ExternalRecipeSearch onPrefill={jest.fn()} />);

    typeQuery("arrabiata");
    await advanceDebounce();
    fireEvent.click(await screen.findByText("Spicy Arrabiata Penne"));
    await act(async () => { await flushMicrotasks(); });

    await waitFor(() => expect(screen.queryByText(/Mapping recipe/i)).toBeNull());
    expect(screen.queryByText(/No recipes found/i)).toBeNull();
  });

  it("shows a mapping state while the long map call runs", async () => {
    let resolveMap;
    mapRecipeSource.mockReturnValue(new Promise((resolve) => { resolveMap = resolve; }));
    render(<ExternalRecipeSearch onPrefill={jest.fn()} />);

    typeQuery("arrabiata");
    await advanceDebounce();
    fireEvent.click(await screen.findByText("Spicy Arrabiata Penne"));

    expect(await screen.findByText(/Mapping recipe/i)).toBeTruthy();

    await act(async () => {
      resolveMap({ draft: {}, unmapped_fields: [], source_meta: {}, mapper: {} });
      await flushMicrotasks();
    });
  });

  it("replaces the results dropdown with the mapping panel while a selection is in flight", async () => {
    let resolveMap;
    mapRecipeSource.mockReturnValue(new Promise((resolve) => { resolveMap = resolve; }));
    render(<ExternalRecipeSearch onPrefill={jest.fn()} />);

    typeQuery("arrabiata");
    await advanceDebounce();
    fireEvent.click(await screen.findByText("Spicy Arrabiata Penne"));

    // The mapping panel takes over the same spot the results dropdown
    // occupied — the dropdown's own attribution line (only rendered inside
    // the results list) must be gone, and the mapping status must be present.
    expect(await screen.findByText(/Mapping recipe/i)).toBeTruthy();
    expect(screen.queryByText(/Recipes from TheMealDB/i)).toBeFalsy();
    expect(screen.queryByText("Spicy Arrabiata Penne")).toBeFalsy();

    await act(async () => {
      resolveMap({ draft: {}, unmapped_fields: [], source_meta: {}, mapper: {} });
      await flushMicrotasks();
    });
  });

  it("reports a mapping failure without breaking the form", async () => {
    mapRecipeSource.mockRejectedValue(new Error("mapper exploded"));
    const onError = jest.fn();
    render(<ExternalRecipeSearch onPrefill={jest.fn()} onError={onError} />);

    typeQuery("arrabiata");
    await advanceDebounce();
    fireEvent.click(await screen.findByText("Spicy Arrabiata Penne"));
    await act(async () => { await flushMicrotasks(); });

    await waitFor(() => expect(onError).toHaveBeenCalled());
  });

  it("keeps showing results after a failed map instead of the empty-state message", async () => {
    mapRecipeSource.mockRejectedValue(new Error("mapper exploded"));
    const onError = jest.fn();
    render(<ExternalRecipeSearch onPrefill={jest.fn()} onError={onError} />);

    typeQuery("arrabiata");
    await advanceDebounce();
    fireEvent.click(await screen.findByText("Spicy Arrabiata Penne"));
    await act(async () => { await flushMicrotasks(); });

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(screen.queryByText(/No recipes found/i)).toBeFalsy();
    expect(screen.getByText("Spicy Arrabiata Penne")).toBeTruthy();
  });

  it("ignores a stale search response that resolves after a newer query was already typed", async () => {
    let resolveStale;
    let resolveFresh;
    searchRecipeSources.mockImplementation((q) => {
      if (q === "arrab") {
        return new Promise((resolve) => { resolveStale = resolve; });
      }
      if (q === "arrabx") {
        return new Promise((resolve) => { resolveFresh = resolve; });
      }
      return Promise.resolve([]);
    });

    render(<ExternalRecipeSearch onPrefill={jest.fn()} />);

    typeQuery("arrab");
    await advanceDebounce();
    expect(searchRecipeSources).toHaveBeenCalledWith("arrab");

    typeQuery("arrabx");
    await advanceDebounce();
    expect(searchRecipeSources).toHaveBeenCalledWith("arrabx");

    // The stale ("arrab") request resolves only now, after the user has
    // already moved on to a newer query. Its results must be dropped.
    await act(async () => {
      resolveStale([{ ...ROW, external_id: "stale-1", title: "Stale Spaghetti" }]);
      await flushMicrotasks();
    });

    expect(screen.queryByText("Stale Spaghetti")).toBeFalsy();

    // The newer ("arrabx") request resolving afterward must still render.
    await act(async () => {
      resolveFresh([{ ...ROW, external_id: "fresh-1", title: "Fresh Fettuccine" }]);
      await flushMicrotasks();
    });

    expect(await screen.findByText("Fresh Fettuccine")).toBeTruthy();
    expect(screen.queryByText("Stale Spaghetti")).toBeFalsy();
  });
});
