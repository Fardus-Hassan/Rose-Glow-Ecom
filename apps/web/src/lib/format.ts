export function formatBdt(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function bdMobile(value: string) {
  let raw = value.replace(/[\s-]/g, "");
  if (raw.startsWith("+880")) raw = `0${raw.slice(4)}`;
  else if (raw.startsWith("880")) raw = `0${raw.slice(3)}`;
  return /^01\d{9}$/.test(raw) ? raw : "";
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
