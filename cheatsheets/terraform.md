# Terraform

Commands for a controlled configuration/state workflow. Use the intended working directory, backend, cloud identity, and Terraform/provider versions. Plan and state artifacts may contain secrets. The lesson explains [state bindings and infrastructure changes](/guides/devops/terraform-and-state/).

## Initialize and inspect the target

Initialization can access a remote backend and install providers. Review backend configuration first.

```bash
terraform version
terraform init -input=false
terraform workspace show
terraform providers
terraform state list
```

A workspace name is not proof of account isolation. Establish the provider's actual cloud identity as well. Commit the dependency lockfile; do not commit state or plan files.

## Validate and create a reviewable plan

Format and validate configuration, then generate an exact plan artifact.

```bash
terraform fmt -check -recursive
terraform validate
terraform plan -input=false -lock-timeout=60s -out=reviewed.tfplan
terraform show reviewed.tfplan
```

Validation does not prove permissions, available quota, or safe data changes. Inspect replacements and deletions, dependent resources, and interrupted-run recovery. Protect the saved plan and apply it only in its reviewed context.

## Apply the reviewed artifact

In the approved controlled workflow, consume the saved plan rather than creating an unreviewed one at apply time.

```bash
terraform apply -input=false reviewed.tfplan
terraform output
```

A saved-plan apply performs the reviewed actions without a new interactive approval. The command can create, replace, or delete real resources. A partial failure is not automatically rolled back; inspect resulting state and remote objects before retrying.

## Detect drift and interpret exit status

Use a non-mutating plan to surface changes from configuration and remote observations.

```bash
terraform plan -input=false -detailed-exitcode -lock-timeout=60s
```

Exit 0 means no proposed changes, 2 means changes are present, and 1 means error. CI should distinguish all three. `-refresh-only` plans state updates based on remote reality; it does not reconcile infrastructure back to configuration.

## Inspect a binding and import deliberately

Inspect one known state address before changing ownership.

```bash
terraform state show 'module.orders.aws_security_group.api'
```

State output can contain sensitive values. To import an existing object, declare its intended resource configuration and a reviewable import block, then inspect the plan.

```hcl
import {
  to = aws_security_group.api
  id = "sg-REPLACE_WITH_VERIFIED_ID"
}
```

The import target must exist in configuration and belong to this state. Importing the same remote object into competing states creates conflicting owners. Address refactors should use moved blocks when the object itself is staying in place.

## Investigate locks without removing coordination

Read the lock error, find its owning job, and inspect the remote backend and run status.

```bash
terraform plan -input=false -lock-timeout=120s
```

A longer bounded wait is reasonable for an active owner. Force-unlock is a recovery operation only after establishing that no writer remains; disabling locks as a routine workaround risks concurrent state writes. Recover state through controlled backend versions and reconciliation, rather than hand-editing JSON during an incident.
