import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { writeFileSync } from "node:fs";

async function main() {
  const keys = await generateKeyPair("RS256", {
    extractable: true,
  });
  const privateKey = await exportPKCS8(keys.privateKey);
  const publicKey = await exportJWK(keys.publicKey);
  const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

  // For environment variables, the private key needs newlines replaced
  const privateKeyForEnv = privateKey.trimEnd().replace(/\n/g, " ");

  // Write to files for local use or inspection
  writeFileSync("./jwt_private_key.pkcs8", privateKey);
  writeFileSync("./jwks.json", jwks);

  console.log("Wrote jwt_private_key.pkcs8 and jwks.json");
  console.log("\n--- Copy the following for Convex environment variables ---");
  console.log(`JWT_PRIVATE_KEY="${privateKeyForEnv}"`);
  console.log(`JWKS='${jwks}'`);
  console.log("----------------------------------------------------------");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
