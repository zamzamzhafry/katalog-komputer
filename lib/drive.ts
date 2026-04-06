export function convertDriveLink(url: string): string {
  if (!url) {
    return "https://placehold.co/1200x800?text=No+Photo";
  }

  const idMatch = url.match(/[-\w]{25,}/);
  if (!idMatch || idMatch.length === 0) {
    return url;
  }

  return `https://drive.google.com/thumbnail?id=${idMatch[0]}&sz=w1200`;
}
