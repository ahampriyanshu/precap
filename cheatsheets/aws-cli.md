# AWS CLI

A focused AWS CLI v2 workflow for identity, resource inspection, and incident evidence. Examples use a configured `staging` profile in `ap-south-1`; replace resource names and IDs with verified values. The [cloud foundations lesson](/guides/devops/cloud-identity-and-infrastructure/) explains the resource and permission boundaries.

## Establish identity and region

Use your organization's federated access configuration. The SSO wizard requires its start/issuer URL and assigned account/role.

```bash
aws configure sso --profile staging
aws sso login --profile staging
aws sts get-caller-identity --profile staging
aws configure list --profile staging
```

The identity response identifies the active principal and account, not permission to every service. Avoid pasting temporary credentials into shell history. Region is independent of identity and can change which resources are visible.

## Query inventory rather than dumping everything

Filter on the service side, then select useful response fields.

```bash
aws ec2 describe-instances --profile staging --region ap-south-1 \
  --filters Name=tag:Service,Values=orders Name=instance-state-name,Values=running \
  --query 'Reservations[].Instances[].{Id:InstanceId,AZ:Placement.AvailabilityZone,IP:PrivateIpAddress}' \
  --output table
aws elbv2 describe-target-health --profile staging --region ap-south-1 \
  --target-group-arn TARGET_GROUP_ARN
```

Replace the target-group ARN. An empty filtered result may indicate the wrong region or tags. CLI pagination and `--query` behavior matter for large datasets; do not infer a fleet-wide count from a truncated page.

## Inspect logs with an explicit time boundary

This assumes the log group already exists and permissions allow reading it.

```bash
aws logs tail /services/orders --profile staging --region ap-south-1 --since 10m
aws logs describe-log-groups --profile staging --region ap-south-1 \
  --log-group-name-prefix /services/orders \
  --query 'logGroups[].{Name:logGroupName,Retention:retentionInDays}'
```

Logs can contain sensitive data and be delayed. An absence of events can mean a broken collection path rather than no application failure. Preserve timestamps and the running version in the investigation.

## Verify image content and object metadata

Read identities without downloading customer payloads.

```bash
aws ecr describe-images --profile staging --region ap-south-1 \
  --repository-name orders --image-ids imageTag=release-42 \
  --query 'imageDetails[].{Digest:imageDigest,Pushed:imagePushedAt}'
aws s3api head-object --profile staging --region ap-south-1 \
  --bucket example-invoices --key tenant-exports/example.json
```

A tag can move, so retain the returned digest in release evidence. S3 object metadata does not prove business correctness or entitlement. Versioned objects and encryption may require additional identifiers and permissions.

## Open controlled operational access

Session Manager avoids exposing an SSH listener when the instance has the required agent, network path, and IAM configuration.

```bash
aws ssm describe-instance-information --profile staging --region ap-south-1
aws ssm start-session --profile staging --region ap-south-1 --target INSTANCE_ID
```

Replace the instance ID and use an authorized session policy. Session initiation is an interactive action, not inventory. Audit and restrict the session capabilities; access to a shell can expose workload credentials.

## Observe a managed database's configuration

Inspect the intended instance without initiating a failover or restore.

```bash
aws rds describe-db-instances --profile staging --region ap-south-1 \
  --db-instance-identifier orders-staging \
  --query 'DBInstances[].{Status:DBInstanceStatus,MultiAZ:MultiAZ,Retention:BackupRetentionPeriod,LatestRestorable:LatestRestorableTime}'
```

A recent restorable timestamp is useful operational evidence. It does not establish a tested RTO, available keys, valid application data, or a complete disaster-recovery procedure.
