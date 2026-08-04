export function getDefaultDateRange() {
  const now = new Date();
  const endYear = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const cdateStart = `${endYear - 1}-${month}-${day}`;
  const cdateEnd = `${endYear}-${month}-${day}`;
  return { cdateStart, cdateEnd };
}