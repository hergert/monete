
# Bags API Documentation - Bags API Documentation

## URL
https://docs.bags.fm/

## Metadata
- Depth: 0
- Timestamp: 2026-01-27T21:18:59.550037

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Getting started
Bags API Documentation
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Getting started
 * Authentication
 * Get your API key
 * Using your API key
 * Managing API keys
 * Rate limits
 * Core Principles
 * Explore the API

Getting started
# Bags API Documentation
OpenAIOpen in ChatGPT
Build powerful applications with the Bags API - get started with authentication, rate limits, and your first API call
OpenAIOpen in ChatGPT
## 
​
Getting started
The Bags API allows you to integrate Bags functionality into your applications. Get up and running in minutes.
## 
​
Authentication
All API requests require authentication using an API key.
### 
​
Get your API key
 1. Visit dev.bags.fm and sign in to your account
 2. Navigate to the API Keys section
 3. Create a new API key

Each user can create up to 10 API keys. Keep your keys secure and never share them publicly.
### 
​
Using your API key
Include your API key in the `x-api-key` header with every request:
cURL
Copy
Ask AI
```
curl -X GET 'https://public-api-v2.bags.fm/api/v1/endpoint' \
  -H 'x-api-key: YOUR_API_KEY'

```

Node.js
Python
Copy
Ask AI
```
const response = await fetch('https://public-api-v2.bags.fm/api/v1/endpoint', {
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});

```

### 
​
Managing API keys
You can revoke API keys at any time:
 1. Go to dev.bags.fm
 2. Find the key you want to revoke
 3. Click “Revoke” to permanently disable it

Revoking an API key immediately stops all requests using that key. Update your applications before revoking keys that are in use.
## 
​
Rate limits
The Bags API implements rate limiting to ensure fair usage and system stability.
 * **Rate limit** : 1,000 requests per hour per user and per ip
 * **Scope** : Rate limits apply across all your API keys
 * **Headers** : Check `X-RateLimit-Remaining` and `X-RateLimit-Reset` in response headers

Distribute requests evenly throughout the hour to avoid hitting rate limits. Consider implementing exponential backoff for failed requests.
## 
​
Core Principles
Get familiar with key concepts and best practices:
## Base URL & Versioning API endpoint structure and versioning information. ## Error Handling Understanding API error responses and status codes. ## Rate Limits Monitor usage and avoid hitting rate limits. ## File Uploads Upload images and files for token creation. ## API Key Management Best practices for securing and organizing API keys. ## Token Launch Workflow Complete guide to creating Solana tokens. 
## 
​
Explore the API
## API Reference Complete endpoint documentation with examples. 
Set Up a TypeScript & Node.js Project
⌘I
xgithublinkedin
Powered by


---

# Bags API Documentation - Bags API Documentation

## URL
https://docs.bags.fm

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.550135

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Getting started
Bags API Documentation
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Getting started
 * Authentication
 * Get your API key
 * Using your API key
 * Managing API keys
 * Rate limits
 * Core Principles
 * Explore the API

Getting started
# Bags API Documentation
OpenAIOpen in ChatGPT
Build powerful applications with the Bags API - get started with authentication, rate limits, and your first API call
OpenAIOpen in ChatGPT
## 
​
Getting started
The Bags API allows you to integrate Bags functionality into your applications. Get up and running in minutes.
## 
​
Authentication
All API requests require authentication using an API key.
### 
​
Get your API key
 1. Visit dev.bags.fm and sign in to your account
 2. Navigate to the API Keys section
 3. Create a new API key

Each user can create up to 10 API keys. Keep your keys secure and never share them publicly.
### 
​
Using your API key
Include your API key in the `x-api-key` header with every request:
cURL
Copy
Ask AI
```
curl -X GET 'https://public-api-v2.bags.fm/api/v1/endpoint' \
  -H 'x-api-key: YOUR_API_KEY'

```

Node.js
Python
Copy
Ask AI
```
const response = await fetch('https://public-api-v2.bags.fm/api/v1/endpoint', {
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});

```

### 
​
Managing API keys
You can revoke API keys at any time:
 1. Go to dev.bags.fm
 2. Find the key you want to revoke
 3. Click “Revoke” to permanently disable it

Revoking an API key immediately stops all requests using that key. Update your applications before revoking keys that are in use.
## 
​
Rate limits
The Bags API implements rate limiting to ensure fair usage and system stability.
 * **Rate limit** : 1,000 requests per hour per user and per ip
 * **Scope** : Rate limits apply across all your API keys
 * **Headers** : Check `X-RateLimit-Remaining` and `X-RateLimit-Reset` in response headers

Distribute requests evenly throughout the hour to avoid hitting rate limits. Consider implementing exponential backoff for failed requests.
## 
​
Core Principles
Get familiar with key concepts and best practices:
## Base URL & Versioning API endpoint structure and versioning information. ## Error Handling Understanding API error responses and status codes. ## Rate Limits Monitor usage and avoid hitting rate limits. ## File Uploads Upload images and files for token creation. ## API Key Management Best practices for securing and organizing API keys. ## Token Launch Workflow Complete guide to creating Solana tokens. 
## 
​
Explore the API
## API Reference Complete endpoint documentation with examples. 
Set Up a TypeScript & Node.js Project
⌘I
xgithublinkedin
Powered by


---

# Bags

## URL
https://dev.bags.fm

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.550151

## Content



---

# Get Token Claim Events - Bags API Documentation

## URL
https://docs.bags.fm/how-to-guides/get-token-claim-events

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.550414

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
How-to Guides
Get Token Claim Events
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Prerequisites
 * Query Modes Overview
 * 1. Offset Mode (Pagination)
 * Script: Paginated Claim Events
 * Run the Script
 * 2. Time Mode (Time-Based Filtering)
 * Script: Time-Based Claim Events
 * Run the Script
 * Example Output
 * Offset Mode Output
 * Time Mode Output
 * SDK Function Reference
 * Return Type
 * Use Cases
 * Offset Mode
 * Time Mode
 * Error Handling
 * Related Guides

How-to Guides
# Get Token Claim Events
OpenAIOpen in ChatGPT
Learn how to retrieve claim events for a token using both offset pagination and time-based filtering
OpenAIOpen in ChatGPT
In this guide, you’ll learn how to retrieve claim events for a Solana token using the Bags TypeScript SDK. The endpoint supports two query modes: **offset-based pagination** for traditional page-by-page retrieval, and **time-based filtering** for fetching events within a specific time range.
## 
​
Prerequisites
Before starting, make sure you have:
 * Completed our TypeScript and Node.js Setup Guide.
 * Got your API key from the Bags Developer Portal.
 * The token mint address you want to analyze.

## 
​
Query Modes Overview
Mode | Use Case | Required Parameters 
---|---|--- 
`offset` | Paginated lists, real-time feeds | `limit`, `offset` 
`time` | Historical analysis, reports | `from`, `to` (unix timestamps) 
## 
​
1. Offset Mode (Pagination)
Use offset mode to paginate through claim events. This is the default mode and is backward compatible with previous API versions.
### 
​
Script: Paginated Claim Events
Save this as `get-claim-events-paginated.ts`:
get-claim-events-paginated.ts
Copy
Ask AI
```
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { BagsSDK } from "@bagsfm/bags-sdk";
import { PublicKey, Connection } from "@solana/web3.js";
// Initialize SDK
const BAGS_API_KEY = process.env.BAGS_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
if (!BAGS_API_KEY || !SOLANA_RPC_URL) {
  throw new Error("BAGS_API_KEY and SOLANA_RPC_URL are required");
}
const connection = new Connection(SOLANA_RPC_URL);
const sdk = new BagsSDK(BAGS_API_KEY, connection, "processed");
async function getClaimEventsWithOffset(tokenMint: string, limit = 100, offset = 0) {
  console.log(`🔍 Fetching claim events for: ${tokenMint}`);
  console.log(`   Mode: offset | Limit: ${limit} | Offset: ${offset}\n`);
  const events = await sdk.state.getTokenClaimEvents(new PublicKey(tokenMint), {
    mode: "offset",
    limit,
    offset,
  });
  events.forEach((event, i) => {
    console.log(`Event ${i + 1}:`);
    console.log(`  Wallet: ${event.wallet}`);
    console.log(`  Amount: ${event.amount} lamports`);
    console.log(`  Creator: ${event.isCreator ? "Yes" : "No"}`);
    console.log(`  Time: ${new Date(event.timestamp).toLocaleString()}`);
    console.log(`  Signature: ${event.signature.slice(0, 20)}...`);
    console.log();
  });
  console.log(`✅ Retrieved ${events.length} claim events`);
  return events;
}
// Example: Fetch first 10 events
getClaimEventsWithOffset("CyXBDcVQuHyEDbG661Jf3iHqxyd9wNHhE2SiQdNrBAGS", 10, 0)
  .catch(console.error);

```

### 
​
Run the Script
npx
bun
Copy
Ask AI
```
npx ts-node get-claim-events-paginated.ts

```

## 
​
2. Time Mode (Time-Based Filtering)
Use time mode to retrieve all claim events within a specific time range. This is useful for analytics, generating reports, or syncing historical data.
### 
​
Script: Time-Based Claim Events
Save this as `get-claim-events-by-time.ts`:
get-claim-events-by-time.ts
Copy
Ask AI
```
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { BagsSDK } from "@bagsfm/bags-sdk";
import { LAMPORTS_PER_SOL, PublicKey, Connection } from "@solana/web3.js";
// Initialize SDK
const BAGS_API_KEY = process.env.BAGS_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
if (!BAGS_API_KEY || !SOLANA_RPC_URL) {
  throw new Error("BAGS_API_KEY and SOLANA_RPC_URL are required");
}
const connection = new Connection(SOLANA_RPC_URL);
const sdk = new BagsSDK(BAGS_API_KEY, connection, "processed");
// Helper to convert date to unix timestamp
function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}
async function getClaimEventsByTimeRange(tokenMint: string, from: number, to: number) {
  console.log(`📅 Fetching claim events for: ${tokenMint}`);
  console.log(`   Mode: time | From: ${from} | To: ${to}\n`);
  const events = await sdk.state.getTokenClaimEvents(new PublicKey(tokenMint), {
    mode: "time",
    from,
    to,
  });
  // Calculate total claimed
  const totalLamports = events.reduce(
    (sum, e) => sum + BigInt(e.amount),
    BigInt(0)
  );
  const totalSol = Number(totalLamports) / LAMPORTS_PER_SOL;
  console.log(`📊 Summary:`);
  console.log(`   Total events: ${events.length}`);
  console.log(`   Total claimed: ${totalSol.toLocaleString()} SOL`);
  console.log(`   Unique wallets: ${new Set(events.map((e) => e.wallet)).size}`);
  // Show breakdown by day
  const byDay = new Map<string, { count: number; amount: bigint }>();
  events.forEach((event) => {
    const day = new Date(event.timestamp).toLocaleDateString();
    const existing = byDay.get(day) || { count: 0, amount: BigInt(0) };
    byDay.set(day, {
      count: existing.count + 1,
      amount: existing.amount + BigInt(event.amount),
    });
  });
  console.log(`\n📆 Daily breakdown:`);
  byDay.forEach((stats, day) => {
    const sol = Number(stats.amount) / LAMPORTS_PER_SOL;
    console.log(`   ${day}: ${stats.count} claims, ${sol.toLocaleString()} SOL`);
  });
  return events;
}
// Example: Get events from the last 7 days
async function main() {
  const tokenMint = "CyXBDcVQuHyEDbG661Jf3iHqxyd9wNHhE2SiQdNrBAGS";
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const from = toUnixTimestamp(sevenDaysAgo);
  const to = toUnixTimestamp(now);
  console.log(`🗓️  Date range: ${sevenDaysAgo.toLocaleDateString()} → ${now.toLocaleDateString()}\n`);
  await getClaimEventsByTimeRange(tokenMint, from, to);
}
main().catch(console.error);

```

### 
​
Run the Script
npx
bun
Copy
Ask AI
```
npx ts-node get-claim-events-by-time.ts

```

## 
​
Example Output
### 
​
Offset Mode Output
Copy
Ask AI
```
🔍 Fetching claim events for: CyXBDcVQuHyEDbG661Jf3iHqxyd9wNHhE2SiQdNrBAGS
   Mode: offset | Limit: 10 | Offset: 0
Event 1:
  Wallet: 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin
  Amount: 1500000000 lamports
  Creator: Yes
  Time: 1/15/2026, 3:45:00 PM
  Signature: 5KtPn1LGuxhKLHHD...
Event 2:
  Wallet: 7nYXhxpZe9VuXMBZE3TVf...
  Amount: 500000000 lamports
  Creator: No
  Time: 1/14/2026, 2:30:00 PM
  Signature: 3RtQm2JGvxhMKIFD...
✅ Retrieved 10 claim events

```

### 
​
Time Mode Output
Copy
Ask AI
```
🗓️  Date range: 1/9/2026 → 1/16/2026
📅 Fetching claim events for: CyXBDcVQuHyEDbG661Jf3iHqxyd9wNHhE2SiQdNrBAGS
   Mode: time | From: 1736380800 | To: 1736985600
📊 Summary:
   Total events: 47
   Total claimed: 125.5 SOL
   Unique wallets: 12
📆 Daily breakdown:
   1/15/2026: 8 claims, 22.3 SOL
   1/14/2026: 12 claims, 35.1 SOL
   1/13/2026: 7 claims, 18.7 SOL
   1/12/2026: 10 claims, 28.4 SOL
   1/11/2026: 6 claims, 12.2 SOL
   1/10/2026: 4 claims, 8.8 SOL

```

## 
​
SDK Function Reference
The `sdk.state.getTokenClaimEvents()` function accepts a token mint and an options object:
Copy
Ask AI
```
// Offset mode (default)
const events = await sdk.state.getTokenClaimEvents(tokenMint, {
  mode: "offset",
  limit: 100,    // 1-100, default: 100
  offset: 0,     // default: 0
});
// Time mode
const events = await sdk.state.getTokenClaimEvents(tokenMint, {
  mode: "time",
  from: 1736380800,  // unix timestamp (required)
  to: 1736985600,    // unix timestamp (required, must be >= from)
});

```

### 
​
Return Type
Each event in the returned array has the following structure:
Field | Type | Description 
---|---|--- 
`wallet` | `string` | Public key of the wallet that claimed fees 
`isCreator` | `boolean` | Whether this wallet is the token creator 
`amount` | `string` | Amount claimed in lamports (as string for bigint support) 
`signature` | `string` | Transaction signature of the claim 
`timestamp` | `string` | ISO 8601 timestamp of the claim event 
## 
​
Use Cases
### 
​
Offset Mode
 * **Paginated UIs** : Display claim events in a table with “Load More” or page navigation
 * **Real-time Feeds** : Show the latest claims as they happen
 * **Infinite Scroll** : Load more events as the user scrolls

### 
​
Time Mode
 * **Weekly/Monthly Reports** : Generate reports for specific time periods
 * **Analytics Dashboards** : Show claim activity over custom date ranges
 * **Auditing** : Review all claims that occurred during a specific period
 * **Data Sync** : Sync historical claim data to your database

## 
​
Error Handling
Common errors to handle:
Error | Cause | Solution 
---|---|--- 
400 Bad Request | Invalid `tokenMint` format | Verify the mint is a valid base58 public key 
400 Bad Request | `from` > `to` in time mode | Ensure `from` is less than or equal to `to` 
401 Unauthorized | Missing or invalid API key | Check your API key configuration 
When using time mode, the `from` timestamp must be less than or equal to `to`. The API validates this constraint and returns an error if violated.
## 
​
Related Guides
 * Get Token Lifetime Fees - Get total fees earned by a token
 * Get Token Creators - Find token launch creators
 * Claim Fees - Claim your earned fees

Trade TokensChangelog
⌘I
xgithublinkedin
Powered by


---

# Base URL & Versioning - Bags API Documentation

## URL
https://docs.bags.fm/principles/base-url-versioning

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.550578

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Core Principles
Base URL & Versioning
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Health Check
 * Version History

Core Principles
# Base URL & Versioning
OpenAIOpen in ChatGPT
API endpoint structure and versioning information
OpenAIOpen in ChatGPT
The Bags API uses a consistent base URL structure for all endpoints:
 * **Base URL** : `https://public-api-v2.bags.fm/api/v1/`
 * **Current version** : v1
 * **Health check** : GET `/ping` returns `{message: "pong"}`

All endpoints are prefixed with the base URL. Future API versions will be released with updated version numbers in the path.
## 
​
Health Check
Test API connectivity:
cURL
Node.js
Python
Copy
Ask AI
```
curl https://public-api-v2.bags.fm/ping

```

**Response:**
Copy
Ask AI
```
{
  "message": "pong"
}

```

## 
​
Version History
Version | Release Date | Status | Breaking Changes 
---|---|---|--- 
v1 | 2025-08-02 | Current | N/A (Initial release) 
Future API versions will maintain backward compatibility where possible. Breaking changes will be clearly documented and communicated in advance.
ChangelogProgram IDs
⌘I
xgithublinkedin
Powered by


---

# Set Up a TypeScript & Node.js Project - Bags API Documentation

## URL
https://docs.bags.fm/how-to-guides/typescript-node-setup

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.550667

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
How-to Guides
Set Up a TypeScript & Node.js Project
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * 1. Initialize Your TypeScript Project
 * 2. Install Core Dependencies
 * 3. Set Up Environment Variables
 * 4. Project Structure

How-to Guides
# Set Up a TypeScript & Node.js Project
OpenAIOpen in ChatGPT
Follow these steps to set up a TypeScript and Node.js project for interacting with the Bags API.
OpenAIOpen in ChatGPT
Before you can follow our TypeScript and Node.js how-to guides, you need to set up your development environment. This guide will walk you through creating a new project, installing essential packages, and configuring your environment.
## 
​
1. Initialize Your TypeScript Project
First, create a new directory for your project and initialize it:
Copy
Ask AI
```
mkdir my-bags-project
cd my-bags-project
npm init -y

```

Next, install TypeScript and initialize the TypeScript configuration:
Copy
Ask AI
```
npm install -g typescript
npx tsc --init

```

This will create a `tsconfig.json` file with default settings, which you can customize as needed.
## 
​
2. Install Core Dependencies
Now, install the core dependencies required for most interactions with the Bags API and for running your TypeScript code with Node.js.
Copy
Ask AI
```
npm install @bagsfm/bags-sdk dotenv @solana/web3.js bs58

```

Also, install the necessary development dependencies:
Copy
Ask AI
```
npm install -D typescript ts-node @types/node

```

## 
​
3. Set Up Environment Variables
Create a `.env` file in your project root to store your Bags API key, Solana RPC URL, and other secrets:
Copy
Ask AI
```
# .env
BAGS_API_KEY=your_api_key_here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# PRIVATE_KEY=your_base58_encoded_private_key_here  # Required for guides that perform transactions

```

You can get your API key from dev.bags.fm. Some guides might require additional variables like your wallet’s private key for signing transactions.
Never commit your `.env` file to version control. Add it to your `.gitignore` file to keep your secrets safe.
## 
​
4. Project Structure
Your project structure should look like this:
Copy
Ask AI
```
my-bags-project/
├── package.json
├── tsconfig.json
├── .env
├── .gitignore
└── src/
    └── (your TypeScript files will go here)

```

Make sure to add `.env` to your `.gitignore` file:
Copy
Ask AI
```
# .gitignore
.env
node_modules/
dist/

```

You are now ready to follow our how-to guides! Each guide will include the complete setup code needed to initialize the SDK and run the examples.
Bags API DocumentationLaunch a Token
⌘I
xgithublinkedin
Powered by


---

# Launch a Token - Bags API Documentation

## URL
https://docs.bags.fm/how-to-guides/launch-token

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.551032

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
How-to Guides
Launch a Token
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Prerequisites
 * 1. Set Up Environment Variables
 * 2. The Token Launch Script
 * 3. Understanding Fee Sharing
 * Key Rules
 * Partner Configuration
 * 4. Run Your Script
 * 5. Troubleshooting

How-to Guides
# Launch a Token
OpenAIOpen in ChatGPT
Complete step-by-step guide to launch a Solana token using the Bags API v2 with TypeScript and Node.js
OpenAIOpen in ChatGPT
In this guide, you’ll learn how to launch a Solana token using the Bags TypeScript SDK with Node.js. Token Launch v2 requires fee sharing configuration, where all fees are shared with the creator’s wallet by default. You can optionally share fees with additional fee claimers.
## 
​
Prerequisites
Before starting, make sure you have:
 * Completed our TypeScript and Node.js Setup Guide.
 * Got your API key from the Bags Developer Portal.
 * A Solana wallet with some SOL for transactions.
 * A token image URL (recommended) or image file.
 * Installed the additional dependencies for this guide:
Copy
Ask AI
```
npm install @solana/web3.js bs58

```

**Optional** : If you want to include a partner configuration in your token launch, you’ll need to create a partner key first. See the Create Partner Key guide for details. Once you have a partner key, you can include it when launching tokens using the `partner` and `partnerConfig` parameters.
## 
​
1. Set Up Environment Variables
This guide requires your wallet’s private key. Add it to your base `.env` file:
Copy
Ask AI
```
# .env
BAGS_API_KEY=your_api_key_here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PRIVATE_KEY=your_base58_encoded_private_key_here  # Required for this guide

```

You can export your private key from wallets like Bags, Phantom, or Backpack.
## 
​
2. The Token Launch Script
Here is the complete script for launching a token. Save it as `launch-token.ts`. The script follows the Token Launch v2 flow:
 1. Create metadata
 2. Create config (fee share configuration)
 3. Get token creation transaction
 4. Sign transaction
 5. Broadcast transaction

