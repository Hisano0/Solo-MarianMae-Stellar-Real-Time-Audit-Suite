Project Name
Stellar Real-Time Audit Suite

One-Line Description
A real-time Stellar audit dashboard powered by a dual-engine architecture that seamlessly toggles between an offline Simulation Mode for instant testing and a Live Horizon SSE Stream for on-chain telemetry.

Track
Track 6 Open Innovation

Problem It Solves
Compliance teams and developers building on Stellar often lack tools that gracefully bridge offline application testing with real-time ledger auditing. Standard explorers force teams to connect active accounts or endure hydration bugs and 404 console errors during local development. Stellar Sentinel solves this by providing a unified audit dashboard equipped with an instant Simulation Mode for offline UI testing, alongside a live push-based Horizon engine that streams real-time payment events the moment a wallet connects.

How It Uses Stellar
Horizon Server-Sent Events (SSE): Utilizes @stellar/stellar-sdk push streaming (payments().forAccount().cursor("now").stream()) to capture live ledger transactions in real time with zero polling overhead.

Horizon REST API: Queries past ledger operations (fetchAuditHistory) to reconstruct account audit volume and payment timelines upon connection.

Freighter Wallet Integration: Implements modern wallet detection (requestAccess / getAddress) to authenticate keys and trigger the transition from simulated to live network data.

Stellar Payment Primitives & Simulation Engine: Mirrors standard on-chain payment structures (hashes, senders, recipients, XLM amounts) in both Simulation and Live modes for complete testing parity.

GitHub Repository
https://github.com/Hisano0/Solo-MarianMae-Stellar-Real-Time-Audit-Suite

Network & Deployment
Network: Stellar Testnet

Live app URL (if any): Runs locally — see README (or paste your Vercel deployment URL)

Contract IDs / asset issuers (if any): N/A

Team
Marian Mae J. Modesto — @Hisano0

Novelty Note
Unlike traditional block explorers that strictly require an active network connection, Stellar Sentinel features a Dual-Engine Architecture. It initializes instantly in Simulation Mode (eliminating hydration errors, suppressing testnet console noise, and allowing offline workflow testing) and seamlessly elevates to a Live Horizon SSE Stream when a wallet is connected. This gives developers and compliance officers a sandbox and a live production audit environment inside a single, unified interface.

Anything Else
Future Roadmap: Soroban smart contract event auditing, custom threshold rules for flagged compliance alerts, multi-signature monitoring, and automated CSV/PDF report exports.
