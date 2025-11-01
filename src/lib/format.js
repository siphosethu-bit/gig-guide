export const formatDateRange = (startISO, endISO) => {
  const tz = "Africa/Johannesburg";
  const fmt = new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium", timeStyle: "short", timeZone: tz
  });
  return `${fmt.format(new Date(startISO))} – ${fmt.format(new Date(endISO))}`;
};
