import { signBlock } from "nanocurrency";
import { NextApiHandler } from "next";

const handler: NextApiHandler = (req, res) => {
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

    if (!body?.hash) {
        res.status(400).json({
            error: {
                code: 400,
                shortMessage: "Bad request",
                message: "Missing hash",
            },
        });
        return;
    }

    const { hash } = body;

    const signature = signBlock({ hash, secretKey: process.env.PRIVATE_KEY });

    return res.json({ signature });
};

export default handler;