Copy
Ask AI
```
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import {
    BagsSDK,
    BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT,
    waitForSlotsToPass,
    signAndSendTransaction,
    createTipTransaction,
    sendBundleAndConfirm,
} from "@bagsfm/bags-sdk";
import type { SupportedSocialProvider } from "@bagsfm/bags-sdk";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, Connection, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
// Initialize SDK
const BAGS_API_KEY = process.env.BAGS_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!BAGS_API_KEY || !SOLANA_RPC_URL || !PRIVATE_KEY) {
    throw new Error("BAGS_API_KEY, SOLANA_RPC_URL, and PRIVATE_KEY are required");
}
const connection = new Connection(SOLANA_RPC_URL);
const sdk = new BagsSDK(BAGS_API_KEY, connection, "processed");
const FALLBACK_JITO_TIP_LAMPORTS = 0.015 * LAMPORTS_PER_SOL;
/**
 * Create a tip transaction, sign bundle transactions, and send via Jito
 * @param unsignedTransactions - Array of unsigned VersionedTransaction instances
 * @param keypair - The keypair to sign all transactions
 * @returns The confirmed bundle ID
 */
async function sendBundleWithTip(
    unsignedTransactions: VersionedTransaction[],
    keypair: Keypair
): Promise<string> {
    const commitment = sdk.state.getCommitment();
    // Get blockhash from the first bundle transaction
    const bundleBlockhash = unsignedTransactions[0]?.message.recentBlockhash;
    if (!bundleBlockhash) {
        throw new Error("Bundle transactions must have a blockhash");
    }
    let jitoTip = FALLBACK_JITO_TIP_LAMPORTS;
    // Get recommended Jito tip
    const recommendedJitoTip = await sdk.solana.getJitoRecentFees().catch((err) => {
        console.log("⚠️ Failed to get Jito recent fees, using fallback:", err.message);
        return null;
    });
    // Calculate tip amount (use 95th percentile or fallback to default)
    if (recommendedJitoTip?.landed_tips_95th_percentile) {
        jitoTip = Math.floor(recommendedJitoTip.landed_tips_95th_percentile * LAMPORTS_PER_SOL);
    }
    console.log(`💰 Jito tip: ${jitoTip / LAMPORTS_PER_SOL} SOL`);
    // Create tip transaction
    const tipTransaction = await createTipTransaction(connection, commitment, keypair.publicKey, jitoTip, {
        blockhash: bundleBlockhash,
    });
    // Sign all transactions (tip first, then the rest)
    const signedTransactions = [tipTransaction, ...unsignedTransactions].map((tx) => {
        tx.sign([keypair]);
        return tx;
    });
    console.log(`📦 Sending bundle via Jito...`);
    // Send bundle and wait for confirmation
    const bundleId = await sendBundleAndConfirm(signedTransactions, sdk);
    console.log(`✅ Bundle confirmed! Bundle ID: ${bundleId}`);
    return bundleId;
}
async function getOrCreateFeeShareConfig(
    tokenMint: PublicKey,
    creatorWallet: PublicKey,
    keypair: Keypair,
    feeClaimers: Array<{ user: PublicKey; userBps: number }>,
    partner?: PublicKey, // Optional: Partner wallet address
    partnerConfig?: PublicKey // Optional: Partner config PDA (see Create Partner Key guide)
): Promise<PublicKey> {
    const commitment = sdk.state.getCommitment();
    // Check if lookup tables are needed (when there are more than MAX_CLAIMERS_NON_LUT claimers)
    let additionalLookupTables: PublicKey[] | undefined;
    if (feeClaimers.length > BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT) {
        console.log(`📋 Creating lookup tables for ${feeClaimers.length} fee claimers (exceeds ${BAGS_FEE_SHARE_V2_MAX_CLAIMERS_NON_LUT} limit)...`);
        // Get LUT creation transactions
        const lutResult = await sdk.config.getConfigCreationLookupTableTransactions({
            payer: creatorWallet,
            baseMint: tokenMint,
            feeClaimers: feeClaimers,
        });
        if (!lutResult) {
            throw new Error("Failed to create lookup table transactions");
        }
        // Execute the LUT creation transaction first
        console.log("🔧 Executing lookup table creation transaction...");
        await signAndSendTransaction(connection, commitment, lutResult.creationTransaction, keypair);
        // Wait for one slot to pass (required before extending LUT)
        console.log("⏳ Waiting for one slot to pass...");
        await waitForSlotsToPass(connection, commitment, 1);
        // Execute all extend transactions
        console.log(`🔧 Executing ${lutResult.extendTransactions.length} lookup table extend transaction(s)...`);
        for (const extendTx of lutResult.extendTransactions) {
            await signAndSendTransaction(connection, commitment, extendTx, keypair);
        }
        additionalLookupTables = lutResult.lutAddresses;
        console.log("✅ Lookup tables created successfully!");
    }
    try {
        // Try to create the config (with LUTs if needed)
        const configResult = await sdk.config.createBagsFeeShareConfig({
            payer: creatorWallet,
            baseMint: tokenMint,
            feeClaimers: feeClaimers,
            partner: partner,
            partnerConfig: partnerConfig,
            additionalLookupTables: additionalLookupTables,
        });
        console.log("🔧 Creating fee share config...");
        // Send bundle txs
        if (configResult.bundles && configResult.bundles.length > 0) {
            console.log(`📦 Sending ${configResult.bundles.length} bundle(s) via Jito...`);
            for (const bundle of configResult.bundles) {
                // Send the bundle with tip transaction and wait for confirmation
                await sendBundleWithTip(bundle, keypair);
            }
        }
        // Sign and send all returned transactions
        for (const tx of configResult.transactions || []) {
            await signAndSendTransaction(connection, commitment, tx, keypair);
        }
        console.log("✅ Fee share config created successfully!");
        return configResult.meteoraConfigKey;
    } catch (error: any) {
        console.error("🚨 Failed getting or creating fee share config:", error);
        throw error;
    }
}
async function launchToken(launchParams: {
    imageUrl: string;
    name: string;
    symbol: string;
    description: string;
    twitterUrl?: string;
    websiteUrl?: string;
    telegramUrl?: string;
    initialBuyAmountLamports: number;
    // Optional: Share fees with fee claimers
    // Each entry should have provider, username, and the percentage (bps) they receive
    feeClaimers?: Array<{
        provider: SupportedSocialProvider;
        username: string;
        bps: number; // Basis points (10000 = 100%)
    }>;
    // Optional: Partner configuration for fee sharing
    // See the Create Partner Key guide for details: /how-to-guides/create-partner-key
    partner?: PublicKey; // Partner wallet address
    partnerConfig?: PublicKey; // Partner config PDA (can be derived using deriveBagsFeeShareV2PartnerConfigPda)
}) {
    try {
        if (!PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY is not set");
        }
        const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
        const commitment = sdk.state.getCommitment();
        console.log(`🚀 Creating token $${launchParams.symbol} with wallet ${keypair.publicKey.toBase58()}`);
        // Step 1: Create metadata
        console.log("📝 Step 1: Creating token info and metadata...");
        const tokenInfoResponse = await sdk.tokenLaunch.createTokenInfoAndMetadata({
            imageUrl: launchParams.imageUrl,
            name: launchParams.name,
            description: launchParams.description,
            symbol: launchParams.symbol?.toUpperCase()?.replace("$", ""),
            twitter: launchParams.twitterUrl,
            website: launchParams.websiteUrl,
            telegram: launchParams.telegramUrl,
        });
        console.log("✨ Successfully created token info and metadata!");
        console.log("🪙 Token mint:", tokenInfoResponse.tokenMint);
        // Step 2: Get or create fee share config
        console.log("⚙️  Step 2: Getting or creating fee share config...");
        const tokenMint = new PublicKey(tokenInfoResponse.tokenMint);
        // Build fee claimers array
        // IMPORTANT: Creator must always be included explicitly with their BPS set
        let feeClaimers: Array<{ user: PublicKey; userBps: number }> = [];
        if (launchParams.feeClaimers && launchParams.feeClaimers.length > 0) {
            // Calculate creator's share (remaining after all fee claimers)
            const feeClaimersBps = launchParams.feeClaimers.reduce((sum, fc) => sum + fc.bps, 0);
            const creatorBps = 10000 - feeClaimersBps;
            if (creatorBps < 0) {
                throw new Error("Total fee claimer BPS cannot exceed 10000 (100%)");
            }
            // Add creator first with explicit BPS (required - creator must always be explicit)
            if (creatorBps > 0) {
                feeClaimers.push({ user: keypair.publicKey, userBps: creatorBps });
                console.log(`💰 Creator will receive ${creatorBps / 100}% of fees (explicitly set)`);
            }
            // Add fee claimers
            for (const feeClaimer of launchParams.feeClaimers) {
                console.log(
                    `🔍 Looking up fee claimer wallet for ${feeClaimer.provider}:${feeClaimer.username}`
                );
                const feeClaimerResult = await sdk.state.getLaunchWalletV2(
                    feeClaimer.username,
                    feeClaimer.provider
                );
                feeClaimers.push({
                    user: feeClaimerResult.wallet,
                    userBps: feeClaimer.bps,
                });
                console.log(
                    `✨ Found fee claimer wallet: ${feeClaimerResult.wallet.toString()} (${feeClaimer.bps / 100}%)`
                );
            }
        } else {
            // No fee claimers - creator gets all fees (must be set explicitly to max BPS)
            console.log("💰 All fees will go to creator wallet (explicitly set to 10000 bps)");
            feeClaimers = [{ user: keypair.publicKey, userBps: 10000 }];
        }
        const configKey = await getOrCreateFeeShareConfig(
            tokenMint,
            keypair.publicKey,
            keypair,
            feeClaimers,
            launchParams.partner,
            launchParams.partnerConfig
        );
        console.log("🔑 Config Key:", configKey.toString());
        // Step 3: Get token creation transaction
        console.log("🎯 Step 3: Creating token launch transaction...");
        const tokenLaunchTransaction = await sdk.tokenLaunch.createLaunchTransaction({
            metadataUrl: tokenInfoResponse.tokenMetadata,
            tokenMint: tokenMint,
            launchWallet: keypair.publicKey,
            initialBuyLamports: launchParams.initialBuyAmountLamports,
            configKey: configKey,
        });
        // Step 4 & 5: Sign and broadcast transaction
        console.log("📡 Step 4 & 5: Signing and broadcasting transaction...");
        const signature = await signAndSendTransaction(connection, commitment, tokenLaunchTransaction, keypair);
        console.log("🎉 Token launched successfully!");
        console.log("🪙 Token Mint:", tokenInfoResponse.tokenMint);
        console.log("🔑 Launch Signature:", signature);
        console.log("📄 Metadata URI:", tokenInfoResponse.tokenMetadata);
        console.log(`🌐 View your token at: https://bags.fm/${tokenInfoResponse.tokenMint}`);
    } catch (error) {
        console.error("🚨 Token launch failed:", error);
        throw error;
    }
}
// Example: Launch token with shared fees among multiple users
// (40% creator, 30% fee claimer 1, 30% fee claimer 2)
launchToken({
    imageUrl: "https://img.freepik.com/premium-vector/white-abstract-vactor-background-design_665257-153.jpg",
    name: "Multi-Share Token",
    symbol: "MST",
    description: "This token shares fees with multiple fee claimers",
    twitterUrl: "https://x.com/multisharetoken",
    websiteUrl: "https://multisharetoken.com",
    initialBuyAmountLamports: 0.01 * LAMPORTS_PER_SOL,
    feeClaimers: [
        {
            provider: "twitter",
            username: "feeclaimer1",
            bps: 3000, // 30% to first fee claimer
        },
        {
            provider: "twitter",
            username: "feeclaimer2",
            bps: 3000, // 30% to second fee claimer
        },
        // Creator automatically gets remaining 40%
    ],
});
// Example: Launch token without sharing fees (all fees go to creator)
// launchToken({
//     imageUrl: "https://img.freepik.com/premium-vector/white-abstract-vactor-background-design_665257-153.jpg",
//     name: "My Token",
//     symbol: "MTK",
//     description: "This is my token description",
//     twitterUrl: "https://x.com/mytoken",
//     websiteUrl: "https://mytoken.com",
//     initialBuyAmountLamports: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL
// });

```

## 
​
3. Understanding Fee Sharing
Token Launch v2 requires fee sharing configuration with explicit BPS (basis points) allocation. **Important rules:**
### 
​
Key Rules
 1. **Creators must always explicitly set their BPS** : To receive all fees, creators must give themselves the maximum BPS (10000) explicitly, no matter what. Creator fees must always be set explicitly in the fee claimers array.
 2. **When sharing fees** : Give fee claimers their BPS and then **explicitly also give the creator their BPS**. Both the creator and all fee claimers must have their BPS values set explicitly in the configuration.
 3. **Total BPS must equal 10000** : The sum of all BPS values (creator + all fee claimers) must equal exactly 10,000 (100%).
 4. **Maximum fee earners** : You can have up to 100 fee earners (including the creator) per token launch.
 5. **Supported platforms** : Fee claimers can be identified using supported social platforms: `twitter`, `kick`, and `github`.
 6. **Lookup Tables (LUTs)** : When you have more than 15 fee claimers, you need to create lookup tables before creating the fee share config. The script automatically handles this by:
 * Calling `getConfigCreationLookupTableTransactions()` to get LUT creation transactions
 * Executing the LUT creation transaction
 * Waiting for one slot to pass (required by Solana)
 * Executing all LUT extend transactions
 * Passing the LUT addresses to `createBagsFeeShareConfig` via `additionalLookupTables`

### 
​
Partner Configuration
You can include a partner configuration in your fee share setup by providing:
 * `partner`: The partner wallet address (PublicKey)
 * `partnerConfig`: The partner config PDA (PublicKey) - can be derived using the helper function shown in the examples

Partners receive a share of fees from token launches that include their partner configuration. This is useful for platforms or partnerships that want to collect fees from multiple token launches.
To create a partner key, see the Create Partner Key guide.
## 
​
4. Run Your Script
To launch your token, edit the `launchToken` function call at the bottom of `launch-token.ts` with your token’s details, especially the `imageUrl`. Then, run the script from your terminal:
Copy
Ask AI
```
npx ts-node launch-token.ts

```

## 
​
5. Troubleshooting
The script includes comprehensive error handling. Common issues include:
 * **API Key Issues** : Ensure your API key is valid.
 * **Private Key Format** : Your private key must be base58 encoded.
 * **Insufficient SOL** : Your wallet needs SOL for transaction fees.
 * **Image URL** : The URL to your token image must be accessible and valid.
 * **Invalid Fee Claimer** : Ensure the fee claimer provider and username are valid and the user has a registered wallet.

For more details, see the API Reference.
Set Up a TypeScript & Node.js ProjectCreate Partner Key
⌘I
xgithublinkedin
Powered by


---

# Error Handling - Bags API Documentation

## URL
https://docs.bags.fm/principles/error-handling

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.551226

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Core Principles
Error Handling
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Error Response Format
 * Common Status Codes
 * Error Examples
 * Validation Error (400)
 * Authentication Error (401)
 * Permission Error (403)
 * Rate Limit Error (429)
 * File Upload Error (413)
 * Server Error (500)
 * SDK Error Handling
 * Best Practices
 * Error Handling in Code
 * Retry Logic

Core Principles
# Error Handling
OpenAIOpen in ChatGPT
Understanding API error responses and status codes
OpenAIOpen in ChatGPT
The Bags API uses standardized error responses to help you handle issues in your applications.
## 
​
Error Response Format
All errors return JSON with a consistent structure:
Copy
Ask AI
```
{
  "success": false,
  "error": "Detailed error message"
}

```

Success responses use a different format:
Copy
Ask AI
```
{
  "success": true,
  "response": {
    // Response data here
  }
}

```

## 
​
Common Status Codes
Status Code | Description | When It Occurs 
---|---|--- 
400 | Bad Request | Invalid request parameters or validation errors 
401 | Unauthorized | Missing or invalid API key/authentication 
403 | Forbidden | Valid authentication but insufficient permissions 
404 | Not Found | Resource not found 
413 | Payload Too Large | File upload exceeds size limit 
429 | Too Many Requests | Rate limit exceeded 
500 | Internal Server Error | Unexpected server error 
## 
​
Error Examples
### 
​
Validation Error (400)
Copy
Ask AI
```
{
  "success": false,
  "error": "Token name is required and must be between 1-32 characters"
}

```

### 
​
Authentication Error (401)
Copy
Ask AI
```
{
  "success": false,
  "error": "Invalid API key. Please check your x-api-key header."
}

```

### 
​
Permission Error (403)
Copy
Ask AI
```
{
  "success": false,
  "error": "API key does not have permission to access this resource"
}

```

### 
​
Rate Limit Error (429)
When you exceed rate limits, the API returns additional information:
Copy
Ask AI
```
{
  "success": false,
  "error": "Rate limit exceeded",
  "limit": 1000,
  "remaining": 0,
  "resetTime": 1672531200
}

```

### 
​
File Upload Error (413)
Copy
Ask AI
```
{
  "success": false,
  "error": "Image file must be under 15MB"
}

```

### 
​
Server Error (500)
Copy
Ask AI
```
{
  "success": false,
  "error": "An unexpected error occurred. Please try again later."
}

```

## 
​
SDK Error Handling
When using the Bags TypeScript SDK, errors are automatically handled and thrown as exceptions. The SDK wraps API responses and throws errors for failed requests:
Copy
Ask AI
```
import { BagsSDK } from "@bagsfm/bags-sdk";
try {
  const sdk = new BagsSDK(apiKey, connection);
  const result = await sdk.tokenLaunch.createTokenInfoAndMetadata({...});
  // Success - result contains the response data directly
} catch (error) {
  // The SDK automatically throws errors for API failures
  // Error messages contain details about what went wrong
  console.error('Error:', error.message);
  // You can check error properties if available
  if (error.status) {
    console.error('Status:', error.status);
  }
}

```

The SDK automatically handles the `success: false` responses and throws errors, so you don’t need to manually check the `success` field. Successful responses return the data directly from the `response` field.
## 
​
Best Practices
### 
​
Error Handling in Code
Node.js
Python
Copy
Ask AI
```
try {
  const response = await fetch('https://public-api-v2.bags.fm/api/v1/endpoint', {
    headers: { 'x-api-key': 'YOUR_API_KEY' }
  });
  const data = await response.json();
  if (!data.success) {
    console.error('API Error:', data.error);
    // Handle specific error cases
    switch (response.status) {
      case 401:
        // Redirect to login or refresh API key
        break;
      case 429:
        // Implement exponential backoff
        break;
      default:
        // Generic error handling
    }
    return;
  }
  // Process successful response
  console.log(data.response);
} catch (error) {
  console.error('Network error:', error);
}

```

### 
​
Retry Logic
Implement exponential backoff for rate limit and server errors:
 1. **429 (Rate Limited)** : Wait based on `resetTime` or implement exponential backoff
 2. **500/502/503** : Retry with exponential backoff (max 5 attempts)
 3. **400/401/403/404** : Don’t retry - fix the request first

Check the `X-RateLimit-*` headers to proactively avoid rate limits rather than handling them reactively.
Priority Fees and TipsRate Limits
⌘I
xgithublinkedin
Powered by


---

# Get Token Creators - Bags API Documentation

## URL
https://docs.bags.fm/how-to-guides/get-token-creators

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.551369

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
How-to Guides
Get Token Creators
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Prerequisites
 * 1. The Token Creators Script
 * 2. Run Your Script
 * What You’ll See
 * Understanding the Data
 * Key Information Retrieved:
 * Use Cases

How-to Guides
# Get Token Creators
OpenAIOpen in ChatGPT
Learn how to retrieve token launch creators/deployers with provider details using the Bags TypeScript SDK and Node.js
OpenAIOpen in ChatGPT
In this guide, you’ll learn how to retrieve token launch creators/deployers using the Bags TypeScript SDK with Node.js. This includes provider, display name, wallet address, royalty percentage, and profile image.
## 
​
Prerequisites
Before starting, make sure you have:
 * Completed our TypeScript and Node.js Setup Guide.
 * Got your API key from the Bags Developer Portal.
 * The token mint address you want to analyze.

## 
​
1. The Token Creators Script
Here is a comprehensive script to fetch token creator information. Save this as `get-token-creators.ts`. This script retrieves detailed information about the primary creator and any additional launch participants, including provider, display name, wallet, profile picture, and royalty percentage.
Copy
Ask AI
```
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { BagsSDK } from "@bagsfm/bags-sdk";
import { PublicKey, Connection } from "@solana/web3.js";
// Initialize SDK
const BAGS_API_KEY = process.env.BAGS_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
if (!BAGS_API_KEY || !SOLANA_RPC_URL) {
    throw new Error("BAGS_API_KEY and SOLANA_RPC_URL are required");
}
const connection = new Connection(SOLANA_RPC_URL);
const sdk = new BagsSDK(BAGS_API_KEY, connection, "processed");
async function getTokenCreators(tokenMint: string) {
    try {
        console.log(`🔍 Fetching token creators for: ${tokenMint}`);
        const creators = await sdk.state.getTokenCreators(new PublicKey(tokenMint));
        console.log(`📊 Found ${creators.length} creator(s)/deployer(s)`);
        const primaryCreator = creators.find(c => c.isCreator);
        if (!primaryCreator) {
            throw new Error("❌ No primary creator found for this token!");
        }
        console.log("✨ Primary Creator Details:");
        console.log(`👤 Display Name: ${primaryCreator.providerUsername ?? primaryCreator.username ?? "N/A"}`);
        console.log(`🔗 Provider: ${primaryCreator.provider ?? "unknown"}`);
        console.log(`👛 Wallet: ${primaryCreator.wallet}`);
        console.log(`🎨 Profile Picture: ${primaryCreator.pfp}`);
        console.log(`💰 Royalty: ${primaryCreator.royaltyBps / 100}%`);
        const others = creators.filter(c => !c.isCreator);
        if (others.length > 0) {
            console.log("\n🤝 Other Launch Participants:");
            others.forEach((participant, idx) => {
                console.log(`\n#${idx + 1}`);
                console.log(`👤 Display Name: ${participant.providerUsername ?? participant.username ?? "N/A"}`);
                console.log(`🔗 Provider: ${participant.provider ?? "unknown"}`);
                console.log(`👛 Wallet: ${participant.wallet}`);
                console.log(`🎨 Profile Picture: ${participant.pfp}`);
                console.log(`💰 Royalty: ${participant.royaltyBps / 100}%`);
            });
        } else {
            console.log("\n📝 No additional launch participants found for this token");
        }
        console.log("\n✅ Successfully retrieved token creators!");
    }
    catch (error) {
        console.error("🚨 Error fetching token creators:", error);
    }
}
getTokenCreators("CyXBDcVQuHyEDbG661Jf3iHqxyd9wNHhE2SiQdNrBAGS");

