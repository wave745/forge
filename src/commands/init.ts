import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { logo } from '../ascii.js';

export async function initCommand(projectName?: string): Promise<void> {
  console.log(logo);
  console.log('FORGE - Solana Development Platform\n');

  const name = projectName || 'forge-project';

  // Check if Anchor is installed
  try {
    execSync('anchor --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Anchor CLI not found. Install with:');
    console.error('cargo install --git https://github.com/coral-xyz/anchor anchor-cli --tag v0.29.0');
    process.exit(1);
  }

  console.log(`Initializing ${name}...\n`);

  // Create project directory
  const projectPath = join(process.cwd(), name);
  if (existsSync(projectPath)) {
    console.error(`❌ Directory ${name} already exists`);
    process.exit(1);
  }

  mkdirSync(projectPath, { recursive: true });
  mkdirSync(join(projectPath, 'programs', name, 'src'), { recursive: true });

  // Generate program ID (simplified for demo)
  const programId = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";

  // Create Anchor.toml
  const anchorToml = `[toolchain]
anchor_version = "0.29.0"

[features]
seeds = false
skip-lint = false

[programs.localnet]
${name} = "${programId}"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
`;

  // Create Cargo.toml
  const cargoToml = `[package]
name = "${name}"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "${name.replace(/-/g, '_')}"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "0.29.0"
anchor-spl = "0.29.0"
`;

  // Create lib.rs
  const libRs = `use anchor_lang::prelude::*;

declare_id!("${programId}");

#[program]
pub mod ${name.replace(/-/g, '_')} {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Program initialized!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
`;

  // Write files
  writeFileSync(join(projectPath, 'Anchor.toml'), anchorToml);
  writeFileSync(join(projectPath, 'programs', name, 'Cargo.toml'), cargoToml);
  writeFileSync(join(projectPath, 'programs', name, 'src', 'lib.rs'), libRs);

  console.log('✅ Project created successfully!');
  console.log(`\nNext steps:`);
  console.log(`  cd ${name}`);
  console.log(`  anchor build`);
  console.log(`  anchor test`);
}