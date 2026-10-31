# Backups, disaster recovery, and stateful operations

Replication keeps another copy close to current state. It can also copy an accidental deletion immediately. Backups preserve recovery points; disaster recovery coordinates data, application, identity, networking, and operational access after a larger failure. The relevant result is a usable service with acceptable data loss, not a successful backup job.

## Define RPO and RTO for a real failure

Recovery Point Objective describes tolerable data loss measured backward from failure. Recovery Time Objective describes the target time to restore usable service. Include detection, decision, provisioning, restore, replay, verification, and traffic restoration in the time budget.

An hourly snapshot alone cannot promise a five-minute RPO. A continuous log archive can narrow loss, but only if logs are complete, retained, accessible, and replayable. The intended recovery point may precede the latest backup when corruption or malicious changes occurred earlier.

| Failure | Relevant defense | Limitation to test |
| --- | --- | --- |
| One process dies | Replacement and durable dependencies | Lost in-flight work |
| One zone fails | Cross-zone capacity and replication | Routing and surviving capacity |
| Rows deleted incorrectly | Historical restore and reconciliation | Finding the right recovery point |
| Region unavailable | Independent recovery environment | Data, keys, quotas, identity, DNS |
| Credentials compromised | Isolated retained backups and trusted access | Attacker deletion and key compromise |

These defenses overlap but are not interchangeable. Choose a recovery scenario explicitly rather than calling every redundant copy a backup.

## Establish an application-consistent recovery point

For PostgreSQL, physical backups plus archived WAL can support point-in-time recovery when configured and verified correctly. Logical dumps help selective migration and inspection but have different scope and restore characteristics. Database roles, extensions, encryption keys, and external object references may need separate recovery handling.

A snapshot of a filesystem is not automatically an application-consistent backup of a running database. Use the engine's supported backup procedure and verify its ordering requirements. For multiple independent systems, establish how their states will be reconciled after restoring to different points.

Consider an order row referencing an uploaded invoice. Restoring the database to 10:00 while object retention has already deleted the referenced version can leave an unusable order. Retention and deletion policies must account for database recovery windows, legal requirements, and object version lifecycles together.

## A restore drill needs assertions

Restore into an isolated environment with its own network and identities. Prevent restored workers from sending emails, charging cards, or consuming production queues. Measure elapsed time and validate application-level invariants, not just that a database process starts.

```sql
-- Example post-restore checks; adapt the expected domain invariants.
SELECT COUNT(*) AS orphan_lines
FROM order_line AS line
LEFT JOIN orders AS parent ON parent.id = line.order_id
WHERE parent.id IS NULL;

SELECT currency, SUM(amount_minor) AS ledger_balance
FROM ledger_entry
GROUP BY currency;
```

The first query should find no missing parents. The ledger check is useful only with a known accounting model; some ledgers require per-transaction balanced entries rather than a zero global sum. Compare row and event watermarks, representative tenant access, object references, and critical workflows. A successful row count can coexist with broken authorization or missing files.

A restore drill should produce the actual RPO achieved, full service RTO, bottleneck, and follow-up. Repeat after major schema, volume, encryption, or infrastructure changes. An untested runbook ages even if the backup job stays green.

## Failover must prevent two writers

Promoting a standby changes authority. Ensure the old primary cannot continue accepting conflicting writes through stale routes or an isolated network. Fencing can involve storage, network, lease epochs, or the database's own replication protocol. DNS changes alone do not invalidate existing connections or stop an old writer.

Asynchronous replication can lose acknowledged writes during failover. Synchronous policies trade write availability and latency against durability objectives. After promotion, applications must reconnect, pools must discard invalid connections, and retries must preserve operation identity. Rejoining the old primary is a recovery procedure, not simply pointing it at the new address.

## Recovery capacity and cost are architectural choices

Active-active, warm standby, pilot-light, and restore-on-demand approaches spend different amounts before failure and require different work during recovery. A warm environment can still fail to scale because quotas, images, secrets, or instance types are unavailable. Test the dependent control planes that recovery uses.

Budget storage retention, cross-region transfer, replay time, and retrieval costs. Lower-cost archival tiers may have retrieval delays incompatible with the RTO. Keep recovery credentials and keys available through a failure of the primary identity or platform system, with access control and auditing appropriate to their power.

A senior review should end with a concrete scenario: “If this database is corrupted at 14:00, what exactly restores it, how much data can be lost, who can perform the work, and what proves the service is usable?” An answer that names a backup product without that sequence is incomplete.
