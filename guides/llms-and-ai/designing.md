# Put the model in the right place

An LLM adds language judgment and a new source of uncertainty. Decide where that judgment earns its cost, which evidence it may see, and which guarantees software must enforce.

## Start with the decision the product needs

Consider a support assistant that explains refund policy and prepares a request. The requirement is specific: use the applicable policy, disclose only permitted information, and never issue an ineligible or duplicate refund.

Account ownership, arithmetic, eligibility rules, and ledger state belong in authoritative services. A classifier may suffice for a stable intent taxonomy. An LLM helps interpret varied language and explain several pieces of evidence; fluency does not prove eligibility was checked. Evaluate a model against this bounded task and acceptable abstentions, rather than a general benchmark.

## Bound the model’s work

Start with an application-owned workflow: retrieve permitted policy, fetch account facts, calculate eligibility, then draft an explanation. An agent that selects its own next steps adds execution paths, tool budgets, and recovery states. Use that flexibility when the path cannot be specified usefully in advance. [Anthropic's workflow guidance](https://www.anthropic.com/research/building-effective-agents) explains this distinction.

Constrain a draft with a response schema. This vendor-neutral JSON Schema fragment permits explanations or escalation, with citations that the application must resolve:

```json
{
  "type": "object",
  "required": ["action", "explanation", "policy_ids"],
  "additionalProperties": false,
  "properties": {
    "action": {"enum": ["explain", "request_review"]},
    "explanation": {"type": "string", "maxLength": 2000},
    "policy_ids": {"type": "array", "items": {"type": "string"}}
  }
}
```

A provider may support only a subset of JSON Schema; adapt and validate its contract. A parseable policy ID can still be fabricated, revoked, or irrelevant. Resolve IDs against evidence supplied to this request and check that it supports the claim. [Google's structured-output documentation](https://ai.google.dev/gemini-api/docs/structured-output) retains this application validation.

## Choose where knowledge lives

Use direct context for a small known policy set. Retrieval fits changing, private, or extensive knowledge. Keyword lookup often serves exact policy identifiers; hybrid search or reranking earns its complexity through measured retrieval failures. Fine-tuning changes learned behavior and conventions; it gives no dependable policy-freshness guarantee.

Filter permission and effective dates before documents enter model context. This PostgreSQL fragment assumes row-level account grants in `policy_grants`; `$1` comes from the authenticated session and `$2` is the decision timestamp:

```sql
SELECT p.id, p.version, p.body
FROM policies p
WHERE p.effective_at <= $2
  AND (p.expires_at IS NULL OR p.expires_at > $2)
  AND EXISTS (
    SELECT 1 FROM policy_grants g
    WHERE g.policy_id = p.id AND g.account_id = $1
  );
```

This illustrates authorization, not a complete retrieval engine. Apply every relevant ACL before ranking authorized candidates, preserve source versions, and carry the same scope into caches. Revocations and deletions must reach indexes and caches promptly. Asking the model to hide unauthorized retrieved content comes after disclosure. [Google's retrieval ACL documentation](https://docs.cloud.google.com/generative-ai-app-builder/docs/data-source-access-control) describes the identity metadata involved.

Track ingestion lag and embedding versions; query and document representations must remain compatible during index migration. Evaluate whether the correct current passage was found separately from whether the generated answer used it faithfully.

## Keep authority outside the model

Treat retrieved documents and tool output as untrusted content: a passage can contain instructions alongside useful evidence. Prompt defenses reduce attacks, while least privilege and independent service checks bound their consequences. See [Anthropic's injection guidance](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks).

A narrow execution service derives identity from authentication, checks approval and policy, and uses a guarded state transition. This SQL is only that transition, assuming a uniquely identified request and trusted service parameters:

```sql
UPDATE refund_requests
SET state = 'executing', operation_key = $4
WHERE id = $1 AND account_id = $2
  AND state = 'approved' AND amount_cents <= $3
RETURNING id, amount_cents, operation_key;
```

Only a returned row authorizes this worker to proceed. `$3` must be a validated limit; bind approval to the exact request, amount, and policy version and prevent later edits. The database transaction does not make a payment API atomic. Commit a durable operation record, use provider idempotency, and reconcile ambiguous timeouts before retrying. The model proposes; the execution service owns authority and recovery.
