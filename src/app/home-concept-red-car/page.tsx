import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";

// Experiment: the homepage with Daphne's portrait by the red car as the opening photo.
export const metadata: Metadata = { title: "Homepage concept — red car", robots: { index: false, follow: false } };

export default function HomeConceptRedCar() {
  return (
    <HomeView
      hero={{
        portrait: { src: "/images/concepts/daphne-red-car.jpg", width: 1536, height: 2048 },
        alt: "Daphne Merel sitting in the open door of a red vintage car on a cobbled terrace at sunset.",
        position: "50% 33%",
      }}
    />
  );
}
