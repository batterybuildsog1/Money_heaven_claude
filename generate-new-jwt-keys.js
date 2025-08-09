import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

// Generate new keys
const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

console.log("=== FOR CONVEX DASHBOARD (COPY EXACTLY AS SHOWN) ===\n");
console.log("JWT_PRIVATE_KEY (paste including the BEGIN and END lines):");
console.log(privateKey);

console.log("\nJWKS (copy this entire JSON on one line):");
console.log(jwks);

console.log("\n\n=== ALTERNATIVE: WITH SPACES INSTEAD OF NEWLINES ===\n");
console.log("JWT_PRIVATE_KEY (if dashboard doesn't accept multiline):");
console.log(privateKey.replace(/\n/g, " "));