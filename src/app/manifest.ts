import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GameBoy Engine - Web-based Retro Console",
    short_name: "GameBoy",
    description:
      "A gorgeous, fully playable GameBoy-inspired game engine. Play classics like Pong, Tetris, Snake, Space Invaders, Bomberman, and Flappy Bird directly in your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#161619",
    theme_color: "#161619",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
