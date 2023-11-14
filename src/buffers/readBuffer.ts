export const createReadBuffer = (device: GPUDevice, size: GPUSize64) => device.createBuffer({
    label: 'result buffer',
    size,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
})
