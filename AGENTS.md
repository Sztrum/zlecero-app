# AGENTS.md

## Version
v1.0.0

## Scope
Portable AI-agent execution, collaboration, git workflow, verification, and response rules for this repository.

## Purpose
This file contains flexible global rules that define how the agent should work with the user: execution flow, git workflow, verification, and summaries. Project-specific paths, providers, and module contracts must stay in `AGENTS_PROJECT_RULES.md`.

## Required Document Read Order
Read documents in this exact order before implementation:
1. `AGENTS.md`
2. `AGENTS_CODING_RULES.md`
3. `AGENTS_PROJECT_RULES.md`
4. all relevant module-level `AGENTS.md` files in scope

## AI Execution And Response Rules
These rules are mandatory for every task and are intended to be portable across projects.

### Workflow Rule Placement And Communication Conventions
- Rules that define agent response format/style or execution workflow placement are global/portable by default and must be added in `AGENTS.md`; put them in `AGENTS_PROJECT_RULES.md` or module-level files only when they are explicitly project-specific.
- If the user provides instructions about how the agent should collaborate/work/respond, treat them as global-by-default instructions and document/enforce them in `AGENTS.md`, not only in `AGENTS_PROJECT_RULES.md` or module-level files.
- When the agent is not 100% certain that a planned solution is correct, it must pause before implementation, present a proposed solution/plan/idea, and ask for user confirmation first; this is especially mandatory when the user message is a question.
- In repository-authored materials such as branch names, commit messages, PR titles/descriptions, AGENTS/docs comments, do not use direct `Codex` naming; use `agents` terminology instead.
- The only allowed exception is a repository `README.md` section that documents local CLI configuration for Codex.

### Local Agent Task Context Directory
- The repository-local agent task context directory is always `agent-context/`.
- Treat files placed in `agent-context/` as local task inputs when the user indicates they are relevant to the current task.
- If the user says they added files, screenshots, logs, or source files to the working directory, context directory, or any similarly described task-context folder, interpret that as `agent-context/` unless they explicitly point to a different path.
- At the start of a task, verify that `agent-context/` exists and is excluded via `.git/info/exclude`. If either is missing, create the directory, add the local exclude entry, and explicitly inform the user that the directory was initialized for task context materials.
- Do not add `agent-context/` to `.gitignore`; keep it as a local-only ignore entry.
- `agent-context/` must never be committed or pushed.
- After completing a task, remove files from `agent-context/` that were used only for that task when they are no longer needed; if there is meaningful uncertainty about whether to delete them, ask the user first.

## Mandatory Git Workflow
- At the start of each new task/session, verify and report the current branch before any implementation step.
- Exception: if a task is strictly limited to analyzing, finding, adding, changing, updating, or removing rules in `AGENTS*.md`, ignore unrelated uncommitted changes, stay on the current branch, do not create or switch branches, do not run the standard commit/push/PR workflow, and stop for review without committing unless the user explicitly requests otherwise.
- Start every non-AGENTS-only implementation task on a dedicated branch created specifically for that task; do not implement task changes directly on the repository's default branch or any equivalent protected/default integration branch.
- Treat task-start git workflow as strict and non-optional for every non-AGENTS-only request:
  - start from a clean working tree;
  - before editing files, review current git changes;
  - if there are agent-created in-scope changes, commit them first;
  - if there are pre-existing/unrelated changes not created in the current task, stop and ask the user whether they should be included or excluded;
  - propose a branch name, provide a short implementation brief, and remind the user of the iteration workflow before branching;
  - create and switch to a dedicated task branch before file edits;
  - implement changes only on that task branch and keep them ready for user review before finalization.
