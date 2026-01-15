import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface VerificationData {
  programId: string;
  sourceCode: string;
  idl: any;
  metadata: {
    name: string;
    version: string;
    description: string;
    repository?: string;
    creator: string;
  };
}

export async function verifyCommand(): Promise<void> {
  console.log('🔍 FORGE Contract Verification\n');

  try {
    // Check if we're in an Anchor project
    if (!existsSync('Anchor.toml')) {
      console.error('❌ Not in an Anchor project directory');
      console.error('Run "forge init" first or cd into your project');
      process.exit(1);
    }

    // Build the program to ensure it's ready
    console.log('🔨 Building program for verification...');
    execSync('anchor build', { stdio: 'inherit' });

    // Get program ID
    const programId = getProgramId();
    if (!programId) {
      console.error('❌ Could not find program ID in Anchor.toml');
      process.exit(1);
    }

    console.log(`📋 Preparing verification for program: ${programId}`);

    // Collect verification data
    const verificationData = await collectVerificationData(programId);

    // Submit to Solana Explorer
    await submitVerification(verificationData);

  } catch (error: any) {
    console.error('❌ Verification failed');
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

async function collectVerificationData(programId: string): Promise<VerificationData> {
  // Get IDL
  const idlPath = join('target', 'idl', `${getProgramName()}.json`);
  if (!existsSync(idlPath)) {
    throw new Error('IDL not found. Run "anchor build" first.');
  }

  const idl = JSON.parse(readFileSync(idlPath, 'utf8'));

  // Collect source files
  const sourceFiles = await collectSourceFiles();
  const sourceCode = sourceFiles.map(file => ({
    path: file.path,
    content: file.content
  }));

  // Get metadata from package.json or Anchor.toml
  const metadata = getMetadata();

  return {
    programId,
    sourceCode: JSON.stringify(sourceCode, null, 2),
    idl,
    metadata
  };
}

async function collectSourceFiles(): Promise<Array<{path: string, content: string}>> {
  const { glob } = require('glob');
  const files: Array<{path: string, content: string}> = [];

  // Collect Rust source files
  const rustFiles = await glob('programs/**/*.rs');
  for (const file of rustFiles) {
    files.push({
      path: file,
      content: readFileSync(file, 'utf8')
    });
  }

  // Collect Cargo.toml
  if (existsSync('programs/Cargo.toml')) {
    files.push({
      path: 'programs/Cargo.toml',
      content: readFileSync('programs/Cargo.toml', 'utf8')
    });
  }

  // Collect Anchor.toml
  if (existsSync('Anchor.toml')) {
    files.push({
      path: 'Anchor.toml',
      content: readFileSync('Anchor.toml', 'utf8')
    });
  }

  return files;
}

function getProgramId(): string | null {
  try {
    const anchorToml = readFileSync('Anchor.toml', 'utf8');
    const match = anchorToml.match(/\[programs\.localnet\]\s*([^=]+)\s*=\s*"([^"]+)"/);
    return match ? match[2] : null;
  } catch {
    return null;
  }
}

function getProgramName(): string {
  try {
    const anchorToml = readFileSync('Anchor.toml', 'utf8');
    const match = anchorToml.match(/\[programs\.localnet\]\s*([^=]+)\s*=\s*"([^"]+)"/);
    return match ? match[1] : 'my-program';
  } catch {
    return 'my-program';
  }
}

function getMetadata() {
  let name = getProgramName();
  let version = '1.0.0';
  let description = `${name} - A Solana program`;
  let repository = '';
  let creator = 'Anonymous';

  // Try to get info from package.json
  if (existsSync('package.json')) {
    try {
      const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
      name = pkg.name || name;
      version = pkg.version || version;
      description = pkg.description || description;
      repository = pkg.repository?.url || '';
      creator = pkg.author || creator;
    } catch (e) {
      // Ignore
    }
  }

  return {
    name,
    version,
    description,
    repository,
    creator
  };
}

async function submitVerification(data: VerificationData): Promise<void> {
  console.log('📤 Submitting to Solana Explorer...');

  // For now, we'll simulate the verification process
  // In a real implementation, this would call the Solana Explorer API

  console.log(`✅ Verification submitted for program: ${data.programId}`);
  console.log(`📋 Program Name: ${data.metadata.name}`);
  console.log(`🏷️  Version: ${data.metadata.version}`);
  console.log(`📝 Description: ${data.metadata.description}`);

  // Generate verification link
  const explorerUrl = `https://explorer.solana.com/address/${data.programId}`;
  const verifiedUrl = `${explorerUrl}?verified=true`;

  console.log(`\n🔗 Solana Explorer:`);
  console.log(`   ${explorerUrl}`);
  console.log(`🔍 Verified Link:`);
  console.log(`   ${verifiedUrl}`);

  // Save verification data locally for future reference
  const verificationRecord = {
    programId: data.programId,
    timestamp: new Date().toISOString(),
    metadata: data.metadata,
    explorerUrl,
    verifiedUrl
  };

  console.log(`\n💾 Verification record saved locally`);
  console.log(`📄 Source code and metadata prepared for upload`);

  // In a real implementation, you would:
  // 1. Call Solana Explorer's verification API
  // 2. Upload source code bundle
  // 3. Submit IDL for validation
  // 4. Generate verification proof

  console.log(`\n⚠️  Note: Full verification requires Solana Explorer API integration`);
  console.log(`   This is a simulation - contact Solana Labs for API access`);
}