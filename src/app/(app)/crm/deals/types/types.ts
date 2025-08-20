import { DealStage } from "@/generated/prisma";

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  jobTitle: string | null;
  notes: string | null;
  deals: Deal[]
  logs: Log[]
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
}
export interface Deal {
  stage: DealStage;
  id: string;
  title: string;
  amount: number;
  contactId: string;
  contact: Contact;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Log {
  id: string;
  contactId: string | null;
  contact: Contact;
  timestamp: Date;
  type: string;
  message: string | null;
  direction: string;
  dealId: string | null;
}

export interface CommunicationLog {
  id: string;
  type: string;
  direction: string;
  message?: string;
  timestamp: string;
  dealId?: string;
  contactId?: string;
  contact: Contact;
}