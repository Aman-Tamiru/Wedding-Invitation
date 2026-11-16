
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Betslot & Amanuel — Wedding Invitation",
    short_name: "Betslot & Amanuel",
    description:
      "Celebrate the wedding of Betslot and Amanuel on 19 November 2028.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf8f0",
    theme_color: "#fbf8f0",
    icons: [
      {
        src: "/icons/wedding-app-icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
