export const createUniformBuffer = (device: GPUDevice, inputTime: Float32Array) => device.createBuffer({
    label: 'buffer Position',
    size: inputTime.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
})
