import { Prisma } from "@/lib/generated/prisma/client";
import { notifyNewNewsletterSubscriber } from "@/lib/newsletter/notification";
import type { NewsletterSubscriptionDto } from "@/lib/newsletter/schemas";
import type { NewsletterSubscriberEntity } from "@/lib/newsletter/types";
import { prisma } from "@/lib/prisma";
import {
  formatParticipantPhoneForDisplay,
  normalizeParticipantPhone,
} from "@/lib/rei-da-copa/utils";

const subscriberSelect = {
  id: true,
  registrationNumber: true,
  name: true,
  email: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
} as const;

function getDuplicateSubscriberError(error: unknown): string | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const targets = Array.isArray(error.meta?.target)
      ? error.meta.target.map(String)
      : typeof error.meta?.target === "string"
        ? [error.meta.target]
        : [];

    if (targets.some((target) => target.includes("email"))) {
      return "Este e-mail já está cadastrado na newsletter.";
    }

    if (targets.some((target) => target.includes("phone"))) {
      return "Este telefone já está cadastrado na newsletter.";
    }

    return "Este contato já está cadastrado na newsletter.";
  }

  return null;
}

export class NewsletterSubscribersService {
  async registerSubscriber(
    input: NewsletterSubscriptionDto,
  ): Promise<NewsletterSubscriberEntity> {
    const phone = normalizeParticipantPhone(input.phone);
    const email = input.email.trim().toLowerCase();

    const existing = await prisma.newsletterSubscriber.findFirst({
      where: {
        OR: [{ phone }, { email }],
      },
      select: {
        phone: true,
        email: true,
      },
    });

    if (existing) {
      if (existing.email === email) {
        throw new Error("Este e-mail já está cadastrado na newsletter.");
      }

      throw new Error("Este telefone já está cadastrado na newsletter.");
    }

    let subscriber: NewsletterSubscriberEntity;

    try {
      subscriber = await prisma.newsletterSubscriber.create({
        data: {
          name: input.name,
          email,
          phone,
        },
        select: subscriberSelect,
      });
    } catch (error) {
      const duplicateMessage = getDuplicateSubscriberError(error);

      if (duplicateMessage) {
        throw new Error(duplicateMessage);
      }

      throw error;
    }

    await notifyNewNewsletterSubscriber(subscriber);

    return subscriber;
  }

  async exportSubscribers(): Promise<
    Array<{
      registrationNumber: number;
      name: string;
      email: string;
      phone: string;
      createdAt: string;
    }>
  > {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { registrationNumber: "asc" },
      select: subscriberSelect,
    });

    return subscribers.map((subscriber) => ({
      registrationNumber: subscriber.registrationNumber,
      name: subscriber.name,
      email: subscriber.email,
      phone: formatParticipantPhoneForDisplay(subscriber.phone),
      createdAt: subscriber.createdAt.toISOString(),
    }));
  }
}

export const newsletterSubscribersService = new NewsletterSubscribersService();
