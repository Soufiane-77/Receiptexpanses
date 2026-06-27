// Shared account types — safe to import from both client and server code
// (types only, no runtime). The client auth module and the server user store
// both produce/consume this PublicUser shape.

export type Plan = "free" | "pro";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  /** ISO timestamp the user upgraded to Pro, if ever. */
  proSince?: string;
  blogSubscribed: boolean;
  /** ISO timestamp the account was created. */
  createdAt: string;
  /** Google profile picture URL, when the account signed in with Google. */
  avatarUrl?: string;
  /** How the account authenticates. Defaults to "email". */
  provider?: "email" | "google";
};

/** Fields a user is allowed to patch on their own account. */
export type AccountPatch = {
  name?: string;
  blogSubscribed?: boolean;
  plan?: Plan;
  proSince?: string;
};
