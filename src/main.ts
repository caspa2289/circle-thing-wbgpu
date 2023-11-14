import { coreShader } from './shaders/core'
import { getComputeShader } from './shaders/compute'
import { createCorePipeline } from './pipelines/core'
import { createComputePipeline } from './pipelines/compute'
import { createUniformBuffer } from './buffers/uniform'
import { createInputArray } from './utils/createInputArray'
import { createWorkBuffer } from './buffers/workBuffer'
import { createReadBuffer } from './buffers/readBuffer'
import { createComputeBindGroup } from './bindGroups/computeBindGroup'
import { createRenderBindGroup } from './bindGroups/renderBindGroup'
import { update } from './utils/update'

const init = async () => {

    if (!navigator.gpu) {
        alert('Your browser does not support WebGPU :(')
        return
    }

    const PARTICLE_AMOUNT = 100000
    const canvas = document.querySelector('#canvas') as HTMLCanvasElement
    const context = canvas.getContext('webgpu') as GPUCanvasContext
    const adapter = await navigator.gpu.requestAdapter()

    if (!adapter) {
        alert('Your browser blocks access to physical gpu :(')
        return
    }

    const device = await adapter.requestDevice()
    const format = navigator.gpu.getPreferredCanvasFormat() // формат данных в которых храняться пиксели в физическом устройстве

    context.configure({
        device: device,
        format: format,
        alphaMode: 'opaque',
    })

    const computeModule = getComputeShader(device)
    const pipeline = createCorePipeline(device, coreShader, format)
    const computePipeline = createComputePipeline(device, computeModule)

    const inputTime = new Float32Array([ 1.0 ])
    const input = createInputArray(PARTICLE_AMOUNT)

    const uniformBuffer = createUniformBuffer(device, inputTime)
    const workBufferA = createWorkBuffer(device, input.byteLength)
    const workBufferB = createWorkBuffer(device, input.byteLength)
    const readBuffer = createReadBuffer(device, input.byteLength)

    device.queue.writeBuffer(uniformBuffer, 0, inputTime)
    device.queue.writeBuffer(workBufferA, 0, input)
    device.queue.writeBuffer(workBufferB, 0, input)

    const data = [
        {
            bindGroup: createComputeBindGroup(device, computePipeline, workBufferA, workBufferB, uniformBuffer),
            buffer: workBufferA,
            bindGroupRender: createRenderBindGroup(device, pipeline, workBufferA)
        },
        {
            bindGroup: createComputeBindGroup(device, computePipeline, workBufferB, workBufferA, uniformBuffer),
            buffer: workBufferB,
            bindGroupRender: createRenderBindGroup(device, pipeline, workBufferB)
        } ]

    update(device, uniformBuffer, computePipeline, data, PARTICLE_AMOUNT, readBuffer, context, pipeline)
}

init()
