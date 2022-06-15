import * as webglpow from "./nano-webgl-pow";

const generateSendWork = (hash: string) =>
    new Promise((res) => {
        webglpow.calculate(
            hash,
            "0xFFFFFFF8",
            2048,
            1025,
            (work: string) => {
                res(work);
            },
            () => {}
        );
    });

export default generateSendWork;
