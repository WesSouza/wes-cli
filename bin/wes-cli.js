#!/usr/bin/env node

import oclif from '@oclif/core';

// Start the CLI
oclif
  .run(process.argv.slice(2), import.meta.url)
  .then(oclif.flush)
  .catch(oclif.Errors.handle);
