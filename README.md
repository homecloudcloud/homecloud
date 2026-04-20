# Homecloud

This repository contains the OpenMediaVault package-oriented source tree and
related assets.

## Getting Started

### Prerequisites

- Debian/Ubuntu build environment
- `make`, `dpkg-dev`, and standard packaging tools
- Node.js and `npm` (for workbench tasks)

### First-time setup

```bash
make install
```

### Build package artifacts

```bash
make clean && make binary
```

### Optional: build and test workbench

```bash
cd openmediavault/workbench
npm ci
npm run build:prod
npm run test:ci
npm run lint
```

### Quick Verify

```bash
make --version
dpkg-buildpackage --version
cd openmediavault/workbench && npm --version
```

If all commands return versions without errors, run:

```bash
make clean && make binary
```

## Repository layout

- `openmediavault/` – primary package contents, runtime files, scripts, Salt
  states, and workbench.
- Root Debian metadata/files – `control`, `rules`,
  `openmediavault.install`, service/unit files, and packaging helpers.
- `php-pam/` – PAM PHP package sources.

## Build

From repository root:

```bash
make install
make clean && make binary
```

Debian package flow:

```bash
cd openmediavault
debian/rules clean && debian/rules binary
dpkg-buildpackage -S -us -uc
```

## Test

Python unit tests:

```bash
cd openmediavault/usr/share/openmediavault/unittests/python
make install && make test
```

PHP unit tests:

```bash
cd openmediavault/usr/share/openmediavault/unittests/php
make install && make test
```

Shell unit tests:

```bash
cd openmediavault/usr/share/openmediavault/unittests/shell
make install && make test
```

## Workbench

```bash
cd openmediavault/workbench
npm ci
npm run build:prod
npm run test:ci
npm run lint
```

## Markdown

Run Markdown lint checks from the repository root:

```bash
npx --yes markdownlint-cli "**/*.md"
```
