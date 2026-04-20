# Project Guidelines

## Code Style

- Python formatting/linting conventions follow `openmediavault.mk`: `autopep8` (line length 79), `isort`, and `pylint` with `.pylintrc`.
- Keep Python changes aligned with existing tolerance in `.pylintrc` (legacy-style checks are intentionally relaxed).
- For shell logic, follow helper-function patterns in `openmediavault/usr/share/openmediavault/scripts/helper-functions` and related tests in `openmediavault/usr/share/openmediavault/unittests/shell/helper-functions.sh`.
- For workbench/frontend changes, use scripts defined in `openmediavault/package.json`.

## Architecture

- This is a Debian package-oriented project: package metadata is in `control`,
  install mappings in `openmediavault.install`, and lifecycle/post-install
  logic is in `openmediavault.postinst`.
- OMV backend service APIs are implemented as RPC modules in `openmediavault/usr/share/openmediavault/engined/rpc` (example: `system.inc`).
- Configuration/state deployment uses Salt in `openmediavault/srv/salt`, rooted by `openmediavault/srv/salt/top.sls`.
- Operational app scripts are primarily under `openmediavault/sbin` and typically orchestrate OMV RPC + Salt + systemd.

## Build and Test

- Root package build:
  - `make install`
  - `make clean && make binary`
- Debian package path:
  - `cd openmediavault && debian/rules clean && debian/rules binary`
  - `cd openmediavault && dpkg-buildpackage -S -us -uc`
- Workbench/frontend:
  - `cd openmediavault/workbench && npm ci`
  - `cd openmediavault/workbench && npm run build:prod`
  - `cd openmediavault/workbench && npm run test:ci && npm run lint`
- Unit tests:
  - `cd openmediavault/usr/share/openmediavault/unittests/python && make install && make test`
  - `cd openmediavault/usr/share/openmediavault/unittests/php && make install && make test`
  - `cd openmediavault/usr/share/openmediavault/unittests/shell && make install && make test`

## Project Conventions

- Keep install/package mappings synchronized with `openmediavault.install`; avoid introducing runtime files outside declared install roots.
- Prefer OMV-native interfaces (`omv-rpc`, `omv-salt`, `omv-confdbadm`) instead of direct low-level config mutation.
- Treat systemd units/services as source-of-truth for lifecycle behavior (e.g., `openmediavault.openmediavault-engined.service`).
- Follow existing script orchestration patterns in `openmediavault/sbin/app-auto-updates.py` and `openmediavault/sbin/update-app.py`.

## Integration Points

- RPC integrations: `openmediavault/usr/share/openmediavault/engined/rpc` and callers in `openmediavault/sbin/*.py`.
- Salt integrations: deployment/stage trees under `openmediavault/srv/salt/omv/deploy` and `openmediavault/srv/salt/omv/stage`.
- Password-reset container integration: `openmediavault/omv-password-reset/docker-compose.yml`, `start.sh`, `reset.sh`.

## Security

- Treat PAM/auth files as high risk: `openmediavault/etc/pam.d/openmediavault-webgui` and `openmediavault/etc/pam.d/openmediavault-common-auth`.
- Treat password reset logic as privileged: `openmediavault/omv-password-reset/reset.sh`.
- Treat any material under `openmediavault/etc/ssl` as sensitive.
- Be cautious with `openmediavault.postinst` changes because it affects bootstrap users, passwords, and service defaults.

## Notes for Maintainers

- Please confirm source-of-truth for Debian metadata between repo root (`control`, `rules`) and `openmediavault/debian/`.
- Please confirm intended JS unittest location (README mentions it, tree appears incomplete).
- Please confirm whether `openmediavault/requirements.txt` is authoritative or supplemental to Debian dependency metadata.
