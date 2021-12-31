import { Command } from '@oclif/core';

import { generate } from '../configGenerator/configGenerator';
import { CONFIG_FILENAME } from '../constants';

export default class Install extends Command {
  static description = `Installs and generates configuration files based on ${CONFIG_FILENAME}`;

  async run(): Promise<void> {
    await generate({ workingDirectory: './' });
  }
}
