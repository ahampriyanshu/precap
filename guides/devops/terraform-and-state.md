# Terraform, state, and infrastructure changes

Manual cloud setup produces resources whose purpose and dependencies live in people's memory. Infrastructure as code makes intended configuration reviewable. Terraform builds a dependency graph and asks providers to reconcile that configuration with remote objects. Its state records which real object corresponds to each resource address. Understanding that binding is essential before trusting a plan.

## Configuration, state, and reality can disagree

These are three different views. Configuration says what is intended. State records Terraform's bindings and known attributes. Provider reads observe the remote system. A plan compares them and proposes actions. Someone changing a security group in the console creates drift; renaming a resource block can look like deleting one object and creating another unless the address move is declared.

![Terraform compares versioned configuration, protected state bindings, and provider observations, then produces a plan that is reviewed before apply.](/diagrams/devops-state.svg)

Terraform is not a continuous controller by default. A committed file does not change infrastructure until a run executes, and an unmanaged resource does not enter state merely because its name looks familiar. Import brings an existing object under a resource address; the corresponding configuration must then represent the desired behavior.

## Establish a state boundary deliberately

Separate states by ownership and change/failure boundary. One enormous state couples permissions and run times across teams. Hundreds of tiny states can create brittle remote-output dependencies and no atomic change across them. A network foundation and an application stack often warrant separate lifecycles, with a small published interface between them.

This backend fragment assumes a protected, versioned bucket already exists. Native S3 lock-file support requires a compatible Terraform release; `>= 1.10` is the minimum in this example. Configure encryption, access policies, retention, and permissions for the lock object in the backend's bootstrap stack.

```hcl
terraform {
  required_version = ">= 1.10, < 2.0"
  backend "s3" {
    bucket       = "example-infra-state"
    key          = "orders/production.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

A state lock coordinates writers to that state. It cannot prevent two independent states from attempting incompatible changes to a shared resource. It also cannot make a reviewed deletion safe. Keep ownership singular and dependencies explicit. State can contain secret values even when outputs are marked sensitive; protect state and saved plan files accordingly.

## Review a change, not just a green command

A useful review checks additions, in-place updates, replacements, and deletions; the affected traffic and data path; and recovery if the run stops halfway. A replacement can temporarily require double capacity or a unique name. `create_before_destroy` helps only when the provider and resource constraints permit coexistence.

```bash
terraform init -input=false
terraform fmt -check
terraform validate
terraform plan -out=reviewed.tfplan -lock-timeout=60s
terraform show reviewed.tfplan
# After review, apply this exact protected plan in the same controlled workflow.
terraform apply -input=false reviewed.tfplan
```

These commands are a workflow illustration, not instructions to run against an unknown account. Pin and commit provider selections with the dependency lockfile. Keep credentials out of backend arguments and plan artifacts. If the plan becomes stale or its intended context changes, create and review a new one.

Terraform apply is not an all-or-nothing transaction across cloud APIs. Some resources may be updated before a later operation fails. Read the resulting state and actual remote status before retrying. Blind rollback to an old configuration can propose additional destructive actions rather than restore the previous reality.

## Move addresses without replacing infrastructure

Refactoring configuration should preserve the binding when the intended object stays the same. A moved block communicates the address change to collaborators and future runs.

```hcl
moved {
  from = aws_security_group.api
  to   = module.orders.aws_security_group.api
}
```

This fragment assumes the destination module contains the matching resource. Review the resulting plan for a move with no unintended replacement. Removing the old state entry manually, then applying, can create duplicates or strand unmanaged objects. State-edit commands are maintenance operations with their own review and recovery requirements.

Modules should encode a useful contract: workload identity, ingress intent, resource ownership, tags, and sensible constraints. A module that accepts every underlying provider option transfers complexity without establishing a platform interface. Version modules and document migrations so consumers can upgrade deliberately.

## Drift and emergency changes need reconciliation

An emergency console change may be the fastest restoration. Record it, then decide whether configuration should adopt it or restore the previous intent. Otherwise the next ordinary apply can undo the fix. A drift detector should open an actionable difference; automatically applying every difference can amplify an incident.

If a lock is stuck, identify the owning run and establish that no writer remains. Force-unlocking an active writer removes the coordination that protects state. Recover a damaged state from a controlled version or backup with an explicit reconciliation plan, not by guessing at JSON edits.

Use the [Terraform cheatsheet](/cheatsheets/terraform/) for inspection, plan exit codes, imports, and state investigation. The key interview and production question is always which real objects a proposed change will affect, and what happens if execution ends halfway.
