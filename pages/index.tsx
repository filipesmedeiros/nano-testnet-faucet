import { useState } from "react";
import generateSendWork from "../lib/promisifyNanoWebGLPoW";
import getTxnData from "../lib/getTxnData";
import { addressRegex, faucetAmountInNano } from "../lib/constants";

const Home = () => {
    const [generatingWork, setGeneratingWork] = useState(false);
    const [hash, setHash] = useState<string>();

    const onRequestNano = async (address: string) => {
        setHash(undefined);

        const { previousHash } = await getTxnData(address);

        setGeneratingWork(true);
        const work = await generateSendWork(previousHash);
        setGeneratingWork(false);

        const sendNanoRes = await fetch("/api/sendNano", {
            body: JSON.stringify({ address, work }),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await sendNanoRes.json();

        if (!sendNanoRes.ok || "error" in data)
            throw new Error("Failed to send test nano, please try again");

        setHash(data.hash);
    };

    return (
        <div>
            <h1>Nano testnet faucet</h1>
            <h2>Pays {faucetAmountInNano} test nano</h2>
            <h3>Please be nice :)</h3>
            {generatingWork && (
                <h1>
                    Generating work for your block, please don&apos;t close this
                    tab
                </h1>
            )}
            <form
                onSubmit={async (e) => {
                    e.preventDefault();

                    const data = new FormData(e.currentTarget);
                    const address = data.get("xno-address");

                    if (
                        address === null ||
                        !addressRegex.test(address as string)
                    )
                        alert("Insert a valid address");
                    else {
                        try {
                            await onRequestNano(address as string);
                        } catch (e) {
                            setGeneratingWork(false);
                            if (e instanceof Error)
                                alert(`${e.message}. Please try again!`);
                            else alert(e);
                        }
                    }
                }}
            >
                <input
                    name="xno-address"
                    id="xno-address"
                    type="text"
                    maxLength={65}
                    autoComplete="off"
                    autoCorrect="off"
                />
                <button type="submit">Get test nano</button>
            </form>

            {hash && (
                <a href={`https://nanolooker.com/block/${hash}`}>
                    You can see your transaction here, but be sure to set the
                    node&apos;s URL to a test node in the settings!
                </a>
            )}

            <a
                href="https://github.com/filipesmedeiros/nano-testnet-faucet"
                style={{ marginTop: "3rem", display: "block" }}
            >
                Github repo with code
            </a>
        </div>
    );
};

export default Home;
