export type LandingPoint = { en: string; bn: string };

export type ProductLandingConfig = {
  eyebrowEn: string;
  eyebrowBn: string;
  headlineEn: string;
  headlineBn: string;
  bodyEn: string;
  bodyBn: string;
  points: LandingPoint[];
  relatedSlugs: string[];
  metaTitleEn: string;
  metaTitleBn: string;
  metaDescriptionEn: string;
  metaDescriptionBn: string;
};

export const emptyLandingConfig = (): ProductLandingConfig => ({
  eyebrowEn: "",
  eyebrowBn: "",
  headlineEn: "",
  headlineBn: "",
  bodyEn: "",
  bodyBn: "",
  points: [
    { en: "", bn: "" },
    { en: "", bn: "" },
    { en: "", bn: "" },
  ],
  relatedSlugs: [],
  metaTitleEn: "",
  metaTitleBn: "",
  metaDescriptionEn: "",
  metaDescriptionBn: "",
});

export function parseLandingConfig(raw: unknown): ProductLandingConfig {
  const base = emptyLandingConfig();
  if (!raw || typeof raw !== "object") return base;
  const v = raw as Record<string, unknown>;
  const pointsRaw = Array.isArray(v.points) ? v.points : [];
  const points: LandingPoint[] = [0, 1, 2].map((i) => {
    const row = pointsRaw[i];
    if (row && typeof row === "object") {
      const p = row as { en?: string; bn?: string };
      return { en: String(p.en || ""), bn: String(p.bn || "") };
    }
    return { en: "", bn: "" };
  });
  return {
    eyebrowEn: String(v.eyebrowEn || ""),
    eyebrowBn: String(v.eyebrowBn || ""),
    headlineEn: String(v.headlineEn || ""),
    headlineBn: String(v.headlineBn || ""),
    bodyEn: String(v.bodyEn || ""),
    bodyBn: String(v.bodyBn || ""),
    points,
    relatedSlugs: Array.isArray(v.relatedSlugs)
      ? v.relatedSlugs.map((s) => String(s).trim()).filter(Boolean)
      : [],
    metaTitleEn: String(v.metaTitleEn || ""),
    metaTitleBn: String(v.metaTitleBn || ""),
    metaDescriptionEn: String(v.metaDescriptionEn || ""),
    metaDescriptionBn: String(v.metaDescriptionBn || ""),
  };
}

export function normalizeLandingSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
