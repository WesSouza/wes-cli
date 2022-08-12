import { exec as execNode } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

import {
  ConfigModule,
  getAllModules,
} from '../src/configGenerator/configModules';
import { LOCAL_OVERRIDES_LOCATION } from '../src/constants';

const exec = promisify(execNode);

async function upgradeDependenciesFor(module: ConfigModule) {
  const { name, basePath, filePaths } = module;
  const hasYarnLock = filePaths.find((filePath) => filePath === 'yarn.lock');
  if (!hasYarnLock) {
    return;
  }

  console.log(`Upgrading dependencies from "${name}"`);
  console.log(`-- Installing...`);
  await exec('yarn install --ignore-scripts', {
    cwd: basePath,
  });

  console.log(`-- Upgrading...`);
  await exec('yarn upgrade --latest', {
    cwd: basePath,
  });
  console.log(`-- Done.`);
}

(async () => {
  const modules = await getAllModules();
  const modulesList = Object.values(modules).sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  for await (const module of modulesList) {
    await upgradeDependenciesFor(module);
  }

  const localBasePath = resolve(__dirname, '../', LOCAL_OVERRIDES_LOCATION);
  const localYarnPath = resolve(localBasePath, './yarn.lock');
  const localYarnExists = existsSync(localYarnPath);

  if (localYarnExists) {
    await upgradeDependenciesFor({
      name: LOCAL_OVERRIDES_LOCATION,
      config: { version: 0 },
      basePath: localBasePath,
      filePaths: ['package.json', 'yarn.lock'],
    });
  }

  console.log('All done.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