- Before any file edit or implementation command, report the current branch, report whether the working tree is clean, create/switch to a dedicated task branch if required, and stop for scope confirmation when unrelated pre-existing changes are detected.
- If a preflight gate was skipped by mistake, stop immediately, report the violation, create/switch to a dedicated task branch if required, re-check working tree state, and continue only after user-visible confirmation of corrected workflow state.
- For pull/fetch/analysis/reporting decisions across multiple remotes, use only the user-designated canonical repository/remote as the source of truth.
- If the user has not explicitly designated a canonical remote yet, treat the current branch upstream as the canonical remote/branch for push verification and reporting.
- If a push to the canonical remote is rejected because the remote has newer changes, do not use `git pull --rebase`; recover by running plain `git pull` from the canonical remote, then retry the push.
- After any push reported as completed, verify success against the canonical/upstream remote branch itself. In repositories with multiple remotes or multi-pushurl setups, refresh the canonical tracking ref and confirm the local branch is no longer ahead of that canonical upstream.
- Never use `git rebase` in any form unless the user explicitly asks for it.
- Never use squash commits or squash merges unless the user explicitly requests squashing.
- When committing, always stage all changed files with `git add .`; never stage files selectively unless the user explicitly asks to exclude specific files.
- Use concrete, descriptive commit messages and follow repository commit-message rules.
- Never add a `Co-Authored-By` trailer to any commit message.
- After implementing changes on a task branch, always publish a file-level summary and stop for user review; never commit at this stage.
- Treat a reply containing only `kk` as affirmative confirmation equivalent to OK/yes.
- When uncertain what to do next after completing a task or reaching a decision point, present a numbered list of proposed next actions and wait for the user to reply with the chosen number.
- Commit only when the user explicitly approves with `zcommituj` or an equivalent direct commit instruction such as `gotowe`, `commituj`, or `push it`.
- Before any user-approved commit/push step, satisfy the verification reuse policy. If any required check has no reusable successful result or its covered inputs changed, run it before committing. If a required check fails, do not commit, push, or open/update the PR until the failure is fixed or the user explicitly instructs otherwise after seeing it.
- For each correction iteration, implement requested changes, stop for user review without committing or pushing, and wait for explicit approval before proceeding with the git cycle.
- Treat `zcommituj` or an equivalent direct commit instruction as confirmation that the current reviewed iteration should be committed, pushed, and PR-synchronized.
- Keep all changes uncommitted while waiting for user review feedback.
- Once a PR exists, keep it synchronized after every user-approved pushed commit, including PR title/description updates when scope or intent changed.
- Pull request descriptions must be comprehensive and in English, including goal, detailed changes, identified/fixed issues, and a full file list explaining what changed and why.
- After pushing a task branch to remote, perform the PR lifecycle without waiting for further instruction: create the PR via `gh pr create`, merge it via `gh pr merge --merge --delete-branch`, switch back to the repository default branch, and run plain `git pull` to sync. Never squash or rebase unless explicitly requested.

## During Implementation
- For every requested fix or change, keep code and documentation synchronized in the same task.
- Update the relevant `AGENTS*.md` rule or contract with reusable prevention guidance whenever the work exposes a failure mode future agents could repeat.
- First extend an existing canonical rule when one overlaps; do not add speculative or duplicate rules.
- If behavior, contracts, or architecture change, update relevant documentation immediately.
- Do not defer verified documentation drift.
- If documentation conflicts with newer user decisions or current code behavior, update documentation in the same task.
- Treat documentation freshness as a release criterion for behavior-changing tasks.
- If the user asks whether `AGENTS.md` is current, treat it as a question about all `AGENTS*.md` documentation in scope and update missing/outdated rules immediately when drift is confirmed.
- When the user asks to add/change/update rules in `AGENTS*.md`, first analyze all relevant existing rules in scope.
- If an equivalent or overlapping rule already exists, update/expand the canonical rule and remove or merge overlapping entries so exactly one canonical rule remains in scope.
- Only add a brand-new rule when no equivalent/overlapping rule exists after analysis.
- If changes delete a file, immediately run `git add <deleted-file-path>` to stage that deletion only for files deleted by the agent.
- If an `AGENTS*.md` file change updates only its `## Version` value, immediately run `git add <that-file-path>` so the version-only update is staged for the next commit.
- If the user proposes an architectural/pattern/location change and the agent believes it is materially weaker than the current approach, first provide a direct counter-proposal with technical reasoning; apply the user's preferred approach only after explicit confirmation.
- When a requested fix can be achieved by either a local workaround or by correcting flawed shared/base architecture, first analyze and explicitly present the root-cause option.
- When implementation needs to verify required domain data or related entities, prefer aggregate/service-level checks that throw project-specific exceptions modeled after existing module patterns instead of inline generic existence checks.

