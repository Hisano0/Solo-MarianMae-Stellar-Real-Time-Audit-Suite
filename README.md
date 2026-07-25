## Project Name

Stellar Real-Time Audit Suite

## One-Line Description

A real-time Stellar audit dashboard featuring a dual-engine architecture that seamlessly toggles between an offline Simulation Mode and a live Horizon SSE stream.

## Track

Track 6 Open Innovation

## Problem It Solves

Compliance teams and developers often lack tools that bridge offline application testing with real-time ledger auditing, forcing them to connect active wallets or endure hydration errors during local development. Stellar Sentinel provides a unified audit dashboard with an offline Simulation Mode for instant workflow testing alongside a live push-based Horizon SSE engine for real-time transaction telemetry.

## How It Uses Stellar

* **Horizon Server-Sent Events (SSE):** Uses `@stellar/stellar-sdk` streaming (`payments().forAccount().cursor("now").stream()`) to capture live payment events with zero polling overhead.
* **Horizon REST API:** Queries historical ledger operations (`fetchAuditHistory`) to reconstruct account audit volume and transaction timelines upon connection.
* **Freighter Wallet Integration:** Implements modern wallet detection (`requestAccess` / `getAddress`) to authenticate accounts and trigger the transition from simulated to live data.
* **Stellar Payment Primitives:** Decodes on-chain payment records (hashes, senders, recipients, XLM amounts) to render instant audit verification statuses.

## GitHub Repository

https://github.com/Hisano0/Solo-MarianMae-Stellar-Real-Time-Audit-Suite

## Network & Deployment

* Network: testnet
* Live app URL (if any): runs locally — see README
* Contract IDs / asset issuers (if any): N/A

## Team

* Marian Mae J. Modesto — @Hisano0

## Novelty Note

Unlike traditional block explorers that strictly require an active network connection, Stellar Sentinel features a dual-engine architecture. It initializes in Simulation Mode to eliminate hydration errors, suppress console noise, and enable offline testing, then automatically elevates to a Live Horizon SSE stream when a wallet connects for zero-latency audit parity.

## Anything Else

Future roadmap plans include Soroban smart contract event parsing, configurable compliance threshold alert rules, multi-signature account monitoring, and automated CSV export features.
