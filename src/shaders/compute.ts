export const getComputeShader = (device: GPUDevice) => device.createShaderModule({
    label: 'compute module',
    code: `
        struct Particle {
            pos : vec2<f32>,
            vel : vec2<f32>,
            radius : vec4<f32>,
        }
        
        struct Particles {
            particles : array<Particle>,
        }
        
        struct Uniforms {
            deltaTime : f32
        }
        
        @group(0) @binding(0) var<storage, read> particlesA: Particles;
        @group(0) @binding(1) var<storage, read_write> particlesB: Particles;
        @group(0) @binding(2) var<uniform> uniforms : Uniforms;
        
        @compute @workgroup_size(64) fn computeBoundaries(
            @builtin(global_invocation_id) id: vec3<u32>
        ) {
        
            if (id.x >= u32(arrayLength(&particlesA.particles))) {
               return;
            }
            
            let index = id.x;
            var vPos = particlesA.particles[index].pos;
            var vVel = particlesA.particles[index].vel;
            
            let friction : f32 = 0.99;
            var newPos = vPos + vVel * uniforms.deltaTime;
            var newVel = vVel * friction;
            
            let circleRadius : f32 =  particlesA.particles[index].radius[0];
            let gravity : vec2<f32> =  vec2<f32>(0.0, - 0.001);
            
            if(newPos.x > (1.0 - circleRadius)){
               newVel.x = -vVel.x;
               newPos = vPos + newVel;
            }
            
            if(newPos.x < (-1.0 + circleRadius)){
               newVel.x = -vVel.x; 
               newPos = vPos + newVel;
            }
            
            if(newPos.y > (1.0 - circleRadius)){
               newVel.y = -vVel.y;
               newPos = vPos + newVel;
            }
            
            if(newPos.y < (-1.0 + circleRadius)){
               newVel.y = vVel.y * -0.9;
               newPos = vPos + newVel;
               
               if(length(newVel) < circleRadius  ){
                 newPos.y = -1.0 + circleRadius;
               }                   
            }
                                        
            particlesB.particles[index].pos = newPos;  
            particlesB.particles[index].vel = newVel + gravity; 
            particlesB.particles[index].radius = particlesA.particles[index].radius;                            
        }
    `,
})
