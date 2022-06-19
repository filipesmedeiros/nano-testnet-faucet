import { convert, Unit } from "nanocurrency";

export const nanolookerBaseUrl =
    process.env.NEXT_PUBLIC_NANOLOOKER_BASE_URL || "https://nanolooker.com";

export const faucetAddress =
    process.env.NEXT_PUBLIC_FAUCET_ADDRESS ||
    "nano_1u7fqn3hsrgqmxduboyxq9wgobse84taappnexuiiso1kzui7noj41ehsdj8";

export const nanoRpcUrl =
    process.env.NEXT_PUBLIC_NANO_RPC_URL ||
    "https://nano-testnet.filipesm.com/rpc";

export const representativeAddress =
    process.env.NEXT_PUBLIC_REPRESENTATIVE_ADDRESS ||
    "nano_31d4ymibpnsr9t1kcgtpgxzw6iiooufanbbsrh7wrstsj6c5h4owug1abhqb";

export const github =
    process.env.NEXT_PUBLIC_GITHUB ||
    "https://github.com/filipesmedeiros/nano-testnet-faucet";

export const email = process.env.NEXT_PUBLIC_EMAIL || "hello@filipesm.com";

export const twitter = process.env.NEXT_PUBLIC_TWITTER || "filipesm_com";

export const fediverse =
    process.env.NEXT_PUBLIC_FEDIVERSE ||
    "https://social.filipesm.com/web/@filipe";

export const donationAddress =
    process.env.NEXT_PUBLIC_DONATION_ADDRESS ||
    "nano_3stbuoteedww6z5dt4emx9xs6fa5ueeghreicy9p59ygpidizcckuue4ps3f";

export const faucetAmountPercentage =
    process.env.NEXT_PUBLIC_FAUCET_AMOUNT_PERCENTAGE || "1";

export const faucetAmountMinInNano =
    process.env.NEXT_PUBLIC_FAUCET_AMOUNT_MIN_IN_NANO || "10";

export const faucetAmountMaxInNano =
    process.env.NEXT_PUBLIC_FAUCET_AMOUNT_MAX_IN_NANO || "100";

export const faucetAmountMin = convert(faucetAmountMinInNano, {
    from: Unit.Nano,
    to: Unit.raw,
});

export const faucetAmountMax = convert(faucetAmountMaxInNano, {
    from: Unit.Nano,
    to: Unit.raw,
});

export const addressRegex =
    /^(nano|xrb)_[13]{1}[13456789abcdefghijkmnopqrstuwxyz]{59}$/;
