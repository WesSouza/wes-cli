import assert from 'assert';
import { readFile } from 'fs/promises';

import { arrayOfStrings, arrayOfStringsOfStrings } from '../utils/array.js';
import { Config, ModuleConfig } from './configTypes.js';

export function parse(
  configFilePath: string,
  options: { type: 'local' },
): Promise<Config>;
export function parse(
  configFilePath: string,
  options: { type: 'module' },
): Promise<ModuleConfig>;
export async function parse(
  configFilePath: string,
  options: { type: 'local' | 'module' },
) {
  const contents = await readFile(configFilePath, { encoding: 'utf-8' });
  const config = JSON.parse(contents) as Config | ModuleConfig;

  assert(
    config !== null && typeof config === 'object',
    'Config must be an object',
  );

  assert('version' in config, 'Missing config version');

  const { version } = config;

  assert(
    version >= 1 && version <= 2,
    `Unsupported config version: ${version}`,
  );

  if ('dependencies' in config) {
    assert(
      Array.isArray(config.dependencies) &&
        ((options.type === 'local' && arrayOfStrings(config.dependencies)) ||
          (options.type === 'module' &&
            arrayOfStringsOfStrings(config.dependencies))),
      '`dependencies` must be an array of strings',
    );
  }

  if ('localOverrides' in config) {
    assert(
      version >= 2,
      `localOverrides requires version 2 or higher, got ${version}`,
    );

    assert(
      Array.isArray(config.localOverrides) &&
        arrayOfStrings(config.localOverrides),
      '`localOverrides` must be an array of strings',
    );
  }

  return config;
}
