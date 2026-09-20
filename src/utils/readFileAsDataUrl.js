/**
 * Reads a File or Blob as a base64 data URL.
 *
 * A promise, not a callback, so the caller can await it: work that carries on
 * inside `onloadend` escapes whatever the caller wrapped around the save.
 */
export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("The file could not be read."));
    reader.readAsDataURL(file);
  });

export default readFileAsDataUrl;
