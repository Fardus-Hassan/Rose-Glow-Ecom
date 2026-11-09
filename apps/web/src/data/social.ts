export type SocialLink = {
  id: "instagram" | "facebook" | "whatsapp" | "tiktok";
  href: string;
  label: string;
};

/** Update these to the real Rose Glow profiles when ready. */
export const socialLinks: SocialLink[] = [
  {
    id: "instagram",
    href: "https://instagram.com/roseglo.bd",
    label: "Instagram",
  },
  {
    id: "facebook",
    href: "https://facebook.com/roseglo.bd",
    label: "Facebook",
  },
  {
    id: "whatsapp",
    href: "https://wa.me/8801700000000",
    label: "WhatsApp",
  },
  {
    id: "tiktok",
    href: "https://tiktok.com/@roseglo.bd",
    label: "TikTok",
  },
];
