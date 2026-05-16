export const isValidDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return date instanceof Date && !Number.isNaN(date.getTime());
};

export const formatDate = (value, fallback = "-") => {
  if (!isValidDate(value)) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
};

export const formatRelativeTime = (value, fallback = "Never") => {
  if (!isValidDate(value)) return fallback;

  const date = new Date(value);
  return date.toLocaleDateString();
};
