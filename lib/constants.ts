import { convert, Unit } from "nanocurrency";

export const nanolookerBaseUrl = process.env.NEXT_PUBLIC_NANOLOOKER_BASE_URL;

export const faucetAddress = process.env.NEXT_PUBLIC_FAUCET_ADDRESS;

export const representativeAddress =
    "nano_31d4ymibpnsr9t1kcgtpgxzw6iiooufanbbsrh7wrstsj6c5h4owug1abhqb";

export const addressRegex =
    /^(nano|xrb)_[13]{1}[13456789abcdefghijkmnopqrstuwxyz]{59}$/;

export const faucetAmountInNano = process.env.NEXT_PUBLIC_FAUCET_SEND_AMOUNT;

export const faucetAmount = convert(faucetAmountInNano, {
    from: Unit.Nano,
    to: Unit.raw,
});

export const nanoRpcUrl = process.env.NEXT_PUBLIC_NANO_RPC_URL;
