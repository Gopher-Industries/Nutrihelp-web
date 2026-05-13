import { collectReadablePageText } from "./ttsTextCollector";

describe("ttsTextCollector", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("collects visible page content and excludes noisy regions", () => {
    document.body.innerHTML = `
      <nav>Navigation Text</nav>
      <main>
        <h1>Dashboard</h1>
        <p>Welcome to your meal planner.</p>
        <section class="home-reviews" aria-label="User reviews">
          <p>This review should not be read.</p>
        </section>
        <section class="tts-ignore">Ignore this content</section>
        <div style="display:none">Hidden by display none</div>
        <div style="display:none"><span>Hidden by parent</span></div>
        <div aria-hidden="true">Hidden by aria</div>
      </main>
      <footer>Footer details</footer>
    `;

    const result = collectReadablePageText(document.body);

    expect(result).toContain("Dashboard");
    expect(result).toContain("Welcome to your meal planner.");
    expect(result).not.toContain("Navigation Text");
    expect(result).not.toContain("Footer details");
    expect(result).not.toContain("Ignore this content");
    expect(result).not.toContain("This review should not be read.");
    expect(result).not.toContain("Hidden by display none");
    expect(result).not.toContain("Hidden by parent");
    expect(result).not.toContain("Hidden by aria");
  });

  it("avoids duplicate adjacent chunks from mirrored DOM fragments", () => {
    document.body.innerHTML = `
      <main>
        <p>Same line</p>
        <div>Same line</div>
        <p>Another line</p>
      </main>
    `;

    const result = collectReadablePageText(document.body);
    const sameLineCount = result.split("Same line").length - 1;

    expect(sameLineCount).toBe(1);
    expect(result).toContain("Another line");
  });

  it("truncates very long content to keep reading focused", () => {
    const longText = "This is a sentence. ".repeat(300);
    document.body.innerHTML = `<main><p>${longText}</p></main>`;

    const result = collectReadablePageText(document.body);

    expect(result.length).toBeLessThanOrEqual(1810);
    expect(result.endsWith("...")).toBe(true);
  });
});
