# Security Specification & Hardened Rules TDD

## 1. Data Invariants
- **User profiles (`/users/{userId}`)**:
  - The document ID must match the authenticated user's UID exactly (`request.auth.uid == userId`).
  - All standard profile fields (`uid`, `name`, `email`) are required and type-validated.
  - Email format and field lengths are strictly validated.
  - `createdAt` and `updatedAt` must be set to the server timestamp (`request.time`) on creation.
  - `createdAt` is immutable.
  - Users cannot update other users' profiles.
- **Registration Passes (`/registrations/{userId}`)**:
  - The document ID must match the authenticated user's UID exactly (`request.auth.uid == userId`).
  - Required fields are `userId`, `name`, `github`, `track`, `glowColor`, and `ticketNumber`.
  - `track` must be one of `["GenAI", "Agents", "Web3", "HealthTech"]`.
  - `glowColor` must be one of `["purple", "blue", "cyan"]`.
  - `createdAt` is immutable after creation.
  - `updatedAt` must be set to the server timestamp (`request.time`) on any write.
  - Access is restricted to the owner of the pass.

---

## 2. The "Dirty Dozen" Malicious Payloads
The following payloads are designed to attack the data integrity and security posture. Each must be strictly blocked with `PERMISSION_DENIED`.

### Pillar 1: Identity Spoofing (Attacking `/users`)
1. **Payload 1: Impersonate Another User on Creation**
   - Attempting to write a profile to `/users/another_user_uid` with `uid = "another_user_uid"` while authenticated as `user_uid`.
2. **Payload 2: Set Self-Assigned Privileges**
   - Writing `role = "admin"` or `isAdmin = true` in user metadata.
3. **Payload 3: Identity Swapping inside Document**
   - Writing to `/users/user_uid` with `uid = "another_user_uid"`.

### Pillar 2: Temporal & Structural Validation (Attacking `/users`)
4. **Payload 4: Client-Spoofed Timestamps**
   - Setting `createdAt` to a hand-crafted past or future ISO string (e.g. `2020-01-01T00:00:00Z`).
5. **Payload 5: Oversized Strings (Denial of Wallet)**
   - Creating a user profile where `name` contains a 10MB string.
6. **Payload 6: Unexpected Fields (Shadow Fields)**
   - Injecting a field `isPremiumVerified: true` into the user profile.

### Pillar 3: Track & Role Violations (Attacking `/registrations`)
7. **Payload 7: Invalid Enum Values for Track**
   - Attempting to set `track` to `"Overlord_AI"` (not in enum).
8. **Payload 8: Path Variable ID Poisoning**
   - Attempting to write to `/registrations/some_poisoned_id_containing_special_characters_$%^&*()` where ID length is excessive.
9. **Payload 9: Hijack Sibling Registration Pass**
   - Authenticated as `user_uid`, attempting to read `/registrations/victim_user_uid`.
10. **Payload 10: State Bypass (Mutating Immutable Fields)**
    - Attempting to update an existing registration pass while changing `createdAt` to a new timestamp.
11. **Payload 11: Missing Required Keys**
    - Submitting a registration pass without the required `ticketNumber` field.
12. **Payload 12: Invalid Glow Energy**
    - Setting `glowColor` to `"red"` (not in the allowed set of `purple`, `blue`, `cyan`).

---

## 3. Security Rule Verification (Dry Run)
The generated ruleset enforces all of these protections at the database layer, ensuring zero-trust enforcement irrespective of the client implementation.
