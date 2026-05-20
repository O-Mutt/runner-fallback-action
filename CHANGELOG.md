# Changelog

## [2.0.0](https://github.com/O-Mutt/runner-fallback-action/compare/runner-fallback-action-v2.0.0...runner-fallback-action-v2.0.0) (2026-05-20)


### Miscellaneous

* set Matt O'Keefe as author, move Mike Hardy to contributors ([07b67c1](https://github.com/O-Mutt/runner-fallback-action/commit/07b67c1deaf3d980853669c82ae50a2fac345e1a))

## [2.0.0](https://github.com/O-Mutt/runner-fallback-action/compare/runner-fallback-action-v1.0.2...runner-fallback-action-v2.0.0) (2026-05-19)


### Features

* add ability to fallback if not enough free primaries ([003e483](https://github.com/O-Mutt/runner-fallback-action/commit/003e483e0b573b0eae57e9337016ec058f94ceab))
* adding ability to run for orgs/ents ([7246e8f](https://github.com/O-Mutt/runner-fallback-action/commit/7246e8f85ff2dae37a443f8367f988a764a81cc6))
* **coverage:** add jest coverage with thresholds, upload to Codecov ([d158d95](https://github.com/O-Mutt/runner-fallback-action/commit/d158d95cae424feb68b8ec38277bae06099a581d))
* new option 'fallback-on-error', use fallback if any errors ([b016527](https://github.com/O-Mutt/runner-fallback-action/commit/b01652760b007b7ee68b15c4211fb2310d37c03a))
* print which runner was selected to summary ([dc7732f](https://github.com/O-Mutt/runner-fallback-action/commit/dc7732f9e532c451b2527b288ba8d58fd4b0a4ca))


### Bug Fixes

* **ci:** make integration tests resilient to missing TEST_GITHUB_TOKEN ([41beac4](https://github.com/O-Mutt/runner-fallback-action/commit/41beac47465ea1003c96920e07c32b1be3a6d68b))
* **ci:** regenerate package-lock.json and rebuild dist for clean install ([684fd15](https://github.com/O-Mutt/runner-fallback-action/commit/684fd159121987ffb802a78909ebfe5ebce04d0b))
* **ci:** regenerate package-lock.json on Linux to capture cross-platform wasm fallbacks ([cf960e3](https://github.com/O-Mutt/runner-fallback-action/commit/cf960e3a59e0dd0a395659ee469c5defb62c5e23))
* clean up error reporting of fallback-on-error is set ([beebc8e](https://github.com/O-Mutt/runner-fallback-action/commit/beebc8eed8835caf1b34d5d37db091ad8ac62fed))
* fallback-runner output should be an array ([f9a4beb](https://github.com/O-Mutt/runner-fallback-action/commit/f9a4beba00c5e64d79516f499daa64e6c30cab47))
* **security:** override transitive undici to a patched 6.24+ version ([efdf038](https://github.com/O-Mutt/runner-fallback-action/commit/efdf03870e03dca72abfddcee94518bbdec30a7c))


### Refactor

* **index:** fix unset primaries-required handling, extract helpers, harden API call ([2791efc](https://github.com/O-Mutt/runner-fallback-action/commit/2791efcacfc21ecca8b3933c8cbc5d1617beb409))


### Documentation

* add SECURITY.md and CONTRIBUTING.md ([bc0e99a](https://github.com/O-Mutt/runner-fallback-action/commit/bc0e99a3c09e5474eabd95241928c77807f992d6))
* note in README that this fork will be successor to original action ([28a5172](https://github.com/O-Mutt/runner-fallback-action/commit/28a5172532123d3dd5cc855bee4cb1578196413f))
* **README:** add Prerequisites, Setup walkthrough, and Troubleshooting ([6e274f6](https://github.com/O-Mutt/runner-fallback-action/commit/6e274f67852b7422a014e123d657c6db65c40ef8))
* **README:** expand badge row with CodeQL, vulns, version, and recency signals ([a6144a6](https://github.com/O-Mutt/runner-fallback-action/commit/a6144a66ab25362f3c6563932bcf77d425ee6ce0))
* **README:** update docs with acquired wisdom on eliminating runner contention ([795a97a](https://github.com/O-Mutt/runner-fallback-action/commit/795a97ae8c1c8b667ce94201c30f2342521f451f))
* rewrite README and action.yml metadata for Marketplace release ([88b5a2f](https://github.com/O-Mutt/runner-fallback-action/commit/88b5a2f43917c3fb64fdc962efc2d801c6720ac9))


### Build

* **deps:** rebuild package-lock.json, then `npm audit fix` ([2975d03](https://github.com/O-Mutt/runner-fallback-action/commit/2975d0376c99ad42a95f1a3b4f31a92678fdcc27))
* **deps:** update all packages, forward-port to new eslint ([04ca5bb](https://github.com/O-Mutt/runner-fallback-action/commit/04ca5bb29b0f27ab7f7337755c56ba9575978f95))
* rebuild dist/ for Node 24 runtime ([713da2c](https://github.com/O-Mutt/runner-fallback-action/commit/713da2c43731eeae8c8c227286acfbc8d86066c0))


### Continuous Integration

* **release:** automate releases with release-please ([3e39ae5](https://github.com/O-Mutt/runner-fallback-action/commit/3e39ae53bea559ff2ab0e80bc85b3c42c6c465ac))
* rename workflow to "CI" and add concurrency control ([dedfa49](https://github.com/O-Mutt/runner-fallback-action/commit/dedfa492faf240e6f2e91e853e272b0d5fbdfacf))
* upgrade workflow actions to latest majors, add lint and format-check jobs ([4b520ae](https://github.com/O-Mutt/runner-fallback-action/commit/4b520ae78d6ff493d157803dfb7886d54dd14b9c))


### Miscellaneous

* gitignore local Claude Code tooling, fix CODEOWNERS ([618ef66](https://github.com/O-Mutt/runner-fallback-action/commit/618ef66d94f7bd84b6a3ca44a9a3dda2f8d681eb))
* **node:** bump runtime to Node 24, manage version via .nvmrc ([3ae5f71](https://github.com/O-Mutt/runner-fallback-action/commit/3ae5f71221af531c72c5500a0d222286abc63372))
* remove dead wait.js and legacy .eslintrc.json ([f65deb0](https://github.com/O-Mutt/runner-fallback-action/commit/f65deb0db3684533d4465e814e2472d0d41dac40))
* this repo is now the primary repo, attribution for prior ([1bd25f0](https://github.com/O-Mutt/runner-fallback-action/commit/1bd25f00939e6c78a4fffbe13df8f9d2e6630b93))
* **tooling:** add Prettier with CI format check, modernize ESLint config ([329d640](https://github.com/O-Mutt/runner-fallback-action/commit/329d6402730b34d5acd7812e97a84348ae2881b2))
* update README credits with links ([56a0aee](https://github.com/O-Mutt/runner-fallback-action/commit/56a0aee62ecfbbd50882e545159e1fdd761aa69e))
* use unique name for Action Marketplace ([4bbaf1a](https://github.com/O-Mutt/runner-fallback-action/commit/4bbaf1a48d3a2792cd011a9a586bf014f078c67f))
