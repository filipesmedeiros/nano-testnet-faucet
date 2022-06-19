import Big from "big.js";
import { hashBlock } from "nanocurrency";
import {
    faucetAddress,
    faucetAmountMax,
    faucetAmountMin,
    faucetAmountPercentage,
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

    const decimalOfPercentage = +faucetAmountPercentage / 100;
    const balanceBig = new Big(info.confirmed_balance);
    let dropAmountBig = balanceBig.mul(decimalOfPercentage);

    // clamp the drop amount to the min and max amounts
    if (dropAmountBig.gt(faucetAmountMax))
        dropAmountBig = new Big(faucetAmountMax);
    if (dropAmountBig.lt(faucetAmountMin))
        dropAmountBig = new Big(faucetAmountMin);

    // empty the faucet to this person :)
    if (dropAmountBig.gt(balanceBig)) dropAmountBig = balanceBig;

    const newBalanceBig = balanceBig.minus(dropAmountBig);
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
