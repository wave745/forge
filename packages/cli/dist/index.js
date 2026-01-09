#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const init_1 = require("./commands/init");
const build_1 = require("./commands/build");
const deploy_1 = require("./commands/deploy");
// FORGE ASCII Logo (compact version for CLI)
const FORGE_LOGO_COMPACT = chalk_1.default.cyan(`
    ███████╗░█████╔╗░██████╗░░██████╗░███████╗
    ██╔════╝██╔══██╗██╔══██╗██╔════╝░██╔════╝
    █████╗░░██║░░██║██████╔╝██║░░██╗░█████╗░░
    ██╔══╝░░██║░░██║██╔══██╗██║░░╚██╗██╔══╝░░
    ██║░░░░░╚█████╔╝██║░░██║╚██████╔╝███████╗
    ╚═╝░░░░░░╚════╝░╚═╝░░╚═╝░╚═════╝░╚══════╝
`) + chalk_1.default.blue.bold('\nFORGE - Solana Development Platform CLI') + chalk_1.default.gray(' v0.1.0') + '\n';
const program = new commander_1.Command();
program
    .name('forge')
    .description('FORGE - Solana Development Platform CLI')
    .version('0.1.0')
    .on('--help', () => {
    console.log(FORGE_LOGO_COMPACT);
});
program
    .command('init [projectName]')
    .description('Initialize a new FORGE project')
    .option('-t, --template <template>', 'Project template (basic, token, nft, dao)', 'basic')
    .option('--skip-tests', 'Skip test files')
    .action((projectName, options) => (0, init_1.initCommand)(projectName, options));
program
    .command('build')
    .description('Build Anchor programs')
    .action(build_1.buildCommand);
program
    .command('deploy')
    .description('Deploy programs to Solana')
    .action(deploy_1.deployCommand);
program
    .command('help')
    .description('Display help information')
    .action(() => {
    program.help();
});
// Handle unknown commands
program.on('command:*', (unknownCommand) => {
    console.error(chalk_1.default.red(`Unknown command: ${unknownCommand[0]}`));
    console.log(chalk_1.default.yellow('Run "forge help" for available commands'));
    process.exit(1);
});
// Parse arguments
program.parse();
//# sourceMappingURL=index.js.map