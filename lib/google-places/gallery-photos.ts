import "server-only";

import { destinationsGalleryConfig } from "@/config/destinations-gallery";
import { siteConfig } from "@/config/site";

const PLACES_API_BASE = "https://places.googleapis.com/v1";

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type GooglePlacePhoto = {
  name?: string;
  widthPx?: number;
  heightPx?: number;
};

type GooglePlaceDetails = {
  photos?: GooglePlacePhoto[];
  displayName?: { text?: string };
};

type GoogleTextSearchResponse = {
  places?: Array<{ id?: string; name?: string }>;
};

type GooglePhotoMediaResponse = {
  photoUri?: string;
};

const FALLBACK_PHOTOS: GalleryPhoto[] = [
  {
    id: "fallback-1",
    src: "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1600&q=80",
    alt: "Vista aérea de uma praia tropical",
  },
  {
    id: "fallback-2",
    src: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80",
    alt: "Mochila e mapa de viagem sobre mesa de madeira",
  },
  {
    id: "fallback-3",
    src: "https://images.unsplash.com/photo-1586441133374-ed1cb4007a47?auto=format&fit=crop&w=1600&q=80",
    alt: "Passageiro em aeroporto observando painel de voos",
  },
  {
    id: "fallback-4",
    src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80",
    alt: "Asa de avião sobre nuvens durante voo",
  },
  {
    id: "fallback-5",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    alt: "Praia com mar calmo e areia clara",
  },
  {
    id: "fallback-6",
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80",
    alt: "Estrada de viagem entre montanhas ao pôr do sol",
  },
];

function getApiKey() {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() ?? "";
}

function getConfiguredPlaceId() {
  return process.env.GOOGLE_BUSINESS_PLACE_ID?.trim() ?? "";
}

async function resolvePlaceId(apiKey: string): Promise<string | null> {
  const configuredPlaceId = getConfiguredPlaceId();
  if (configuredPlaceId) {
    return configuredPlaceId.startsWith("places/")
      ? configuredPlaceId.replace(/^places\//, "")
      : configuredPlaceId;
  }

  const response = await fetch(`${PLACES_API_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify({
      textQuery: destinationsGalleryConfig.textQuery,
      languageCode: "pt-BR",
      maxResultCount: 1,
    }),
    next: { revalidate: 86_400 },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GoogleTextSearchResponse;
  const place = data.places?.[0];

  if (!place?.id && !place?.name) {
    return null;
  }

  const rawId = place.id ?? place.name ?? "";
  return rawId.replace(/^places\//, "");
}

async function fetchPlaceDetails(
  apiKey: string,
  placeId: string,
): Promise<GooglePlaceDetails | null> {
  const response = await fetch(`${PLACES_API_BASE}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "photos,displayName",
    },
    next: { revalidate: 86_400 },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as GooglePlaceDetails;
}

async function resolvePhotoUri(
  apiKey: string,
  photoName: string,
): Promise<string | null> {
  const params = new URLSearchParams({
    maxHeightPx: String(destinationsGalleryConfig.photoMaxSizePx),
    maxWidthPx: String(destinationsGalleryConfig.photoMaxSizePx),
    skipHttpRedirect: "true",
  });

  const response = await fetch(
    `${PLACES_API_BASE}/${photoName}/media?${params.toString()}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
      },
      next: { revalidate: 86_400 },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GooglePhotoMediaResponse;
  return data.photoUri ?? null;
}

export async function getDestinationsGalleryPhotos(): Promise<{
  photos: GalleryPhoto[];
  source: "google" | "fallback";
}> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return { photos: FALLBACK_PHOTOS, source: "fallback" };
  }

  try {
    const placeId = await resolvePlaceId(apiKey);

    if (!placeId) {
      return { photos: FALLBACK_PHOTOS, source: "fallback" };
    }

    const place = await fetchPlaceDetails(apiKey, placeId);
    const rawPhotos = place?.photos?.slice(0, destinationsGalleryConfig.maxPhotos) ?? [];

    if (rawPhotos.length === 0) {
      return { photos: FALLBACK_PHOTOS, source: "fallback" };
    }

    const businessName = place?.displayName?.text ?? siteConfig.name;

    const resolvedPhotos = await Promise.all(
      rawPhotos.map(async (photo, index) => {
        if (!photo.name) {
          return null;
        }

        const src = await resolvePhotoUri(apiKey, photo.name);

        if (!src) {
          return null;
        }

        return {
          id: `${placeId}-${index}`,
          src,
          alt: `Foto ${index + 1} da galeria de destinos ${businessName}`,
          ...(photo.widthPx ? { width: photo.widthPx } : {}),
          ...(photo.heightPx ? { height: photo.heightPx } : {}),
        } satisfies GalleryPhoto;
      }),
    );

    const photos = resolvedPhotos.filter(
      (photo): photo is GalleryPhoto => photo !== null,
    );

    if (photos.length === 0) {
      return { photos: FALLBACK_PHOTOS, source: "fallback" };
    }

    return { photos, source: "google" };
  } catch {
    return { photos: FALLBACK_PHOTOS, source: "fallback" };
  }
}
