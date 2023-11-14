export const createComputeBindGroup = (
    device: GPUDevice,
    computePipeline: GPUComputePipeline,
    buffer1: GPUBuffer,
    buffer2: GPUBuffer,
    uniformBuffer: GPUBuffer
) =>
    device.createBindGroup({
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: buffer1
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: buffer2
                }
            },
            {
                binding: 2,
                resource: {
                    buffer: uniformBuffer
                }
            },
        ],
    })
