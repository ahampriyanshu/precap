# Agents, tools, and durable execution

A model can propose the next step in a task; an agent runtime interprets that proposal, performs permitted operations, supplies observations, and decides whether to continue. Agents are useful when the next useful action depends on results that cannot be fully specified in advance. The engineering cost is a larger space of execution paths, effects, and recovery states.

A fixed workflow remains the right baseline when the sequence is known. Retrieving evidence, calculating a total, and explaining it often needs no open-ended planning loop.

## Choose how much control to delegate

Routing, parallel checks, bounded refinement, and tool selection provide progressively more flexibility. Broad autonomy is justified by measured task success, not by the presence of a chat interface. Give the runtime ownership of deadlines, permissions, budgets, and state transitions regardless of how the next action is chosen.

![An agent runtime loads durable task state, asks a model for a proposal, validates policy and arguments, executes a bounded tool, persists the observation, and either continues or validates a final outcome. The model never bypasses the policy boundary.](/diagrams/ai-agent.svg)

```pseudocode
load task, authenticated principal, budget, durable event history
while task is active and deadline/step/token budgets remain:
    proposal = ask model using permitted observations and tools
    if proposal is final:
        verify task outcome; accept or return a defined incomplete state
    else:
        validate tool, arguments, authorization, and effect policy
        persist intent and stable operation identity
        execute or reconcile operation; persist observed result
        update typed task state
```

This is a control-flow sketch. Real execution must handle concurrent workers, process loss, tool-specific failure semantics, and cancellation. A fluent final message is one output artifact; it is not the authoritative state of the task.

## Tool interfaces should expose domain intent

A tool definition needs a narrow purpose, typed arguments, clear return semantics, and explicit failure behavior. `refund_payment(payment_id, amount_minor, reason)` is easier to constrain than `run_arbitrary_sql(query)`. The runtime resolves authenticated tenant and identity rather than letting the model select them freely.

Separate reads from writes and previews from commits where that enables meaningful review. A preview must identify the exact proposed effect, not merely display a natural-language summary. Use authoritative IDs returned by trusted lookups; do not accept invented IDs because they fit a string field.

```json
{
  "name": "preview_refund",
  "input": {
    "payment_id": "pay-42",
    "amount_minor": 1500,
    "currency": "USD",
    "reason_code": "duplicate-charge"
  },
  "output_contract": {
    "proposal_id": "server generated",
    "payment_revision": "authoritative revision",
    "effect_digest": "hash of normalized effect",
    "expires_at": "server timestamp"
  }
}
```

This is an application-level contract, not an MCP wire message. Validate currency, refundable balance, ownership, limits, and current revision on the server. Tool descriptions guide the model; they do not enforce any of those checks.

## MCP standardizes integration, not trust

Model Context Protocol gives hosts/clients a common way to discover and invoke server tools and access other supported capabilities. Tool schemas and observations can therefore connect many integrations without a custom model-facing format for each one. Version negotiation and the selected protocol/transport still matter.

For remote HTTP integrations, validate authentication and token audience at the intended resource; do not pass an inbound token through to unrelated upstream APIs. Local process integrations inherit the permissions of the process they launch. A tool's annotation, name, or description is not proof that it is harmless. Pin approved integrations, inspect capability changes, and enforce resource authorization in the tool service.

Use the protocol to reduce integration duplication. Keep consent, least privilege, auditability, and application policy in the surrounding system. A standard transport cannot make an untrusted server or malicious tool result safe.

## Retries need a stable operation identity

A timeout does not reveal whether an external effect occurred. Retrying a read is usually different from retrying a payment, email, or deployment. Give consequential operations a stable idempotency key tied to normalized intent, and reject reuse of that key with different arguments.

This standalone in-memory example illustrates the invariant; it is not crash-safe storage:

