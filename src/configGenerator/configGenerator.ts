import assert from 'assert';
import { spawn as spawnNonPromise } from 'child_process';
import { resolve } from 'path';
import { promisify } from 'util';

import { LOCAL_FILES_LOCATION } from '../constants.js';
import { clearConfigFile, mergeConfigFile } from './configFileMerger.js';
import { findConfigFrom } from './configLocator.js';
import { getAllModules, getFilePathsFor } from './configModules.js';
import { parseConfig } from './configParser.js';
import { ConfigFile } from './configTypes.js';

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

    dependency.config.dependencies?.forEach(
      (dependencyDependencyOrDependenciesNames) => {
        dependencyDependencyOrDependenciesNames = Array.isArray(
          dependencyDependencyOrDependenciesNames,
        )
          ? dependencyDependencyOrDependenciesNames
          : [dependencyDependencyOrDependenciesNames];

        assert(
          dependencyDependencyOrDependenciesNames.some(
            (dependencyDependencyName) =>
              config.dependencies?.includes(dependencyDependencyName),
          ),
          `Missing dependency for ${dependencyName}: ${dependencyDependencyOrDependenciesNames.join(
            ', ',
          )}`,
        );
      },
    );

    dependency.filePaths.forEach((filePath) => {
      if (config.localOverrides?.includes(filePath)) {
        console.log(`Skipping ${dependency.name}'s ${filePath}`);
        return;
      }

      filesToMerge.push({
        basePath: dependency.basePath,
        path: filePath,
      });
    });
  });

  const localMergesBasePath = resolve(workingDirectory, LOCAL_FILES_LOCATION);
  const localMergeFilePaths = await getFilePathsFor(localMergesBasePath);
  localMergeFilePaths.forEach((filePath) =>
    filesToMerge.push({ basePath: localMergesBasePath, path: filePath }),
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
      shell: true,
    });
  }

  console.log('Done');
}
