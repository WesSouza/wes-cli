import directoryTree from 'directory-tree';
import { opendir, stat } from 'fs/promises';
import { basename, relative, resolve } from 'path';

import { CONFIG_FILENAME, MODULES_PATH } from '../constants.js';
import { nodeErrorCode } from '../utils/errors.js';
import { escapeRegExp } from '../utils/regexp.js';
import { parseModuleConfig } from './configModuleParser.js';
import { ModuleConfig } from './configTypes.js';

export interface ConfigModule {
  name: string;
  config: ModuleConfig;
  basePath: string;
  filePaths: string[];
}

export function flatDirectoryTree(
  tree: directoryTree.DirectoryTree,
): Omit<directoryTree.DirectoryTree, 'children'>[] {
  const { children, ...item } = tree;
  return !children
    ? [item]
    : children.flatMap((item) => flatDirectoryTree(item));
}

export async function getModuleConfigFor(path: string) {
  try {
    const configPath = resolve(path, CONFIG_FILENAME);
    const configPathStat = await stat(configPath);
    if (configPathStat.isFile() && configPathStat.size > 0) {
      return parseModuleConfig(configPath);
    }
    return null;
  } catch (error) {
    if (nodeErrorCode(error) !== 'ENOENT') {
      throw error;
    }
    return null;
  }
}

export async function getFilePathsFor(path: string) {
  const exclude = [
    new RegExp(`\/${escapeRegExp(CONFIG_FILENAME)}$`),
    /\/node_modules\/?$/,
    /\/README/,
  ];
  const moduleTree = directoryTree(path, { exclude });
  const flatFiles = flatDirectoryTree(moduleTree);
  return flatFiles
    .map((file) => relative(path, file.path))
    .filter((path) => path !== '');
}

export async function getModuleFor(path: string): Promise<ConfigModule | null> {
  const moduleConfig = await getModuleConfigFor(path);
  if (!moduleConfig) {
    return null;
  }

  return {
    name: basename(path),
    config: moduleConfig,
    basePath: path,
    filePaths: await getFilePathsFor(path),
  };
}

export async function getAllModules(): Promise<Record<string, ConfigModule>> {
  const modules: Record<string, ConfigModule> = {};

  const dir = await opendir(MODULES_PATH);
  for await (const dirent of dir) {
    if (!dirent.isDirectory()) {
      continue;
    }

    const modulePath = resolve(MODULES_PATH, dirent.name);
    const module = await getModuleFor(modulePath);

    if (module) {
      modules[module.name] = module;
    }
  }

  return modules;
}
