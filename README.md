# FORGE SDK

Intent-driven app assembly on Solana.

## Install

```bash
npm install -g forge-sdk
```

## Usage

### Initialize a project
```bash
forge init my-project
```

### Check status
```bash
forge status
```

### Deploy to Solana
```bash
cd my-project
forge deploy
```

## Prerequisites

- Node.js 18+
- Rust 1.70+
- Solana CLI
- Anchor CLI 0.29.0

## What FORGE Does

FORGE generates Anchor programs from intent. It creates the boilerplate so you can focus on business logic.

## What FORGE Does NOT Do

FORGE does not:
- host your code
- manage your keys
- abstract blockchain risks
- hold your hand

If you want magic, look elsewhere.

## Requirements

You must have:
- Basic Rust knowledge
- Understanding of Solana concepts
- Your own wallet and keys
- Test SOL for deployment

## Support

This is infrastructure. If it breaks, file an issue. If you don't understand Solana, learn Solana first.

## License

MIT
