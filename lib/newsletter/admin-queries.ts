import { cache } from "react";

import type { AdminNewsletterSubscriberRow } from "@/lib/newsletter/types";
import { prisma } from "@/lib/prisma";
import { formatParticipantPhoneForDisplay } from "@/lib/rei-da-copa/utils";

export const getAdminNewsletterSubscribers = cache(
  async (): Promise<AdminNewsletterSubscriberRow[]> => {
    try {
      const subscribers = await prisma.newsletterSubscriber.findMany({
        orderBy: { registrationNumber: "desc" },
        select: {
          id: true,
          registrationNumber: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      });

      return subscribers.map((subscriber) => ({
        id: subscriber.id,
        registrationNumber: subscriber.registrationNumber,
        name: subscriber.name,
        email: subscriber.email,
        phone: formatParticipantPhoneForDisplay(subscriber.phone),
        createdAt: subscriber.createdAt.toISOString(),
      }));
    } catch {
      return [];
    }
  },
);
