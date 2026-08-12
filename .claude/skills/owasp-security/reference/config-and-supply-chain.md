# A02 Security Misconfiguration & A03 Software Supply Chain Failures

The #2 and #3 categories of the OWASP Top 10:2025 are rarely found in application code. They
live in Dockerfiles, Kubernetes manifests, Terraform, framework settings, lockfiles, and CI
workflow definitions. This file covers those surfaces concretely.

> **Same reporting bar applies.** A hardening gap in a file that never reaches production, or a
> permissive setting already constrained by a layer above it (a security group behind a private
> subnet, a `latest` tag pinned by digest at deploy), is defense-in-depth — report it as such.
> See "Before Reporting a Finding" in [`../SKILL.md`](../SKILL.md).

## Contents
- [Where to Look First](#where-to-look-first)
- [A02 — Containers](#a02--containers)
- [A02 — Kubernetes](#a02--kubernetes)
- [A02 — Cloud & Terraform](#a02--cloud--terraform)
- [A02 — Application & Web Server Config](#a02--application--web-server-config)
- [A02 — Security Headers](#a02--security-headers)
- [A03 — Dependency Manifests and Lockfiles](#a03--dependency-manifests-and-lockfiles)
- [A03 — Dependency Confusion and Typosquatting](#a03--dependency-confusion-and-typosquatting)
- [A03 — Install Scripts](#a03--install-scripts)
- [A03 — CI/CD Pipelines](#a03--cicd-pipelines)
- [A03 — Provenance, Signing, and SBOM](#a03--provenance-signing-and-sbom)

---

## Where to Look First

Before reading any application code, list these files if they exist. They are small, high-signal,
and frequently unreviewed:

| Surface | Files |
|---|---|
| Containers | `Dockerfile*`, `docker-compose*.yml`, `.dockerignore` |
| Orchestration | `k8s/**/*.yaml`, `helm/**/values.yaml`, `*.deployment.yaml` |
| Infrastructure | `*.tf`, `*.tfvars`, `cdk/**`, `template.yaml` (SAM), `serverless.yml` |
| App config | `settings.py`, `application*.yml`, `appsettings*.json`, `next.config.js`, `.env*` |
| Web server | `nginx.conf`, `httpd.conf`, ingress annotations |
| Dependencies | `package.json` + lockfile, `requirements.txt`, `pyproject.toml`, `go.mod`, `pom.xml`, `Gemfile`, `Cargo.toml` |
| Registry config | `.npmrc`, `pip.conf`, `settings.xml`, `.yarnrc.yml` |
| Pipelines | `.github/workflows/*.yml`, `.gitlab-ci.yml`, `Jenkinsfile`, `azure-pipelines.yml` |

Two questions cut through most of it: **what runs as root or with wildcard permissions**, and
**what executes code that someone outside the repo controls**.

---

## A02 — Containers

```dockerfile
# UNSAFE
FROM node:latest                      # unpinned — the image changes under you
COPY . .                              # no .dockerignore: .env, .git, keys land in the layer
RUN npm install
ARG NPM_TOKEN                         # build args are visible in image history
ENV API_KEY="sk-live-..."             # baked into the image, readable by anyone who pulls it
USER root                             # default; the process runs as uid 0
CMD ["npm", "start"]
```

```dockerfile
# SAFE
FROM node:22.11.0-alpine@sha256:...   # pinned by digest
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev                 # ci, not install: honors the lockfile exactly
COPY --chown=node:node . .            # with a .dockerignore covering .git, .env, secrets
USER node                             # non-root
CMD ["node", "server.js"]
```

**Check for:**
- Running as root — `USER` absent entirely is the common case, not an explicit `USER root`
- Secrets in `ENV`, `ARG`, or any `RUN` command — every layer is readable via `docker history`;
  deleting a file in a later layer does not remove it from the earlier one. Use build secrets
  (`RUN --mount=type=secret`) or inject at runtime.
- Missing `.dockerignore` while the Dockerfile does `COPY . .` — this is how `.git` and `.env`
  reach production images
- `npm install` / `pip install -r` without a lockfile step (see A03 below)
- `latest` or floating tags; unpinned base image digests
- `curl ... | sh` in a build step — unverified remote code at build time
- `--privileged`, `network_mode: host`, or docker socket mounts (`/var/run/docker.sock`) in
  compose files — a socket mount is host root, effectively

---

## A02 — Kubernetes

```yaml
# UNSAFE
spec:
  containers:
    - name: api
      image: myapp:latest
      securityContext:
        privileged: true              # full host access
        runAsUser: 0
      env:
        - name: DB_PASSWORD
          value: "hunter2"            # plaintext in the manifest, and in git
      volumeMounts:
        - mountPath: /host
          name: hostvol
  volumes:
    - name: hostvol
      hostPath: { path: / }           # the entire node filesystem
```

```yaml
# SAFE
spec:
  automountServiceAccountToken: false  # unless the pod actually calls the API server
  securityContext:
    runAsNonRoot: true
    runAsUser: 10001
    seccompProfile: { type: RuntimeDefault }
  containers:
    - name: api
      image: myapp@sha256:...
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities: { drop: ["ALL"] }
      envFrom:
        - secretRef: { name: api-secrets }   # from a secret store, not the manifest
      resources:
        limits: { cpu: "1", memory: "512Mi" }   # absent limits = node-wide DoS
```

**Check for:** `privileged: true`, `hostNetwork`/`hostPID`/`hostPath`, missing
`allowPrivilegeEscalation: false`, capabilities not dropped, secrets as literal `value:` (and
remember base64 in a `Secret` object is encoding, not encryption), `automountServiceAccountToken`
left on by default, absent resource limits, no NetworkPolicy (default is all pods can reach all
pods), and RBAC bindings granting `cluster-admin` or `*` verbs.

---

## A02 — Cloud & Terraform

```hcl
# UNSAFE
resource "aws_s3_bucket_public_access_block" "b" {
  block_public_acls = false           # public bucket
}

resource "aws_security_group_rule" "ssh" {
  type        = "ingress"
  from_port   = 22
  to_port     = 22
  cidr_blocks = ["0.0.0.0/0"]         # SSH open to the internet
}

resource "aws_db_instance" "db" {
  publicly_accessible = true
  storage_encrypted   = false
}

data "aws_iam_policy_document" "p" {
  statement {
    actions   = ["*"]                 # wildcard action on wildcard resource
    resources = ["*"]
  }
}
```

**Check for:**
- Storage exposed publicly (S3 ACLs/policies, GCS `allUsers`, Azure blob public access)
- `0.0.0.0/0` on anything that is not 80/443 — SSH, RDP, database ports, admin panels
- Encryption at rest disabled; TLS not enforced in transit
- IAM policies with `"*"` actions or resources; roles assumable by `"*"` principals
- Managed databases and caches marked publicly accessible
- Audit logging (CloudTrail, flow logs, GCP audit logs) disabled or not retained
- Secrets in `.tfvars` or committed state files — Terraform state stores values in cleartext
- IMDSv1 permitted on EC2 (`http_tokens = "optional"`) — this is the SSRF-to-credentials path

---

## A02 — Application & Web Server Config

```python
# UNSAFE (Django)
DEBUG = True                          # tracebacks with settings and local variables
ALLOWED_HOSTS = ["*"]                 # host header injection, cache poisoning
SECRET_KEY = "dev-key-do-not-use"     # committed and predictable → forgeable sessions
CORS_ALLOW_ALL_ORIGINS = True         # with credentials, any site reads authenticated responses
SESSION_COOKIE_SECURE = False
```

**Check for:**
- Debug/verbose error modes reachable in production; stack-trace pages, `/debug` or profiler routes
- Development secrets committed, or the same key across environments
- CORS: `*` combined with credentials, origin reflected from the request, or a regex matching
  `evil-myapp.com` because the dot was not escaped
- Directory listing enabled; `.git/`, `.env`, backups, or `/actuator`, `/metrics`, `/graphql`
  introspection served publicly
- Default admin consoles left mounted (`/admin`, phpMyAdmin, Kibana, Grafana) without auth
- TLS: versions below 1.2 enabled, weak ciphers, certificate verification disabled in clients
  (`verify=False`, `rejectUnauthorized: false`, `InsecureSkipVerify: true`)

---

## A02 — Security Headers

| Header | Value | Why |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'` | Last line of defense for XSS. `unsafe-inline`/`unsafe-eval` mostly negates it; prefer nonces or hashes. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Prevents downgrade/stripping. |
| `X-Content-Type-Options` | `nosniff` | Stops MIME sniffing turning an upload into script. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Keeps paths and tokens out of `Referer`. |
| `Cache-Control` | `no-store` on authenticated responses | Prevents shared-cache leakage. |
| Cookies | `HttpOnly; Secure; SameSite=Lax` | XSS theft and cross-site request defense. |

`frame-ancestors` supersedes `X-Frame-Options`; setting both is harmless and helps old clients.

---

## A03 — Dependency Manifests and Lockfiles

The recurring finding is a lockfile that exists but is not enforced, which means CI resolves
fresh versions and the review you did does not describe what ships.

| Ecosystem | Resolves fresh (unsafe in CI) | Honors the lockfile |
|---|---|---|
| npm | `npm install` | `npm ci` |
| yarn | `yarn install` | `yarn install --immutable` |
| pnpm | `pnpm install` | `pnpm install --frozen-lockfile` |
| Python | `pip install -r requirements.txt` (unpinned) | pinned `==` + hashes, `pip install --require-hashes`, or `uv sync --frozen` / `poetry install` with committed lock |
| Go | — | `go mod verify` + committed `go.sum` |
| Rust | — | committed `Cargo.lock` (binaries), `cargo --locked` |
| Java | version ranges in `pom.xml` | fixed versions + `dependency-lock` / `mvn -o` with verified checksums |

**Check for:** floating ranges (`^`, `~`, `*`, `latest`) reaching production builds; lockfile
missing or gitignored; `requirements.txt` without `==`; a lockfile whose `resolved` URLs point at
a registry other than the expected one; and vulnerable-but-unused dependencies (they still count
if the code path is reachable — check before rating severity).

---

## A03 — Dependency Confusion and Typosquatting

Dependency confusion: an internal package name that is not registered publicly can be claimed by
an attacker, whose higher version number wins resolution when a build falls back to the public
registry.

```ini
# UNSAFE .npmrc — private scope resolvable from the public registry
registry=https://registry.npmjs.org/

# SAFE — bind the scope to the internal registry explicitly
@mycompany:registry=https://npm.internal.example.com/
//npm.internal.example.com/:_authToken=${NPM_TOKEN}
```

**Check for:**
- Internal package names used unscoped, or scopes not pinned to an internal registry
- A proxy/mirror configured to fall through to the public registry for internal names
- `pip install --extra-index-url` — pip picks the highest version across **all** indexes; use
  `--index-url` with a single trusted mirror
- Names one edit away from a popular package (`crossenv`, `python3-dateutil`, `reqeusts`),
  packages with very recent first-publish dates, or a maintainer change on a critical dependency
- Git/URL dependencies pointing at a branch rather than a commit SHA

---

## A03 — Install Scripts

Package installation executes code. `npm install` runs `preinstall`/`postinstall` from every
package in the tree, with the developer's or CI runner's privileges.

```json
// Review any package that ships this — it is the standard malware entry point
{ "scripts": { "postinstall": "node ./scripts/collect.js" } }
```

Mitigations: `npm ci --ignore-scripts` (then run the builds you actually need explicitly),
`pip install --only-binary :all:` to avoid arbitrary `setup.py` execution, and running installs
in a container without credentials or network access beyond the registry.

---

## A03 — CI/CD Pipelines

The pipeline has repository write access and production credentials. It is a higher-value target
than the application.

```yaml
# UNSAFE — GitHub Actions
on: pull_request_target             # runs with a writable token AND secrets...
jobs:
  build:
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}   # ...on the fork's code. RCE.
      - uses: some-org/some-action@main                    # mutable ref
      - run: echo "Title: ${{ github.event.pull_request.title }}"  # script injection
```

```yaml
# SAFE
on: pull_request                    # read-only token, no secrets for forks
permissions:
  contents: read                    # least privilege, declared explicitly
jobs:
  build:
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # pinned SHA
      - env:
          TITLE: ${{ github.event.pull_request.title }}   # via env, not interpolated into the shell
        run: echo "Title: $TITLE"
```

**Check for:**
- `pull_request_target` or `workflow_run` that checks out untrusted code — the combination of
  fork code plus secrets is the critical one
- `${{ }}` interpolation of attacker-controllable fields (PR title, branch name, issue body,
  commit message) directly into `run:` — the expression is substituted before the shell sees it
- Third-party actions referenced by tag or branch instead of a commit SHA; tags are mutable
- `permissions:` not restricted (default may be write-all)
- Secrets echoed, passed to untrusted steps, or exposed to fork-triggered runs
- Self-hosted runners on public repositories — fork PRs get code execution on your infrastructure
- No required review or branch protection on the branch that deploys

---

## A03 — Provenance, Signing, and SBOM

- Generate an SBOM (CycloneDX or SPDX) as a build artifact, not as a one-off report
- Verify signatures before deploy: `cosign verify`, `npm audit signatures`, sigstore attestations
- Publish with provenance (`npm publish --provenance`, SLSA attestations) so consumers can verify
  which workflow and commit produced an artifact
- Pin container images by digest, not tag — a tag can be repointed after your review
- Keep a rollback path: an artifact whose signature fails verification should block the deploy,
  which only works if failing closed does not leave you unable to ship the previous version

Continuous monitoring (Dependabot, Renovate, Snyk, `osv-scanner`, `pip-audit`, `cargo audit`)
matters more than a point-in-time audit — the dependency was clean on the day you reviewed it.
