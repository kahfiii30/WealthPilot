export const isValidDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return date instanceof Date && !Number.isNaN(date.getTime());
};

export const formatDate = (value, fallback = "-") => {
  if (!isValidDate(value)) return fallback;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
};

export const formatRelativeTime = (value, fallback = "Never") => {
  if (!isValidDate(value)) return fallback;

  const date = new Date(value);
  return date.toLocaleDateString();
};
