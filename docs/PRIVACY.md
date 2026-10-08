# Rogue+ private data policy

**Only reproducible public code, default presets, configuration and pinned upstream source references may be committed.** User saves, decrypted snapshots, account statistics, personal Build/Run records, token values, and backup archives remain local and untracked.

- A public `account-fixture.template.v1.json` provides field variables only; actual account regression fixtures belong in ignored `companion/private/`.
- The demo uses synthetic numbers, not a real user account.
- The game starter reference is generated during the build. No account or trainer data is needed to generate it.
- `scripts/validate-repository.mjs` blocks common private-file paths from CI, although automated scanning cannot replace a human review.

## Git history and public release caution

The original private development history once included exact account statistics, a save filename, and a timestamp. As of 2026-10-08, active branch refs were rewritten onto a clean root commit, with Alpha on a clean child commit. **The repository is public.** A branch rewrite does not guarantee GitHub's servers, pull request views, caches, artifacts, or previously cloned copies immediately discard unreachable objects. For strict assurance, a new repository with independently verified clean history provides stronger assurance than a force-rewrite of existing public refs. Do not interpret current active refs being clean as proof that old unreachable Git objects and caches are inaccessible.
