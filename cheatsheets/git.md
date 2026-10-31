# Git

Commands for understanding a change, integrating it, and recovering deliberately. Run inside the intended repository. Inspect local changes before any operation that updates the working tree. The companion lesson explains [Git and delivery pipelines](/guides/devops/git-and-delivery-pipelines/).

## Inspect the working tree and history

Start by distinguishing staged, unstaged, and committed work.

```bash
git status --short --branch
git diff
git diff --cached
git log --oneline --decorate --graph -15
git show --stat HEAD
```

`git diff` omits staged changes; `git diff --cached` shows the proposed commit. Neither includes untracked file contents. Read those explicitly before deciding that a change is complete.

## Review a branch against its base

Fetch updates remote-tracking references without merging into the current branch. These examples assume `origin/main` is the intended base.

```bash
git fetch origin
git log --oneline origin/main..HEAD
git diff --stat origin/main...HEAD
git diff origin/main...HEAD
```

The three-dot diff starts at the merge base and describes the branch's change. A two-dot log selects commits reachable from the right side but not the left; revision syntax has command-specific meaning.

## Integrate and resolve a conflict

Rebase a private branch when replaying its changes is appropriate. This rewrites commit identities, so coordinate shared history first.

```bash
git rebase origin/main
git status
# Edit each conflicted file and remove conflict markers.
git add path/to/resolved-file
git rebase --continue
# To return to the pre-rebase state instead:
git rebase --abort
```

Choose continue or abort according to the result, rather than running this whole block blindly. A clean merge is a syntactic result; run the checks relevant to the combined behavior.

## Reverse a published change

For an ordinary shared commit, create an inverse commit rather than moving shared history backward.

```bash
git show COMMIT_SHA
git revert COMMIT_SHA
git show --stat HEAD
```

Replace `COMMIT_SHA` with a verified commit. Merge commits need an explicitly understood mainline policy. Reverting source cannot reverse an already executed data migration or external side effect.

## Find a regression and recover a reference

Bisect works when a repeatable check distinguishes good from bad revisions. Begin with a clean working tree.

```bash
git bisect start
git bisect bad
git bisect good KNOWN_GOOD_SHA
git bisect run ./scripts/regression-check
git bisect reset
```

The script must exist and use Git's expected exit-code contract. For a misplaced local commit, inspect the reflog before changing references.

```bash
git reflog --date=iso -20
git show RECOVERABLE_SHA
git branch recovery/investigation RECOVERABLE_SHA
```

A recovery branch preserves the selected commit without overwriting current files. Reflogs are local and expire; they are not a substitute for sharing or backing up needed work.
