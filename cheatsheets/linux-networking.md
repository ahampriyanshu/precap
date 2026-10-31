# Linux and networking

Commands that narrow a running-service failure from process to public route. These examples target Linux hosts; macOS uses different tools for several checks. Use an authorized diagnostic session and avoid including credentials or customer payloads in captured output. The lessons cover [process supervision](/guides/devops/processes-and-first-deploy/) and [the traffic path](/guides/devops/networking-and-ingress/).

## Establish process state

Check the service's supervisor and recent logs before restarting away useful evidence.

```bash
systemctl status orders --no-pager
journalctl -u orders --since '10 minutes ago' --no-pager
ps -eo pid,ppid,%cpu,%mem,etime,args --sort=-%cpu
ss -lntp
```

Process details may require privileges and command arguments may expose secrets. A listener on loopback is reachable locally but not directly from another host. A running unit can still serve failing requests.

## Find resource pressure

Inspect memory, filesystem capacity, inodes, and I/O together.

```bash
free -h
vmstat 1 5
df -h
df -i
pidstat -dur 1 5
```

`pidstat` needs the sysstat package. Free memory alone can be misleading because the OS uses memory for caches; inspect available memory and process/cgroup limits. A filesystem can run out of inodes while still showing free bytes.

## Resolve names and compare endpoints

Observe the resolver response and whether the application listener answers directly.

```bash
dig app.example.test A
dig app.example.test AAAA
curl --fail-with-body --max-time 5 http://127.0.0.1:8000/health/ready
curl --fail-with-body --max-time 10 https://app.example.test/health/ready
```

The example domain requires a real configured replacement. The first HTTP request bypasses public DNS/TLS/proxy routing; the second exercises those boundaries. CORS is enforced by browsers, so a successful curl request does not establish a browser's permission to read a response.

## Inspect TLS with the correct server name

SNI and hostname validation matter when multiple sites share an address.

```bash
openssl s_client -connect app.example.test:443 \
  -servername app.example.test -verify_hostname app.example.test \
  -verify_return_error </dev/null
```

Inspect the served chain, validity dates, and verification result. Do not bypass certificate verification to make a health check pass; establish whether trust, hostname, clock, or certificate distribution is wrong.

## Measure phases of an HTTP request

Curl's timings are cumulative elapsed values from request start.

```bash
curl --silent --show-error --output /dev/null --max-time 10 \
  --write-out 'dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} first_byte=%{time_starttransfer} total=%{time_total}\n' \
  https://app.example.test/health/ready
```

Differences between phases approximate time spent in each boundary for this request. Connection reuse, redirects, proxies, and protocol negotiation change interpretation. First-byte time includes request transmission and server work; it is not a pure application timer.

## Validate proxy configuration before reload

For a host running Nginx with the intended configuration and privileges:

```bash
sudo nginx -t
# Run only after validation succeeds and the configuration change is reviewed.
sudo systemctl reload nginx
```

A config test establishes syntax and referenced-file checks, not upstream health. After reload, verify the public route and inspect errors. Preserve the previously working configuration for controlled recovery.
