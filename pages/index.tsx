import { FormEvent, useState } from "react";
import generateSendWork from "../lib/promisifyNanoWebGLPoW";
import getTxnData from "../lib/getTxnData";
import {
    addressRegex,
    donationAddress,
    email,
    faucetAddress,
    faucetAmountMaxInNano,
    faucetAmountMinInNano,
    faucetAmountPercentage,
    fediverse,
    github,
    nanolookerBaseUrl,
    twitter,
} from "../lib/constants";

const Home = () => {
    const [step, setStep] = useState<"info" | "work" | "send">();
    const [hash, setHash] = useState<string>();

    const onRequestNano = async (address: string) => {
        setHash(undefined);
        setStep("info");

        const { previousHash } = await getTxnData(address);

        setStep("work");
        const work = await generateSendWork(previousHash);
        setStep("send");

        // const sendNanoRes = await fetch("/api/sendNano", {
        //     body: JSON.stringify({ address, work }),
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        // });

        // const data = await sendNanoRes.json();

        // if (!sendNanoRes.ok || "error" in data)
        //     throw new Error("Failed to send test nano, please try again");

        // setHash(data.hash);
        setStep(undefined);
    };

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const address = data.get("xno-address");

        if (address === null || !addressRegex.test(address as string))
            alert("Insert a valid address");
        else {
            try {
                await onRequestNano(address as string);
            } catch (e) {
                setStep(undefined);
                if (e instanceof Error)
                    alert(`${e.message}. Please try again!`);
                else alert(e);
            }
        }
    };

    return (
        <>
            <h1>Nano testnet faucet</h1>

            <main>
                <div>
                    <h2>
                        Pays {faucetAmountPercentage}% of the faucet balance in
                        test nano (min. Ӿ{faucetAmountMinInNano} and max. Ӿ
                        {faucetAmountMaxInNano})
                    </h2>
                    <h3>Please be nice with the faucet, thanks! 🥰</h3>
                    {step && (
                        <h3>
                            {step === "info"
                                ? "Getting faucet account info..."
                                : step === "work"
                                ? "Generating work for your block, please keep this tab open!"
                                : "Signing and sending your block..."}
                        </h3>
                    )}
                </div>
                <form onSubmit={onSubmit}>
                    <input
                        name="xno-address"
                        id="xno-address"
                        type="text"
                        maxLength={65}
                        autoComplete="off"
                        autoCorrect="off"
                        autoFocus
                        required
                        placeholder="Insert your testnet address here"
                    />
                    <button disabled={!!step} type="submit">
                        {!step ? "Get test nano" : <div id="spin"></div>}
                    </button>
                </form>

                {hash && (
                    <a
                        id="faucet-drop-link"
                        href={`${nanolookerBaseUrl}/block/${hash}`}
                    >
                        You can see your transaction here, but be sure to set
                        the node&apos;s URL to a test node in the settings!
                    </a>
                )}
            </main>

            <footer>
                <span id="not-maintained">
                    Not maintained by{" "}
                    <a href="https://nano.org/nano-foundation">
                        The Nano Foundation
                    </a>
                    .
                </span>
                <a href={github}>Github repo with code</a>
                <span>
                    The faucet address is{" "}
                    <a
                        className="address"
                        href={`${nanolookerBaseUrl}/account/${faucetAddress}`}
                    >
                        {faucetAddress}
                    </a>
                </span>
                <a href="https://test.nano.org/">
                    More info on the nano test network
                </a>
                <span>
                    Contact me on{" "}
                    <a href={`https://twitter.com/${twitter}`}>Twitter</a>,{" "}
                    <a href={fediverse}>the fediverse</a> or by{" "}
                    <a href={`mailto:${email}`}>email</a>
                </span>
                <span id="donate-to">
                    Donations:{" "}
                    <a className="address" href={`nano:${donationAddress}`}>
                        {donationAddress}
                    </a>
                </span>
            </footer>
        </>
    );
};

export default Home;
