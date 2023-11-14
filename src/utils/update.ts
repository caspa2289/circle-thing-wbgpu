let lastTime = 0
let time = 0

export const update = async (
    device: GPUDevice,
    uniformBuffer: GPUBuffer,
    computePipeline: GPUComputePipeline,
    data: { bindGroupRender: GPUBindGroup, buffer: GPUBuffer, bindGroup: GPUBindGroup }[],
    particleAmount: number,
    readBuffer: GPUBuffer,
    context: GPUCanvasContext,
    pipeline: GPURenderPipeline
) => {
    const deltaTime = time - lastTime
    lastTime = time

    device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([ deltaTime * 0.05 ]))

    const encoder = device.createCommandEncoder({
        label: 'doubling encoder',
    })

    const computePass = encoder.beginComputePass({
        label: 'doubling compute pass',
    })

    computePass.setPipeline(computePipeline)
    computePass.setBindGroup(0, data[time % 2].bindGroup)
    computePass.dispatchWorkgroups(Math.ceil(particleAmount / 64))
    computePass.end()

    encoder.copyBufferToBuffer(data[time % 2].buffer, 0, readBuffer, 0, readBuffer.size)

    device.queue.submit([ encoder.finish() ])

    // Read the results
    await readBuffer.mapAsync(GPUMapMode.READ)
    readBuffer.unmap()

    const encoderRender = device.createCommandEncoder({
        label: 'doubling encoder',
    })

    const textureView = context.getCurrentTexture().createView() // тектура к которой привязан контекст
    const renderPass = encoderRender.beginRenderPass({  // натсраиваем проход рендера, подключаем текстуру канваса это значать выводлить результат на канвас
        colorAttachments: [ {
            view: textureView,
            clearValue: {
                r: 0.5,
                g: 0.5,
                b: 0.5,
                a: 1.0
            },
            loadOp: 'clear',
            storeOp: 'store'
        } ]
    })
    renderPass.setPipeline(pipeline)
    renderPass.setBindGroup(0, data[time % 2].bindGroupRender)
    renderPass.draw(64, particleAmount)
    renderPass.end()

    device.queue.submit([ encoderRender.finish() ])
    ++time
    window.requestAnimationFrame(() => update(device, uniformBuffer, computePipeline, data, particleAmount, readBuffer, context, pipeline))
}
