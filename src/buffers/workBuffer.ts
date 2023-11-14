export const createWorkBuffer = (device: GPUDevice, size: GPUSize64) => device.createBuffer({
    label: 'work buffer',
    size,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
})
