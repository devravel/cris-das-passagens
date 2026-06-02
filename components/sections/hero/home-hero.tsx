import { TourismHero } from "@/components/sections/hero/tourism-hero";
import { DEFAULT_DEPARTURE_CITY } from "@/config/packages-showcase";
import { getFeaturedPackages } from "@/lib/package/queries";

export async function HomeHero() {
  const featuredPackages = await getFeaturedPackages();

  return (
    <TourismHero
      featuredPackages={featuredPackages}
      departureCity={DEFAULT_DEPARTURE_CITY}
    />
  );
}
