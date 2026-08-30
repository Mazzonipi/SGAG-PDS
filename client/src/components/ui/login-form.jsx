// login-form.jsx
// Converted from TSX to JSX for compatibility with this Vite/React JS project.
// SmokeyBackground uses a WebGL shader for an animated smoky canvas effect.
// LoginForm is the glassmorphism login UI that sits on top.

import { useEffect, useRef, useState } from "react";
import { User, Lock, ArrowRight } from "lucide-react";

// ──────────────────────────────────────────────
// WebGL Shader Sources
// ──────────────────────────────────────────────
const vertexSmokeySource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentSmokeySource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 u_color;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = fragCoord / iResolution;
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    float time = iTime * 0.5;

    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0;

    vec2 distortion = centeredUV;
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
        distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);

    fragColor = vec4(u_color * glow, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

// ──────────────────────────────────────────────
// SmokeyBackground Component
// Props:
//   color          - hex color string for the smoke (default: dark purple)
//   backdropBlur   - Tailwind backdrop-blur class suffix (default: "sm")
//   className      - additional classes
// ──────────────────────────────────────────────
export function SmokeyBackground({ backdropBlur = "sm", color = "#4f1b8a", className = "" }) {
  const canvasRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isHoveringRef = useRef(false);

  const hexToRgb = (hex) => {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    return [r, g, b];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported in this browser.");
      return;
    }

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSmokeySource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSmokeySource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLoc = gl.getUniformLocation(program, "iResolution");
    const iTimeLoc = gl.getUniformLocation(program, "iTime");
    const iMouseLoc = gl.getUniformLocation(program, "iMouse");
    const uColorLoc = gl.getUniformLocation(program, "u_color");

    const startTime = Date.now();
    const [r, g, b] = hexToRgb(color);
    gl.uniform3f(uColorLoc, r, g, b);

    let animFrameId;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      const currentTime = (Date.now() - startTime) / 1000;
      const mp = mousePositionRef.current;
      const hovering = isHoveringRef.current;

      gl.uniform2f(iResolutionLoc, width, height);
      gl.uniform1f(iTimeLoc, currentTime);
      gl.uniform2f(
        iMouseLoc,
        hovering ? mp.x : width / 2,
        hovering ? height - mp.y : height / 2
      );

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePositionRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseEnter = () => { isHoveringRef.current = true; };
    const handleMouseLeave = () => { isHoveringRef.current = false; };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      gl.deleteProgram(program);
    };
  }, [color]);

  const blurClass = {
    none: "backdrop-blur-none",
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
    "2xl": "backdrop-blur-2xl",
    "3xl": "backdrop-blur-3xl",
  }[backdropBlur] ?? "backdrop-blur-sm";

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className={`absolute inset-0 ${blurClass}`} />
    </div>
  );
}

// ──────────────────────────────────────────────
// LoginForm Component
// This is the glassmorphism UI shell.
// Pass onSubmit, onGoogleLogin, loading, error as props
// to wire it to your auth logic.
// ──────────────────────────────────────────────
export function LoginForm({
  onSubmit,
  loading = false,
  error = null,
  defaultEmail = "",
  defaultPassword = "",
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(email, password);
  };

  return (
    <div className="w-full max-w-sm p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Bem-vindo</h2>
        <p className="mt-2 text-sm text-gray-300">Acesse o SGAG-PDS</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* E-mail com label animada */}
        <div className="relative z-0">
          <input
            type="email"
            id="floating_email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-purple-400 peer"
            placeholder=" "
            required
          />
          <label
            htmlFor="floating_email"
            className="absolute text-sm text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-purple-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            <User className="inline-block mr-2 -mt-1" size={16} />
            E-mail de Acesso
          </label>
        </div>

        {/* Senha com label animada */}
        <div className="relative z-0">
          <input
            type="password"
            id="floating_password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-purple-400 peer"
            placeholder=" "
            required
          />
          <label
            htmlFor="floating_password"
            className="absolute text-sm text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-purple-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            <Lock className="inline-block mr-2 -mt-1" size={16} />
            Senha
          </label>
        </div>

        {/* Botão de login */}
        <button
          type="submit"
          disabled={loading}
          className="group w-full flex items-center justify-center py-3 px-4 bg-purple-700 hover:bg-purple-600 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
          ) : (
            <>
              Entrar no Sistema
              <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 pt-2">
        Apenas <span className="text-purple-300 font-semibold">Professor</span>, <span className="text-blue-300 font-semibold">Líder</span> ou <span className="text-cyan-300 font-semibold">Vice-Líder</span> possuem acesso.
      </p>
    </div>
  );
}