```python
import hashlib
import json

operations = {}

def apply_once(operation_id, arguments):
    digest = hashlib.sha256(json.dumps(arguments, sort_keys=True).encode()).hexdigest()
    if operation_id in operations:
        previous_digest, result = operations[operation_id]
        if previous_digest != digest:
            raise ValueError("operation identity reused for a different effect")
        return result
    result = {"status": "applied", "amount_minor": arguments["amount_minor"]}
    operations[operation_id] = (digest, result)
    return result

arguments = {"payment_id": "pay-42", "amount_minor": 1500}
assert apply_once("task-7/refund-1", arguments) == apply_once("task-7/refund-1", arguments)
print(len(operations))
```

Production idempotency requires atomic persistence and a compatible downstream boundary. If a process crashes after the payment provider applies an effect but before local completion is stored, a local dictionary or transaction alone cannot establish exactly-once external execution. Reconcile using the provider's operation identity or queryable outcome. Report an indeterminate state when it cannot be established safely.

## Durable state makes recovery explicit

Persist intent before execution and observations after execution, with task ID, step ID, arguments digest, tool revision, status, and result reference. Recovery should load committed state and reconcile pending effects rather than rerunning the entire conversation blindly.

| Persisted state | Recovery action |
| --- | --- |
| Proposed, policy not checked | Revalidate under current identity and policy |
| Authorized intent, not dispatched | Dispatch if still valid and within budget |
| Dispatched, outcome unknown | Query/reconcile stable operation identity |
| Applied and observed | Reuse the stored result; avoid duplicate effect |
| Awaiting approval | Verify approval matches this exact current proposal |

Use worker leases and fencing or another concurrency mechanism so two resumed workers do not independently advance the same task. A lease expiration does not undo an external effect. Compensation is a new domain operation with its own failure modes; “rollback the agent” cannot unsend an email or erase an already observed disclosure.

Approvals should bind to normalized arguments, affected resources, relevant revisions, scope, and expiry. Recheck at execution to avoid a stale preview authorizing a changed operation. After a task is canceled, stop new dispatches and reconcile in-flight effects; cancellation is not proof that a request already sent to another system was canceled there.

## Memory has types, provenance, and deletion rules

Working memory holds the current task and recent observations. Episodic memory records prior attempts or interactions. Semantic memory stores durable facts or preferences. Procedural memory stores reusable instructions or learned workflows. These categories need different validation and retention policies.

A summary is a lossy view, not an authoritative database. Store important constraints and accepted decisions in typed task state with provenance. User preferences need source, scope, and an update/removal path; model-generated guesses should not silently become permanent facts.

Retrieving past “successful” traces can transfer stale permissions or a previous tenant's content. Scope memory by principal and resource policy, attach revisions, and verify relevance before use. Evaluate tasks after compaction and resume, including contradictions and revoked access. More remembered text can make the agent less accurate if it preserves outdated assumptions.

## Parallel agents multiply coordination work

Parallel workers help when subtasks are independent: inspect separate files, compare independent evidence, or run distinct checks. They do not automatically improve a task requiring one consistent mutable plan. Shared writes require ownership boundaries, merge policy, and conflict detection.

Give each worker a bounded task, permitted resources, and a result contract. Aggregate verifiable artifacts instead of accepting an unsupported summary. Include the coordinator and all worker calls in token, latency, and cost budgets. Avoid circular delegation and duplicated work by recording assignment IDs and dependencies.

For a consequential shared mutation, one coordinator or transaction boundary should own the commit. Several models agreeing to perform an action does not establish authorization or consistency.

## Evaluate the trajectory and final state

Test successful tasks, no-answer tasks, forbidden requests, malformed tool results, injected instructions, timeouts, duplicate calls, process crashes, and resumes. Verify that the final state matches the user's authorized objective and that forbidden effects never occurred along the way.

Measure accepted completion rate, tool efficiency, total cost, time to useful result, and recoverability. An agent that eventually succeeds after twenty unnecessary calls may be worse than a three-step workflow. Flexibility earns its place when it improves outcomes within the application's explicit control boundaries.
