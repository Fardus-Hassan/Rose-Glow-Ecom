/**
 * Hero media — change `mode` to pick image or video.
 *
 * Mobile + desktop assets are always separate for both modes.
 * Swap file paths / video URLs here without touching the Hero component.
 */
export const heroMedia = {
  mode: "image" as "image" | "video",

  image: {
    desktop: "/home/atelier-gold-spread.jpg",
    mobile: "/home/hero-ornaments.jpg",
  },

  video: {
    desktop: {
      src: "https://videos.pexels.com/video-files/11353206/11353206-hd_1920_1080_25fps.mp4",
      poster: "/home/atelier-gold-spread.jpg",
    },
    mobile: {
      src: "https://videos.pexels.com/video-files/7626566/7626566-hd_1080_1920_25fps.mp4",
      poster: "/home/hero-ornaments.jpg",
    },
  },
} as const;
