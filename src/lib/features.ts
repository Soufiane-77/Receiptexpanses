// Product feature flags. Safe to import from both client and server code
// (plain constants, no runtime side effects).

/**
 * Master switch for paid (Pro / Stripe) monetization.
 *
 * While `false` the product is free but login-gated: building and previewing a
 * receipt is open to everyone, and downloading / printing / saving only require
 * a (free) account. The Stripe machinery (billing routes, webhook, pricing
 * page, subscriptions table) is left intact but dormant.
 *
 * Flip this to `true` to re-enable the subscription paywall — `requireAccess`
 * in the editor, the dashboard subscription panel, the pricing page and the
 * "Pricing" nav link all read this flag, so no other code needs to change.
 */
export const PAYMENTS_ENABLED = false;