```

## 
​
2. Run Your Script
To analyze a token’s creators, edit the `getTokenCreators` function call at the bottom of the script with the actual mint address you want to analyze. Then, run the script from your terminal:
Copy
Ask AI
```
npx ts-node get-token-creators.ts

```

## 
​
What You’ll See
The script will output detailed information about the token’s launch creators/deployers: Example output:
Copy
Ask AI
```
🔍 Fetching token creators for: CyXBDcVQuHyEDbG661Jf3iHqxyd9wNHhE2SiQdNrBAGS
📊 Found 2 creator(s)/deployer(s)
✨ Primary Creator Details:
👤 Display Name: tokenCreatorOnTwitter
🔗 Provider: twitter
👛 Wallet: 8xX...abc
🎨 Profile Picture: https://example.com/pfp.jpg
💰 Royalty: 5%
🤝 Other Launch Participants:
#1
👤 Display Name: feeShareUser
🔗 Provider: github
👛 Wallet: 3yz...def
🎨 Profile Picture: https://example.com/pfp2.jpg
💰 Royalty: 2%
✅ Successfully retrieved token creators!

```

## 
​
Understanding the Data
 * **isCreator** : Identifies the primary token creator. There can be multiple creators/deployers, but at most one will have `isCreator: true`.
 * **provider** : The social/login provider associated with the creator (e.g., `twitter`, `tiktok`, `kick`, `github`). Use this to show a platform logo. May be `unknown` or `null`.
 * **providerUsername** : The username on the provider platform, when available. Prefer this for display. The plain `username` is a Bags internal username and may be absent.
 * **wallet** : The creator’s wallet address.
 * **pfp** : URL to the profile image, when available.
 * **royaltyBps** : Royalty in basis points. Divide by 100 to display as a percentage.

### 
​
Key Information Retrieved:
 * **Display Name** : `providerUsername` if present, otherwise `username`
 * **Provider** : Source platform for displaying logos and context
 * **Wallet** : Wallet address string
 * **Profile Picture** : URL string
 * **Royalty** : Percentage derived from `royaltyBps / 100`

## 
​
Use Cases
This information is valuable for:
 * **Due Diligence** : Research token creators before investing
 * **Creator Discovery** : Find and follow successful token creators
 * **Fee Analysis** : Understand how token fees are distributed
 * **Partnership Opportunities** : Identify potential collaborators
 * **Portfolio Research** : Learn about the teams behind your investments

For token performance metrics, also check out our Get Token Lifetime Fees guide.
Get Token Lifetime FeesClaim Fees from Token Positions
⌘I
xgithublinkedin
Powered by


---

# Get Token Lifetime Fees - Bags API Documentation

## URL
https://docs.bags.fm/how-to-guides/get-token-lifetime-fees

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.551473

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
How-to Guides
Get Token Lifetime Fees
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Prerequisites
 * 1. The Token Lifetime Fees Script
 * 2. Run Your Script
 * What You’ll See
 * Use Cases

How-to Guides
# Get Token Lifetime Fees
OpenAIOpen in ChatGPT
Learn how to retrieve the total lifetime fees earned by a Solana token using the Bags API with TypeScript and Node.js
OpenAIOpen in ChatGPT
In this guide, you’ll learn how to retrieve the total lifetime fees earned by a Solana token using the Bags TypeScript SDK with Node.js. This is useful for tracking token performance and earnings over time.
## 
​
Prerequisites
Before starting, make sure you have:
 * Completed our TypeScript and Node.js Setup Guide.
 * Got your API key from the Bags Developer Portal.
 * The token mint address you want to analyze.

## 
​
1. The Token Lifetime Fees Script
Here is a simple script to fetch token lifetime fees. Save this as `get-token-lifetime-fees.ts`. This script uses the updated SDK API to retrieve lifetime fees for any token and displays them in a user-friendly format.
Copy
Ask AI
```
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { BagsSDK } from "@bagsfm/bags-sdk";
import { LAMPORTS_PER_SOL, PublicKey, Connection } from "@solana/web3.js";
// Initialize SDK
const BAGS_API_KEY = process.env.BAGS_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
if (!BAGS_API_KEY || !SOLANA_RPC_URL) {
    throw new Error("BAGS_API_KEY and SOLANA_RPC_URL are required");
}
const connection = new Connection(SOLANA_RPC_URL);
const sdk = new BagsSDK(BAGS_API_KEY, connection, "processed");
async function getTokenLifetimeFees(tokenMint: string) {
    const feesLamports = await sdk.state.getTokenLifetimeFees(new PublicKey(tokenMint));
    console.log("💰 Token lifetime fees:", (feesLamports / LAMPORTS_PER_SOL).toLocaleString(), "SOL");
}
getTokenLifetimeFees("CyXBDcVQuHyEDbG661Jf3iHqxyd9wNHhE2SiQdNrBAGS");

```

## 
​
2. Run Your Script
To analyze a token’s lifetime fees, edit the `getTokenLifetimeFees` function call at the bottom of the script with the actual mint address you want to analyze. Then, run the script from your terminal:
Copy
Ask AI
```
npx ts-node get-token-lifetime-fees.ts

```

## 
​
What You’ll See
The script will output the total lifetime fees earned by the token in SOL, formatted with proper number localization for easy reading. Example output:
Copy
Ask AI
```
💰 Token lifetime fees: 1,234.567890 SOL

```

## 
​
Use Cases
This information is valuable for:
 * **Token Performance Analysis** : Track how much revenue a token has generated
 * **Investment Research** : Evaluate token success based on fee generation
 * **Portfolio Management** : Monitor earnings from tokens you’ve created or invested in
 * **Market Analysis** : Compare performance across different tokens

For more advanced token analytics, check out our Get Token Creators guide.
Claim Partner FeesGet Token Creators
⌘I
xgithublinkedin
Powered by


---

# What is the Bags API? - Bags API Documentation

## URL
https://docs.bags.fm/faq/what-is-bags-api

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.551525

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Frequently Asked Questions
What is the Bags API?
GuidesAPI referenceFAQ
##### Frequently Asked Questions
 * What is the Bags API?
 * How do I get an API key?
 * How to display social profile on token page?
 * What are the rate limits?
 * Do I need a Solana wallet to use the API?

On this page
 * What is the Bags API?
 * Key Features
 * Getting Started

Frequently Asked Questions
# What is the Bags API?
OpenAIOpen in ChatGPT
Learn about the Bags API and what it allows you to do
OpenAIOpen in ChatGPT
## 
​
What is the Bags API?
The Bags API allows you to integrate Bags functionality into your applications. You can launch tokens, manage fee shares, and retrieve analytics data programmatically.
### 
​
Key Features
 * **Token Launch** : Create and launch Solana tokens through the API
 * **Fee Sharing** : Configure fee sharing between creators and fee claimers
 * **Analytics** : Retrieve token lifetime fees and creator information
 * **State Management** : Query pool configurations and token data

### 
​
Getting Started
To start using the Bags API:
 1. Get your API key from the Bags Developer Portal
 2. Review the API Reference documentation
 3. Follow our TypeScript Setup Guide to get started quickly

How do I get an API key?
⌘I
xgithublinkedin
Powered by


---

# Address Lookup Tables (LUTs) - Bags API Documentation

## URL
https://docs.bags.fm/principles/lookup-tables

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.551613

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Core Principles
Address Lookup Tables (LUTs)
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Overview
 * What’s inside
 * Using the LUT in transactions
 * When LUTs are Required
 * Recommended tip recipients (from the Bags LUT)
 * Propose additions

Core Principles
# Address Lookup Tables (LUTs)
OpenAIOpen in ChatGPT
Public LUTs maintained by Bags and how to use them
OpenAIOpen in ChatGPT
### 
​
Overview
Solana Address Lookup Tables (LUTs) let you reference many accounts in a transaction without having to include their full 32-byte public keys directly. This reduces transaction size and helps you fit more instructions per transaction. Bags maintains a public LUT that contains the most commonly used accounts across our APIs and products. You can use it for all Bags-related transactions.
 * Mainnet-beta LUT address: `Eq1EVs15EAWww1YtPTtWPzJRLPJoS6VYP9oW9SbNr3yp`

The LUT is updated over time as our products evolve. If you have suggestions for accounts or providers to include, reach out to us.
### 
​
What’s inside
 * Core program IDs and frequently used accounts for Bags workflows
 * Accounts related to token launches, fee sharing/claiming, and post-launch liquidity
 * Well-known tipping provider recipient wallets (see below)

You can inspect the table contents via your RPC or CLI to confirm which accounts are currently included.
### 
​
Using the LUT in transactions
 * Include the LUT address when compiling or building your transaction message so that account keys are resolved from the table at runtime.
 * The transaction fee payer must have access to the LUT on mainnet-beta; no special permissions are required to read from a public LUT.
 * LUT usage is optional for most transactions. Your transactions will still work without it, but may be larger.

### 
​
When LUTs are Required
For fee share configurations, LUTs are **required** when you have more than 15 fee claimers. The SDK provides a helper function `getConfigCreationLookupTableTransactions()` to create the necessary LUT transactions:
 1. Create the LUT creation transaction
 2. Execute the creation transaction
 3. Wait for one slot to pass (required by Solana)
 4. Execute all LUT extend transactions
 5. Pass the LUT addresses to `createBagsFeeShareConfig` via `additionalLookupTables`

See the Launch a Token guide for a complete example of LUT creation and usage.
### 
​
Recommended tip recipients (from the Bags LUT)
While you can tip any valid Solana address, we recommend using a provider wallet that is already present in our LUT for convenience and compact transactions. Current provider recipients included in the LUT:
 * Jito:
 * `96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5`
 * `HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe`
 * `Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY`
 * `ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49`
 * `DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh`
 * `ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt`
 * `DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL`
 * `3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT`
 * bloXroute:
 * `HWEoBxYs7ssKuudEjzjmpfJVX7Dvi7wescFsVx2L5yoY`
 * `95cfoy472fcQHaw4tPGBTKpn6ZQnfEPfBgDQx6gcRmRg`
 * `3UQUKjhMKaY2S6bjcQD6yHB7utcZt5bfarRCmctpRtUd`
 * `FogxVNs6Mm2w9rnGL1vkARSwJxvLE8mujTv3LK8RnUhF`
 * Astral:
 * `astrazznxsGUhWShqgNtAdfrzP2G83DzcWVJDxwV9bF`
 * `astra4uejePWneqNaJKuFFA8oonqCE1sqF6b45kDMZm`
 * `astra9xWY93QyfG6yM8zwsKsRodscjQ2uU2HKNL5prk`
 * `astraRVUuTHjpwEVvNBeQEgwYx9w9CFyfxjYoobCZhL`
 * `astraEJ2fEj8Xmy6KLG7B3VfbKfsHXhHrNdCQx7iGJK`
 * `astraubkDw81n4LuutzSQ8uzHCv4BhPVhfvTcYv8SKC`
 * `astraZW5GLFefxNPAatceHhYjfA1ciq9gvfEg2S47xk`
 * `astrawVNP4xDBKT7rAdxrLYiTSTdqtUr63fSMduivXK`

See the tipping guide for how to include a tip in Bags-generated transactions. Using a recipient already in the LUT keeps transactions as compact as possible.
### 
​
Propose additions
If you operate a relevant service or have account suggestions that should be in our LUT, please reach out. We’re happy to review and expand coverage where it benefits developers.
Program IDsPriority Fees and Tips
⌘I
xgithublinkedin
Powered by


---

# Bags Help Center

## URL
https://support.bags.fm

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.551645

## Content
Skip to main content
Bags Help Center
English
English
# How can we help?
Search for articles...

Bags Help Center
Report Content


---

# Trade Tokens - Bags API Documentation

## URL
https://docs.bags.fm/how-to-guides/trade-tokens

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.551905

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
How-to Guides
Trade Tokens
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Prerequisites
 * 1. Set Up Environment Variables
 * 2. The Token Trading Script
 * 3. Understanding Trade Quotes
 * Quote Parameters
 * Quote Response
 * Route Plan
 * 4. Slippage Modes
 * Auto Slippage
 * Manual Slippage
 * 5. Swap Transaction Details
 * 6. Running the Script
 * 7. Getting a Quote Only
 * 8. Error Handling
 * 9. Troubleshooting

How-to Guides
# Trade Tokens
OpenAIOpen in ChatGPT
Complete guide to get trade quotes and execute token swaps using the Bags API with TypeScript and Node.js
OpenAIOpen in ChatGPT
In this guide, you’ll learn how to get trade quotes and execute token swaps using the Bags TypeScript SDK with Node.js. The trade service allows you to swap tokens across various DEXs and liquidity pools on Solana.
## 
​
Prerequisites
Before starting, make sure you have:
 * Completed our TypeScript and Node.js Setup Guide.
 * Got your API key from the Bags Developer Portal.
 * A Solana wallet with tokens to swap and SOL for transaction fees.
 * Installed the additional dependencies for this guide:
Copy
Ask AI
```
npm install @solana/web3.js bs58

```

**Transaction Fees** : Trading tokens requires Solana transactions. Make sure your wallet has sufficient SOL balance to pay for transaction fees.
## 
​
1. Set Up Environment Variables
This guide requires your wallet’s private key. Add it to your base `.env` file:
Copy
Ask AI
```
# .env
BAGS_API_KEY=your_api_key_here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PRIVATE_KEY=your_base58_encoded_private_key_here  # Required for this guide

```

You can export your private key from wallets like Bags, Phantom, or Backpack.
## 
​
2. The Token Trading Script
Here is a complete script to get a trade quote and execute a swap. Save it as `trade-tokens.ts`. The script follows this flow:
 1. Get a trade quote
 2. Review the quote details
 3. Create a swap transaction
 4. Sign and send the transaction

Copy
Ask AI
```
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { BagsSDK, signAndSendTransaction } from "@bagsfm/bags-sdk";
import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import bs58 from "bs58";
// Initialize SDK
const BAGS_API_KEY = process.env.BAGS_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!BAGS_API_KEY || !SOLANA_RPC_URL || !PRIVATE_KEY) {
    throw new Error("BAGS_API_KEY, SOLANA_RPC_URL, and PRIVATE_KEY are required");
}
const connection = new Connection(SOLANA_RPC_URL);
const sdk = new BagsSDK(BAGS_API_KEY, connection, "processed");
async function executeSwap(
    inputMint: PublicKey,
    outputMint: PublicKey,
    amount: number,
    slippageMode: "auto" | "manual" = "auto",
    slippageBps?: number
) {
    try {
        if (!PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY is not set");
        }
        const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
        const commitment = sdk.state.getCommitment();
        console.log(`💱 Getting trade quote...`);
        console.log(`   Input: ${inputMint.toBase58()}`);
        console.log(`   Output: ${outputMint.toBase58()}`);
        console.log(`   Amount: ${amount}`);
        console.log(`   Slippage Mode: ${slippageMode}`);
        // Step 1: Get a trade quote
        const quote = await sdk.trade.getQuote({
            inputMint: inputMint,
            outputMint: outputMint,
            amount: amount,
            slippageMode: slippageMode,
            slippageBps: slippageBps,
        });
        console.log("\n📊 Quote Details:");
        console.log(`   Request ID: ${quote.requestId}`);
        console.log(`   Input Amount: ${quote.inAmount}`);
        console.log(`   Output Amount: ${quote.outAmount}`);
        console.log(`   Min Output Amount: ${quote.minOutAmount}`);
        console.log(`   Price Impact: ${quote.priceImpactPct}%`);
        console.log(`   Slippage: ${quote.slippageBps / 100}%`);
        console.log(`   Route Plan: ${quote.routePlan.length} leg(s)`);
        // Display route plan details
        if (quote.routePlan.length > 0) {
            console.log("\n🛣️  Route Plan:");
            quote.routePlan.forEach((leg, index) => {
                console.log(`   Leg ${index + 1}:`);
                console.log(`      Venue: ${leg.venue}`);
                console.log(`      Input: ${leg.inAmount} (${leg.inputMint})`);
                console.log(`      Output: ${leg.outAmount} (${leg.outputMint})`);
            });
        }
        // Display platform fee if present
        if (quote.platformFee) {
            console.log("\n💰 Platform Fee:");
            console.log(`   Amount: ${quote.platformFee.amount}`);
            console.log(`   Fee BPS: ${quote.platformFee.feeBps}`);
            console.log(`   Fee Account: ${quote.platformFee.feeAccount}`);
        }
        // Step 2: Create swap transaction
        console.log("\n🎯 Creating swap transaction...");
        const swapResult = await sdk.trade.createSwapTransaction({
            quoteResponse: quote,
            userPublicKey: keypair.publicKey,
        });
        console.log(`   Compute Unit Limit: ${swapResult.computeUnitLimit}`);
        console.log(`   Prioritization Fee: ${swapResult.prioritizationFeeLamports} lamports`);
        // Step 3: Sign and send transaction
        console.log("\n🔑 Signing and sending swap transaction...");
        const signature = await signAndSendTransaction(connection, commitment, swapResult.transaction, keypair);
        console.log("\n🎉 Swap executed successfully!");
        console.log(`   Transaction Signature: ${signature}`);
        console.log(`   View on Solana Explorer: https://solscan.io/tx/${signature}`);
        return {
            signature,
            quote,
            swapResult,
        };
    } catch (error) {
        console.error("🚨 Swap execution failed:", error);
        throw error;
    }
}
// Example: Swap 100,000 tokens (adjust decimals based on token)
// Replace with your actual token mint addresses
const INPUT_MINT = new PublicKey("YOUR_INPUT_TOKEN_MINT_ADDRESS");
const OUTPUT_MINT = new PublicKey("YOUR_OUTPUT_TOKEN_MINT_ADDRESS");
const AMOUNT = 100_000; // Amount in token's smallest unit (e.g., if token has 6 decimals, 100000 = 0.1 tokens)
// Execute swap with auto slippage
executeSwap(INPUT_MINT, OUTPUT_MINT, AMOUNT, "auto")
    .then((result) => {
        console.log("\n✨ Swap completed successfully!");
    })
    .catch((error) => {
        console.error("🚨 Unexpected error occurred:", error);
    });
// Example: Execute swap with manual slippage (1% = 100 bps)
// executeSwap(INPUT_MINT, OUTPUT_MINT, AMOUNT, "manual", 100)
//     .then((result) => {
//         console.log("\n✨ Swap completed successfully!");
//     })
//     .catch((error) => {
//         console.error("🚨 Unexpected error occurred:", error);
//     });

```

## 
​
3. Understanding Trade Quotes
A trade quote provides information about a potential swap before you execute it:
### 
​
Quote Parameters
 * **inputMint** : The token you want to swap from (PublicKey)
 * **outputMint** : The token you want to swap to (PublicKey)
 * **amount** : The amount to swap (in the token’s smallest unit, e.g., lamports for SOL)
 * **slippageMode** : Either `"auto"` (automatic slippage calculation) or `"manual"` (you specify slippage)
 * **slippageBps** : Basis points for slippage tolerance (0-10000, where 10000 = 100%). Required when `slippageMode` is `"manual"`

### 
​
Quote Response
The quote response includes:
 * **inAmount** : The input amount (as string)
 * **outAmount** : The expected output amount (as string)
 * **minOutAmount** : The minimum output amount considering slippage
 * **priceImpactPct** : The price impact percentage (as string)
 * **slippageBps** : The slippage tolerance in basis points
 * **routePlan** : Array of route legs showing the swap path through different venues
 * **platformFee** : Optional platform fee information
 * **requestId** : Unique identifier for the quote request

### 
​
Route Plan
The route plan shows how your swap will be executed across different venues (DEXs, liquidity pools, etc.). Each leg represents one step in the swap path.
## 
​
4. Slippage Modes
### 
​
Auto Slippage
When using `slippageMode: "auto"`, the SDK automatically calculates an appropriate slippage tolerance based on market conditions. This is recommended for most use cases.
Copy
Ask AI
```
const quote = await sdk.trade.getQuote({
    inputMint: inputMint,
    outputMint: outputMint,
    amount: amount,
    slippageMode: "auto",
});

```

### 
​
Manual Slippage
When using `slippageMode: "manual"`, you must specify `slippageBps`. This gives you full control over slippage tolerance.
Copy
Ask AI
```
const quote = await sdk.trade.getQuote({
    inputMint: inputMint,
    outputMint: outputMint,
    amount: amount,
    slippageMode: "manual",
    slippageBps: 100, // 1% slippage tolerance
});

