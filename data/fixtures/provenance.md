# Fixture Provenance

## Overview

This document describes how the test fixtures were collected and their provenance.

## Collection Date

Generated: 2026-01-27T23:07:59.940Z

## Sources

### Bags Launch Fixtures (10 files)

- **Source**: Helius RPC API
- **Method**: Query Fee Share V1 program signatures, fetch full transactions
- **Filter**: Transactions containing both Fee Share V1 and Meteora DBC programs
- **Script**: `scripts/collect-bags.ts`

### Non-Bags DBC Fixtures (20 files)

- **Source**: Helius RPC API
- **Method**: Query Meteora DBC program signatures
- **Filter**: Transactions NOT containing Bags Fee Share V1 program
- **Script**: `scripts/collect-non-bags.ts`

### Wallet Action Fixtures (50 files)

- **Source**: Helius RPC API
- **Method**: Query wallet signatures for known smart wallets interacting with Bags tokens
- **Status**: Collected

### Quote Fixtures (50 files)

- **Source**: Jupiter API
- **Method**: Request swap quotes for Bags tokens at collection time
- **Status**: Collected

### Holder Fixtures (10 files)

- **Source**: Helius DAS API
- **Method**: Query token largest accounts for Bags tokens
- **Status**: Collected

## Data Integrity

- All fixtures are real on-chain data (no synthetic/mocked data)
- Each fixture includes the original transaction signature for verification
- Fixtures can be re-fetched using the collection scripts

## Verification

To verify any fixture:
1. Extract the transaction signature from `_meta.signature`
2. Query Helius/Solana RPC: `getTransaction(signature)`
3. Compare response with fixture content
