import { useEffect, useRef } from 'react';

const VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Star Nest — adapted from Pablo Román Andrioli (MIT)
const FRAG_SRC = `
precision highp float;
uniform float u_time;
uniform vec2  u_res;

const int   ITER    = 17;
const int   VSTEPS  = 20;
const float FPARAM  = 0.53;
const float SSTEP   = 0.1;
const float ZOOM    = 0.8;
const float TILE    = 0.85;
const float SPEED   = 0.003;
const float BRIGHT  = 0.0015;
const float DARK    = 0.300;
const float DFADE   = 0.730;
const float SAT     = 0.850;

void main() {
  vec2 uv = gl_FragCoord.xy / u_res - 0.5;
  uv.y   *= u_res.y / u_res.x;

  vec3 dir  = vec3(uv * ZOOM, 1.0);
  float t   = u_time * SPEED + 0.25;

  float a1 = 0.5 + sin(t * 0.07) * 0.15;
  float a2 = 0.8 + cos(t * 0.05) * 0.10;
  mat2 r1 = mat2(cos(a1), sin(a1), -sin(a1), cos(a1));
  mat2 r2 = mat2(cos(a2), sin(a2), -sin(a2), cos(a2));

  dir.xz *= r1;
  dir.xy *= r2;

  vec3 from = vec3(1.0, 0.5, 0.5);
  from += vec3(t * 2.0, t, -2.0);
  from.xz *= r1;
  from.xy *= r2;

  float s = 0.1, fade = 1.0;
  vec3  v = vec3(0.0);

  for (int r = 0; r < VSTEPS; r++) {
    vec3 p = from + s * dir * 0.5;
    p = abs(vec3(TILE) - mod(p, vec3(TILE * 2.0)));
    float pa = 0.0, a = 0.0;
    for (int i = 0; i < ITER; i++) {
      p  = abs(p) / dot(p, p) - FPARAM;
      a += abs(length(p) - pa);
      pa = length(p);
    }
    float dm = max(0.0, DARK - a * a * 0.001);
    a *= a * a;
    if (r > 6) fade *= 1.0 - dm;
    v += fade;
    v += vec3(s, s * s, s * s * s * s) * a * BRIGHT * fade;
    fade *= DFADE;
    s   += SSTEP;
  }

  v = mix(vec3(length(v)), v, SAT);
  // Extra dim so gameplay elements pop
  gl_FragColor = vec4(v * 0.006, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s) ?? 'shader error');
  return s;
}

function createProgram(gl: WebGLRenderingContext, vert: string, frag: string): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, createShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, createShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(p) ?? 'link error');
  return p;
}

export default function StarNestShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    let prog: WebGLProgram;
    try {
      prog = createProgram(gl, VERT_SRC, FRAG_SRC);
    } catch (e) {
      console.error('StarNest shader failed:', e);
      return;
    }

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');

    gl.useProgram(prog);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    let rafId: number;
    const start = performance.now();

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      const elapsed = (performance.now() - start) / 1000;
      gl!.uniform1f(uTime, elapsed);
      gl!.uniform2f(uRes, canvas.width, canvas.height);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
