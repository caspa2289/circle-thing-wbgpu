export const createRenderBindGroup = (device: GPUDevice, pipeline: GPURenderPipeline, buffer: GPUBuffer) => device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
        {
            binding: 0,
            resource: {
                buffer 
            }
        },
    ],
})