```

**Slippage BPS Examples:**
 * `50` = 0.5% slippage tolerance
 * `100` = 1% slippage tolerance
 * `500` = 5% slippage tolerance
 * `1000` = 10% slippage tolerance

## 
​
5. Swap Transaction Details
When you create a swap transaction, you receive:
 * **transaction** : A `VersionedTransaction` ready to be signed and sent
 * **computeUnitLimit** : The compute unit limit for the transaction
 * **lastValidBlockHeight** : The last valid block height for the transaction
 * **prioritizationFeeLamports** : The prioritization fee in lamports

The transaction is already configured with compute units and prioritization fees, so you can sign and send it directly.
## 
​
6. Running the Script
To execute a swap, edit the script with your token mint addresses and amount:
 1. Set `INPUT_MINT` to the token you want to swap from
 2. Set `OUTPUT_MINT` to the token you want to swap to
 3. Set `AMOUNT` to the amount in the token’s smallest unit (consider token decimals)

Then, run the script from your terminal:
Copy
Ask AI
```
npx ts-node trade-tokens.ts

```

## 
​
7. Getting a Quote Only
If you just want to check a quote without executing a swap:
Copy
Ask AI
```
async function getQuoteOnly(inputMint: PublicKey, outputMint: PublicKey, amount: number) {
    const quote = await sdk.trade.getQuote({
        inputMint: inputMint,
        outputMint: outputMint,
        amount: amount,
        slippageMode: "auto",
    });
    console.log(`Expected output: ${quote.outAmount}`);
    console.log(`Min output (with slippage): ${quote.minOutAmount}`);
    console.log(`Price impact: ${quote.priceImpactPct}%`);
    return quote;
}

```

## 
​
8. Error Handling
The script includes comprehensive error handling for:
 * **Invalid Token Mints** : Ensure the mint addresses are valid Solana public keys
 * **Insufficient Liquidity** : The quote may fail if there’s not enough liquidity for the swap
 * **Invalid Amount** : The amount must be a positive number
 * **Slippage Errors** : If using manual slippage, ensure `slippageBps` is between 0 and 10000
 * **Transaction Failures** : Network issues or insufficient SOL for fees

## 
​
9. Troubleshooting
Common issues include:
 * **No Quote Available** : Check that both tokens have sufficient liquidity and are tradeable
 * **High Price Impact** : Large swaps may have high price impact. Consider splitting into smaller swaps
 * **Insufficient SOL** : Your wallet needs SOL for transaction fees
 * **Invalid Amount** : Make sure the amount is in the token’s smallest unit (not in human-readable format)

For more details, see the API Reference.
Claim Fees from Token PositionsGet Token Claim Events
⌘I
xgithublinkedin
Powered by


---

# Claim Partner Fees - Bags API Documentation

## URL
https://docs.bags.fm/how-to-guides/claim-partner-fees

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.552177

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
How-to Guides
Claim Partner Fees
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Method 1: Using the Dev Dashboard
 * Step 1: Access the Dashboard
 * Step 2: View Claim Stats
 * Step 3: Claim Fees
 * Method 2: Using the SDK
 * Prerequisites
 * 1. Set Up Environment Variables
 * 2. The Partner Fee Claiming Script
 * 3. Understanding Partner Fees
 * Partner Fee Accumulation
 * Claiming Process
 * Fee Types
 * 4. Running the Script
 * 5. Checking Stats Only
 * 6. Troubleshooting
 * 7. Related Guides

How-to Guides
# Claim Partner Fees
OpenAIOpen in ChatGPT
Complete guide to claim fees from partner configurations using the Bags Dev Dashboard or SDK
OpenAIOpen in ChatGPT
In this guide, you’ll learn how to check and claim fees from your partner configuration. Partner fees are accumulated from token launches that include your partner configuration. You can claim partner fees using either the Bags Dev Dashboard or the TypeScript SDK.
**Transaction Fees** : Partners pay transaction fees for all source claim steps, and the SOL you’re claiming is only received in the final vault-withdraw transaction. Keep enough SOL up front so every claim transaction can succeed and you collect the funds on that last step.
## 
​
Method 1: Using the Dev Dashboard
The easiest way to check and claim partner fees is through the Bags Developer Dashboard.
### 
​
Step 1: Access the Dashboard
 1. Go to <https://dev.bags.fm> and log in with your account.

### 
​
Step 2: View Claim Stats
 1. Navigate to the **Partner Key** table in the dashboard.
 2. View your unclaimed fees in the table. The table displays:
 * Your partner config key
 * Claimed fees
 * Unclaimed fees

!Partner Key Table with Stats
### 
​
Step 3: Claim Fees
 1. If you have unclaimed fees, click the **“Claim”** button next to your partner key in the table.
 2. Confirm the transaction in your connected wallet.
 3. Your fees will be claimed and transferred to your wallet.

Make sure your wallet has sufficient SOL balance to pay for the transaction fees.
## 
​
Method 2: Using the SDK
You can also check and claim partner fees programmatically using the Bags TypeScript SDK.
### 
​
Prerequisites
Before starting, make sure you have:
 * Completed our TypeScript and Node.js Setup Guide.
 * Got your API key from the Bags Developer Portal.
 * A Solana wallet with a partner configuration (see Create Partner Key guide).
 * Installed the additional dependencies for this guide:
Copy
Ask AI
```
npm install @solana/web3.js bs58

```

### 
​
1. Set Up Environment Variables
This guide requires your wallet’s private key. Add it to your base `.env` file:
Copy
Ask AI
```
# .env
BAGS_API_KEY=your_api_key_here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PRIVATE_KEY=your_base58_encoded_private_key_here  # Required for this guide

```

You can export your private key from wallets like Bags, Phantom, or Backpack.
### 
​
2. The Partner Fee Claiming Script
Here is a comprehensive script to check partner fee stats and claim fees. You can save this as `claim-partner-fees.ts`. This script uses the Bags SDK’s `partner` service to check claimable fees and generate claim transactions. The SDK returns claim transactions where **the last transaction must be executed last** because it withdraws funds from the user vault. All preceding transactions fund that vault and could be processed in parallel before the final one, but this guide executes them sequentially for simplicity.
Copy
Ask AI
```
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { BagsSDK, signAndSendTransaction } from "@bagsfm/bags-sdk";
import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import bs58 from "bs58";
// Initialize SDK
const BAGS_API_KEY = process.env.BAGS_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!BAGS_API_KEY || !SOLANA_RPC_URL || !PRIVATE_KEY) {
    throw new Error("BAGS_API_KEY, SOLANA_RPC_URL, and PRIVATE_KEY are required");
}
const connection = new Connection(SOLANA_RPC_URL);
const sdk = new BagsSDK(BAGS_API_KEY, connection, "processed");
async function claimPartnerFees(partnerWallet: PublicKey) {
    try {
        if (!PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY is not set");
        }
        const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
        console.log(`💰 Checking partner fees for wallet: ${partnerWallet.toBase58()}`);
        // Check if partner config exists
        try {
            const partnerConfig = await sdk.partner.getPartnerConfig(partnerWallet);
            console.log("✅ Partner config found!");
            console.log(`   Partner: ${partnerConfig.partner.toBase58()}`);
            console.log(`   BPS: ${partnerConfig.bps}`);
            console.log(`   Total Claimed Fees: ${partnerConfig.totalClaimedFees.toString()}`);
            console.log(`   Total Accumulated Fees: ${partnerConfig.totalAccumulatedFees.toString()}`);
        } catch (error: any) {
            if (error.message?.includes("not found")) {
                console.error("❌ Partner config not found. Please create a partner key first.");
                console.log("   See the [Create Partner Key](/how-to-guides/create-partner-key) guide.");
                return;
            }
            throw error;
        }
        // Get partner claim stats
        console.log("\n📊 Fetching partner claim stats...");
        const stats = await sdk.partner.getPartnerConfigClaimStats(partnerWallet);
        const claimedFees = BigInt(stats.claimedFees);
        const unclaimedFees = BigInt(stats.unclaimedFees);
        console.log(`💰 Claimed Fees: ${claimedFees.toString()} lamports`);
        console.log(`💰 Unclaimed Fees: ${unclaimedFees.toString()} lamports`);
        if (unclaimedFees === 0n) {
            console.log("\n✨ No unclaimed fees available to claim.");
            return;
        }
        const unclaimedFeesSOL = Number(unclaimedFees) / 1_000_000_000; // Convert lamports to SOL
        console.log(`💵 Unclaimed Fees: ${unclaimedFeesSOL.toFixed(9)} SOL`);
        // Get claim transactions
        console.log("\n🎯 Generating claim transactions...");
        const claimTransactions = await sdk.partner.getPartnerConfigClaimTransactions(partnerWallet);
        if (!claimTransactions || claimTransactions.length === 0) {
            console.log("⚠️  No claim transactions available.");
            return;
        }
        console.log(`✨ Generated ${claimTransactions.length} claim transaction(s)`);
        // Sign and send transactions
        // The SDK guarantees the last transaction withdraws from the vault.
        // All preceding transactions fund that vault and could run in parallel,
        // but we send them sequentially here for clarity and to ensure order.
        const commitment = sdk.state.getCommitment();
        console.log("\n🔑 Signing and sending transactions sequentially (you can parallelize pre-vault txs if desired)...");
        for (let i = 0; i < claimTransactions.length; i++) {
            const { transaction, blockhash } = claimTransactions[i];
            const isFinal = i === claimTransactions.length - 1;
            const label = isFinal ? "vault withdraw" : "pre-vault";
            console.log(`\n📝 Processing transaction ${i + 1}/${claimTransactions.length} (${label})...`);
            const signature = await signAndSendTransaction(connection, commitment, transaction, keypair, blockhash);
            console.log(`✅ ${label} transaction sent: ${signature}`);
        }
        console.log("\n🎉 Partner fee claiming completed successfully!");
        // Get updated stats
        const updatedStats = await sdk.partner.getPartnerConfigClaimStats(partnerWallet);
        const newUnclaimedFees = BigInt(updatedStats.unclaimedFees);
        const newUnclaimedFeesSOL = Number(newUnclaimedFees) / 1_000_000_000;
        console.log(`\n📊 Updated Stats:`);
        console.log(`   Unclaimed Fees: ${newUnclaimedFeesSOL.toFixed(9)} SOL`);
    } catch (error) {
        console.error("🚨 Partner fee claiming failed:", error);
        throw error;
    }
}
// Example: Claim partner fees for a specific wallet
// Replace with your partner wallet address
const partnerWallet = new PublicKey("YOUR_PARTNER_WALLET_ADDRESS_HERE");
claimPartnerFees(partnerWallet)
    .then(() => {
        console.log("\n✨ Process completed!");
    })
    .catch((error) => {
        console.error("🚨 Unexpected error occurred:", error);
    });

```

### 
​
3. Understanding Partner Fees
Partner fees are accumulated when token launches include your partner configuration. Here’s how it works:
### 
​
Partner Fee Accumulation
 * **Token Launches** : When tokens are launched with your partner config, fees from trading are automatically accumulated in your partner configuration
 * **Fee Share** : The percentage you receive is determined by the partner configuration’s BPS (basis points) setting
 * **Automatic Tracking** : The SDK tracks all accumulated fees across all token launches that include your partner config

### 
​
Claiming Process
 1. **Check Stats** : Use `getPartnerConfigClaimStats()` to see how much you can claim
 2. **Get Transactions** : Use `getPartnerConfigClaimTransactions()` to generate claim transactions
 3. **Sign & Send**: Sign and broadcast the transactions to claim your fees

### 
​
Fee Types
 * **Claimed Fees** : Fees you’ve already claimed and received
 * **Unclaimed Fees** : Fees that are available to claim but haven’t been claimed yet

### 
​
4. Running the Script
To check and claim partner fees, edit the `partnerWallet` variable in `claim-partner-fees.ts` with your partner wallet address. Then, run the script from your terminal:
Copy
Ask AI
```
npx ts-node claim-partner-fees.ts

```

The script will:
 1. Check if your partner config exists
 2. Display your partner configuration details
 3. Show your claimable fee stats
 4. Generate and send claim transactions if fees are available
 5. Display updated stats after claiming

### 
​
5. Checking Stats Only
If you just want to check your partner fee stats without claiming, you can use this simplified version:
Copy
Ask AI
```
async function checkPartnerStats(partnerWallet: PublicKey) {
    const stats = await sdk.partner.getPartnerConfigClaimStats(partnerWallet);
    const claimedFees = BigInt(stats.claimedFees);
    const unclaimedFees = BigInt(stats.unclaimedFees);
    const claimedFeesSOL = Number(claimedFees) / 1_000_000_000;
    const unclaimedFeesSOL = Number(unclaimedFees) / 1_000_000_000;
    console.log(`💰 Claimed Fees: ${claimedFeesSOL.toFixed(9)} SOL`);
    console.log(`💰 Unclaimed Fees: ${unclaimedFeesSOL.toFixed(9)} SOL`);
}

```

### 
​
6. Troubleshooting
Common issues include:
 * **Partner Config Not Found** : Ensure you’ve created a partner key first using the Create Partner Key guide
 * **No Unclaimed Fees** : If unclaimed fees are 0, there are no fees available to claim at this time
 * **Insufficient SOL** : Your wallet needs SOL for transaction fees
 * **Invalid Wallet Address** : Ensure the partner wallet address is a valid Solana public key
 * **Transaction Failures** : Check that your wallet has sufficient SOL for transaction fees

### 
​
7. Related Guides
 * Create Partner Key - Learn how to create a partner configuration
 * Launch a Token - Learn how to include partner configs in token launches
 * Claim Fees from Token Positions - Learn how to claim fees from token positions

For more details, see the API Reference.
Create Partner KeyGet Token Lifetime Fees
⌘I
xgithublinkedin
Powered by


---

# API Key Management - Bags API Documentation

## URL
https://docs.bags.fm/principles/api-key-management

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.552278

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Core Principles
API Key Management
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Getting Your First API Key
 * Key Limitations
 * Best Practices
 * 1. Descriptive Naming
 * 2. Environment Separation
 * 3. Application-Specific Keys
 * Emergency Procedures
 * Compromised Key Response

Core Principles
# API Key Management
OpenAIOpen in ChatGPT
Best practices for creating, organizing, and securing your API keys
OpenAIOpen in ChatGPT
Manage your API keys efficiently to maintain security and organization across your applications.
## 
​
Getting Your First API Key
 1. Visit dev.bags.fm and sign in to your account
 2. Navigate to the API Keys section
 3. Create a new API key with a descriptive name
 4. Copy and securely store your API key

Each user can create up to 10 API keys. Keep your keys secure and never share them publicly.
## 
​
Key Limitations
 * **Maximum keys** : 10 API keys per user account
 * **Key naming** : Name your keys for easy organization and identification
 * **Usage tracking** : Keys track last usage timestamp for monitoring
 * **Immediate revocation** : Revoking a key instantly stops all requests using that key

## 
​
Best Practices
### 
​
1. Descriptive Naming
Use clear, descriptive names that identify the key’s purpose: **Good examples:**
 * `Production-Web-App`
 * `Development-Environment`
 * `Mobile-App-iOS`
 * `Background-Jobs-Server`
 * `Testing-Integration`

**Poor examples:**
 * `Key1`
 * `Test`
 * `MyKey`
 * `temp`

### 
​
2. Environment Separation
Create separate keys for different environments:
Copy
Ask AI
```
// Environment-specific configurations
const config = {
  development: {
    apiKey: 'bags_test_dev123...',
    baseURL: 'https://public-api-v2.bags.fm/api/v1/'
  },
  staging: {
    apiKey: 'bags_test_staging456...',
    baseURL: 'https://public-api-v2.bags.fm/api/v1/'
  },
  production: {
    apiKey: 'bags_live_prod789...',
    baseURL: 'https://public-api-v2.bags.fm/api/v1/'
  }
};

```

### 
​
3. Application-Specific Keys
Use different keys for different applications or services:
Application | Key Name | Purpose 
---|---|--- 
Web Dashboard | `Web-Dashboard-Prod` | Main web application 
Mobile App | `Mobile-App-v2` | iOS/Android app 
Background Jobs | `Cronjobs-Server` | Scheduled tasks 
Analytics | `Analytics-Service` | Data collection 
Integration Tests | `CI-CD-Testing` | Automated testing 
## 
​
Emergency Procedures
### 
​
Compromised Key Response
If an API key is compromised:
 1. **Immediately revoke** the compromised key
 2. **Create a new key** with different name
 3. **Update all applications** using the old key
 4. **Review logs** for unauthorized usage
 5. **Report the incident** if further assistance is required

Always update your applications with new API keys before revoking old ones to prevent service interruptions.
File Upload Support
⌘I
xgithublinkedin
Powered by


---

# Create Partner Key - Bags API Documentation

## URL
https://docs.bags.fm/how-to-guides/create-partner-key

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.552455

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
How-to Guides
Create Partner Key
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Method 1: Using the Dev Dashboard
 * Step 1: Access the Dashboard
 * Step 2: Create Partner Key
 * Step 3: View Your Partner Config
 * Method 2: Using the SDK
 * Prerequisites
 * 1. Set Up Environment Variables
 * 2. The Partner Key Creation Script
 * 3. Understanding Partner Keys
 * When to Use Partner Keys
 * Using Partner Keys in Token Launches
 * 4. Run Your Script
 * 5. Next Steps
 * 6. Troubleshooting

How-to Guides
# Create Partner Key
OpenAIOpen in ChatGPT
Complete guide to create a partner key for fee sharing using the Bags Dev Dashboard or SDK
OpenAIOpen in ChatGPT
In this guide, you’ll learn how to create a partner key (partner config key) for fee sharing. Partner keys allow you to receive a share of fees from token launches that include your partner configuration. You can create a partner key using either the Bags Dev Dashboard or the TypeScript SDK.
**Transaction Fees** : Creating a partner key requires a Solana transaction. Make sure your wallet has sufficient SOL balance to pay for transaction fees.
**One key per wallet** : Each wallet can have only one partner key. If you need multiple partner keys, use multiple wallets and create a partner key for each wallet via the SDK.**Default fee share** : By default, a partner key receives 25% (2,500 bps) of the fees generated by tokens launched via that partner key. If you need a custom percentage, reach out to us and we can configure it for your account.
## 
​
Method 1: Using the Dev Dashboard
The easiest way to create a partner key is through the Bags Developer Dashboard.
### 
​
Step 1: Access the Dashboard
 1. Go to <https://dev.bags.fm> and log in with your account.

### 
​
Step 2: Create Partner Key
 1. Click the **“Create partner key”** button in the dashboard.
 2. Confirm creation in the confirmation modal by clicking the **“Create partner key”** button
 3. Note: Only one partner key can be created per wallet.

!Create Partner Key Button !Partner Key Table
### 
​
Step 3: View Your Partner Config
 1. After creating your partner key, you can view it in the Partner Key table below.
 2. You can copy your partner config key (PDA) from the table.
 3. The table also displays your claim stats, including claimed and unclaimed fees.

Your partner config key is now ready to use in token launches! See the Launch a Token guide for details on how to include it.
## 
​
Method 2: Using the SDK
You can also create a partner key programmatically using the Bags TypeScript SDK.
### 
​
Prerequisites
Before starting, make sure you have:
 * Completed our TypeScript and Node.js Setup Guide.
 * Got your API key from the Bags Developer Portal.
 * A Solana wallet with some SOL for transaction fees.
 * Installed the additional dependencies for this guide:
Copy
Ask AI
```
npm install @solana/web3.js bs58

```

### 
​
1. Set Up Environment Variables
This guide requires your wallet’s private key. Add it to your base `.env` file:
Copy
Ask AI
```
# .env
BAGS_API_KEY=your_api_key_here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PRIVATE_KEY=your_base58_encoded_private_key_here  # Required for this guide

```

You can export your private key from wallets like Bags, Phantom, or Backpack.
### 
​
2. The Partner Key Creation Script
Here is the complete script for creating a partner key. Save it as `create-partner-key.ts`.
Copy
Ask AI
```
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { BagsSDK, deriveBagsFeeShareV2PartnerConfigPda, signAndSendTransaction } from "@bagsfm/bags-sdk";
import {
  Keypair,
  PublicKey,
  Connection,
} from "@solana/web3.js";
import bs58 from "bs58";
// Initialize SDK
const BAGS_API_KEY = process.env.BAGS_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!BAGS_API_KEY || !SOLANA_RPC_URL || !PRIVATE_KEY) {
  throw new Error("BAGS_API_KEY, SOLANA_RPC_URL, and PRIVATE_KEY are required");
}
const connection = new Connection(SOLANA_RPC_URL);
const sdk = new BagsSDK(BAGS_API_KEY, connection, "processed");
async function createPartnerKey(partnerWallet: PublicKey) {
  try {
    if (!PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is not set");
    }
    const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
    console.log(
      `🔑 Creating partner key for wallet: ${partnerWallet.toBase58()}`
    );
    // Check if partner config already exists
    const partnerConfigPda = deriveBagsFeeShareV2PartnerConfigPda(partnerWallet);
    console.log(`📍 Partner Config PDA: ${partnerConfigPda.toBase58()}`);
    try {
      const existingConfig = await sdk.partner.getPartnerConfig(partnerWallet);
      console.log("♻️  Partner config already exists!");
      console.log(`   Partner: ${existingConfig.partner.toBase58()}`);
      console.log(`   BPS: ${existingConfig.bps}`);
      console.log(
        `   Total Claimed Fees: ${existingConfig.totalClaimedFees.toString()}`
      );
      return partnerConfigPda;
    } catch (error: any) {
      if (!error.message?.includes("not found")) {
        throw error;
      }
      // Partner config doesn't exist, proceed with creation
    }
    // Get the partner config creation transaction
    console.log("📝 Getting partner config creation transaction...");
    const { transaction, blockhash } =
      await sdk.partner.getPartnerConfigCreationTransaction(partnerWallet);
    // Sign and send the transaction
    const commitment = sdk.state.getCommitment();
    console.log("🔐 Signing and sending transaction...");
    const signature = await signAndSendTransaction(connection, commitment, transaction, keypair, blockhash);
    console.log("🎉 Partner key created successfully!");
    console.log(`📍 Partner Config PDA: ${partnerConfigPda.toBase58()}`);
    console.log(`🔑 Transaction Signature: ${signature}`);
    return partnerConfigPda;
  } catch (error) {
    console.error("🚨 Partner key creation failed:", error);
    throw error;
  }
}
// Example: Create a partner key for a specific wallet
// Replace with your partner wallet address
const partnerWallet = new PublicKey("YOUR_PARTNER_WALLET_ADDRESS_HERE");
createPartnerKey(partnerWallet)
  .then((partnerConfigPda) => {
    console.log(
      `\n✨ Partner key ready! Use this Partner Config PDA in your token launches:`
    );
    console.log(`   ${partnerConfigPda.toBase58()}`);
  })
  .catch((error) => {
    console.error("🚨 Unexpected error occurred:", error);
  });

