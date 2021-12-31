import assert from 'assert';
import { readFile } from 'fs/promises';

import { Config } from './configTypes';

export async function parse(configFilePath: string) {
  const contents = await readFile(configFilePath, { encoding: 'utf-8' });
  const config = JSON.parse(contents) as Config;

  assert(
    config !== null && typeof config === 'object',
    'Config must be an object',
  );

  assert('version' in config, 'Missing config version');

  assert(config.version === 1, `Unsupported config version: ${config.version}`);

  if ('dependencies' in config) {
    assert(
      Array.isArray(config.dependencies) &&
        config.dependencies.every(
          (dependency) => typeof dependency === 'string',
        ),
      '`dependencies` must be an array of strings',
    );
  }

  return config;
}
