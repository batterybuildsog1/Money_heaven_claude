import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

console.log("Copy and paste these into Convex dashboard:\n");
console.log(`JWT_PRIVATE_KEY:\n${privateKey.trimEnd()}\n`);
console.log(`JWKS:\n${jwks}\n`);

// Also output in format ready for CLI
console.log("\n\nFor CLI (single line format):");
console.log(`JWT_PRIVATE_KEY="${privateKey.trimEnd().replace(/\n/g, "\\n")}"`);
console.log(`JWKS='${jwks}'`);