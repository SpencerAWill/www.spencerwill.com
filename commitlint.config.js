/**
 * Conventional Commits, enforced on commit-msg by husky.
 *
 * This config is also the source of truth for the interactive prompt: `pnpm
 * commit` runs commitizen through @commitlint/cz-commitlint, which reads the
 * rules below to build its questions. Editing a rule here changes both what the
 * prompt offers and what the hook accepts, so the two cannot drift apart.
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // "scope" is the workspace package or area touched -- e.g. feat(web): ...
    // Left unrestricted for now; worth pinning to an enum once the workspace
    // has more than the single apps/web package.
    "scope-empty": [0],
  },
  prompt: {
    settings: {},
    messages: {
      skip: ":skip",
      max: "upper %d chars",
      min: "%d chars at least",
      emptyWarning: "can not be empty",
      upperLimitWarning: "over limit",
      lowerLimitWarning: "below limit",
    },
  },
};
