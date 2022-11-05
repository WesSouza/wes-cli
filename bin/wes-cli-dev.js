#!/usr/bin/env node --loader ts-node/esm

import oclif from '@oclif/core';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { register } from 'ts-node';

// In dev mode -> use ts-node and dev plugins
process.env.NODE_ENV = 'development';

register({
  project: join(dirname(fileURLToPath(import.meta.url)), '..', 'tsconfig.json'),
});

// In dev mode, always show stack traces
oclif.settings.debug = true;

// Start the CLI
oclif
  .run(process.argv.slice(2), import.meta.url)
  .then(oclif.flush)
  .catch(oclif.Errors.handle);