```

### 
​
3. Understanding Partner Keys
A partner key (partner config) is a program-derived address (PDA) that represents a partner’s configuration for receiving fee shares. When you create a partner key:
 1. **Partner Wallet** : The wallet address that will receive the partner’s share of fees
 2. **Partner Config PDA** : A derived address that uniquely identifies the partner configuration
 3. **Fee Share** : By default, partner keys receive 25% (2,500 bps) of fees from tokens launched via their key. Custom percentages are available on request—contact us to discuss.
 4. **Per-Wallet Limit** : Each wallet can have only one partner key. To use multiple partner keys, manage multiple wallets and create a partner key for each using the SDK.

### 
​
When to Use Partner Keys
Partner keys are useful when:
 * You want to receive a share of fees from multiple token launches
 * You’re building a platform that launches tokens and wants to collect fees
 * You have a partnership agreement to receive fees from specific token launches

### 
​
Using Partner Keys in Token Launches
Once you have a partner config PDA, you can use it when creating fee share configurations for token launches. See the Launch a Token guide for details on how to include partner and partnerConfig parameters.
### 
​
4. Run Your Script
To create a partner key, edit the `partnerWallet` variable in `create-partner-key.ts` with the wallet address that should receive the partner fees. Then, run the script from your terminal:
Copy
Ask AI
```
npx ts-node create-partner-key.ts

```

### 
​
5. Next Steps
After creating a partner key, you can:
 * **Check Partner Stats** : Use `sdk.partner.getPartnerConfigClaimStats()` to see accumulated fees
 * **Claim Partner Fees** : See the Claim Partner Fees guide for a complete walkthrough on checking and claiming your partner fees
 * **Use in Token Launches** : Include your partner config when launching tokens (see Launch a Token guide)

### 
​
6. Troubleshooting
Common issues include:
 * **Partner Config Already Exists** : If the partner config already exists, the script will detect it and display the existing configuration.
 * **Insufficient SOL** : Your wallet needs SOL for transaction fees.
 * **Invalid Wallet Address** : Ensure the partner wallet address is a valid Solana public key.

For more details, see the API Reference.
Launch a TokenClaim Partner Fees
⌘I
xgithublinkedin
Powered by


---

# Changelog - Bags API Documentation

## URL
https://docs.bags.fm/changelog/changelog

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.552593

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Changelog
Changelog
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * January 2026
 * Token Launch v2
 * September 2025

Changelog
# Changelog
OpenAIOpen in ChatGPT
Product updates and announcements
OpenAIOpen in ChatGPT
> For instant change notifications, join and subscribe to our Telegram channel: Bags Dev Notifications.
​
January 2026
v1.2.0
**Get Token Claim Events - Time-Based Filtering:** The `/fee-share/token/claim-events` endpoint now supports two query modes:
 * **Offset Mode** (default, backward compatible): Use `mode=offset` with `limit` and `offset` for traditional pagination.
 * **Time Mode** (new): Use `mode=time` with `from` and `to` unix timestamps to retrieve all events within a specific time range.

**Example - Time Mode:**
Copy
Ask AI
```
GET /fee-share/token/claim-events?tokenMint=...&mode=time&from=1704067200&to=1706745600

```

**New Parameters:**
 * `mode`: Query mode (`offset` or `time`). Defaults to `offset` for backward compatibility.
 * `from`: Start unix timestamp (required for time mode).
 * `to`: End unix timestamp (required for time mode, must be >= `from`).

**Documentation Updates:**
 * Updated Get Token Claim Events API reference with new parameters.
 * Added Get Token Claim Events how-to guide with examples for both modes.

**Backward Compatibility:**
 * Existing integrations using offset/limit without specifying `mode` will continue to work unchanged.

​
Token Launch v2
v1.1.0
**Token Launch v2 - Fee Sharing Required:**
 * Token Launch v2 now requires fee sharing configuration for all token launches. Launches without shared fees are no longer supported.
 * All fees must be explicitly allocated using basis points. Creators must always set their BPS explicitly, even when receiving 100% of fees.
 * When sharing fees, both creators and fee claimers must have their BPS set explicitly in the configuration. **New Features**
 * **Multiple Fee Claimers** : Support for sharing fees with multiple fee claimers (not just 2 users), up to a maximum of 100 fee earners per token launch (including the creator). Each fee claimer can be identified by social provider (twitter, kick, github) and username.
 * **Partner Configuration** : New partner key system allows platforms and partnerships to receive fees from multiple token launches. See Create Partner Key and Claim Partner Fees guides.
 * **Lookup Tables (LUTs)** : Automatic LUT creation and management for fee share configs with more than 15 fee claimers. The SDK handles LUT creation, slot waiting, and extension automatically.
 * **Trade Service** : New trade endpoints for getting quotes and executing token swaps. See Trade Tokens guide.

**SDK Updates:**
 * `createBagsFeeShareConfig` now supports `partner` and `partnerConfig` parameters for partner fee sharing.
 * `createBagsFeeShareConfig` now supports `additionalLookupTables` parameter for configs with >15 fee claimers.
 * New `getConfigCreationLookupTableTransactions()` helper function for LUT creation.
 * New `waitForSlotsToPass()` utility function for waiting between LUT creation and extension.
 * New `getPartnerConfigCreationTransaction()` for creating partner keys.
 * New `getPartnerConfigClaimTransactions()` for claiming partner fees.
 * New `getQuote()` and `createSwapTransaction()` for token trading.
 * Updated `getClaimTransaction()` to return `Transaction[]` instead of `VersionedTransaction[]`.

**Documentation Updates:**
 * Updated Launch a Token guide with v2 flow and multiple fee claimer support.
 * Removed `launch-token-with-shared-fees` guide (functionality merged into main launch guide).
 * Added Create Partner Key guide with dev dashboard and SDK methods.
 * Added Claim Partner Fees guide with dev dashboard and SDK methods.
 * Added Trade Tokens guide for swap functionality.
 * Updated Claim Fees guide with new SDK functions and detailed position type explanations.
 * Updated core principles: Program IDs (added Fee Share V2), Lookup Tables (LUT requirements), Tipping (updated endpoints), File Uploads (corrected endpoint).

**Breaking Changes:**
 * Token launches now require fee sharing configuration. The old flow without fee sharing is no longer supported.
 * Fee claimers must be identified using supported social providers: `twitter`, `kick`, and `github`.
 * Maximum of 100 fee earners (including the creator) per token launch.

​
September 2025
v0.1.8
**Endpoint Updates (7-day deprecation):**
 * `/fee-share/wallet/v2` replaces `/fee-share/wallet/twitter` (now supporting GitHub, Kick, TikTok, Twitter).
 * `/token-launch/creator/v3` replaces `/token-launch/creator/v2` (response type includes more details).
 * Old endpoints will be removed in **7 days**.

**API Enhancements:**
 * Optional tip support on launch-related endpoints. Add an optional tip using `tipWallet` (Base58 encoded Solana public key) and `tipLamports` (lamports) on: 
`/token-launch/create-config`, `/token-launch/create-launch-transaction`, `/token-launch/fee-share/create-config`.
 * No mandatory IPFS upload for token info creation. `/token-launch/create-token-info` now accepts `imageUrl` and/or `metadataUrl`. When `metadataUrl` is provided, we skip IPFS upload and use the provided URL as-is. **SDK v1.0.8:**
 * Adds `getLaunchWalletV2`.
 * `getAllClaimablePositions` is more efficient, with new `chunkSize` arg to reduce RPC rate limits.
 * All downstream functions now support **commitment**.
 * General performance & stability improvements.

**Other Improvements:**
 * Total fees earned reporting is now more accurate.
 * No more fees for token creation via API (only pay Solana tx cost).
 * Better error responses across the board.

Get Token Claim EventsBase URL & Versioning
⌘I
xgithublinkedin
Powered by


---

# Claim Fees from Token Positions - Bags API Documentation

## URL
https://docs.bags.fm/how-to-guides/claim-fees

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.552816

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
How-to Guides
Claim Fees from Token Positions
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Prerequisites
 * 1. Set Up Environment Variables
 * 2. The Fee Claiming Script
 * 3. Understanding Claimable Positions
 * Regular Positions (No Custom Fee Vault)
 * Custom Fee Vault V1 Positions
 * Custom Fee Vault V2 Positions (Pre-Migration)
 * Custom Fee Vault V2 Positions (Post-Migration)
 * Position Properties
 * 4. Running the Script
 * 5. Automatic Fee Claiming
 * 6. Transaction Types
 * 7. Error Handling

How-to Guides
# Claim Fees from Token Positions
OpenAIOpen in ChatGPT
Complete guide to retrieve claimable positions and claim fees using the Bags API with TypeScript and Node.js
OpenAIOpen in ChatGPT
In this guide, you’ll learn how to retrieve claimable positions and claim fees for a specific token using the Bags TypeScript SDK with Node.js. We’ll show you how to filter claimable positions for a specific token mint and generate claim transactions to collect your fees.
## 
​
Prerequisites
Before starting, make sure you have:
 * Completed our TypeScript and Node.js Setup Guide.
 * Got your API key from the Bags Developer Portal.
 * A Solana wallet with claimable positions (from token launches, liquidity pools, etc.).
 * Installed the additional dependencies for this guide:
Copy
Ask AI
```
npm install @solana/web3.js bs58

```

## 
​
1. Set Up Environment Variables
This guide requires your wallet’s private key. Add it to your base `.env` file:
Copy
Ask AI
```
# .env
BAGS_API_KEY=your_api_key_here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PRIVATE_KEY=your_base58_encoded_private_key_here  # Required for this guide

```

You can export your private key from wallets like Bags, Phantom, or Backpack.
## 
​
2. The Fee Claiming Script
Here is a comprehensive script to fetch claimable positions for a specific token and claim fees. You can save this as `claim-fees.ts`. This script uses the Bags SDK’s `fee` service to get all claimable positions, filter them for a specific token mint, and generate claim transactions.
Copy
Ask AI
```
// claim-fees.ts
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { BagsSDK, signAndSendTransaction } from "@bagsfm/bags-sdk";
import { Keypair, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";
import bs58 from "bs58";
// Initialize SDK
const BAGS_API_KEY = process.env.BAGS_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!BAGS_API_KEY || !SOLANA_RPC_URL || !PRIVATE_KEY) {
    throw new Error("BAGS_API_KEY, SOLANA_RPC_URL, and PRIVATE_KEY are required");
}
const connection = new Connection(SOLANA_RPC_URL);
const sdk = new BagsSDK(BAGS_API_KEY, connection, "processed");
async function claimFeesForToken(tokenMint: string) {
    try {
        if (!PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY is not set");
        }
        const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
        console.log(`💰 Claiming fees for token ${tokenMint} with wallet ${keypair.publicKey.toBase58()}`);
        const connection = sdk.state.getConnection();
        const commitment = sdk.state.getCommitment();
        console.log("🔍 Fetching all claimable positions...");
        // Get all claimable positions for the wallet
        const allPositions = await sdk.fee.getAllClaimablePositions(keypair.publicKey);
        if (allPositions.length === 0) {
            console.log("❌ No claimable positions found for this wallet.");
            return;
        }
        console.log(`📋 Found ${allPositions.length} total claimable position(s)`);
        // Filter positions for the specific token mint
        const targetPositions = allPositions.filter(position => position.baseMint === tokenMint);
        if (targetPositions.length === 0) {
            console.log(`❌ No claimable positions found for token mint: ${tokenMint}`);
            console.log("Available token mints:");
            allPositions.forEach((position, index) => {
                console.log(`   ${index + 1}. ${position.baseMint}`);
            });
            return;
        }
        console.log(`✅ Found ${targetPositions.length} claimable position(s) for target token`);
        // Display position details
        targetPositions.forEach((position, index) => {
            console.log(`\n📊 Position ${index + 1}:`);
            console.log(`   🪙 Token: ${position.baseMint}`);
            console.log(`   🏊 Virtual Pool: ${position.virtualPoolAddress}`);
            if (position.virtualPoolClaimableAmount) {
                const virtualAmount = Number(position.virtualPoolClaimableAmount) / LAMPORTS_PER_SOL;
                console.log(`   💰 Virtual Pool Claimable: ${virtualAmount.toFixed(6)} SOL`);
            }
            if (position.dammPoolClaimableAmount) {
                const dammAmount = Number(position.dammPoolClaimableAmount) / LAMPORTS_PER_SOL;
                console.log(`   💰 DAMM Pool Claimable: ${dammAmount.toFixed(6)} SOL`);
            }
            if (position.isCustomFeeVault) {
                const customFeeVaultBalance = Number(position.customFeeVaultBalance) / LAMPORTS_PER_SOL;
                const bps = position.customFeeVaultBps;
                const claimableAmount = customFeeVaultBalance * (bps / 10000);
                console.log(`   🏦 Custom Fee Vault: Yes`);
                console.log(`   📍 Claimer Side: ${position.customFeeVaultClaimerSide}`);
                console.log(`   💰 Custom Fee Vault Claimable: ${claimableAmount.toFixed(6)} SOL`);
            }
        });
        console.log("\n🎯 Creating claim transactions...");
        // Process each target position
        for (let i = 0; i < targetPositions.length; i++) {
            const position = targetPositions[i];
            console.log(`\n⚙️  Processing position ${i + 1}/${targetPositions.length}...`);
            // Generate claim transactions for this position
            const claimTransactions = await sdk.fee.getClaimTransaction(
                keypair.publicKey,
                position
            );
            if (!claimTransactions || claimTransactions.length === 0) {
                console.log(`⚠️  No claim transactions generated for this position.`);
                continue;
            }
            console.log(`✨ Generated ${claimTransactions.length} claim transaction(s)`);
            // Sign and send transactions
            console.log(`🔑 Signing and sending transactions...`);
            for (let j = 0; j < claimTransactions.length; j++) {
                const transaction = claimTransactions[j];
                try {
                    await signAndSendTransaction(connection, commitment, transaction, keypair);
                    console.log(`✅ Transaction ${j + 1} confirmed successfully!`);
                } catch (txError) {
                    console.error(`🚨 Failed to send transaction ${j + 1}:`, txError);
                }
            }
        }
        console.log("🎉 Fee claiming process completed!");
    }
    catch (error) {
        console.error("🚨 Unexpected error occurred:", error);
    }
}
claimFeesForToken("TOKEN_MINT");

```

## 
​
3. Understanding Claimable Positions
The SDK’s `getAllClaimablePositions()` function returns different types of claimable positions based on the token’s lifecycle and fee sharing configuration:
### 
​
Regular Positions (No Custom Fee Vault)
These positions are for tokens that don’t use custom fee sharing:
 * **Virtual Pool Fees** : Fees earned from pre-graduation trading (before the token migrates to DAMM V2)
 * **DAMM V2 Pool Fees** : Fees earned from post-graduation trading (after the token migrates to the DAMM V2 pool)

### 
​
Custom Fee Vault V1 Positions
These positions use the Fee Share V1 program for custom fee sharing:
 * **Custom Fee Vault** : A vault that holds fees for specific claimers (A or B side)
 * **Virtual Pool Fees** : May include fees from pre-graduation trading
 * **DAMM V2 Pool Fees** : May include fees from post-graduation trading
 * Uses `customFeeVaultClaimerA` and `customFeeVaultClaimerB` to identify claimers
 * Uses `customFeeVaultClaimerSide` (‘A’ or ‘B’) to determine which side can claim

### 
​
Custom Fee Vault V2 Positions (Pre-Migration)
These positions use the Fee Share V2 program before token migration:
 * **Virtual Pool Fees Only** : Fees from pre-graduation trading
 * **User BPS** : Your share percentage in basis points (10000 = 100%)
 * **Claimer Index** : Your position in the fee claimers array
 * Token has not yet migrated to DAMM V2 pool

### 
​
Custom Fee Vault V2 Positions (Post-Migration)
These positions use the Fee Share V2 program after token migration:
 * **Virtual Pool Fees** : Fees from pre-graduation trading
 * **DAMM V2 Pool Fees** : Fees from post-graduation trading
 * **User BPS** : Your share percentage in basis points (10000 = 100%)
 * **Claimer Index** : Your position in the fee claimers array
 * Token has migrated to DAMM V2 pool (`isMigrated: true`)

### 
​
Position Properties
Each position includes:
 * `baseMint`: The token mint address
 * `virtualPoolAddress`: Address of the virtual pool (if applicable)
 * `virtualPoolClaimableAmount` or `virtualPoolClaimableLamportsUserShare`: Claimable amount from virtual pool
 * `dammPoolClaimableAmount` or `dammPoolClaimableLamportsUserShare`: Claimable amount from DAMM V2 pool (if migrated)
 * `totalClaimableLamportsUserShare`: Total claimable amount for your share
 * `isCustomFeeVault`: Whether this position uses custom fee sharing
 * `programId`: The fee share program ID (V1 or V2)
 * `isMigrated`: Whether the token has migrated to DAMM V2 pool

## 
​
4. Running the Script
To check and claim fees for the specified token, simply run the script from your terminal:
Copy
Ask AI
```
npx ts-node claim-fees.ts

```

The script will automatically use the wallet associated with your private key and claim fees for the specific token mint defined in the `claimFeesForToken()` function call. You can change the token mint address by modifying the last line of the script.
## 
​
5. Automatic Fee Claiming
The script automatically signs and sends all claim transactions for the specified token using your private key. This means:
 * **Token-specific claiming** : Only processes positions for the specified token mint
 * **No manual intervention required** : All transactions are signed and submitted automatically
 * **Batch processing** : Multiple claim transactions are processed sequentially
 * **Error handling** : Failed transactions are logged but don’t stop the process
 * **Fallback information** : If no positions exist for the target token, it shows available token mints

**⚠️ Security Warning** : Never commit private keys to version control or share them publicly.
## 
​
6. Transaction Types
The SDK generates different types of claim transactions based on the position:
 * **Virtual Pool Claims** : Simple fee claims from token trading
 * **DAMM V2 Pool Claims** : Complex transactions involving position NFTs and pool data
 * **Custom Vault Claims** : Specialized transactions for custom fee arrangements

Each transaction type requires specific parameters that the SDK automatically handles based on the position data.
## 
​
7. Error Handling
The script includes comprehensive error handling for:
 * Invalid API keys
 * Network connectivity issues
 * Invalid wallet addresses
 * Transaction failures
 * Rate limiting

Check the console output for detailed error messages and troubleshooting hints.
Get Token CreatorsTrade Tokens
⌘I
xgithublinkedin
Powered by


---

# Program IDs - Bags API Documentation

## URL
https://docs.bags.fm/principles/program-ids

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.552924

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Core Principles
Program IDs
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Active Programs
 * Program Overviews
 * Bags Fee Share V1 (Legacy)
 * Bags Fee Share V2 (Current)
 * Meteora DAMM v2
 * Meteora DBC
 * IDLs
 * Address Lookup Table
 * References
 * Verification Checklist

Core Principles
# Program IDs
OpenAIOpen in ChatGPT
Solana programs used by Bags and where to find their IDLs
OpenAIOpen in ChatGPT
This page lists the Solana programs actively used by Bags and shows where to find their Interface Definition Language (IDL) files.
All program IDs below refer to mainnet-beta deployments unless otherwise noted.
## 
​
Active Programs
Program | Purpose | Program ID 
---|---|--- 
Bags Fee Share V1 | Custom fee splits and fee claiming (legacy) | `FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi` 
Bags Fee Share V2 | Fee share configuration and claiming (current) | `FEE2tBhCKAt7shrod19QttSVREUYPiyMzoku1mL1gqVK` 
Meteora DAMM v2 | Post-migration tokens (AMM/pool after bonding curve graduation) | `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG` 
Meteora DBC | Token creation and bonding curve management | `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN` 
## 
​
Program Overviews
### 
​
Bags Fee Share V1 (Legacy)
 * **Purpose** : Legacy fee share program for custom fee splits and fee claiming.
 * **Program ID** : `FEEhPbKVKnco9EXnaY3i4R5rQVUx91wgVfu8qokixywi`
 * **Status** : Still supported for backward compatibility with existing positions

### 
​
Bags Fee Share V2 (Current)
 * **Purpose** : Current fee share program for configuring fee splits and claiming fees. Used by Token Launch v2.
 * **Program ID** : `FEE2tBhCKAt7shrod19QttSVREUYPiyMzoku1mL1gqVK`
 * **Features** : Supports multiple fee claimers, partner configurations, and lookup tables for large configurations

### 
​
Meteora DAMM v2
 * **Purpose** : AMM used by tokens after migrating from bonding curves; supports SPL and Token-2022 flows.
 * **Program ID** : `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG`
 * **More info** : See the Meteora developer docs.

### 
​
Meteora DBC
 * **Purpose** : Token creation and bonding curve lifecycle management prior to AMM migration.
 * **Program ID** : `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`
 * **More info** : See the Meteora developer docs.

## 
​
IDLs
 * **All actively used IDLs (including Meteora and Bags)** are available in the Bags SDK repository:
 * `bags-sdk` IDLs: `https://github.com/bagsfm/bags-sdk/tree/main/src/idl`

