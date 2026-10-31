# Git, CI, and artifact promotion

Git records snapshots and their ancestry so changes can be reviewed, combined, and recovered. CI turns those changes into reproducible evidence: compilation, tests, checks, and a built artifact. Continuous delivery makes a verified artifact releasable through a repeatable path. The crucial unit of promotion is the artifact that passed the checks.

## Commits are a graph of changes

A branch is a movable reference to a commit. A merge combines histories; a rebase recreates commits on a different base and changes their identities. A pull request is a review workflow around that graph, rather than an additional Git object that guarantees correctness.

Short-lived changes reduce integration drift. Review needs a concrete behavioral change and the evidence relevant to it. A passing unit test does not establish schema compatibility, and a human approval does not establish that the approved artifact is what production received.

For a shared-history regression, a revert adds a new commit that reverses a change without rewriting collaborators' history. In a private branch, rebasing can clarify the patch. Neither operation understands a database migration's business reversibility.

## Make the build a controlled function

A build consumes source, dependencies, toolchain, configuration, and sometimes network resources. A source SHA alone is insufficient to recreate it when base images, package ranges, or downloads move. Lock dependencies, record the toolchain, pin important inputs, and retain provenance. Bit-for-bit reproducibility is a stronger property that requires controlling nondeterminism as well.

Create one immutable artifact, record its digest, and promote it through environments. Environment-specific runtime configuration should not force an untracked rebuild. Frontend public build-time values are an exception to plan explicitly: if a value is embedded in JavaScript, it becomes part of the artifact and is public to its users.

![Source passes isolated verification and one build; the same artifact digest moves through staging, canary, and production with independent configuration.](/diagrams/devops-promotion.svg)

## A pipeline expresses dependency and trust

Jenkins runs pipeline stages on agents. Other CI systems use different syntax for the same dependency graph. This declarative fragment assumes the repository provides the scripts and that the deploy identity is restricted to the intended environment.

```groovy
pipeline {
  agent { label 'trusted-linux' }
  options {
    disableConcurrentBuilds()
    timeout(time: 20, unit: 'MINUTES')
  }
  stages {
    stage('Verify') {
      steps { sh './ci/verify' }
    }
    stage('Build once') {
      steps { sh './ci/build-and-push --write-digest artifact.digest' }
    }
    stage('Deploy staging') {
      steps { sh './ci/deploy --environment staging --digest-file artifact.digest' }
    }
    stage('Verify staging') {
      steps { sh './ci/smoke --environment staging' }
    }
  }
  post {
    always { archiveArtifacts artifacts: 'artifact.digest', allowEmptyArchive: true }
  }
}
```

The script interfaces are illustrative, not commands shipped with this curriculum. Production promotion consumes the recorded digest after its release gates pass. Store the manifest in trusted artifact storage when separate jobs perform promotion. A filename in a mutable workspace is insufficient provenance across jobs.

`disableConcurrentBuilds()` serializes this job; it does not coordinate unrelated deploy jobs changing the same environment. Establish one deployment owner and a lock or version check at the environment boundary. Keep untrusted pull-request code away from production credentials and privileged build agents. Test scripts are executable code too.

## Choose evidence by failure boundary

Run fast deterministic checks early. Integration tests need the actual database or compatible service behavior for transaction and protocol claims. End-to-end tests cover critical user flows. Migration rehearsals need realistic data sizes and lock behavior. Artifact scanning identifies known vulnerabilities; it cannot establish that application authorization is correct.

Cache downloaded dependencies by lockfile and toolchain identity. A cache speeds a build but must not silently become its source of truth. Treat a cache miss as a supported path. Avoid a shared mutable dependency directory that lets one branch contaminate another build.

A test suite that flakes regularly trains people to ignore failures. Track flake rate separately, isolate nondeterministic clocks and external systems, and repair the faulty boundary. Re-running until green changes the meaning of the release gate.

## Delivery is measured after deployment

Deployment success means the orchestrator accepted or completed an update. Release success means the intended users can complete their work within quality and reliability bounds. Separate a deployment from feature exposure when flags permit gradual rollout. Flags need ownership and expiry so temporary compatibility paths do not become permanent complexity.

Record source, artifact digest, configuration revision, schema compatibility, deployment actor, and verification result. Measure lead time, deployment frequency, change failure, and recovery in a context that improves flow rather than rewards gaming a number. A tiny deployment that repeatedly breaks customers is not a successful delivery system.

Use the [Git cheatsheet](/cheatsheets/git/) for review, conflict resolution, recovery, and history investigation commands.
