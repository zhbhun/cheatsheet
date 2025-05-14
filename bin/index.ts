import path from 'node:path';
import { program } from 'commander';
import * as dotenv from 'dotenv';
import processFeature from './feature.ts';

dotenv.config({
  path: path.resolve(import.meta.dirname, '../.env.local'),
});

program.name('cheatsheet').description('CLI to some cheatsheet utilities');

program
  .command('language')
  .arguments('<languages...>')
  .action((languages) => {
    // processFeature(feature, options).catch(console.error);
    console.log(languages);
  });

program
  .command('feature')
  .option('-o, --outline', 'Outline of the feature')
  .option('-u, --usage', 'Usage of the feature')
  .argument('<feature>', 'Feature to generate, e.g. "typescript:syntax"')
  .action((feature, options) => {
    processFeature(feature, options).catch(console.error);
  });

program.parse();
