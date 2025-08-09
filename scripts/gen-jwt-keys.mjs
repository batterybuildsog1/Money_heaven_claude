import { generateKeyPair, exportJWK } from "jose";
import { writeFileSync } from "node:fs";

async function main() {
  const { privateKey, publicKey } = await generateKeyPair("RS256", { modulusLength: 2048 });
  const jwkPrivate = await exportJWK(privateKey);
  const jwkPublic = await exportJWK(publicKey);

  // Assign a key id to aid future rotation
  const kid = "mh-1";
  jwkPrivate.kid = kid;
  jwkPublic.kid = kid;

  const privateJson = JSON.stringify(jwkPrivate);
  const jwksJson = JSON.stringify({ keys: [jwkPublic] });

  writeFileSync("./jwt_private_key.json", privateJson);
  writeFileSync("./jwks.json", jwksJson);

  console.log("Wrote jwt_private_key.json and jwks.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


