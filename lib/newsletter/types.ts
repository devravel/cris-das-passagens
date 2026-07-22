export type NewsletterSubscriberEntity = {
  id: string;
  registrationNumber: number;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminNewsletterSubscriberRow = {
  id: string;
  registrationNumber: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};
