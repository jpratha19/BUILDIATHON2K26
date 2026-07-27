import { db, handleFirestoreError, OperationType } from "./firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  Timestamp, 
  serverTimestamp 
} from "firebase/firestore";
import { Credential } from "../types/credentials";

/**
 * Checks if the user is eligible for a credential (has finished a hackathon event).
 * We define "finished" as having a registered ticket or having submitted a project for evaluation.
 */
export async function checkEligibility(userId: string): Promise<{ 
  eligible: boolean; 
  reason?: string; 
  hasProject: boolean; 
  hasRegistration: boolean; 
}> {
  try {
    const regDoc = await getDoc(doc(db, "registrations", userId));
    const hasRegistration = regDoc.exists();

    const q = query(collection(db, "projects"), where("userId", "==", userId));
    const projectsSnap = await getDocs(q);
    const hasProject = !projectsSnap.empty;

    const eligible = hasRegistration || hasProject;
    
    return {
      eligible,
      hasProject,
      hasRegistration,
      reason: eligible 
        ? undefined 
        : "You must complete your Hackathon Registration (Ticket) or submit a Project for AI evaluation to qualify for verifiable credentials."
    };
  } catch (error) {
    console.error("Error checking eligibility:", error);
    return { eligible: false, hasProject: false, hasRegistration: false, reason: "Error verifying qualifications." };
  }
}

/**
 * Mocks the backend minting / claiming of a badge.
 * Generates a mock SHA-256 cryptographic hash as proof of authenticity.
 * Writes it permanently to the Firestore 'credentials' collection.
 */
export async function claimBadge(
  userId: string, 
  credentialId: string, 
  role: string, 
  hackathonName: string
): Promise<Credential> {
  try {
    const eligibility = await checkEligibility(userId);
    if (!eligibility.eligible) {
      throw new Error("User does not meet the eligibility criteria for this hackathon credential.");
    }

    // Generate SHA-256-like cryptographic hash for verifiable proof
    const hashChars = "0123456789abcdef";
    let mockHash = "0x";
    for (let i = 0; i < 64; i++) {
      mockHash += hashChars[Math.floor(Math.random() * 16)];
    }

    // Token ID (mock ERC-721 token id)
    const mockTokenId = Math.floor(100000 + Math.random() * 900000).toString();
    const ipfsMetadataUrl = `ipfs://bafybeicm2z77vnyz6ux7mqv45v3nyfmxv${mockTokenId}g33f4a/metadata.json`;

    const credentialData: Credential = {
      credentialId,
      userId,
      hackathonName,
      role,
      issueDate: Timestamp.now(),
      ipfsMetadataUrl,
      cryptographicHash: mockHash,
      status: "Claimed",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Write it permanently to Firestore
    await setDoc(doc(db, "credentials", credentialId), credentialData);
    
    return credentialData;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `credentials/${credentialId}`);
    throw err;
  }
}
