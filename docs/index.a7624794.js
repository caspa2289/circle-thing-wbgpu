const e={vertex:`
        struct Particle {
            pos : vec2<f32>,
            vel : vec2<f32>,
            radius : vec4<f32>,
        }   

        @group(0) @binding(0) var<storage, read> data: array<Particle>;

        struct VertexOutput {
            @builtin(position) Position : vec4<f32>,
            @location(0) color : vec3<f32>          
        }      

        @vertex
        fn vertex_main(
            @builtin(vertex_index) VertexIndex : u32 ,
            @builtin(instance_index) InstanceIndex : u32,
        ) -> VertexOutput {
       
            let scale:f32 = data[InstanceIndex].radius[0];
            let a:f32 = 1.0 * scale;
            let b:f32 = 0.71 * scale;  
            let c:f32 = 0.923 * scale;  
            let d:f32 = 0.382 * scale;  
    
            var pos = array<vec2<f32>, 6*4*2> (
                vec2( 0.0,  0.0), vec2( a, 0.0), vec2(c, d),
                vec2( 0.0,  0.0), vec2(c, d), vec2(b,  b),
                
                vec2( 0.0,  0.0), vec2(b,  b), vec2(d,  c),
                vec2( 0.0,  0.0), vec2(d,  c), vec2(0.0,  a),
                
                vec2( 0.0,  0.0), vec2( 0.0, a), vec2(-d, c),
                vec2( 0.0,  0.0), vec2(-d, c), vec2(-b, b),
                
                vec2( 0.0,  0.0), vec2(-b, b), vec2(-c, d),
                vec2( 0.0,  0.0), vec2(-c, d), vec2(-a,  0.0),
                
                
                vec2( 0.0,  0.0), vec2( -a, 0.0), vec2(-c, -d),
                vec2( 0.0,  0.0), vec2(-c, -d), vec2(-b, -b),
                
                vec2( 0.0,  0.0), vec2(-b, -b), vec2(-d, -c),
                vec2( 0.0,  0.0), vec2(-d, -c), vec2(0.0, -a),
                
                vec2( 0.0,  0.0), vec2(0.0, -a), vec2(d, -c),
                vec2( 0.0,  0.0), vec2(d, -c), vec2(b, -b),
                
                vec2( 0.0,  0.0), vec2(b, -b), vec2(c, -d),
                vec2( 0.0,  0.0), vec2(c, -d), vec2(a, 0.0),
            );
    
            let lengthVelInstance = length(data[InstanceIndex].vel) * 10.0;
            
            var output : VertexOutput;
            output.Position = vec4<f32>(
                pos[VertexIndex].x + data[InstanceIndex].pos[0], //x
                pos[VertexIndex].y + data[InstanceIndex].pos[1], //y
                0.0, //z
                1.0 //w
            );
            
            output.color = vec3(
                lengthVelInstance + data[InstanceIndex].radius[1], 
                data[InstanceIndex].radius[2],  
                1.0 - lengthVelInstance
            ) + data[InstanceIndex].radius[3];
    
            return output;
        }`,fragment:`
            @fragment
            fn fragment_main(@location(0) color: vec3<f32>) -> @location(0) vec4<f32> {
            return vec4<f32>(color,1.0);
        }`},r=e=>e.createShaderModule({label:"compute module",code:`
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
    `}),t=(e,r,t)=>e.createRenderPipeline({layout:"auto",vertex:{module:e.createShaderModule({code:r.vertex}),entryPoint:"vertex_main"},fragment:{module:e.createShaderModule({code:r.fragment}),entryPoint:"fragment_main",targets:[{format:t}]},primitive:{topology:"triangle-list"}}),a=(e,r)=>e.createComputePipeline({label:"compute pipeline",layout:"auto",compute:{module:r,entryPoint:"computeBoundaries"}}),n=(e,r)=>e.createBuffer({label:"buffer Position",size:r.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),c=e=>{let r=new Float32Array(8*e);for(let t=0;t<e;++t)r[8*t]=2*(Math.random()-.5)*.9//position X
,r[8*t+1]=2*(Math.random()-.5)*.9//position Y
,r[8*t+2]=2*(Math.random()-.5)*.3//velocity X
,r[8*t+3]=2*(Math.random()-.5)*.3//velocity Y
,r[8*t+4]=.01//scale
,r[8*t+5]=.3*Math.random(),r[8*t+6]=.7*Math.random(),r[8*t+7]=.3*Math.random();return r},i=(e,r)=>e.createBuffer({label:"work buffer",size:r,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),o=(e,r)=>e.createBuffer({label:"result buffer",size:r,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),u=(e,r,t,a,n)=>e.createBindGroup({layout:r.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:t}},{binding:1,resource:{buffer:a}},{binding:2,resource:{buffer:n}}]}),s=(e,r,t)=>e.createBindGroup({layout:r.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:t}}]});let l=0,d=0;const v=async(e,r,t,a,n,c,i,o)=>{let u=d-l;l=d,e.queue.writeBuffer(r,0,new Float32Array([.05*u]));let s=e.createCommandEncoder({label:"doubling encoder"}),f=s.beginComputePass({label:"doubling compute pass"});f.setPipeline(t),f.setBindGroup(0,a[d%2].bindGroup),f.dispatchWorkgroups(Math.ceil(n/64)),f.end(),s.copyBufferToBuffer(a[d%2].buffer,0,c,0,c.size),e.queue.submit([s.finish()]),// Read the results
await c.mapAsync(GPUMapMode.READ),c.unmap();let p=e.createCommandEncoder({label:"doubling encoder"}),b=i.getCurrentTexture().createView()// тектура к которой привязан контекст
,g=p.beginRenderPass({colorAttachments:[{view:b,clearValue:{r:.5,g:.5,b:.5,a:1},loadOp:"clear",storeOp:"store"}]});g.setPipeline(o),g.setBindGroup(0,a[d%2].bindGroupRender),g.draw(64,n),g.end(),e.queue.submit([p.finish()]),++d,window.requestAnimationFrame(()=>v(e,r,t,a,n,c,i,o))},f=async()=>{if(!navigator.gpu){alert("Your browser does not support WebGPU :(");return}let l=document.querySelector("#canvas"),d=l.getContext("webgpu"),f=await navigator.gpu.requestAdapter();if(!f){alert("Your browser blocks access to physical gpu :(");return}let p=await f.requestDevice(),b=navigator.gpu.getPreferredCanvasFormat()// формат данных в которых храняться пиксели в физическом устройстве
;d.configure({device:p,format:b,alphaMode:"opaque"});let g=r(p),m=t(p,e,b),P=a(p,g),x=new Float32Array([1]),w=c(1e5),y=n(p,x),V=i(p,w.byteLength),B=i(p,w.byteLength),h=o(p,w.byteLength);p.queue.writeBuffer(y,0,x),p.queue.writeBuffer(V,0,w),p.queue.writeBuffer(B,0,w);let I=[{bindGroup:u(p,P,V,B,y),buffer:V,bindGroupRender:s(p,m,V)},{bindGroup:u(p,P,B,V,y),buffer:B,bindGroupRender:s(p,m,B)}];v(p,y,P,I,1e5,h,d,m)};f();//# sourceMappingURL=index.a7624794.js.map

//# sourceMappingURL=index.a7624794.js.map