You can consume these IDLs directly in your build tooling or download them for offline use when generating clients.
## 
​
Address Lookup Table
 * To save on transaction size when interacting with Bags programs and instructions, you can use our public Address Lookup Table (LUT).
 * **LUT address** : `Eq1EVs15EAWww1YtPTtWPzJRLPJoS6VYP9oW9SbNr3yp`
 * It includes the most commonly used accounts and will be extended over time.

## 
​
References
 * Meteora Developer Guide: `https://docs.meteora.ag/developer-guide/home`
 * Bags SDK IDLs: `https://github.com/bagsfm/bags-sdk/tree/main/src/idl`

## 
​
Verification Checklist
 * **Network** : Ensure you are on mainnet-beta when interacting with the above program IDs.

Base URL & VersioningAddress Lookup Tables (LUTs)
⌘I
xgithublinkedin
Powered by


---

# Priority Fees and Tips - Bags API Documentation

## URL
https://docs.bags.fm/principles/tipping

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.553030

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Core Principles
Priority Fees and Tips
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Overview
 * Supported endpoints
 * How it works
 * Example payloads
 * Recommended providers
 * Validation and limits
 * Troubleshooting

Core Principles
# Priority Fees and Tips
OpenAIOpen in ChatGPT
How to optionally add tips to supported endpoints
OpenAIOpen in ChatGPT
### 
​
Overview
Some endpoints support adding an optional tip to a wallet of your choice. This lets you direct a portion of lamports to any provider (e.g., Jito, Astral) or a wallet you control when constructing transactions. By default, all transactions generated by these endpoints already include appropriate Compute Budget instructions:
 * `setComputeUnitLimit` and `setComputeUnitPrice` are set to optimize for reliable inclusion and cost-efficiency.
 * No tip is included by default. Tips are only added when you provide `tipWallet` and `tipLamports`.

### 
​
Supported endpoints
 * `POST /token-launch/create-launch-transaction`
 * `POST /fee-share/config` (fee share configuration creation)

These endpoints accept two optional fields in the request body:
 * `tipWallet` (string): Base58 encoded Solana public key of the tip recipient wallet.
 * `tipLamports` (number): Tip amount in lamports.

If omitted, no tip is included.
### 
​
How it works
When you include `tipWallet` and `tipLamports`, the API appends a tip transfer as the final instruction in the generated transaction(s). Priority fee settings (`setComputeUnitLimit` and `setComputeUnitPrice`) are always included regardless of tipping. You are responsible for:
 * Submitting and confirming the returned transaction(s)
 * Ensuring the provided `tipWallet` is valid and owned by the intended provider
 * Choosing an appropriate `tipLamports` value

Notes:
 * Tipping is purely optional and does not affect endpoint functionality when omitted.
 * There is no provider/key allowlist. You can use any valid Base58 encoded Solana public key for `tipWallet`.
 * The transaction fee payer funds both the network fees and the `tipLamports` transfer. Ensure the payer has sufficient SOL for all costs.

### 
​
Example payloads
Add a tip when creating a token launch transaction:
Copy
Ask AI
```
{
  "ipfs": "ipfs://...",
  "tokenMint": "...",
  "wallet": "...",
  "initialBuyLamports": 25000000,
  "configKey": "...",
  "tipWallet": "JitoOrAstralWalletBase58...",
  "tipLamports": 100000
}

```

Add a tip when creating a fee-share config:
Copy
Ask AI
```
{
  "payer": "...",
  "baseMint": "...",
  "feeClaimers": [
    {
      "user": "...",
      "userBps": 5000
    },
    {
      "user": "...",
      "userBps": 5000
    }
  ],
  "tipWallet": "TipRecipientBase58...",
  "tipLamports": 100000
}

```

### 
​
Recommended providers
You can use any valid Base58 Solana address for `tipWallet`. For compact transactions, we recommend using a recipient that is already included in our public Address Lookup Table (LUT): `Eq1EVs15EAWww1YtPTtWPzJRLPJoS6VYP9oW9SbNr3yp`. See Address Lookup Tables for details. Current provider recipients included in the LUT:
 * Jito:
 * `96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5`
 * `HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe`
 * `Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY`
 * `ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49`
 * `DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh`
 * `ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt`
 * `DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL`
 * `3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT`
 * bloXroute:
 * `HWEoBxYs7ssKuudEjzjmpfJVX7Dvi7wescFsVx2L5yoY`
 * `95cfoy472fcQHaw4tPGBTKpn6ZQnfEPfBgDQx6gcRmRg`
 * `3UQUKjhMKaY2S6bjcQD6yHB7utcZt5bfarRCmctpRtUd`
 * `FogxVNs6Mm2w9rnGL1vkARSwJxvLE8mujTv3LK8RnUhF`
 * Astral:
 * `astrazznxsGUhWShqgNtAdfrzP2G83DzcWVJDxwV9bF`
 * `astra4uejePWneqNaJKuFFA8oonqCE1sqF6b45kDMZm`
 * `astra9xWY93QyfG6yM8zwsKsRodscjQ2uU2HKNL5prk`
 * `astraRVUuTHjpwEVvNBeQEgwYx9w9CFyfxjYoobCZhL`
 * `astraEJ2fEj8Xmy6KLG7B3VfbKfsHXhHrNdCQx7iGJK`
 * `astraubkDw81n4LuutzSQ8uzHCv4BhPVhfvTcYv8SKC`
 * `astraZW5GLFefxNPAatceHhYjfA1ciq9gvfEg2S47xk`
 * `astrawVNP4xDBKT7rAdxrLYiTSTdqtUr63fSMduivXK`

If you have additional providers to recommend for inclusion in the LUT, reach out to us.
### 
​
Validation and limits
 * `tipWallet` must be a valid Base58 encoded Solana public key (any key is allowed; no allowlist)
 * `tipLamports` must be a positive integer within your balance constraints
 * The API does not currently enforce provider allowlists; use caution and verify recipients

### 
​
Troubleshooting
 * If a transaction fails to simulate or send, verify your `tipWallet`, `tipLamports`, and that your payer has sufficient SOL.
 * If you do not see the tip reflected on-chain, confirm the final submitted transaction includes the tip instruction and was confirmed.

Address Lookup Tables (LUTs)Error Handling
⌘I
xgithublinkedin
Powered by


---

# Rate Limits - Bags API Documentation

## URL
https://docs.bags.fm/principles/rate-limits

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.553115

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Core Principles
Rate Limits
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Rate Limit Overview
 * Endpoint-Specific Limits
 * Response Headers
 * Sliding Window System
 * Monitoring Usage
 * Rate Limit Exceeded
 * Rate Limit Planning
 * Calculate Request Budget

Core Principles
# Rate Limits
OpenAIOpen in ChatGPT
Understanding API rate limits and monitoring usage
OpenAIOpen in ChatGPT
The Bags API implements rate limiting to ensure fair usage and system stability.
## 
​
Rate Limit Overview
 * **Rate limit** : 1,000 requests per hour per user and per ip
 * **Scope** : Rate limits apply across all your API keys
 * **System** : Sliding hourly windows (not fixed periods)

## 
​
Endpoint-Specific Limits
Certain endpoints may enforce additional, endpoint-specific rate limits. These limits are intentionally not publicly disclosed and apply only to the affected endpoints. Under normal usage patterns you should not encounter these limits. If you do get rate limited, please reach out to us so we can help.
## 
​
Response Headers
Monitor your API usage through response headers included with every request:
 * **`X-RateLimit-Limit`**: Total requests allowed per hour (1,000)
 * **`X-RateLimit-Remaining`**: Requests remaining in current window
 * **`X-RateLimit-Reset`**: Unix timestamp when the limit resets

## 
​
Sliding Window System
Rate limits use sliding hourly windows rather than fixed periods:
 * Window 1: 1:00 PM - 2:00 PM
 * Window 2: 2:00 PM - 3:00 PM
 * And so on…

This means your rate limit resets continuously rather than at fixed times.
## 
​
Monitoring Usage
cURL
Node.js
Python
Copy
Ask AI
```
curl -I -X GET 'https://public-api-v2.bags.fm/ping' \
  -H 'x-api-key: YOUR_API_KEY'
# Response headers include:
# X-RateLimit-Limit: 1000
# X-RateLimit-Remaining: 999
# X-RateLimit-Reset: 1672531200

```

## 
​
Rate Limit Exceeded
When you exceed your rate limit, the API returns a `429` status with additional information:
Copy
Ask AI
```
{
  "success": false,
  "error": "Rate limit exceeded",
  "limit": 1000,
  "remaining": 0,
  "resetTime": 1672531200
}

```

## 
​
Rate Limit Planning
### 
​
Calculate Request Budget
Plan your API usage based on your application’s needs:
 * **1,000 requests/hour** = ~16.7 requests/minute = ~0.28 requests/second
 * **High-frequency apps** : Consider request batching or caching
 * **Background jobs** : Spread requests across the hour

Rate limits apply across all API keys for your account. Creating multiple API keys does not increase your rate limit.
If you need to increase your rate limit, please contact us.
Error HandlingFile Upload Support
⌘I
xgithublinkedin
Powered by


---

# File Upload Support - Bags API Documentation

## URL
https://docs.bags.fm/principles/file-uploads

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.553206

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Core Principles
File Upload Support
GuidesAPI referenceFAQ
##### Getting started
 * Bags API Documentation

##### How-to Guides
 * Set Up a TypeScript & Node.js Project
 * Launch a Token
 * Create Partner Key
 * Claim Partner Fees
 * Get Token Lifetime Fees
 * Get Token Creators
 * Claim Fees from Token Positions
 * Trade Tokens
 * Get Token Claim Events

##### Changelog
 * Changelog

##### Core Principles
 * Base URL & Versioning
 * Program IDs
 * Address Lookup Tables (LUTs)
 * Priority Fees and Tips
 * Error Handling
 * Rate Limits
 * File Upload Support
 * API Key Management

On this page
 * Upload Requirements
 * Basic File Upload
 * Single Image Upload
 * Advanced Upload Examples
 * Validate File Before Upload
 * Error Handling
 * Common Upload Errors
 * Best Practices

Core Principles
# File Upload Support
OpenAIOpen in ChatGPT
How to upload images and files through the Bags API
OpenAIOpen in ChatGPT
The Bags API supports file uploads for token creation with specific requirements and formats.
## 
​
Upload Requirements
 * **Maximum file size** : 15MB for image uploads
 * **Content-Type** : `multipart/form-data` for file upload endpoints
 * **File field name** : `image` (required field name for all image uploads)
 * **Supported formats** : PNG, JPG, JPEG, GIF, WebP

## 
​
Basic File Upload
### 
​
Single Image Upload
cURL
Node.js
Python
Copy
Ask AI
```
curl -X POST 'https://public-api-v2.bags.fm/api/v1/token-launch/create-token-info' \
  -H 'x-api-key: YOUR_API_KEY' \
  -H 'Content-Type: multipart/form-data' \
  -F 'image=@/path/to/your/image.png' \
  -F 'name=My Token' \
  -F 'symbol=MYTOKEN'

```

## 
​
Advanced Upload Examples
### 
​
Validate File Before Upload
Node.js
Python
Copy
Ask AI
```
function validateImageFile(file) {
  // Check file size (15MB = 15 * 1024 * 1024 bytes)
  const maxSize = 15 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size must be under 15MB');
  }
  // Check file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File must be PNG, JPG, JPEG, GIF, or WebP');
  }
  return true;
}
// Usage
try {
  validateImageFile(fileInput.files[0]);
  // Proceed with upload
} catch (error) {
  console.error('Validation error:', error.message);
}

```

## 
​
Error Handling
### 
​
Common Upload Errors
**File too large (413):**
Copy
Ask AI
```
{
  "success": false,
  "error": "Image file must be under 15MB"
}

```

**Invalid file type (400):**
Copy
Ask AI
```
{
  "success": false,
  "error": "Unsupported file type. Please upload PNG, JPG, JPEG, GIF, or WebP images."
}

```

**Missing file (400):**
Copy
Ask AI
```
{
  "success": false,
  "error": "Image file is required"
}

```

**Corrupted file (400):**
Copy
Ask AI
```
{
  "success": false,
  "error": "Invalid image file. Please check your file and try again."
}

```

## 
​
Best Practices
 1. **Always validate files client-side** before uploading to save bandwidth and API quota
 2. **Compress images** when possible to improve upload speed and user experience
 3. **Show progress indicators** for better user experience during uploads
 4. **Handle network interruptions** with retry logic for failed uploads
 5. **Use appropriate image formats** - PNG for graphics with transparency, JPEG for photos
 6. **Optimize image dimensions** - resize to appropriate dimensions before upload

Uploaded images are processed and optimized by the Bags system. The final image URL may differ from your uploaded version.
Consider implementing client-side image compression to improve upload speeds and stay within file size limits.
Rate LimitsAPI Key Management
⌘I
xgithublinkedin
Powered by


---

# API Reference - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/introduction

## Metadata
- Depth: 1
- Timestamp: 2026-01-27T21:18:59.553284

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
API documentation
API Reference
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

On this page
 * Welcome
 * Base URL
 * Authentication
 * Public Key Format
 * Response Format
 * Available Endpoints

API documentation
# API Reference
OpenAIOpen in ChatGPT
Complete documentation for all Bags API endpoints
OpenAIOpen in ChatGPT
## 
​
Welcome
The Bags API provides comprehensive functionality for managing API keys and launching tokens on the Solana blockchain. This reference documents all available endpoints with detailed examples.
## 
​
Base URL
All API endpoints use the following base URL:
Copy
Ask AI
```
https://public-api-v2.bags.fm/api/v1/

```

## 
​
Authentication
The Bags API uses API key authentication. Include your API key in the `x-api-key` header:
Copy
Ask AI
```
curl -H "x-api-key: YOUR_API_KEY" \
  https://public-api-v2.bags.fm/api/v1/endpoint

```

**Required for all endpoints except public analytics endpoints.** Get your API key from the Bags Developer Dashboard.
## 
​
Public Key Format
Throughout this documentation, when we refer to “public key” we always mean **Base58 encoded public keys**. This is the standard format used by Solana for representing wallet addresses, token mints, and other on-chain accounts.
## 
​
Response Format
All API responses follow a consistent format: **Success Response:**
Copy
Ask AI
```
{
  "success": true,
  "response": {
    // Response data here
  }
}

```

**Error Response:**
Copy
Ask AI
```
{
  "success": false,
  "error": "Error message description"
}

```

## 
​
Available Endpoints
The API provides the following functionality:
 * **Token Launch** : Create and manage token launches with metadata and initial purchases
 * **Fee Sharing** : Configure custom fee sharing between wallets
 * **Analytics** : Retrieve token lifetime fees and creator information
 * **Fee Claiming** : Generate transactions to claim fees from various sources

All endpoints are documented below with request/response schemas, parameters, and examples.
Create Token Info and Metadata
⌘I
xgithublinkedin
Powered by


---

# Create Fee Share Config creation transaction - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/create-fee-share-configuration

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.553426

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Fee Share
Create Fee Share Config creation transaction
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Create Fee Share Config creation transaction (v2)
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/fee-share/config \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "payer": "<string>",
  "baseMint": "<string>",
  "claimersArray": [
    "<string>"
  ],
  "basisPointsArray": [
    123
  ],
  "partner": "<string>",
  "partnerConfig": "<string>",
  "additionalLookupTables": [
    "<string>"
  ],
  "tipWallet": "<string>",
  "tipLamports": 123
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "needsCreation": true,
    "feeShareAuthority": "<string>",
    "meteoraConfigKey": "<string>",
    "transactions": [
      {
        "blockhash": {
          "blockhash": "<string>",
          "lastValidBlockHeight": 123
        },
        "transaction": "<string>"
      }
    ],
    "bundles": [
      [
        {
          "blockhash": {
            "blockhash": "<string>",
            "lastValidBlockHeight": 123
          },
          "transaction": "<string>"
        }
      ]
    ]
  }
}
```

Fee Share
# Create Fee Share Config creation transaction
OpenAIOpen in ChatGPT
Create a fee sharing config with multiple fee claimers (up to 100). Token Launches require fee sharing configuration for all token launches. All fees must be explicitly allocated using basis points. When there are more than 15 fee claimers, lookup tables are required.
OpenAIOpen in ChatGPT
POST
/
fee-share
/
config
Try it
Create Fee Share Config creation transaction (v2)
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/fee-share/config \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "payer": "<string>",
  "baseMint": "<string>",
  "claimersArray": [
    "<string>"
  ],
  "basisPointsArray": [
    123
  ],
  "partner": "<string>",
  "partnerConfig": "<string>",
  "additionalLookupTables": [
    "<string>"
  ],
  "tipWallet": "<string>",
  "tipLamports": 123
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "needsCreation": true,
    "feeShareAuthority": "<string>",
    "meteoraConfigKey": "<string>",
    "transactions": [
      {
        "blockhash": {
          "blockhash": "<string>",
          "lastValidBlockHeight": 123
        },
        "transaction": "<string>"
      }
    ],
    "bundles": [
      [
        {
          "blockhash": {
            "blockhash": "<string>",
            "lastValidBlockHeight": 123
          },
          "transaction": "<string>"
        }
      ]
    ]
  }
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Body
application/json
​
payer
string
required
Public key of the payer wallet
​
baseMint
string
required
Public key of the base mint (the token being launched)
​
claimersArray
string[]
required
Array of fee claimer wallet public keys. Must align with basisPointsArray. Maximum 100 fee claimers.
Required array length: `1 - 100` elements
Public key of a fee claimer wallet
​
basisPointsArray
number[]
required
Array of basis points for each fee claimer. Must align with claimersArray. Total must equal 10,000.
Required array length: `1 - 100` elements
Basis points allocated to the corresponding claimer
​
partner
string | null
Optional: Public key of the partner wallet for partner fee sharing
​
partnerConfig
string | null
Optional: Public key of the partner config PDA (required if partner is provided)
​
additionalLookupTables
string[] | null
Optional: Array of lookup table addresses. Required when there are more than 15 fee claimers.
Public key of a lookup table address
​
tipWallet
string | null
Base58 encoded Solana public key of the tip recipient wallet
​
tipLamports
number | null
Tip amount in lamports
#### Response
200
application/json
Successfully created fee share config
​
success
boolean
required
Example:
`true`
​
response
object
Show child attributes
Get Fee Share Wallet V2 (Bulk)Get Token Launch Creators
⌘I
xgithublinkedin
Powered by


---

# Get Partner Stats - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/get-partner-stats

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.553496

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Partner
Get Partner Stats
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get partner stats
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/fee-share/partner-config/stats \
  --header 'x-api-key: <api-key>'
```

200
401
404
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "claimedFees": "<string>",
    "unclaimedFees": "<string>"
  }
}
```

Partner
# Get Partner Stats
OpenAIOpen in ChatGPT
Retrieve partner statistics including claimed and unclaimed fees for a given partner
OpenAIOpen in ChatGPT
GET
/
fee-share
/
partner-config
/
stats
Try it
Get partner stats
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/fee-share/partner-config/stats \
  --header 'x-api-key: <api-key>'
```

200
401
404
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "claimedFees": "<string>",
    "unclaimedFees": "<string>"
  }
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Query Parameters
​
partner
string
required
Public key of the partner wallet
#### Response
200
application/json
Successfully retrieved partner claim stats
​
success
boolean
required
Example:
`true`
​
response
object
Show child attributes
Create Swap TransactionCreate Partner Claim Transactions
⌘I
xgithublinkedin
Powered by


---

# Get Fee Share Wallet V2 (Bulk) - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/get-fee-share-wallet-bulk

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.553572

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Fee Share
Get Fee Share Wallet V2 (Bulk)
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get fee share wallets (bulk, v2)
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/fee-share/wallet/v2/bulk \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "items": [
    {
      "username": "<string>",
      "provider": "twitter"
    }
  ]
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": [
    {
      "username": "<string>",
      "provider": "twitter",
      "platformData": {
        "id": "<string>",
        "username": "<string>",
        "display_name": "<string>",
        "avatar_url": "<string>"
      },
      "wallet": "<string>"
    }
  ]
}
```

Fee Share
# Get Fee Share Wallet V2 (Bulk)
OpenAIOpen in ChatGPT
Bulk lookup of wallet addresses associated with social providers and usernames for fee sharing
OpenAIOpen in ChatGPT
POST
/
token-launch
/
fee-share
/
wallet
/
v2
/
bulk
Try it
Get fee share wallets (bulk, v2)
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/fee-share/wallet/v2/bulk \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "items": [
    {
      "username": "<string>",
      "provider": "twitter"
    }
  ]
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": [
    {
      "username": "<string>",
      "provider": "twitter",
      "platformData": {
        "id": "<string>",
        "username": "<string>",
        "display_name": "<string>",
        "avatar_url": "<string>"
      },
      "wallet": "<string>"
    }
  ]
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Body
application/json
​
items
object[]
required
Array of lookups (1-100). Duplicate username+provider combinations are not allowed.
Required array length: `1 - 100` elements
Show child attributes
#### Response
200
application/json
Successfully retrieved wallet addresses for all requested items
​
success
enum<boolean>
required
Available options:
`true`,
`false`
​
response
object[]
required
Per-item results matching the input order
Show child attributes
Get Fee Share Wallet V2Create Fee Share Config creation transaction
⌘I
xgithublinkedin
Powered by


---

# Bags Help Center

## URL
https://support.bags.fm/en

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.553594

## Content
Skip to main content
Bags Help Center
English
English
# How can we help?
Search for articles...

Bags Help Center
Report Content


---

# Get Fee Share Wallet V2 - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/get-fee-share-wallet

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.553663

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Fee Share
Get Fee Share Wallet V2
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get fee share wallet (v2)
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/fee-share/wallet/v2 \
  --header 'x-api-key: <api-key>'
```

