import Big from "big.js";
import { signBlock, hashBlock } from "nanocurrency";
import { NextApiHandler } from "next";
import {
    faucetAddress,
    nanoRpcUrl,
    representativeAddress,
} from "../../lib/constants";
import getTxnData from "../../lib/getTxnData";

Big.PE = 50;

const handler: NextApiHandler = async (req, res) => {
    if (req.method !== "POST") {
        res.status(501).json({
            error: {
                code: 501,
                shortMessage: "Not implemented",
                message: "This endpoint only supports POST requests",
            },
        });
        return;
    }

    const receivablesRes = await fetch(nanoRpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "receivable",
            account: faucetAddress,
            source: "true",
        }),
    });

    const data = (await receivablesRes.json()) as
        | {
              blocks: {
                  [hash: string]: {
                      amount: string;
                      source: string;
                  };
              };
          }
        | { error: string };

    if (!receivablesRes.ok || "error" in data) {
        res.status(500).json({
            error: {
                code: 500,
                shortMessage: "Internal server error",
                message: "Failed to get receivables",
            },
        });
        return;
    }

    let { previousHash, currentBalance } = await getTxnData(faucetAddress);
    for (const [sendHash, { amount }] of Object.entries(data.blocks)) {
        const newBalance = new Big(currentBalance).plus(amount).toString();

        const receiveHash = hashBlock({
            account: faucetAddress,
            link: sendHash,
            representative: representativeAddress,
            previous: previousHash,
            balance: newBalance,
        });

        const signature = signBlock({
            hash: receiveHash,
            secretKey: process.env.PRIVATE_KEY,
        });

        const { work } = await (
            await fetch(`https://nano.to/${previousHash}/pow`)
        ).json();

        const processRes = await fetch(nanoRpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "process",
                json_block: "true",
                subtype: "receive",
                block: {
                    type: "state",
                    account: faucetAddress,
                    previous: previousHash,
                    representative: representativeAddress,
                    balance: newBalance,
                    link: sendHash,
                    signature,
                    work,
                },
            }),
        });

        const processData = await processRes.json();

        if (!processRes.ok || "error" in processData) {
            res.status(500).json({
                error: {
                    code: 500,
                    shortMessage: "Internal server error",
                    message: `Failed to process block: ${processData.error}`,
                },
            });
            return;
        }

        previousHash = processData.hash;
        currentBalance = newBalance;
    }

    res.status(200).json({ success: "Processed all receivable blocks" });
};

export default handler;
