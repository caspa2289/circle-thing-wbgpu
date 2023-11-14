export const createCorePipeline = (
    device: GPUDevice,
    coreShader: { vertex: string, fragment: string },
    format: GPUTextureFormat
) =>
    device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: device.createShaderModule({
                code: coreShader.vertex
            }),
            entryPoint: 'vertex_main'
        },
        fragment: {
            module: device.createShaderModule({
                code: coreShader.fragment
            }),
            entryPoint: 'fragment_main',
            targets: [ {
                format: format
            } ]
        },
        primitive: {
            topology: 'triangle-list',
        }
    })
