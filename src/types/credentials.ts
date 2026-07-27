import { Timestamp } from "firebase/firestore";

export interface Credential {
  credentialId: string;
  userId: string;
  hackathonName: string;
  role: "Winner" | "Participant" | "Runner-up" | "Special Mention" | string;
  issueDate: Timestamp | any;
  ipfsMetadataUrl: string;
  cryptographicHash: string | null;
  status: "Available" | "Claimed";
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}
