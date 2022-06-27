import { signBlock, checkAddress } from "nanocurrency";
import { NextApiHandler } from "next";
import {
    faucetAddress,
    nanoRpcUrl,
    representativeAddress,
} from "../../lib/constants";
import getTxnData from "../../lib/getTxnData";

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

    const { body } = req;

    if (!checkAddress(body.address)) {
        res.status(400).json({
            error: {
                code: 400,
                shortMessage: "Bad request",
                message: "Invalid address",
            },
        });
        return;
    }

    if (!body.work) {
        res.status(400).json({
            error: {
                code: 400,
                shortMessage: "Bad request",
                message: "Invalid work",
            },
        });
        return;
    }

    const { address, work } = body;

    const { hash, previousHash, newBalance } = await getTxnData(address);

    const signature = signBlock({ hash, secretKey: process.env.PRIVATE_KEY });

    const processRes = await fetch(nanoRpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "process",
            json_block: "true",
            subtype: "send",
            block: {
                type: "state",
                account: faucetAddress,
                previous: previousHash,
                representative: representativeAddress,
                balance: newBalance,
                link: address,
                signature,
                work,
            },
        }),
    });

    const data = await processRes.json();

    if (!processRes.ok || "error" in data) {
        res.status(500).json({
            error: {
                code: 500,
                shortMessage: "Internal server error",
                message: "Failed to process block",
            },
        });
        return;
    }

    return res.json({ hash: data.hash });
};

export default handler;
