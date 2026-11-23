import { mediaUrl } from "@/lib/media";

/**
 * Hero media — change `mode` to pick image or video.
 *
 * Mobile + desktop assets are always separate for both modes.
 * Swap file paths / video URLs here without touching the Hero component.
 */
export const heroMedia = {
  mode: "image" as "image" | "video",

  image: {
    desktop:
      "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=1800&q=80",
    mobile:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
  },

  video: {
    desktop: {
      src: "https://videos.pexels.com/video-files/11353206/11353206-hd_1920_1080_25fps.mp4",
      poster: mediaUrl("/home/atelier-gold-spread.jpg"),
    },
    mobile: {
      src: "https://videos.pexels.com/video-files/7626566/7626566-hd_1080_1920_25fps.mp4",
      poster: mediaUrl("/home/hero-ornaments.jpg"),
    },
  },
} as const;
