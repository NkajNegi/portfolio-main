import { useEffect, useRef } from 'react'

/**
 * Brand-tinted WebGL fluid-cursor ("splash") — a self-contained port of Pavel
 * Dobryakov's fluid simulation (MIT), trimmed to the core sim (no bloom/sunrays)
 * and wired for this site.
 *
 * Layering / realism: a single fixed, full-viewport canvas at `-z-[1]`, mounted
 * beside AmbientBackground — above the page background, BEHIND all content. The
 * splashes glow up through the translucent `.surface` cards and section gaps
 * instead of smearing over text, so text stays crisp and the fluid reads as part
 * of the page. Fixed positioning means the splashes live in viewport space while
 * the page scrolls under them.
 *
 * Guardrails (this is the heaviest effect on the site):
 *  - Desktop width + fine pointer + motion-OK only; otherwise a no-op.
 *  - WebGL2 required; graceful no-op if the context can't be created.
 *  - Low resolution (128 sim / 512 dye), short-lived trails (fast dissipation).
 *  - Pauses when the tab is hidden.
 *  - Full teardown on unmount (resources deleted, context lost, listeners off).
 */

const config = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 4.2, // high → trails fade fast (not persistent smoke)
  VELOCITY_DISSIPATION: 2.5,
  PRESSURE: 0.1,
  PRESSURE_ITERATIONS: 20,
  CURL: 3,
  SPLAT_RADIUS: 0.18,
  SPLAT_FORCE: 5500,
}

// Brand hues only (violet / fuchsia / cyan), normalized 0..1.
const BRAND = [
  { r: 0.659, g: 0.333, b: 0.969 }, // #a855f7 violet
  { r: 0.91, g: 0.475, b: 0.976 }, // #e879f9 fuchsia
  { r: 0.024, g: 0.714, b: 0.831 }, // #06b6d4 cyan
]
const DYE_INTENSITY = 0.15 // low intensity → subtle glow, not neon paint

type Pointer = {
  id: number
  texcoordX: number
  texcoordY: number
  prevTexcoordX: number
  prevTexcoordY: number
  deltaX: number
  deltaY: number
  down: boolean
  moved: boolean
  color: { r: number; g: number; b: number }
}

type FBO = {
  texture: WebGLTexture
  fbo: WebGLFramebuffer
  width: number
  height: number
  texelSizeX: number
  texelSizeY: number
  attach: (id: number) => number
}

type DoubleFBO = {
  width: number
  height: number
  texelSizeX: number
  texelSizeY: number
  read: FBO
  write: FBO
  swap: () => void
}

