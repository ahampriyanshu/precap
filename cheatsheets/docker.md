# Docker

Commands for image construction, local execution, and container diagnosis. Examples assume Docker Engine/Desktop and Buildx are installed. Placeholder images must exist before running them. See [containers and image builds](/guides/devops/containers-and-images/) for isolation, lifecycle, and resource semantics.

## Inspect before replacing

Establish the actual container and image identity.

```bash
docker version
docker ps -a
docker image ls --digests
docker inspect orders --format '{{.Image}} {{.State.Status}} {{.State.ExitCode}}'
docker inspect orders --format '{{json .State.OOMKilled}}'
```

The container image ID identifies local content. A registry repository digest identifies distributed content; tags can move. An OOM flag is stronger evidence than assuming every exit code 137 was caused by memory exhaustion.

## Build a local artifact

Run from a directory containing a reviewed Dockerfile and `.dockerignore`.

```bash
docker buildx build --load --tag orders:local .
docker image inspect orders:local --format '{{.Id}}'
docker history orders:local
```

`--load` loads the result into the local image store for this single-platform workflow. Check the context exclusions before building; image history and layers can retain material you did not intend to distribute.

## Run with explicit limits and ports

This starts an existing application image in a local test boundary.

```bash
docker run --detach --name orders \
  --publish 127.0.0.1:8000:8000 \
  --memory 512m --cpus 1 \
  --read-only --tmpfs /tmp:rw,noexec,nosuid,size=64m \
  orders:local
docker logs --tail 100 orders
docker stats --no-stream orders
```

The loopback binding keeps this example off public interfaces. The image must support a read-only root filesystem and its configured port. Resource numbers are local test inputs, not production sizing advice.

## Diagnose process and network boundaries

Inspect the existing process before opening a shell or restarting it.

```bash
docker top orders
docker inspect orders --format '{{json .NetworkSettings.Networks}}'
docker logs --since 10m orders
docker exec orders python -c 'import socket; print(socket.gethostname())'
```

The last command requires Python in the image. Minimal images may have no shell or diagnostic tools. Avoid installing ad hoc tooling into a running production container; use the platform's controlled debugging mechanism.

## Coordinate a local stack

These commands assume a reviewed Compose file and an `api` service.

```bash
docker compose config --quiet
docker compose up --detach
docker compose ps
docker compose logs --tail 100 api
docker compose stop
```

Config validation checks the model, not database readiness or application correctness. `depends_on` alone is not a complete readiness contract. Preserve volumes unless intentionally removing their data.

## Publish and retain the digest

For a registry you can authenticate to and are authorized to publish into:

```bash
docker buildx build --push \
  --tag registry.example.test/orders:source-SHA \
  --metadata-file build-metadata.json .
docker buildx imagetools inspect registry.example.test/orders:source-SHA
```

Record the pushed digest with the source/build provenance and promote that identity. The placeholder registry and tag require replacement. Stop local containers with `docker stop orders`; remove them only after confirming their writable state is disposable. Avoid broad prune commands during diagnosis.
