export function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const startDateStr = formatDate(start);
  const endDateStr = formatDate(end);

  return {
    startDateStr,
    endDateStr,
    cdateStart: `${startDateStr} 00:00:00`,
    cdateEnd: `${endDateStr} 23:59:59`,
  };
}