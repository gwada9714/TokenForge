export function formatDate(date: Date | string, locale = "fr-FR"): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string, locale = "fr-FR"): string {
  const d = new Date(date);
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return formatDate(d);
  } else if (days > 0) {
    return `il y a ${days} jour${days > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else {
    return "à l'instant";
  }
}

export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function isFuture(date: Date | string): boolean {
  return new Date(date).getTime() > new Date().getTime();
}

export function isPast(date: Date | string): boolean {
  return new Date(date).getTime() < new Date().getTime();
}
