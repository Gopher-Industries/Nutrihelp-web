import { readFileAsDataUrl } from "./readFileAsDataUrl";

describe("readFileAsDataUrl", () => {
  it("resolves with the file as a data URL", async () => {
    const file = new File(["hello"], "note.txt", { type: "text/plain" });

    const dataUrl = await readFileAsDataUrl(file);

    expect(dataUrl).toBe("data:text/plain;base64,aGVsbG8=");
  });

  it("rejects when the browser cannot read the file", async () => {
    // Awaiting the read is what keeps Save Recipe locked until the upload ends,
    // so a failed read has to reject rather than hang.
    const original = global.FileReader;
    global.FileReader = class {
      readAsDataURL() {
        this.error = new Error("unreadable");
        this.onerror();
      }
    };

    try {
      await expect(readFileAsDataUrl(new Blob(["x"]))).rejects.toThrow("unreadable");
    } finally {
      global.FileReader = original;
    }
  });
});
