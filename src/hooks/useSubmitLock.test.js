import { renderHook, act } from "@testing-library/react";
import { useSubmitLock } from "./useSubmitLock";

// A save that stays open until the test settles it, like a slow network call.
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useSubmitLock", () => {
  it("starts unlocked", () => {
    const { result } = renderHook(() => useSubmitLock());

    expect(result.current.isLocked).toBe(false);
  });

  it("reports locked while the work is in flight, and unlocked once it settles", async () => {
    const save = deferred();
    const { result } = renderHook(() => useSubmitLock());

    let running;
    act(() => {
      running = result.current.run(() => save.promise);
    });
    expect(result.current.isLocked).toBe(true);

    await act(async () => {
      save.resolve("saved");
      await running;
    });
    expect(result.current.isLocked).toBe(false);
  });

  it("ignores a second click while the first save is still running", async () => {
    // Seen in the app: Save Recipe stayed clickable for the 25 seconds a save can
    // take, and every extra click stored the same recipe again.
    const save = deferred();
    const work = jest.fn(() => save.promise);
    const { result } = renderHook(() => useSubmitLock());

    let first;
    let second;
    act(() => {
      first = result.current.run(work);
      // Same tick, before React has re-rendered: a state flag alone would miss this.
      second = result.current.run(work);
    });

    await act(async () => {
      save.resolve("saved");
      await Promise.all([first, second]);
    });

    expect(work).toHaveBeenCalledTimes(1);
    await expect(first).resolves.toBe("saved");
    await expect(second).resolves.toBeUndefined();
  });

  it("unlocks after a failed save so the user can try again", async () => {
    const save = deferred();
    const { result } = renderHook(() => useSubmitLock());

    let running;
    act(() => {
      running = result.current.run(() => save.promise);
    });

    await act(async () => {
      save.reject(new Error("network down"));
      await running.catch(() => {});
    });

    expect(result.current.isLocked).toBe(false);
    await expect(running).rejects.toThrow("network down");

    const retry = jest.fn(() => Promise.resolve("saved"));
    await act(async () => {
      await result.current.run(retry);
    });
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("unlocks when the work throws before returning a promise", async () => {
    const { result } = renderHook(() => useSubmitLock());

    await act(async () => {
      await result.current
        .run(() => {
          throw new Error("bad input");
        })
        .catch(() => {});
    });

    expect(result.current.isLocked).toBe(false);
  });
});