200
400
401
404
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "provider": "twitter",
    "platformData": {
      "id": "<string>",
      "username": "<string>",
      "display_name": "<string>",
      "avatar_url": "<string>"
    },
    "wallet": "<string>"
  }
}
```

Fee Share
# Get Fee Share Wallet V2
OpenAIOpen in ChatGPT
Get wallet address associated with a social provider and username for fee sharing
OpenAIOpen in ChatGPT
GET
/
token-launch
/
fee-share
/
wallet
/
v2
Try it
Get fee share wallet (v2)
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/fee-share/wallet/v2 \
  --header 'x-api-key: <api-key>'
```

200
400
401
404
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "provider": "twitter",
    "platformData": {
      "id": "<string>",
      "username": "<string>",
      "display_name": "<string>",
      "avatar_url": "<string>"
    },
    "wallet": "<string>"
  }
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Query Parameters
​
provider
enum<string>
required
Social provider (e.g., twitter, instagram, github) Supported social/auth providers
Available options:
`apple`,
`google`,
`email`,
`solana`,
`twitter`,
`tiktok`,
`kick`,
`instagram`,
`onlyfans`,
`github`
Example:
`"twitter"`
​
username
string
required
Username/handle on the provider platform
Required string length: `1 - 100`
#### Response
200
application/json
Successfully retrieved wallet address
​
success
enum<boolean>
required
Available options:
`true`,
`false`
​
response
object
required
Show child attributes
Create Token Launch TransactionGet Fee Share Wallet V2 (Bulk)
⌘I
xgithublinkedin
Powered by


---

# Get Claim Transactions - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/get-claim-transactions

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.553764

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Fee Claiming
Get Claim Transactions
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get claim transactions (v2)
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/claim-txs/v2 \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "feeClaimer": "<string>",
  "tokenMint": "<string>",
  "virtualPoolAddress": "<string>",
  "dammV2Position": "<string>",
  "dammV2Pool": "<string>",
  "dammV2PositionNftAccount": "<string>",
  "tokenAMint": "<string>",
  "tokenBMint": "<string>",
  "tokenAVault": "<string>",
  "tokenBVault": "<string>",
  "claimVirtualPoolFees": true,
  "claimDammV2Fees": true,
  "isCustomFeeVault": true,
  "feeShareProgramId": "<string>",
  "customFeeVaultClaimerA": "<string>",
  "customFeeVaultClaimerB": "<string>",
  "customFeeVaultClaimerSide": "A"
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": [
    {
      "tx": "<string>",
      "blockhash": {
        "blockhash": "<string>",
        "lastValidBlockHeight": 123
      }
    }
  ]
}
```

Fee Claiming
# Get Claim Transactions
OpenAIOpen in ChatGPT
Generate transactions to claim fees from virtual pools and/or DAMM v2 positions or custom fee vaults. Supports both v1 and v2 fee share programs.
OpenAIOpen in ChatGPT
POST
/
token-launch
/
claim-txs
/
v2
Try it
Get claim transactions (v2)
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/claim-txs/v2 \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "feeClaimer": "<string>",
  "tokenMint": "<string>",
  "virtualPoolAddress": "<string>",
  "dammV2Position": "<string>",
  "dammV2Pool": "<string>",
  "dammV2PositionNftAccount": "<string>",
  "tokenAMint": "<string>",
  "tokenBMint": "<string>",
  "tokenAVault": "<string>",
  "tokenBVault": "<string>",
  "claimVirtualPoolFees": true,
  "claimDammV2Fees": true,
  "isCustomFeeVault": true,
  "feeShareProgramId": "<string>",
  "customFeeVaultClaimerA": "<string>",
  "customFeeVaultClaimerB": "<string>",
  "customFeeVaultClaimerSide": "A"
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": [
    {
      "tx": "<string>",
      "blockhash": {
        "blockhash": "<string>",
        "lastValidBlockHeight": 123
      }
    }
  ]
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Body
application/json
​
feeClaimer
string
required
Public key of the fee claimer wallet
​
tokenMint
string
required
Token mint public key
​
virtualPoolAddress
string | null
Virtual pool address (required if claimVirtualPoolFees is true)
​
dammV2Position
string | null
DAMM v2 position public key
​
dammV2Pool
string | null
DAMM v2 pool public key
​
dammV2PositionNftAccount
string | null
DAMM v2 position NFT account public key
​
tokenAMint
string | null
Token A mint public key
​
tokenBMint
string | null
Token B mint public key
​
tokenAVault
string | null
Token A vault public key
​
tokenBVault
string | null
Token B vault public key
​
claimVirtualPoolFees
boolean | null
Whether to claim virtual pool fees
​
claimDammV2Fees
boolean | null
Whether to claim DAMM v2 fees
​
isCustomFeeVault
boolean | null
Whether using a custom fee vault (true for fee share v1 or v2 programs)
​
feeShareProgramId
string | null
Program ID of the fee share program being used. Required when isCustomFeeVault is true.
​
customFeeVaultClaimerA
string | null
Custom fee vault claimer A public key (for v1 fee share)
​
customFeeVaultClaimerB
string | null
Custom fee vault claimer B public key (for v1 fee share)
​
customFeeVaultClaimerSide
enum<string> | null
Which side of the custom fee vault to claim for (for v1 fee share)
Available options:
`A`,
`B`
#### Response
200
application/json
Successfully generated claim transactions
​
success
boolean
required
Example:
`true`
​
response
object[]
Show child attributes
Get Claimable PositionsGet Trade Quote
⌘I
xgithublinkedin
Powered by


---

# How to display social profile on token page? - Bags API Documentation

## URL
https://docs.bags.fm/faq/linking-wallets

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.553825

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Frequently Asked Questions
How to display social profile on token page?
GuidesAPI referenceFAQ
##### Frequently Asked Questions
 * What is the Bags API?
 * How do I get an API key?
 * How to display social profile on token page?
 * What are the rate limits?
 * Do I need a Solana wallet to use the API?

On this page
 * How to display social profile on token page?
 * How to Export Your Bags Wallet to Phantom

Frequently Asked Questions
# How to display social profile on token page?
OpenAIOpen in ChatGPT
Learn how to link your wallet to Bags to display your identity when creating tokens via API
OpenAIOpen in ChatGPT
## 
​
How to display social profile on token page?
When launching your token via API, you can choose any wallet address. 
However, the **creator identity shown on the token page** depends on the wallet you use:
## 🔒 Option 1 — External Wallet (via API)
If you use **any external wallet address** , your token page will display only the wallet address.!External Wallet Example
## 🌐 Option 2 — Bags Wallet (via Bags Login)
Use your **Bags wallet** (export the private key from Bags.fm) when creating tokens via API. Your token page will display your **social profiles** (X, GitHub, Kick, TikTok) instead of just a wallet address.!Bags Wallet Example
## 
​
How to Export Your Bags Wallet to Phantom
Follow these simple steps to use your Bags wallet externally (e.g., with the API or Phantom):
 1. Visit bags.fm
 2. Log in with your credentials
 3. Tap your **username / profile picture** in the top-right corner
 4. Select **My Wallets** → **Export Private Key** for the wallet you want to export 
_(Do this only in a safe, private environment)_
 5. Tap **Copy Key** to copy the private key to your clipboard
 6. You can now import your private key into any wallet app (such as Phantom), or use it in your API scripts to launch a token. 
- To launch a token with your exported wallet, follow our Token Launch Guide.

Keep your private key safe — store it offline (e.g., written on paper or in a password manager). 
Never share it publicly or in untrusted apps.
If you encounter any issues, please contact the Bags team via support or your Bags dashboard.
How do I get an API key?What are the rate limits?
⌘I
xgithublinkedin
Powered by


---

# Create Token Info and Metadata - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/create-token-info

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.553924

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Token Launch
Create Token Info and Metadata
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Create token info and Metadata
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/create-token-info \
  --header 'Content-Type: multipart/form-data' \
  --header 'x-api-key: <api-key>' \
  --form 'image=<string>' \
  --form 'name=<string>' \
  --form 'symbol=<string>' \
  --form 'description=<string>' \
  --form 'imageUrl=<string>' \
  --form 'metadataUrl=<string>' \
  --form 'telegram=<string>' \
  --form 'twitter=<string>' \
  --form 'website=<string>' \
  --form 0.image='@example-file' \
  --form 1.image='@example-file' \
  --form 2.image='@example-file'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "tokenMint": "<string>",
    "tokenMetadata": "<string>",
    "tokenLaunch": {
      "name": "<string>",
      "symbol": "<string>",
      "description": "<string>",
      "image": "<string>",
      "tokenMint": "<string>",
      "status": "PRE_LAUNCH",
      "createdAt": "2023-11-07T05:31:56Z",
      "updatedAt": "2023-11-07T05:31:56Z",
      "userId": "<string>",
      "telegram": "<string>",
      "twitter": "<string>",
      "website": "<string>",
      "launchWallet": "<string>",
      "launchSignature": "<string>",
      "uri": "<string>"
    }
  }
}
```

Token Launch
# Create Token Info and Metadata
OpenAIOpen in ChatGPT
Create token information with image upload and generate a token mint that can be used to launch a token
OpenAIOpen in ChatGPT
POST
/
token-launch
/
create-token-info
Try it
Create token info and Metadata
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/create-token-info \
  --header 'Content-Type: multipart/form-data' \
  --header 'x-api-key: <api-key>' \
  --form 'image=<string>' \
  --form 'name=<string>' \
  --form 'symbol=<string>' \
  --form 'description=<string>' \
  --form 'imageUrl=<string>' \
  --form 'metadataUrl=<string>' \
  --form 'telegram=<string>' \
  --form 'twitter=<string>' \
  --form 'website=<string>' \
  --form 0.image='@example-file' \
  --form 1.image='@example-file' \
  --form 2.image='@example-file'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "tokenMint": "<string>",
    "tokenMetadata": "<string>",
    "tokenLaunch": {
      "name": "<string>",
      "symbol": "<string>",
      "description": "<string>",
      "image": "<string>",
      "tokenMint": "<string>",
      "status": "PRE_LAUNCH",
      "createdAt": "2023-11-07T05:31:56Z",
      "updatedAt": "2023-11-07T05:31:56Z",
      "userId": "<string>",
      "telegram": "<string>",
      "twitter": "<string>",
      "website": "<string>",
      "launchWallet": "<string>",
      "launchSignature": "<string>",
      "uri": "<string>"
    }
  }
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Body
multipart/form-data
 * Option 1
 * Option 2
 * Option 3

Provide either an image file or imageUrl. If metadataUrl is provided, we will not upload metadata to IPFS.
​
image
file
required
Token image file (optional if imageUrl is provided)
​
name
string
required
Token name (max 32 characters)
Maximum string length: `32`
​
symbol
string
required
Token symbol (will be converted to UPPERCASE; max 10 characters)
Maximum string length: `10`
​
description
string
required
Token description (max 1000 characters)
Maximum string length: `1000`
​
imageUrl
string<uri>
Public URL to the token image (optional if image is provided)
​
metadataUrl
string<uri>
URL to a JSON metadata file. When provided, the API will not upload metadata to IPFS and will use this URL as-is. The JSON must match the fields submitted in this request.
​
telegram
string | null
Telegram URL
​
twitter
string | null
Twitter URL
​
website
string | null
Website URL
#### Response
200
application/json
Successfully created token info
​
success
boolean
required
Example:
`true`
​
response
object
Show child attributes
API ReferenceCreate Token Launch Transaction
⌘I
xgithublinkedin
Powered by


---

# Get Trade Quote - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/get-trade-quote

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554021

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Trade
Get Trade Quote
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get trade quote
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/trade/quote \
  --header 'x-api-key: <api-key>'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "requestId": "<string>",
    "contextSlot": 123,
    "inAmount": "<string>",
    "inputMint": "<string>",
    "outAmount": "<string>",
    "outputMint": "<string>",
    "minOutAmount": "<string>",
    "otherAmountThreshold": "<string>",
    "priceImpactPct": "<string>",
    "slippageBps": 123,
    "routePlan": [
      {
        "venue": "<string>",
        "inAmount": "<string>",
        "outAmount": "<string>",
        "inputMint": "<string>",
        "outputMint": "<string>",
        "inputMintDecimals": 123,
        "outputMintDecimals": 123,
        "marketKey": "<string>",
        "data": "<string>"
      }
    ],
    "platformFee": {
      "amount": "<string>",
      "feeBps": 123,
      "feeAccount": "<string>",
      "segmenterFeeAmount": "<string>",
      "segmenterFeePct": 123
    },
    "outTransferFee": "<string>",
    "simulatedComputeUnits": 123
  }
}
```

Trade
# Get Trade Quote
OpenAIOpen in ChatGPT
Get a quote for swapping tokens. Returns expected output amount, price impact, slippage, and route plan.
OpenAIOpen in ChatGPT
GET
/
trade
/
quote
Try it
Get trade quote
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/trade/quote \
  --header 'x-api-key: <api-key>'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "requestId": "<string>",
    "contextSlot": 123,
    "inAmount": "<string>",
    "inputMint": "<string>",
    "outAmount": "<string>",
    "outputMint": "<string>",
    "minOutAmount": "<string>",
    "otherAmountThreshold": "<string>",
    "priceImpactPct": "<string>",
    "slippageBps": 123,
    "routePlan": [
      {
        "venue": "<string>",
        "inAmount": "<string>",
        "outAmount": "<string>",
        "inputMint": "<string>",
        "outputMint": "<string>",
        "inputMintDecimals": 123,
        "outputMintDecimals": 123,
        "marketKey": "<string>",
        "data": "<string>"
      }
    ],
    "platformFee": {
      "amount": "<string>",
      "feeBps": 123,
      "feeAccount": "<string>",
      "segmenterFeeAmount": "<string>",
      "segmenterFeePct": 123
    },
    "outTransferFee": "<string>",
    "simulatedComputeUnits": 123
  }
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Query Parameters
​
inputMint
string
required
Public key of the input token mint
​
outputMint
string
required
Public key of the output token mint
​
amount
number
required
Amount to swap in the token's smallest unit (e.g., lamports for SOL)
​
slippageMode
enum<string>
default:auto
Slippage mode: 'auto' for automatic calculation, 'manual' for user-specified slippage
Available options:
`auto`,
`manual`
​
slippageBps
number
Slippage tolerance in basis points (0-10000, where 10000 = 100%). Required when slippageMode is 'manual'
Required range: `0 <= x <= 10000`
#### Response
200
application/json
Successfully retrieved trade quote
​
success
boolean
required
Example:
`true`
​
response
object
Show child attributes
Get Claim TransactionsCreate Swap Transaction
⌘I
xgithublinkedin
Powered by


---

# Get Token Claim Stats - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/get-token-claim-stats

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554096

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Analytics
Get Token Claim Stats
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get token claim stats
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/claim-stats \
  --header 'x-api-key: <api-key>'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": [
    {
      "username": "<string>",
      "pfp": "<string>",
      "royaltyBps": 123,
      "isCreator": true,
      "wallet": "<string>",
      "totalClaimed": "<string>",
      "provider": "twitter",
      "providerUsername": "<string>"
    }
  ]
}
```

Analytics
# Get Token Claim Stats
OpenAIOpen in ChatGPT
Retrieve claim statistics for all fee claimers of a specific token, including total claimed amounts per user.
OpenAIOpen in ChatGPT
GET
/
token-launch
/
claim-stats
Try it
Get token claim stats
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/claim-stats \
  --header 'x-api-key: <api-key>'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": [
    {
      "username": "<string>",
      "pfp": "<string>",
      "royaltyBps": 123,
      "isCreator": true,
      "wallet": "<string>",
      "totalClaimed": "<string>",
      "provider": "twitter",
      "providerUsername": "<string>"
    }
  ]
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Query Parameters
​
tokenMint
string
required
Public key of the token mint
#### Response
200
application/json
Successfully retrieved token claim stats
​
success
boolean
required
Example:
`true`
​
response
object[]
Show child attributes
Get Token Lifetime FeesGet Token Claim Events
⌘I
xgithublinkedin
Powered by


---

# FAQs | Bags Help Center

## URL
https://support.bags.fm/en/collections/18014326-faqs

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554123

## Content
Skip to main content
Bags Help Center
English
English
Search for articles...
All Collections
FAQs

# FAQs
Answers to frequently asked questions.
!bags support avatar
By bags support1 author
How to launch a TokenDeposit Funds to WalletClaim FeesDividends PayoutHow to see claimed RoyaltiesError Launching TokenDiscordExport Wallet to PhantomTaking Sol but not creating TokenAPI DocsWithdraw to FiatSol needed to launchHow to search TokenExport Private KeyLiquidityPrivate Key vs Seed PhraseChange Royalty RecipientRoyalty % Earned
Bags Help Center
Report Content


---

# Get Token Lifetime Fees - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/get-token-lifetime-fees

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554179

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Analytics
Get Token Lifetime Fees
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get token lifetime fees
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/lifetime-fees \
  --header 'x-api-key: <api-key>'
```

200
400
500
Copy
Ask AI
```
{
  "success": true,
  "response": "<string>"
}
```

Analytics
# Get Token Lifetime Fees
OpenAIOpen in ChatGPT
Retrieve the total lifetime fees collected for a specific token
OpenAIOpen in ChatGPT
GET
/
token-launch
/
lifetime-fees
Try it
Get token lifetime fees
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/lifetime-fees \
  --header 'x-api-key: <api-key>'
```

200
400
500
Copy
Ask AI
```
{
  "success": true,
  "response": "<string>"
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Query Parameters
​
tokenMint
string
required
Public key of the token mint
#### Response
200
application/json
Successfully retrieved token lifetime fees
​
success
boolean
required
Example:
`true`
​
response
string
Total lifetime fees collected in lamports (as string to support bigint casting)
Get Token Launch CreatorsGet Token Claim Stats
⌘I
xgithublinkedin
Powered by


---

# Create Swap Transaction - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/create-swap-transaction

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554271

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Trade
Create Swap Transaction
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Create swap transaction
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/trade/swap \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "quoteResponse": {
    "requestId": "<string>",
    "contextSlot": 123,
    "inAmount": "<string>",
    "inputMint": "<string>",
    "outAmount": "<string>",
    "outputMint": "<string>",
    "minOutAmount": "<string>",
    "otherAmountThreshold": "<string>",
    "priceImpactPct": "<string>",
    "slippageBps": 123,
    "routePlan": [
      {
        "venue": "<string>",
        "inAmount": "<string>",
        "outAmount": "<string>",
        "inputMint": "<string>",
        "outputMint": "<string>",
        "inputMintDecimals": 123,
        "outputMintDecimals": 123,
        "marketKey": "<string>",
        "data": "<string>"
      }
    ],
    "platformFee": {
      "amount": "<string>",
      "feeBps": 123,
      "feeAccount": "<string>",
      "segmenterFeeAmount": "<string>",
      "segmenterFeePct": 123
    },
    "outTransferFee": "<string>",
    "simulatedComputeUnits": 123
  },
  "userPublicKey": "<string>"
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "swapTransaction": "<string>",
    "computeUnitLimit": 123,
    "lastValidBlockHeight": 123,
    "prioritizationFeeLamports": 123
  }
}
```

Trade
# Create Swap Transaction
OpenAIOpen in ChatGPT
Create a swap transaction from a trade quote. The transaction is ready to be signed and sent.
OpenAIOpen in ChatGPT
POST
/
trade
/
swap
Try it
Create swap transaction
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/trade/swap \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "quoteResponse": {
    "requestId": "<string>",
    "contextSlot": 123,
    "inAmount": "<string>",
    "inputMint": "<string>",
    "outAmount": "<string>",
    "outputMint": "<string>",
    "minOutAmount": "<string>",
    "otherAmountThreshold": "<string>",
    "priceImpactPct": "<string>",
    "slippageBps": 123,
    "routePlan": [
      {
        "venue": "<string>",
        "inAmount": "<string>",
        "outAmount": "<string>",
        "inputMint": "<string>",
        "outputMint": "<string>",
        "inputMintDecimals": 123,
        "outputMintDecimals": 123,
        "marketKey": "<string>",
        "data": "<string>"
      }
    ],
    "platformFee": {
      "amount": "<string>",
      "feeBps": 123,
      "feeAccount": "<string>",
      "segmenterFeeAmount": "<string>",
      "segmenterFeePct": 123
    },
    "outTransferFee": "<string>",
    "simulatedComputeUnits": 123
  },
  "userPublicKey": "<string>"
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "swapTransaction": "<string>",
    "computeUnitLimit": 123,
    "lastValidBlockHeight": 123,
    "prioritizationFeeLamports": 123
  }
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Body
application/json
​
quoteResponse
object
required
The quote response from the getQuote endpoint
Show child attributes
​
userPublicKey
string
required
Public key of the user's wallet
#### Response
200
application/json
Successfully created swap transaction
​
success
boolean
required
Example:
`true`
​
response
object
Show child attributes
Get Trade QuoteGet Partner Stats
⌘I
xgithublinkedin
Powered by


