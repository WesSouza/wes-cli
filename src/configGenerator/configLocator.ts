import assert from 'assert';
import { stat } from 'fs/promises';
import { dirname, resolve } from 'path';

import { CONFIG_FILENAME } from '../constants.js';
import { nodeErrorCode } from '../utils/errors.js';

async function isDir(path: string) {
  try {
    const pathStat = await stat(path);
    return pathStat.isDirectory();
  } catch {
    return false;
  }
}

export async function findConfigFrom(path: string) {
  assert(
    typeof path === 'string' && path !== '',
    '`path` must be a non-empty string',
  );
  assert(await isDir(path), '`path` must be a directory');

  let prevPath = null;
  let currentPath = resolve(path);
  do {
    try {
      const configPath = resolve(currentPath, CONFIG_FILENAME);
      const configPathStat = await stat(configPath);
      if (configPathStat.isFile() && configPathStat.size > 0) {
        return configPath;
      }
    } catch (error) {
      if (nodeErrorCode(error) !== 'ENOENT') {
        throw error;
      }
    }

    prevPath = currentPath;
    currentPath = dirname(prevPath);
  } while (currentPath != prevPath);

  throw new Error(`Unable to locate ${CONFIG_FILENAME} on the current path`);
}
