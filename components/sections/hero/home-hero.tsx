import { TourismHero } from "@/components/sections/hero/tourism-hero";
import { content } from "@/config/content";
import { DEFAULT_DEPARTURE_CITY } from "@/config/packages-showcase";
import { getHomeHeroPrimaryCta } from "@/config/rei-da-copa-campaign";
import { getFeaturedPackages } from "@/lib/package/queries";

export async function HomeHero() {
  const featuredPackages = await getFeaturedPackages();

  return (
    <TourismHero
      featuredPackages={featuredPackages}
      departureCity={DEFAULT_DEPARTURE_CITY}
      primaryCta={getHomeHeroPrimaryCta(content.hero.primaryCta)}
    />
  );
}
