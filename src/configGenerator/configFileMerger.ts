import * as lockfile from '@yarnpkg/lockfile';
import deepmerge from 'deepmerge';
import {
  copyFile,
  mkdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from 'fs/promises';
import JSON5 from 'json5';
import { get, set } from 'lodash';
import { dirname, resolve } from 'path';

import { nodeErrorCode } from '../utils/errors';
import { ConfigFile } from './configTypes';

const FILE_MERGERS = [
  {
    match: /package\.json$/,
    merger: makeJsonMerger({
      sortPaths: ['dependencies', 'devDependencies'],
    }),
  },
  {
    match: /\.(eslintrc|json|prettierrc)$/,
    merger: makeJsonMerger(),
  },
  {
    match: /\.editorconfig$/,
    merger: makePlainMerger({ separateWithEmptyLine: true }),
  },
  {
    // When publishing, npm renames .gitignore to .npmignore :(
    match: /gitignore$/,
    merger: makePlainMerger({ separateWithEmptyLine: true }),
    outputFilePath: './.gitignore',
  },
  {
    match: /yarn.lock$/,
    merger: makeYarnLockMerger(),
  },
];

export async function clearConfigFile(file: ConfigFile, atPath: string) {
  const fileMerger = FILE_MERGERS.find(({ match }) => match.test(file.path));

  if (!fileMerger) {
    throw new Error(
      `Unsupported config file: ${file.path} (from ${file.basePath})`,
    );
  }

  const { path: filePath } = file;
  const { outputFilePath } = fileMerger;

  const currentPath = resolve(atPath, outputFilePath ?? filePath);

  let fileStat;
  try {
    fileStat = await stat(currentPath);
  } catch (error) {
    if (nodeErrorCode(error) !== 'ENOENT') {
      throw error;
    }
  }

  if (fileStat) {
    await unlink(currentPath);
  }
}

export async function mergeConfigFile(file: ConfigFile, atPath: string) {
  const fileMerger = FILE_MERGERS.find(({ match }) => match.test(file.path));

  if (!fileMerger) {
    throw new Error(
      `Unsupported config file: ${file.path} (from ${file.basePath})`,
    );
  }

  const { basePath: sourceBasePath, path: filePath } = file;
  const { merger, outputFilePath } = fileMerger;

  const currentPath = resolve(atPath, outputFilePath ?? filePath);
  const incomingPath = resolve(sourceBasePath, filePath);

  let fileStat;

  try {
    fileStat = await stat(currentPath);
  } catch (error) {
    if (nodeErrorCode(error) !== 'ENOENT') {
      throw error;
    }
  }

  if (fileStat && !fileStat.isFile()) {
    throw new Error(`${currentPath} is not a file`);
  }

  if (!fileStat) {
    const dirPath = dirname(currentPath);
    await mkdir(dirPath, { recursive: true });

    await copyFile(incomingPath, currentPath);
    return;
  }

  const currentData = await readFile(currentPath, { encoding: 'utf-8' });
  const incomingData = await readFile(incomingPath, { encoding: 'utf-8' });

  const mergedData = merger(currentData, incomingData);
  await writeFile(currentPath, mergedData, { encoding: 'utf-8' });
}

function makePlainMerger(
  withOptions: { separateWithEmptyLine?: boolean } = {},
) {
  return function mergePlain(current: string, incoming: string): string {
    let separator = '';

    const { separateWithEmptyLine } = withOptions;

    if (separateWithEmptyLine) {
      const currentEndsWithNewline = Boolean(current.match(/[\r\n]+$/));
      separator = `${currentEndsWithNewline ? '' : '\n'}\n`;
    }

    return current.concat(separator, incoming);
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function makeJsonMerger(withOptions: { sortPaths?: string[] } = {}) {
  return function mergeJson(current: string, incoming: string): string {
    const currentObject = JSON5.parse(current);
    const incomingObject = JSON5.parse(incoming);

    const { sortPaths } = withOptions;

    const mergedObject = deepmerge(currentObject, incomingObject) as any;

    if (sortPaths) {
      sortPaths.forEach((sortPath) => {
        const value = get(mergedObject, sortPath);
        const newValue: any = {};

        if (!value) {
          return;
        }

        Object.keys(value)
          .sort((a, b) => a.localeCompare(b))
          .forEach((key) => {
            newValue[key] = value[key];
          });
        set(mergedObject, sortPath, newValue);
      });
    }

    return JSON.stringify(mergedObject, undefined, 2);
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function makeYarnLockMerger() {
  return function mergeYarnLock(current: string, incoming: string): string {
    const { object: currentObject } = lockfile.parse(current, 'yarn.lock');
    const { object: incomingObject } = lockfile.parse(incoming, 'yarn.lock');

    return lockfile.stringify({
      ...currentObject,
      ...incomingObject,
    });
  };
}
