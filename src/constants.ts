import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

export const CONFIG_FILENAME = 'wes-config.json';

export const LOCAL_FILES_LOCATION = '.wes-defaults/local';

export const MODULES_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../modules',
);
