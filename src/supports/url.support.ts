export const extractUrls = (text: string): URL[] => {
  return text
    .split(/\s+/)
    .map((url) => {
      try {
        return new URL(url);
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);
};
