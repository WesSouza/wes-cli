import assert from 'assert';
import { spawn as spawnNonPromise } from 'child_process';
import { resolve } from 'path';
import { promisify } from 'util';

import { LOCAL_OVERRIDES_LOCATION } from '../constants';
import { clearConfigFile, mergeConfigFile } from './configFileMerger';
import { findConfigFrom } from './configLocator';
import { getAllModules, getFilePathsFor } from './configModules';
import { parseConfig } from './configParser';
import { ConfigFile } from './configTypes';

export async function generate({ workingDirectory = './' }) {
  const spawn = promisify(spawnNonPromise);
  const configPath = await findConfigFrom(workingDirectory);

  const config = await parseConfig(configPath);

  const moduleLibrary = await getAllModules();
  const filesToMerge: ConfigFile[] = [];
  config.dependencies?.forEach((dependencyName) => {
    const dependency = moduleLibrary[dependencyName];
    if (!dependency) {
      throw new Error(`Invalid dependency: ${dependencyName}`);
    }

    dependency.config.dependencies?.forEach((dependencyDependencyName) => {
      assert(
        config.dependencies?.includes(dependencyDependencyName),
        `Missing dependency for ${dependencyName}: ${dependencyDependencyName}`,
      );
    });

    dependency.filePaths.forEach((filePath) =>
      filesToMerge.push({
        basePath: dependency.basePath,
        path: filePath,
      }),
    );
  });

  const localOverridesBasePath = resolve(
    workingDirectory,
    LOCAL_OVERRIDES_LOCATION,
  );
  const localOverrideFilePaths = await getFilePathsFor(localOverridesBasePath);
  localOverrideFilePaths.forEach((filePath) =>
    filesToMerge.push({ basePath: localOverridesBasePath, path: filePath }),
  );

  const destinationPath = resolve(workingDirectory);

  const mergedFiles = new Set();
  for await (const file of filesToMerge) {
    if (!mergedFiles.has(file.path)) {
      console.log(`Clearing ${file.path}`);
      mergedFiles.add(file.path);
      await clearConfigFile(file, destinationPath);
    }

    console.log(`Merging ${file.path} from ${file.basePath}`);
    await mergeConfigFile(file, destinationPath);
  }

  const hasYarnLock = filesToMerge.find((file) => file.path === 'yarn.lock');
  if (hasYarnLock) {
    console.log('Running yarn install');
    await spawn('yarn', ['install'], {
      cwd: destinationPath,
      stdio: 'inherit',
    });
  }

  console.log('Done');
}
