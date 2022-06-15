import { convert, Unit, hashBlock } from "nanocurrency";
import Big from "big.js";
import { useState } from "react";
import generateSendWork from "../lib/promisifyNanoWebGLPoW";

const faucetAddress =
    "nano_1u7fqn3hsrgqmxduboyxq9wgobse84taappnexuiiso1kzui7noj41ehsdj8";
const rep = "nano_31d4ymibpnsr9t1kcgtpgxzw6iiooufanbbsrh7wrstsj6c5h4owug1abhqb";

const addressRegex =
    /^(nano|xrb)_[13]{1}[13456789abcdefghijkmnopqrstuwxyz]{59}$/;

const amountRaw = convert("1", { from: Unit.Nano, to: Unit.raw });

const Home = () => {
    const [generatingWork, setGeneratingWork] = useState(false);

    const onRequestNano = async (address: string) => {
        const infoResponse = await fetch(
            "http://nano-testnet.filipesm.com:17076/",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "account_info",
                    account: faucetAddress,
                    include_confirmed: "true",
                }),
            }
        );

        if (!infoResponse.ok) throw new Error("Failed to get account info");

        const info = await infoResponse.json();

        const newBalanceBig = new Big(info.confirmed_balance).minus(amountRaw);
        const newBalance = newBalanceBig.c.join("");

        const hash = hashBlock({
            account: faucetAddress,
            link: address,
            representative: rep,
            previous: info.confirmed_frontier,
            balance: newBalance,
        });

        setGeneratingWork(true);
        const [work, signatureResponse] = await Promise.all([
            generateSendWork(info.confirmed_frontier),
            fetch("/api/signBlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hash }),
            }),
        ]);
        setGeneratingWork(false);

        if (!signatureResponse.ok) throw new Error("Failed to get signature");

        const { signature } = await signatureResponse.json();

        const processResponse = await fetch(
            "http://nano-testnet.filipesm.com:17076/",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "process",
                    json_block: "true",
                    subtype: "send",
                    block: {
                        type: "state",
                        account: faucetAddress,
                        previous: info.confirmed_frontier,
                        representative: rep,
                        balance: newBalance,
                        link: address,
                        signature,
                        work,
                    },
                }),
            }
        );

        const data = await processResponse.json();

        if (!processResponse.ok || "error" in data)
            throw new Error("Failed to process block, please try again");

        return data.hash;
    };

    return (
        <div>
            <h1>Nano testnet faucet</h1>
            <h2>Pays 1 nano</h2>
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
                            const sendHash = await onRequestNano(
                                address as string
                            );
                            alert(`Your nano has been sent! Hash: ${sendHash}`);
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
