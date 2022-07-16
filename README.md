# wes-cli

[![CI Tests status badge](https://github.com/WesSouza/wes-cli/actions/workflows/lint-typecheck-test-build.yml/badge.svg)](https://github.com/WesSouza/wes-cli/actions/workflows/lint-typecheck-test-build.yml?query=branch%3Amain) [![npm version](https://badge.fury.io/js/wes-cli.svg)](https://www.npmjs.com/package/wes-cli)

Collection of CLI commands that make my life easier, such as maintaining configuration files across different projects. It might help you too!

## Commands

### `wes install`

Reads `wes-config.json` file in the current directory and installs files related to all dependencies. All files are added to the `.gitignore` file because they are generated and copied from the package itself.

All configurations are merged with each other, allowing multiple packages to change the same configuration depending on their need. The current logic is extremely simplistic (plain text files are appended, JSON files are deeply merged, yarn.lock files are regenerated). Files which can't be merged can be used, but only one version should exist, as another will generate a conflict.

Local overrides to configured files should be added to `.wes-defaults/local`, which will be merged last to take precedence for potential overrides.

This project is built using itself, so you can peek at [wes-config.json](./wes-config.json) and [.wes-defaults/local](./.wes-defaults/local) to get a sense of usage.

You can see a list of dependencies as folders on [modules](./modules).

## License

MIT, https://wes.dev/LICENSE.txt
