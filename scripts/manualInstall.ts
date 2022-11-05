import { generate } from '../src/configGenerator/configGenerator.js';

generate({ workingDirectory: './' }).catch(console.error);
