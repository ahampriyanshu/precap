# Feature flags and controlled releases

## Separate deployment, release, and experiment

Deployment puts code into an environment. Release makes behavior available to a population. An experiment compares alternatives under an assignment and analysis plan. Feature flags grew out of the need to change exposure without rebuilding or redeploying every service.

The simplest implementation checks a boolean in application code. It becomes insufficient when teams need internal access, tenant targeting, progressive exposure, an emergency stop, and a consistent experience across several requests. The engineering problem is controlling behavior while preserving authorization, compatibility, and measurement.

| Control            | Purpose                                        | Typical lifetime                         |
| ------------------ | ---------------------------------------------- | ---------------------------------------- |
| Release flag       | Expose a new implementation gradually          | Remove after rollout and rollback window |
| Experiment flag    | Hold a stable assigned variant for measurement | Remove after the experiment decision     |
| Operational switch | Disable expensive or failing optional behavior | Long-lived, with periodic drills         |
| Entitlement        | Enforce a purchased or permitted capability    | Part of the product/access model         |

A flag can select an implementation after access is authorized. A browser flag is never proof that the caller is allowed to use the corresponding API.

## Make assignment stable at the right boundary

Randomizing each request causes flicker and makes multi-step workflows inconsistent. For a shared workspace, assign at the account boundary so collaborators receive compatible behavior. For an independent personal preference, a user boundary may be appropriate. Choose the unit based on interference and the product promise.

This runnable standard-library example uses a stable hash for a release cohort. Inputs must be immutable identifiers; length-prefixing prevents ambiguous concatenations:

```python
from hashlib import sha256

def enabled(account_id: str, flag_key: str, basis_points: int) -> bool:
    if not 0 <= basis_points <= 10_000:
        raise ValueError("percentage must be between 0 and 100")
    key = f"{len(flag_key)}:{flag_key}{len(account_id)}:{account_id}".encode()
    bucket = int.from_bytes(sha256(key).digest()[:8], "big") % 10_000
    return bucket < basis_points

assert not enabled("acct-42", "export-v2", 0)
assert enabled("acct-42", "export-v2", 10_000)
assert enabled("acct-42", "export-v2", 500) == enabled("acct-42", "export-v2", 500)
```

Increasing the threshold expands a nested cohort for the same key. Changing the key reshuffles it. This hash is assignment plumbing, not a security or cryptographic access control. Account size still matters: 1% of accounts can produce a much larger fraction of load. Random hashing does not guarantee balance over a small population.

A release SDK also needs targeting rules, configuration versioning, caching, and a fallback. Evaluate from authenticated server context, then return the selected experience to the browser when it must match. Avoid evaluating different rules independently in the frontend, API, and worker.

## Freeze consequential decisions for the operation

An export accepted under implementation v2 should not silently switch to v1 halfway through a retry because the flag changed. Persist the selected workflow version with durable work. New requests can stop entering v2 while already accepted jobs finish or take a defined recovery path.

This is an illustrative job contract, not a vendor SDK payload:

```json
{
  "operation_id": "export-842",
  "account_id": "acct-42",
  "workflow_version": 2,
  "release_flag": "export-v2",
  "config_revision": "flags-118",
  "idempotency_key": "export-842"
}
```

The worker authorizes the job and supports its recorded schema. `config_revision` explains how the decision was made; it is not permission. Preserve idempotency across retries and compatible implementations. A different flag result must not create a second billable operation for the same request.

## Define degraded behavior when configuration is unavailable

A network request to a flag service on every user request adds latency and a new failure dependency. Server SDKs commonly evaluate cached rules locally or fetch configuration asynchronously; the exact behavior depends on the SDK. Know whether you have a cached result, a hardcoded fallback, or no evaluation.

Choose the fallback per capability. A cosmetic experiment may use control. A switch that stops unsafe writes needs a documented safe state and a plan for stale caches. A remotely changed kill switch is not instantaneous when disconnected workers retain old configuration.

Set a maximum acceptable configuration age for critical behavior, expose evaluation failures, and test control-plane outages. Decide how clients recover from an initially unavailable result so that UI hydration and subsequent API requests remain consistent.

## Roll out against explicit guardrails

Start with internal or deliberately selected accounts, then expand in steps that expose relevant workload variety. Choose hold times from detection delay and business cycles rather than copying a fixed percentage sequence. Observe adoption, correctness, latency, capacity, and support impact for the exposed population.

A release plan should make the next decision executable:

```yaml
flag: export-v2
owner: exports-team
exposure_unit: account
guardrails:
  correctness: no missing or duplicated delivered exports
  reliability: completion SLO holds for exposed accounts
  capacity: database pool wait and worker queue age remain bounded
stop_action: prevent new v2 jobs; reconcile accepted v2 jobs separately
cleanup: remove v1 after rollout, client support window, and reconciliation
```

Turn these criteria into numerical limits using the actual baseline before shipping. Do not use every guardrail as a hypothesis test or declare an experiment winner from a rollout dashboard. A kill switch limits future exposure; it does not undo completed writes or side effects.

## Retire temporary branches and test the remaining combinations

Record an owner, purpose, creation date, and review/expiry date with each flag. Expiry should trigger a decision, not silently disable a successful feature. Remove the losing branch, unused rules, tests, and instrumentation only after the fallback and compatibility window close.

Several independent booleans create a large state space. Test supported combinations at API and workflow boundaries and forbid invalid ones explicitly. A dependency such as “new checkout requires new pricing” belongs in one coherent rollout contract; two casually independent flags can expose a state no team tested.

For an interview discussion, explain the unit of exposure, how assignments stay consistent across asynchronous work, what happens when the flag system fails, and how the flag is eventually removed. Those are the operational properties behind the toggle.
