import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../wallet.json"
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner)); 
umi.use(mplTokenMetadata()) // registers Metaplex's Token Metadata program as a plugin so UMI can talk to it.

const mint = generateSigner(umi); // creates your NFT's mint keypair (like your old SPL mint).

(async () => {
    let tx = createNft(umi,{
        mint,
        name: "Garden Rug",
        symbol: "GDNRug",
        uri: "https://gateway.irys.xyz/Gn15Cv2f39MNTqDA7Pn9X3PSE1XGNswR6PjraJzSFXRW",
        sellerFeeBasisPoints:percentAmount(5) 
    })
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);
    
    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    console.log("Mint Address: ", mint.publicKey);
})();