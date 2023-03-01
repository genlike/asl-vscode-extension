"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import chalk from 'chalk';
const commander_1 = require("commander");
//import { Model } from '../language-server/generated/ast';
const module_1 = require("../language-server/generated/module");
function default_1() {
    const program = new commander_1.Command();
    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version(require('../../package.json').version);
    const fileExtensions = module_1.AslLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates JavaScript code that prints "Hello, {name}!" for each greeting in a source file');
    //.action(generateAction);
    program.parse(process.argv);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map