import Big from "big.js";
import { hashBlock } from "nanocurrency";
import {
    faucetAddress,
    faucetAmount,
    nanoRpcUrl,
    representativeAddress,
} from "./constants";

const getTxnData = async (address: string) => {
    const infoResponse = await fetch(nanoRpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "account_info",
            account: faucetAddress,
            include_confirmed: "true",
        }),
    });

    if (!infoResponse.ok) throw new Error("Failed to get account info");

    const info = await infoResponse.json();

    const newBalanceBig = new Big(info.confirmed_balance).minus(faucetAmount);
    const newBalance = newBalanceBig.c.join("");

    const hash = hashBlock({
        account: faucetAddress,
        link: address as string,
        representative: representativeAddress,
        previous: info.confirmed_frontier,
        balance: newBalance,
    });

    return { hash, previousHash: info.confirmed_frontier, newBalance };
};

export default getTxnData;
