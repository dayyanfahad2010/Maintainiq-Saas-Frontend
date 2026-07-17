/** Builds a FormData body from a flat payload object plus an array of File objects. */
export function toFormData(payload, files = [], fileField = "evidence") {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
  });
  files.forEach((file) => formData.append(fileField, file));
  return formData;
}