export function SplashCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvas = canvasRef.current
    if (!canvas || !fine || reduce) return

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    })
    if (!gl) return // graceful no-op — no WebGL2

    gl.getExtension('EXT_color_buffer_float')
    const supportLinear = !!gl.getExtension('OES_texture_float_linear')

    const texType = gl.HALF_FLOAT
    const rgba = { internalFormat: gl.RGBA16F, format: gl.RGBA }
    const rg = { internalFormat: gl.RG16F, format: gl.RG }
    const r = { internalFormat: gl.R16F, format: gl.RED }
    const filtering = supportLinear ? gl.LINEAR : gl.NEAREST

    // ── Shaders ──────────────────────────────────────────────────────────────
    const baseVertex = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }`

    const copyFrag = `
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv; uniform sampler2D uTexture;
      void main () { gl_FragColor = texture2D(uTexture, vUv); }`

    const clearFrag = `
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv; uniform sampler2D uTexture; uniform float value;
      void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`

    const splatFrag = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; uniform sampler2D uTarget; uniform float aspectRatio;
      uniform vec3 color; uniform vec2 point; uniform float radius;
      void main () {
        vec2 p = vUv - point.xy; p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }`

    const advectionFrag = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; uniform sampler2D uVelocity; uniform sampler2D uSource;
      uniform vec2 texelSize; uniform vec2 dyeTexelSize; uniform float dt; uniform float dissipation;
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st); vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main () {
      #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
      #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
      #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }`

    const divergenceFrag = `
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }`

    const curlFrag = `
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }`

    const vorticityFrag = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }`

    const pressureFrag = `
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }`

    const gradientFrag = `
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }`

    const displayFrag = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uTexture; uniform vec2 texelSize;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
      }`

    // ── GL helpers ─────────────────────────────────────────────────────────────
    const shaders: WebGLShader[] = []
    const programs: WebGLProgram[] = []

    function compile(type: number, source: string): WebGLShader {
      const shader = gl!.createShader(type) as WebGLShader
      gl!.shaderSource(shader, source)
      gl!.compileShader(shader)
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.warn('[SplashCursor] shader compile failed:', gl!.getShaderInfoLog(shader))
      }
      shaders.push(shader)
      return shader
    }

    function makeProgram(vsSource: string, fsSource: string, defines = ''): WebGLProgram {
      const prefix = defines ? defines + '\n' : ''
      const vs = compile(gl!.VERTEX_SHADER, prefix + vsSource)
      const fs = compile(gl!.FRAGMENT_SHADER, prefix + fsSource)
      const program = gl!.createProgram() as WebGLProgram
      gl!.attachShader(program, vs)
      gl!.attachShader(program, fs)
      gl!.linkProgram(program)
      if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
        console.warn('[SplashCursor] program link failed:', gl!.getProgramInfoLog(program))
      }
      programs.push(program)
      return program
    }

    function uniforms(program: WebGLProgram): Record<string, WebGLUniformLocation | null> {
      const map: Record<string, WebGLUniformLocation | null> = {}
      const count = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS) as number
      for (let i = 0; i < count; i++) {
        const name = gl!.getActiveUniform(program, i)!.name
        map[name] = gl!.getUniformLocation(program, name)
      }
      return map
    }

    // Fullscreen triangle/quad
    const quad = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    const indexBuffer = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)

    function blit(target: FBO | null) {
      if (target == null) {
        gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight)
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null)
      } else {
        gl!.viewport(0, 0, target.width, target.height)
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo)
      }
      gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0)
    }

    function createFBO(w: number, h: number, internalFormat: number, format: number): FBO {
      gl!.activeTexture(gl!.TEXTURE0)
      const texture = gl!.createTexture() as WebGLTexture
      gl!.bindTexture(gl!.TEXTURE_2D, texture)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filtering)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filtering)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
      gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, w, h, 0, format, texType, null)

      const fbo = gl!.createFramebuffer() as WebGLFramebuffer
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo)
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0)
      gl!.viewport(0, 0, w, h)
      gl!.clear(gl!.COLOR_BUFFER_BIT)

      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        attach(id: number) {
          gl!.activeTexture(gl!.TEXTURE0 + id)
          gl!.bindTexture(gl!.TEXTURE_2D, texture)
          return id
        },
      }
    }

    function createDoubleFBO(
      w: number,
      h: number,
      internalFormat: number,
      format: number,
    ): DoubleFBO {
      let fbo1 = createFBO(w, h, internalFormat, format)
      let fbo2 = createFBO(w, h, internalFormat, format)
      return {
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        get read() {
          return fbo1
        },
        set read(v) {
          fbo1 = v
        },
        get write() {
          return fbo2
        },
        set write(v) {
          fbo2 = v
        },
        swap() {
          const temp = fbo1
          fbo1 = fbo2
          fbo2 = temp
        },
      }
    }

    function getResolution(resolution: number) {
      let aspect = gl!.drawingBufferWidth / gl!.drawingBufferHeight
      if (aspect < 1) aspect = 1 / aspect
      const min = Math.round(resolution)
      const max = Math.round(resolution * aspect)
      return gl!.drawingBufferWidth > gl!.drawingBufferHeight
        ? { width: max, height: min }
        : { width: min, height: max }
    }

    // ── Programs ───────────────────────────────────────────────────────────────
    const copyProg = makeProgram(baseVertex, copyFrag)
    const clearProg = makeProgram(baseVertex, clearFrag)
    const splatProg = makeProgram(baseVertex, splatFrag)
    const advectionProg = makeProgram(
      baseVertex,
      advectionFrag,
      supportLinear ? '' : '#define MANUAL_FILTERING',
    )
    const divergenceProg = makeProgram(baseVertex, divergenceFrag)
    const curlProg = makeProgram(baseVertex, curlFrag)
    const vorticityProg = makeProgram(baseVertex, vorticityFrag)
    const pressureProg = makeProgram(baseVertex, pressureFrag)
    const gradientProg = makeProgram(baseVertex, gradientFrag)
    const displayProg = makeProgram(baseVertex, displayFrag)

    const u = {
      copy: uniforms(copyProg),
      clear: uniforms(clearProg),
      splat: uniforms(splatProg),
      advection: uniforms(advectionProg),
      divergence: uniforms(divergenceProg),
      curl: uniforms(curlProg),
      vorticity: uniforms(vorticityProg),
      pressure: uniforms(pressureProg),
      gradient: uniforms(gradientProg),
      display: uniforms(displayProg),
    }

    let dye: DoubleFBO
    let velocity: DoubleFBO
    let divergence: FBO
    let curl: FBO
    let pressure: DoubleFBO

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION)
      const dyeRes = getResolution(config.DYE_RESOLUTION)
      dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format)
      velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format)
      divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format)
      curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format)
      pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format)
    }

    function resizeCanvas() {
      const w = Math.floor(canvas!.clientWidth * window.devicePixelRatio)
      const h = Math.floor(canvas!.clientHeight * window.devicePixelRatio)
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w
        canvas!.height = h
        return true
      }
      return false
    }

    // ── Simulation ─────────────────────────────────────────────────────────────
    const pointers: Pointer[] = [
      {
        id: -1,
        texcoordX: 0,
        texcoordY: 0,
        prevTexcoordX: 0,
        prevTexcoordY: 0,
        deltaX: 0,
        deltaY: 0,
        down: false,
        moved: false,
        color: { r: 0, g: 0, b: 0 },
      },
    ]

    function correctRadius(radius: number) {
      const aspect = canvas!.width / canvas!.height
      return aspect > 1 ? radius * aspect : radius
    }

    function splat(x: number, y: number, dx: number, dy: number, color: Pointer['color']) {
      gl!.useProgram(splatProg)
      gl!.uniform1i(u.splat.uTarget, velocity.read.attach(0))
      gl!.uniform1f(u.splat.aspectRatio, canvas!.width / canvas!.height)
      gl!.uniform2f(u.splat.point, x, y)
      gl!.uniform3f(u.splat.color, dx, dy, 0)
      gl!.uniform1f(u.splat.radius, correctRadius(config.SPLAT_RADIUS / 100))
      blit(velocity.write)
      velocity.swap()

      gl!.uniform1i(u.splat.uTarget, dye.read.attach(0))
      gl!.uniform3f(u.splat.color, color.r, color.g, color.b)
      blit(dye.write)
      dye.swap()
    }

    function splatPointer(p: Pointer) {
      const dx = p.deltaX * config.SPLAT_FORCE
      const dy = p.deltaY * config.SPLAT_FORCE
      splat(p.texcoordX, p.texcoordY, dx, dy, p.color)
    }

    function step(dt: number) {
      gl!.disable(gl!.BLEND)

      gl!.useProgram(curlProg)
      gl!.uniform2f(u.curl.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl!.uniform1i(u.curl.uVelocity, velocity.read.attach(0))
      blit(curl)

      gl!.useProgram(vorticityProg)
      gl!.uniform2f(u.vorticity.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl!.uniform1i(u.vorticity.uVelocity, velocity.read.attach(0))
      gl!.uniform1i(u.vorticity.uCurl, curl.attach(1))
      gl!.uniform1f(u.vorticity.curl, config.CURL)
      gl!.uniform1f(u.vorticity.dt, dt)
      blit(velocity.write)
      velocity.swap()

      gl!.useProgram(divergenceProg)
      gl!.uniform2f(u.divergence.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl!.uniform1i(u.divergence.uVelocity, velocity.read.attach(0))
      blit(divergence)

      gl!.useProgram(clearProg)
      gl!.uniform1i(u.clear.uTexture, pressure.read.attach(0))
      gl!.uniform1f(u.clear.value, config.PRESSURE)
      blit(pressure.write)
      pressure.swap()

      gl!.useProgram(pressureProg)
      gl!.uniform2f(u.pressure.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl!.uniform1i(u.pressure.uDivergence, divergence.attach(0))
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl!.uniform1i(u.pressure.uPressure, pressure.read.attach(1))
        blit(pressure.write)
        pressure.swap()
      }

      gl!.useProgram(gradientProg)
      gl!.uniform2f(u.gradient.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl!.uniform1i(u.gradient.uPressure, pressure.read.attach(0))
      gl!.uniform1i(u.gradient.uVelocity, velocity.read.attach(1))
      blit(velocity.write)
      velocity.swap()

      gl!.useProgram(advectionProg)
      gl!.uniform2f(u.advection.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      if (!supportLinear)
        gl!.uniform2f(u.advection.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY)
      const velId = velocity.read.attach(0)
      gl!.uniform1i(u.advection.uVelocity, velId)
      gl!.uniform1i(u.advection.uSource, velId)
      gl!.uniform1f(u.advection.dt, dt)
      gl!.uniform1f(u.advection.dissipation, config.VELOCITY_DISSIPATION)
      blit(velocity.write)
      velocity.swap()

      if (!supportLinear)
        gl!.uniform2f(u.advection.dyeTexelSize, dye.texelSizeX, dye.texelSizeY)
      gl!.uniform1i(u.advection.uVelocity, velocity.read.attach(0))
      gl!.uniform1i(u.advection.uSource, dye.read.attach(1))
      gl!.uniform1f(u.advection.dissipation, config.DENSITY_DISSIPATION)
      blit(dye.write)
      dye.swap()
    }

    function render() {
      gl!.disable(gl!.BLEND)
      gl!.useProgram(displayProg)
      gl!.uniform2f(u.display.texelSize, 1 / canvas!.width, 1 / canvas!.height)
      gl!.uniform1i(u.display.uTexture, dye.read.attach(0))
      gl!.clearColor(0, 0, 0, 0)
      gl!.clear(gl!.COLOR_BUFFER_BIT)
      blit(null)
    }

    // ── Input ──────────────────────────────────────────────────────────────────
    let lastColor = 0
    function brandColor() {
      const c = BRAND[Math.floor(Math.random() * BRAND.length)]
      return { r: c.r * DYE_INTENSITY, g: c.g * DYE_INTENSITY, b: c.b * DYE_INTENSITY }
    }

    function onPointerMove(e: PointerEvent) {
      const p = pointers[0]
      const rect = canvas!.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1 - (e.clientY - rect.top) / rect.height
      p.prevTexcoordX = p.texcoordX
      p.prevTexcoordY = p.texcoordY
      p.texcoordX = x
      p.texcoordY = y
      const aspect = canvas!.width / canvas!.height
      p.deltaX = (x - p.prevTexcoordX) * (aspect < 1 ? aspect : 1)
      p.deltaY = (y - p.prevTexcoordY) * (aspect > 1 ? 1 / aspect : 1)
      p.moved = Math.abs(p.deltaX) > 0 || Math.abs(p.deltaY) > 0
      const now = performance.now()
      if (now - lastColor > 250) {
        p.color = brandColor()
        lastColor = now
      }
    }

    // ── Loop ───────────────────────────────────────────────────────────────────
    let raf = 0
    let paused = false
    let lastTime = performance.now()

    function frame() {
      const now = performance.now()
      let dt = (now - lastTime) / 1000
      dt = Math.min(dt, 0.016666)
      lastTime = now

      if (resizeCanvas()) initFramebuffers()

      const p = pointers[0]
      if (p.moved) {
        p.moved = false
        splatPointer(p)
      }
      step(dt)
      render()
      raf = requestAnimationFrame(frame)
    }

    function onVisibility() {
      if (document.hidden) {
        paused = true
        cancelAnimationFrame(raf)
      } else if (paused) {
        paused = false
        lastTime = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    // ── Boot ───────────────────────────────────────────────────────────────────
    // Wait until the canvas actually has layout (clientWidth > 0) before sizing
    // the framebuffers — mounting under the preloader (or any not-yet-laid-out
    // parent) can report 0, which would build 0×0 buffers. The desktop-width
    // gate is checked here too, once real dimensions exist.
    function boot() {
      if (canvas!.clientWidth === 0 || canvas!.clientHeight === 0) {
        raf = requestAnimationFrame(boot)
        return
      }
      if (!window.matchMedia('(min-width: 1024px)').matches) return // small screen → skip
      resizeCanvas()
      initFramebuffers()
      lastTime = performance.now()
      raf = requestAnimationFrame(frame)
    }

    boot()
    window.addEventListener('pointermove', onPointerMove)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      // Free GPU resources but do NOT loseContext(): the canvas element persists
      // across React StrictMode's dev mount→cleanup→remount, and a lost context
      // is sticky — the remount would get a dead context. This top-level effect
      // only truly unmounts on full page unload, where the browser reclaims the
      // context regardless.
      programs.forEach((p) => gl.deleteProgram(p))
      shaders.forEach((s) => gl.deleteShader(s))
      gl.deleteBuffer(quad)
      gl.deleteBuffer(indexBuffer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[1] h-full w-full"
    />
  )
}
