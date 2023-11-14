export const createComputePipeline = (device: GPUDevice, computeModule: GPUShaderModule) =>
    device.createComputePipeline({
        label: 'compute pipeline',
        layout: 'auto',
        compute: {
            module: computeModule,
            entryPoint: 'computeBoundaries',
        },
    })
