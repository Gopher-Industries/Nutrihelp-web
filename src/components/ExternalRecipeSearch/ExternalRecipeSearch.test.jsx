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

  it("debounces typing into a single search", () => {
    render(<ExternalRecipeSearch onPrefill={jest.fn()} />);

    typeQuery("arr");
    typeQuery("arra");
    typeQuery("arrab");
    act(() => { jest.advanceTimersByTime(400); });

    expect(searchRecipeSources).toHaveBeenCalledTimes(1);
    expect(searchRecipeSources).toHaveBeenCalledWith("arrab");
  });

  it("shows results with cuisine and source attribution", async () => {
    render(<ExternalRecipeSearch onPrefill={jest.fn()} />);

    typeQuery("arrabiata");
    await act(async () => { jest.advanceTimersByTime(400); });

    expect(await screen.findByText("Spicy Arrabiata Penne")).toBeTruthy();
    expect(screen.getByText(/Italian/)).toBeTruthy();
    expect(screen.getByText(/Recipes from TheMealDB/i)).toBeTruthy();
  });

  it("tells the user when nothing matched", async () => {
    searchRecipeSources.mockResolvedValue([]);
    render(<ExternalRecipeSearch onPrefill={jest.fn()} />);

    typeQuery("zzzznope");
    await act(async () => { jest.advanceTimersByTime(400); });

    expect(await screen.findByText(/No recipes found/i)).toBeTruthy();
  });

  it("maps the chosen recipe and hands the result upward", async () => {
    const onPrefill = jest.fn();
    render(<ExternalRecipeSearch onPrefill={onPrefill} />);

    typeQuery("arrabiata");
    await act(async () => { jest.advanceTimersByTime(400); });
    fireEvent.click(await screen.findByText("Spicy Arrabiata Penne"));
    await act(async () => {});

    await waitFor(() => expect(onPrefill).toHaveBeenCalledTimes(1));
    expect(mapRecipeSource).toHaveBeenCalledWith("themealdb", "52771");
    expect(onPrefill.mock.calls[0][0].draft.recipe_name).toBe("Spicy Arrabiata Penne");
  });

  it("shows a mapping state while the long map call runs", async () => {
    let resolveMap;
    mapRecipeSource.mockReturnValue(new Promise((resolve) => { resolveMap = resolve; }));
    render(<ExternalRecipeSearch onPrefill={jest.fn()} />);

    typeQuery("arrabiata");
    await act(async () => { jest.advanceTimersByTime(400); });
    fireEvent.click(await screen.findByText("Spicy Arrabiata Penne"));

    expect(await screen.findByText(/Mapping recipe/i)).toBeTruthy();

    await act(async () => {
      resolveMap({ draft: {}, unmapped_fields: [], source_meta: {}, mapper: {} });
    });
  });

  it("reports a mapping failure without breaking the form", async () => {
    mapRecipeSource.mockRejectedValue(new Error("mapper exploded"));
    const onError = jest.fn();
    render(<ExternalRecipeSearch onPrefill={jest.fn()} onError={onError} />);

    typeQuery("arrabiata");
    await act(async () => { jest.advanceTimersByTime(400); });
    fireEvent.click(await screen.findByText("Spicy Arrabiata Penne"));
    await act(async () => {});

    await waitFor(() => expect(onError).toHaveBeenCalled());
  });
});