## Verification Policy
- Run every verification that is possible in the current workspace; do not ask the user to run checks the agent can run directly.
- Reuse prior successful verification only when the covered inputs have not changed since that verification.
- If frontend assets changed, run the repository production build verification documented in `AGENTS_PROJECT_RULES.md`.
- If backend/domain logic changed, run the focused automated tests documented in `AGENTS_PROJECT_RULES.md`.
- Ask the user to verify only steps requiring user-only access such as external login, 2FA, or external systems.
- For local setup/onboarding commands that produce values needed for the next step, run them directly and provide ready-to-use outputs.

## Final Response Policy
- In every response, include the current response timestamp at both boundaries: first line and last line, using the exact date/time from local `date` output in `YYYY-MM-DD HH:MM` format with no timezone suffix.
- After each task, write the summary in Polish and list every top-level instruction the user gave for the task. For each instruction include what was done and a per-instruction file list split into `Added`, `Modified`, and `Deleted`; omit empty categories.
- Do not mention `AGENTS*.md` version bumps or version number changes unless the user explicitly asked for version information.
- When the task includes new or updated unit tests, explain what each test or coherent test group covers, why it matters, and what regression it protects against.
- Only when the user explicitly asks to add/change/remove/update a global AI-agent collaboration, execution-workflow, or response-format rule in root `AGENTS.md`, quote the exact resulting rule text verbatim, state the file/section, provide placement rationale, include Polish translation, and include a ready-to-use prompt for applying the same rule elsewhere.
- If any requested project-wide change is not fully applied, list every omitted place and explain why.
- Whenever new logic is added or existing logic changes, describe how it works and include user-perspective and backend-perspective execution flows with concrete file/class references.
- Whenever new functionality is added, include a manual verification walkthrough with explicit navigation, clicks, inputs, and expected results.
- Instead of raw `git status`, include a concise file-level change log explaining what changed and why.
- Always include current branch name.
- Always include PR status: `created` or `not created`; if created, include PR number and link.
- Explicitly state whether introduced changes are critical and whether they may cause production deployment risk.
- Treat command failures by cause, not merely by non-zero status. Correct routine invocation mistakes autonomously and omit them from summaries. Stop and notify the user only when continued progress requires a genuinely missing external prerequisite or user-controlled environment change.
- When stopping for a real blocker, include a short `Failed commands` section with command/intent, reason, required remediation, and whether work stopped.
- Include developer effort estimate without AI as `X h Y min - A h B min`, covering the full effort to the current solution state.

## Task Completion Routine
- Run the repository-defined completion checklist documented in `AGENTS_PROJECT_RULES.md` and all relevant module-level `AGENTS.md` files in scope.
- After task completion, run `git status` to verify changed files and provide commit-name suggestions based on currently uncommitted files.

## Post-Pull Mandatory Audit And Reporting Policy
- If the user asks to pull code, after pull completes always run a full audit of all pulled changes against all relevant `AGENTS*.md` rules.
- Analyze the full pulled diff and present a readable file-level report listing added/modified/deleted files and explaining why each relevant change matters.
- Perform strict compliance review of pulled changes against current AGENTS rules and list each detected non-compliance with severity/impact and affected files.
- Perform strict documentation alignment review after pull; if documentation is outdated versus pulled code, update documentation in the same task.
- Do not apply automatic code behavior fixes after pull unless the user explicitly asks for implementation changes.
- When the user asks to pull code from the repository default branch into the local repository, after pull and audit run: `php artisan migrate`, `php artisan config:clear`, and `php artisan cache:clear`.
- After post-pull analysis, deliver a detailed report with findings, affected files/areas, severity/impact, and proposed remediation for remaining code issues.
