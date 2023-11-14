export const createInputArray = (particleAmount: number) => {
    const input = new Float32Array(particleAmount * 8)
    for (let i = 0; i < particleAmount; ++i) {
        input[8 * i    ] = 2 * (Math.random() - 0.5) * 0.9 //position X
        input[8 * i + 1] = 2 * (Math.random() - 0.5) * 0.9 //position Y

        input[8 * i + 2] = 2 * (Math.random() - 0.5) * 0.3 //velocity X
        input[8 * i + 3] = 2 * (Math.random() - 0.5) * 0.3 //velocity Y

        input[8 * i + 4] = 0.01 //scale
        input[8 * i + 5] = Math.random() * 0.3
        input[8 * i + 6] = Math.random() * 0.7
        input[8 * i + 7] = Math.random() * 0.3
    }

    return input
}
