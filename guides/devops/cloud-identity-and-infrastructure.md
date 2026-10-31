# Cloud identity, networks, and managed services

Cloud APIs made compute, networks, and storage programmable. They also made it possible for one credential or configuration change to affect an entire fleet. The useful foundation is an explicit resource model: who can act, which boundary traffic crosses, what persists, and which failures the service can tolerate. EC2 is one implementation choice within that model.

## Choose an operating model by responsibility

A VM exposes the host operating system and process lifecycle. A managed container service handles more placement and replacement. A function platform manages short-lived execution within its invocation and concurrency model. A managed database handles parts of replication, patching, and backup infrastructure. Each abstraction retains limits and failure modes that application owners must understand.

| Model | Responsibility reduced | Work that remains |
| --- | --- | --- |
| VM plus supervisor | Physical hardware | OS patching, replacement, routing, app lifecycle |
| Managed containers | Some host and placement work | Images, health, capacity, identity, dependencies |
| Kubernetes platform | Common workload control API | Cluster/platform lifecycle and workload operations |
| Functions | Server provisioning per invocation | Concurrency, cold paths, deadlines, event replay |
| Managed database | Parts of database infrastructure | Schema, query load, access, recovery verification |

Select the smallest model that meets deployment, isolation, scaling, and ownership needs. An internal service with steady low load may not justify operating a Kubernetes platform. A function with thousands of concurrent invocations can exhaust the same database a VM fleet would exhaust.

## Identity is a separate path from traffic

An IAM role establishes permissions for an assumed identity. Its trust policy controls who may assume it; its permissions policy controls what that identity may do. Resource policies and organizational controls can further restrict the result. Explicit deny rules and service-specific evaluation matter, so a single allow statement is not a complete explanation of effective access.

Use short-lived workload credentials and federated human access. A service that reads one bucket prefix should not share an administrator identity with CI. This IAM permissions fragment limits object reads; the real account must separately configure role trust, encryption-key access if applicable, and any required bucket-list permission.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject"],
    "Resource": ["arn:aws:s3:::example-invoices/tenant-exports/*"]
  }]
}
```

The prefix is a resource boundary, not a tenant authorization system by itself. A shared service may still have broad access across tenants; its application must enforce the current caller's entitlement before choosing an object key or issuing a signed URL. Signed URLs delegate access until expiry and need careful scope and retention.

## Model network and failure boundaries

A VPC is a network boundary containing subnets and routes. Availability zones provide separate infrastructure failure domains within a region. Place redundant application capacity across zones when the availability requirement justifies it. Two replicas on one host do not survive that host's failure; two hosts in one zone do not establish zone resilience.

A practical request path is public load balancer → private application → private database. Security groups restrict allowed traffic to intended peers. Outbound internet access may require NAT, while supported cloud services can be reached over private endpoints. Account for DNS, certificate renewal, egress cost, and cross-zone dependencies alongside the attractive instance price.

Separate production and nonproduction identities, budgets, and resource boundaries. A namespace is useful inside a cluster but is not equivalent to an independent cloud account or cluster isolation boundary. Decide how far a mistaken permission or infrastructure apply can reach.

## Match storage to access and recovery

Object storage serves durable blobs through an API; block storage presents a device to a machine; a network filesystem exposes shared file semantics. Their concurrency, consistency, attachment, and cost models differ. A mounted disk does not automatically follow a replacement container to another zone.

Keep database engines on storage designed for their durability and I/O requirements. A managed database can simplify operations, but automatic backups still need retention, encryption-key availability, tested restore time, and data-integrity checks. Cross-zone replication protects a different failure from accidental deletion or a bad migration.

For object-heavy flows, direct uploads with narrowly scoped signed requests can remove API servers from the byte path. Validate object ownership and scan or process uploaded content before making it trusted. A successful upload and a committed business record are separate events that may need reconciliation.

## Diagnose the active identity and region

“Access denied” may involve a wrong role, wrong account, wrong resource name, key policy, or organization rule. A missing resource can simply be in another region. Establish identity and region before changing permissions. Broadening a policy until an error disappears hides the original fault and expands exposure.

The [AWS CLI cheatsheet](/cheatsheets/aws-cli/) covers identity checks, inventory queries, logs, and controlled access to running resources. Cloud commands complement the resource model; they should not become the only record of how production was created.
