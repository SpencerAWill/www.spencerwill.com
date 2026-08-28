/**
 * Biome is the entire pre-commit toolchain: it lints, formats, and sorts
 * imports in a single pass, so there is one entry rather than the usual
 * eslint-then-prettier pair.
 *
 * The "*" glob hands Biome every staged path and lets biome.json decide what is
 * actually in scope -- that keeps the include list in exactly one place instead
 * of duplicating it here, where the two would inevitably drift.
 *
 *   --write                    apply fixes; lint-staged re-stages what changes
 *   --no-errors-on-unmatched   staging only out-of-scope files is not a failure
 *   --files-ignore-unknown     skip file types Biome has no parser for
 *                              (.md, .yaml, images) instead of erroring
 *   --error-on-warnings        make warnings block the commit
 *
 * That last flag matters more than it looks. Several rules in Biome's
 * recommended set -- noUnusedVariables among them -- are warnings, and `biome
 * check` exits 0 on a warning. Without it the hook happily commits code with
 * unused variables and dead imports still in it.
 *
 * Anything Biome cannot fix on its own still fails the commit, which is the
 * point -- problems needing a human decision should block.
 */
export default {
  "*": [
    "biome check --write --no-errors-on-unmatched --files-ignore-unknown=true --error-on-warnings",
  ],
};
