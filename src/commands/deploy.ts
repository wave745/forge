import { execSync } from 'child_process';

export async function deployCommand(): Promise<void> {
  console.log('Deploying to Solana...\n');

  try {
    // Check if we're in an Anchor project
    execSync('ls Anchor.toml', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Not in an Anchor project directory');
    console.error('Run "forge init" first or cd into your project');
    process.exit(1);
  }

  try {
    console.log('Building program...');
    execSync('anchor build', { stdio: 'inherit' });

    console.log('\nDeploying...');
    execSync('anchor deploy', { stdio: 'inherit' });

    console.log('\n✅ Deployment successful!');
  } catch (error) {
    console.error('❌ Deployment failed');
    process.exit(1);
  }
}