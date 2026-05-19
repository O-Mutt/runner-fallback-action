# Security Policy

## Supported versions

Only the latest major version receives security fixes. Older majors are not patched.

| Version | Supported |
| ------- | --------- |
| `v2.x`  | ✅        |
| `v1.x`  | ❌        |

## Reporting a vulnerability

Please do **not** open a public issue for security reports.

Use GitHub's [private vulnerability reporting](https://github.com/O-Mutt/runner-fallback-action/security/advisories/new) so the report stays embargoed until a fix ships. If that link is unavailable, email the maintainer listed on the repository profile and prefix the subject with `[SECURITY]`.

Please include:

- A description of the issue and its impact
- Steps to reproduce, or a minimal proof of concept
- The version (tag or commit SHA) where you observed the issue
- Any suggested remediation, if you have one

You will get an acknowledgement within 5 business days. A coordinated disclosure timeline will be agreed before any public discussion.

## Scope

In scope:

- The action source (`index.js`) and the bundled `dist/index.js`
- The workflow files in `.github/workflows/`
- Any privilege escalation or unintended token exposure caused by this action

Out of scope:

- Vulnerabilities in upstream dependencies (please report those to the dependency's own maintainers; we will track them via Dependabot)
- Misuse of the action with overly permissive tokens — see the [Permissions](README.md#permissions) section for the recommended token scopes