---

# Create Token Launch Transaction - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/create-token-launch-transaction

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554352

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Token Launch
Create Token Launch Transaction
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Create token launch transaction
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/create-launch-transaction \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "ipfs": "<string>",
  "tokenMint": "<string>",
  "wallet": "<string>",
  "initialBuyLamports": 123,
  "configKey": "<string>",
  "tipWallet": "<string>",
  "tipLamports": 123
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": "<string>"
}
```

Token Launch
# Create Token Launch Transaction
OpenAIOpen in ChatGPT
Create a token launch transaction (already signed with token mint)
OpenAIOpen in ChatGPT
POST
/
token-launch
/
create-launch-transaction
Try it
Create token launch transaction
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/create-launch-transaction \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "ipfs": "<string>",
  "tokenMint": "<string>",
  "wallet": "<string>",
  "initialBuyLamports": 123,
  "configKey": "<string>",
  "tipWallet": "<string>",
  "tipLamports": 123
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": "<string>"
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Body
application/json
​
ipfs
string
required
IPFS URL of the token metadata
​
tokenMint
string
required
Public key of the token mint
​
wallet
string
required
Public key of the wallet
​
initialBuyLamports
number
required
Initial buy amount in lamports
​
configKey
string
required
Config key from create-config endpoint
​
tipWallet
string
Base58 encoded Solana public key of the tip recipient wallet
​
tipLamports
number
Tip amount in lamports
#### Response
200
application/json
Successfully created token launch transaction
​
success
boolean
required
Example:
`true`
​
response
string
Base58 encoded serialized transaction
Create Token Info and MetadataGet Fee Share Wallet V2
⌘I
xgithublinkedin
Powered by


---

# Get Claimable Positions - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/get-claimable-positions

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554436

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Fee Claiming
Get Claimable Positions
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get claimable positions
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/claimable-positions \
  --header 'x-api-key: <api-key>'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": [
    {
      "isCustomFeeVault": true,
      "baseMint": "<string>",
      "isMigrated": true,
      "totalClaimableLamportsUserShare": 123,
      "programId": "<string>",
      "quoteMint": "<string>",
      "virtualPool": "<string>",
      "virtualPoolAddress": "<string>",
      "virtualPoolClaimableAmount": 123,
      "virtualPoolClaimableLamportsUserShare": 123,
      "dammPoolClaimableAmount": 123,
      "dammPoolClaimableLamportsUserShare": 123,
      "dammPoolAddress": "<string>",
      "dammPositionInfo": {
        "position": "<string>",
        "pool": "<string>",
        "positionNftAccount": "<string>",
        "tokenAMint": "<string>",
        "tokenBMint": "<string>",
        "tokenAVault": "<string>",
        "tokenBVault": "<string>"
      },
      "claimableDisplayAmount": 123,
      "user": "<string>",
      "claimerIndex": 123,
      "userBps": 123,
      "customFeeVault": "<string>",
      "customFeeVaultClaimerA": "<string>",
      "customFeeVaultClaimerB": "<string>",
      "customFeeVaultClaimerSide": "A"
    }
  ]
}
```

Fee Claiming
# Get Claimable Positions
OpenAIOpen in ChatGPT
Retrieve all claimable fee positions for a wallet. Returns positions with fee information from virtual pools and DAMM v2.
OpenAIOpen in ChatGPT
GET
/
token-launch
/
claimable-positions
Try it
Get claimable positions
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/claimable-positions \
  --header 'x-api-key: <api-key>'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": [
    {
      "isCustomFeeVault": true,
      "baseMint": "<string>",
      "isMigrated": true,
      "totalClaimableLamportsUserShare": 123,
      "programId": "<string>",
      "quoteMint": "<string>",
      "virtualPool": "<string>",
      "virtualPoolAddress": "<string>",
      "virtualPoolClaimableAmount": 123,
      "virtualPoolClaimableLamportsUserShare": 123,
      "dammPoolClaimableAmount": 123,
      "dammPoolClaimableLamportsUserShare": 123,
      "dammPoolAddress": "<string>",
      "dammPositionInfo": {
        "position": "<string>",
        "pool": "<string>",
        "positionNftAccount": "<string>",
        "tokenAMint": "<string>",
        "tokenBMint": "<string>",
        "tokenAVault": "<string>",
        "tokenBVault": "<string>"
      },
      "claimableDisplayAmount": 123,
      "user": "<string>",
      "claimerIndex": 123,
      "userBps": 123,
      "customFeeVault": "<string>",
      "customFeeVaultClaimerA": "<string>",
      "customFeeVaultClaimerB": "<string>",
      "customFeeVaultClaimerSide": "A"
    }
  ]
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Query Parameters
​
wallet
string
required
Public key of the wallet to check for claimable positions
#### Response
200
application/json
Successfully retrieved claimable positions
​
success
boolean
required
Example:
`true`
​
response
object[]
Show child attributes
Get Pool Config Keys by Fee Claimer VaultsGet Claim Transactions
⌘I
xgithublinkedin
Powered by


---

# How do I get an API key? - Bags API Documentation

## URL
https://docs.bags.fm/faq/how-to-get-api-key

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554483

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Frequently Asked Questions
How do I get an API key?
GuidesAPI referenceFAQ
##### Frequently Asked Questions
 * What is the Bags API?
 * How do I get an API key?
 * How to display social profile on token page?
 * What are the rate limits?
 * Do I need a Solana wallet to use the API?

On this page
 * How do I get an API key?
 * Steps to Get Your API Key
 * Using Your API Key
 * Managing API Keys

Frequently Asked Questions
# How do I get an API key?
OpenAIOpen in ChatGPT
Step-by-step guide to obtaining your Bags API key
OpenAIOpen in ChatGPT
## 
​
How do I get an API key?
Getting an API key is simple and only takes a few minutes.
### 
​
Steps to Get Your API Key
 1. Visit dev.bags.fm and sign in to your account
 2. Navigate to the **API Keys** section
 3. Click **Generate new Key**
 4. Give your key a descriptive name (e.g., “Production API”, “Development API”)
 5. Copy and securely store your API key

Keep your API keys secure and never share them publicly. Each user can create up to 10 API keys.
### 
​
Using Your API Key
Include your API key in the `x-api-key` header with every request:
Copy
Ask AI
```
curl -X GET 'https://public-api-v2.bags.fm/api/v1/endpoint' \
  -H 'x-api-key: YOUR_API_KEY'

```

### 
​
Managing API Keys
You can revoke API keys at any time from the Developer Portal. Revoking a key immediately stops all requests using that key.
What is the Bags API?How to display social profile on token page?
⌘I
xgithublinkedin
Powered by


---

# Get Token Claim Events - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/get-token-claim-events

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554608

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Analytics
Get Token Claim Events
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get token claim events
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/fee-share/token/claim-events \
  --header 'x-api-key: <api-key>'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "events": [
      {
        "wallet": "<string>",
        "isCreator": true,
        "amount": "<string>",
        "signature": "<string>",
        "timestamp": "<string>"
      }
    ]
  }
}
```

Analytics
# Get Token Claim Events
OpenAIOpen in ChatGPT
Retrieve claim events for a specific token. Supports two query modes:
**Offset Mode** (default): Use `mode=offset` (or omit mode) with `limit` and `offset` for traditional pagination.
**Time Mode** : Use `mode=time` with `from` and `to` unix timestamps to retrieve events within a specific time range.
OpenAIOpen in ChatGPT
GET
/
fee-share
/
token
/
claim-events
Try it
Get token claim events
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/fee-share/token/claim-events \
  --header 'x-api-key: <api-key>'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "events": [
      {
        "wallet": "<string>",
        "isCreator": true,
        "amount": "<string>",
        "signature": "<string>",
        "timestamp": "<string>"
      }
    ]
  }
}
```

Retrieve claim events for a specific token. This endpoint supports two query modes to give you flexibility in how you fetch claim data.
## 
​
Query Modes
### 
​
Offset Mode (Default)
Use offset-based pagination to retrieve claim events in batches. This is the default mode and is backward compatible with previous API versions.
Copy
Ask AI
```
curl --request GET \
  --url 'https://public-api-v2.bags.fm/api/v1/fee-share/token/claim-events?tokenMint=YOUR_TOKEN_MINT&mode=offset&limit=50&offset=0' \
  --header 'x-api-key: YOUR_API_KEY'

```

​
mode
string
default:"offset"
Set to `offset` or omit entirely for pagination mode.
​
limit
integer
default:"100"
Maximum number of events to return (1-100).
​
offset
integer
default:"0"
Number of events to skip for pagination.
### 
​
Time Mode
Use time-based filtering to retrieve all claim events within a specific time range. Useful for analytics dashboards, scheduled reports, or syncing historical data.
Copy
Ask AI
```
curl --request GET \
  --url 'https://public-api-v2.bags.fm/api/v1/fee-share/token/claim-events?tokenMint=YOUR_TOKEN_MINT&mode=time&from=1704067200&to=1706745600' \
  --header 'x-api-key: YOUR_API_KEY'

```

​
mode
string
required
Must be set to `time` for time-based filtering.
​
from
integer
required
Start unix timestamp (inclusive). Must be greater than or equal to 0.
​
to
integer
required
End unix timestamp (inclusive). Must be greater than or equal to `from`.
When using time mode, the `from` timestamp must be less than or equal to `to`. The API will return an error if this constraint is violated.
## 
​
Use Cases
 * **Offset Mode** : Best for building paginated UIs, real-time feeds, or when you need the most recent events.
 * **Time Mode** : Best for analytics, generating reports for specific periods, auditing, or syncing claim history.

For a complete implementation example, see the Get Token Claim Events how-to guide.
#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Query Parameters
​
tokenMint
string
required
Public key of the token mint
​
mode
enum<string>
default:offset
Query mode: 'offset' for pagination (default), 'time' for time-based filtering
Available options:
`offset`,
`time`
​
limit
integer
default:100
Maximum number of events to return (1-100, default: 100). Only used with mode=offset
Required range: `1 <= x <= 100`
​
offset
integer
default:0
Number of events to skip for pagination (default: 0). Only used with mode=offset
Required range: `x >= 0`
​
from
integer
Start unix timestamp (inclusive). Required when mode=time
Required range: `x >= 0`
​
to
integer
End unix timestamp (inclusive). Required when mode=time. Must be greater than or equal to 'from'
Required range: `x >= 0`
#### Response
200
application/json
Successfully retrieved token claim events
​
success
boolean
required
Example:
`true`
​
response
object
Show child attributes
Get Token Claim StatsGet Pool Config Keys by Fee Claimer Vaults
⌘I
xgithublinkedin
Powered by


---

# Do I need a Solana wallet to use the API? - Bags API Documentation

## URL
https://docs.bags.fm/faq/do-i-need-wallet

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554653

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Frequently Asked Questions
Do I need a Solana wallet to use the API?
GuidesAPI referenceFAQ
##### Frequently Asked Questions
 * What is the Bags API?
 * How do I get an API key?
 * How to display social profile on token page?
 * What are the rate limits?
 * Do I need a Solana wallet to use the API?

On this page
 * Do I need a Solana wallet to use the API?
 * Wallet Requirements
 * Getting Started
 * Security Best Practices

Frequently Asked Questions
# Do I need a Solana wallet to use the API?
OpenAIOpen in ChatGPT
Learn about wallet requirements for using the Bags API
OpenAIOpen in ChatGPT
## 
​
Do I need a Solana wallet to use the API?
For operations that require on-chain transactions like creating a token or claiming fees you’ll need a Solana wallet with enough SOL to cover transaction costs, but you don’t necessarily need SOL for non-transactional usage.
### 
​
Wallet Requirements
 * **Token Launch** : Requires a wallet with SOL for transaction fees
 * **Fee Sharing** : Needs wallet access for configuring and claiming fees
 * **Transactions** : Any blockchain operations require wallet signing

### 
​
Getting Started
 1. Export your wallet’s private key (base58 encoded)
 2. Add it to your environment variables: `PRIVATE_KEY=your_base58_encoded_private_key`
 3. Use it in your scripts to sign transactions

You can export your private key from wallets like Bags, Phantom, or Backpack. See our Token Launch Guide for examples.
### 
​
Security Best Practices
 * Never commit private keys to version control
 * Use environment variables or secure secret management
 * Consider using a dedicated development wallet

What are the rate limits?
⌘I
xgithublinkedin
Powered by


---

# Get Pool Config Keys by Fee Claimer Vaults - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/get-pool-config-keys

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554726

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
State
Get Pool Config Keys by Fee Claimer Vaults
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get pool config keys by fee claimer vaults
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/state/pool-config \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "feeClaimerVaults": [
    "<string>"
  ]
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "poolConfigKeys": [
      "<string>"
    ]
  }
}
```

State
# Get Pool Config Keys by Fee Claimer Vaults
OpenAIOpen in ChatGPT
Given a list of fee claimer vault public keys, returns the first Meteora DBC pool config key for each if present.
WARNING: This function will assume there is only one config key for a fee claimer vault. If this is used for non bags-fee-share fee claimer vault, it will return the first config key found.
OpenAIOpen in ChatGPT
POST
/
token-launch
/
state
/
pool-config
Try it
Get pool config keys by fee claimer vaults
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/state/pool-config \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "feeClaimerVaults": [
    "<string>"
  ]
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "poolConfigKeys": [
      "<string>"
    ]
  }
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Body
application/json
​
feeClaimerVaults
string[]
required
List of fee claimer vault public keys to query
Public key of a fee claimer vault
#### Response
200
application/json
Successfully retrieved pool config keys
​
success
boolean
required
Example:
`true`
​
response
object
Show child attributes
Get Token Claim EventsGet Claimable Positions
⌘I
xgithublinkedin
Powered by


---

# Create Partner Claim Transactions - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/get-partner-claim-transactions

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554801

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Partner
Create Partner Claim Transactions
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get partner fee claim transactions
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/fee-share/partner-config/claim-tx \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "partnerWallet": "<string>"
}
'
```

200
400
401
404
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "transactions": [
      {
        "blockhash": {
          "blockhash": "<string>",
          "lastValidBlockHeight": 123
        },
        "transaction": "<string>"
      }
    ]
  }
}
```

Partner
# Create Partner Claim Transactions
OpenAIOpen in ChatGPT
Generate transactions to claim accumulated partner fees
OpenAIOpen in ChatGPT
POST
/
fee-share
/
partner-config
/
claim-tx
Try it
Get partner fee claim transactions
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/fee-share/partner-config/claim-tx \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "partnerWallet": "<string>"
}
'
```

200
400
401
404
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "transactions": [
      {
        "blockhash": {
          "blockhash": "<string>",
          "lastValidBlockHeight": 123
        },
        "transaction": "<string>"
      }
    ]
  }
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Body
application/json
​
partnerWallet
string
required
Public key of the partner wallet
#### Response
200
application/json
Successfully generated partner claim transactions
​
success
boolean
required
Example:
`true`
​
response
object
Show child attributes
Get Partner StatsCreate Partner Config
⌘I
xgithublinkedin
Powered by


---

# Create Partner Config - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/create-partner-configuration

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554865

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Partner
Create Partner Config
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get partner config creation transaction
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/fee-share/partner-config/creation-tx \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "partnerWallet": "<string>"
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "transaction": "<string>",
    "blockhash": {
      "blockhash": "<string>",
      "lastValidBlockHeight": 123
    }
  }
}
```

Partner
# Create Partner Config
OpenAIOpen in ChatGPT
Get a transaction to create a partner key (partner config) for fee sharing. Only one partner key can be created per wallet.
OpenAIOpen in ChatGPT
POST
/
fee-share
/
partner-config
/
creation-tx
Try it
Get partner config creation transaction
cURL
Copy
Ask AI
```
curl --request POST \
  --url https://public-api-v2.bags.fm/api/v1/fee-share/partner-config/creation-tx \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <api-key>' \
  --data '
{
  "partnerWallet": "<string>"
}
'
```

200
400
401
500
Copy
Ask AI
```
{
  "success": true,
  "response": {
    "transaction": "<string>",
    "blockhash": {
      "blockhash": "<string>",
      "lastValidBlockHeight": 123
    }
  }
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Body
application/json
​
partnerWallet
string
required
Public key of the partner wallet that will receive fees
#### Response
200
application/json
Successfully generated partner config creation transaction
​
success
boolean
required
Example:
`true`
​
response
object
Show child attributes
Create Partner Claim Transactions
⌘I
xgithublinkedin
Powered by


---

# Get Token Launch Creators - Bags API Documentation

## URL
https://docs.bags.fm/api-reference/get-token-launch-creators

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554929

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Analytics
Get Token Launch Creators
GuidesAPI referenceFAQ
##### API documentation
 * API Reference

##### Token Launch
 * POSTCreate Token Info and Metadata
 * POSTCreate Token Launch Transaction

##### Fee Share
 * GETGet Fee Share Wallet V2
 * POSTGet Fee Share Wallet V2 (Bulk)
 * POSTCreate Fee Share Config creation transaction

##### Analytics
 * GETGet Token Launch Creators
 * GETGet Token Lifetime Fees
 * GETGet Token Claim Stats
 * GETGet Token Claim Events

##### State
 * POSTGet Pool Config Keys by Fee Claimer Vaults

##### Fee Claiming
 * GETGet Claimable Positions
 * POSTGet Claim Transactions

##### Trade
 * GETGet Trade Quote
 * POSTCreate Swap Transaction

##### Partner
 * GETGet Partner Stats
 * POSTCreate Partner Claim Transactions
 * POSTCreate Partner Config

Get token launch creators (v3)
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/creator/v3 \
  --header 'x-api-key: <api-key>'
```

200
500
Copy
Ask AI
```
{
  "success": true,
  "response": [
    {
      "username": "<string>",
      "pfp": "<string>",
      "royaltyBps": 123,
      "isCreator": true,
      "wallet": "<string>",
      "provider": "twitter",
      "providerUsername": "<string>"
    }
  ]
}
```

Analytics
# Get Token Launch Creators
OpenAIOpen in ChatGPT
Retrieve the creators/deployers of a specific token launch. Use the ‘provider’ field to show a platform logo in your UI, and prefer ‘providerUsername’ for display when present since ‘username’ is a Bags internal username and optional.
OpenAIOpen in ChatGPT
GET
/
token-launch
/
creator
/
v3
Try it
Get token launch creators (v3)
cURL
Copy
Ask AI
```
curl --request GET \
  --url https://public-api-v2.bags.fm/api/v1/token-launch/creator/v3 \
  --header 'x-api-key: <api-key>'
```

200
500
Copy
Ask AI
```
{
  "success": true,
  "response": [
    {
      "username": "<string>",
      "pfp": "<string>",
      "royaltyBps": 123,
      "isCreator": true,
      "wallet": "<string>",
      "provider": "twitter",
      "providerUsername": "<string>"
    }
  ]
}
```

#### Authorizations
​
x-api-key
string
header
required
API key authentication. Provide your API key as the header value.
#### Query Parameters
​
tokenMint
string
required
Public key of the token mint
#### Response
200
application/json
Successfully retrieved token creators
​
success
boolean
required
Example:
`true`
​
response
object[]
Show child attributes
Create Fee Share Config creation transactionGet Token Lifetime Fees
⌘I
xgithublinkedin
Powered by


---

# What are the rate limits? - Bags API Documentation

## URL
https://docs.bags.fm/faq/what-are-rate-limits

## Metadata
- Depth: 2
- Timestamp: 2026-01-27T21:18:59.554984

## Content
Skip to main content
Bags API Documentation home page
Search...
⌘KAsk AI
 * Support
 * Get API Key
 * Get API Key

Search...
Navigation
Frequently Asked Questions
What are the rate limits?
GuidesAPI referenceFAQ
##### Frequently Asked Questions
 * What is the Bags API?
 * How do I get an API key?
 * How to display social profile on token page?
 * What are the rate limits?
 * Do I need a Solana wallet to use the API?

On this page
 * What are the rate limits?
 * Rate Limit Details
 * Monitoring Your Usage
 * Example

Frequently Asked Questions
# What are the rate limits?
OpenAIOpen in ChatGPT
Understanding Bags API rate limits and how to monitor usage
OpenAIOpen in ChatGPT
## 
​
What are the rate limits?
The Bags API implements rate limiting to ensure fair usage and system stability.
### 
​
Rate Limit Details
 * **Limit** : 1,000 requests per hour per user and per ip
 * **Scope** : Rate limits apply across all your API keys (shared quota)
 * **Headers** : Response headers include rate limit information

### 
​
Monitoring Your Usage
Check these response headers to monitor your API usage:
 * `X-RateLimit-Limit`: Total requests allowed per hour (1,000)
 * `X-RateLimit-Remaining`: Requests remaining in current window
 * `X-RateLimit-Reset`: Unix timestamp when the limit resets

### 
​
Example
Copy
Ask AI
```
const response = await fetch('https://public-api-v2.bags.fm/api/v1/endpoint', {
  headers: { 'x-api-key': 'YOUR_API_KEY' }
});
console.log('Remaining:', response.headers.get('X-RateLimit-Remaining'));
console.log('Resets at:', new Date(
  parseInt(response.headers.get('X-RateLimit-Reset')) * 1000
));

```

Distribute requests evenly throughout the hour to avoid hitting rate limits. Consider implementing exponential backoff for failed requests.
See the Rate Limits guide for more detailed information.
How to display social profile on token page?Do I need a Solana wallet to use the API?
⌘I
xgithublinkedin
Powered by


---
