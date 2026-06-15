"use client";

import { FC, useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle, Vec3 } from "ogl";
import { cn } from "@/lib/utils";

interface VoicePoweredOrbProps {
  className?: string;
  hue?: number;
  enableVoiceControl?: boolean;
  voiceSensitivity?: number;
  maxRotationSpeed?: number;
  maxHoverIntensity?: number;
  onVoiceDetected?: (detected: boolean) => void;
  externalLevel?: number;
}

const vert = /* glsl */ `
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const frag = /* glsl */ `
  precision highp float;
  uniform float iTime;
  uniform vec3 iResolution;
  uniform float hue;
  uniform float hover;
  uniform float rot;
  uniform float hoverIntensity;
  varying vec2 vUv;

  vec3 adjustHue(vec3 color, float hueDeg) {
    float angle = hueDeg * 3.14159265 / 180.0;
    float s = sin(angle);
    float c = cos(angle);
    mat3 m = mat3(
      0.299 + 0.701*c + 0.168*s, 0.587 - 0.587*c + 0.330*s, 0.114 - 0.114*c - 0.497*s,
      0.299 - 0.299*c - 0.328*s, 0.587 + 0.413*c + 0.035*s, 0.114 - 0.114*c + 0.292*s,
      0.299 - 0.300*c + 1.250*s, 0.587 - 0.588*c - 1.050*s, 0.114 + 0.886*c - 0.203*s
    );
    return clamp(color * m, 0.0, 1.0);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), u.x), mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  void main() {
    vec2 center = iResolution.xy * 0.5;
    float size = min(iResolution.x, iResolution.y);
    vec2 uv = (vUv * iResolution.xy - center) / size * 2.0;
    float s = sin(rot);
    float c = cos(rot);
    uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
    float len = length(uv);
    float pulse = hover * hoverIntensity;
    float rim = smoothstep(0.78 + pulse * 0.16, 0.18, len);
    float ring = smoothstep(0.78 + pulse * 0.2, 0.72 + pulse * 0.12, len) * smoothstep(0.95, 0.78, len);
    float n = noise(uv * 4.0 + iTime * 0.6) + noise(uv * 8.0 - iTime * 0.35) * 0.35;
    vec3 c1 = adjustHue(vec3(0.29, 0.61, 0.41), hue);
    vec3 c2 = adjustHue(vec3(0.13, 0.76, 0.85), hue);
    vec3 c3 = adjustHue(vec3(0.78, 0.91, 0.66), hue);
    vec3 color = mix(c1, c2, n);
    color = mix(color, c3, ring + pulse * 0.4);
    float alpha = clamp(rim + ring * 0.8, 0.0, 1.0);
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

export const VoicePoweredOrb: FC<VoicePoweredOrbProps> = ({
  className,
  hue = 0,
  enableVoiceControl = false,
  voiceSensitivity = 1.5,
  maxRotationSpeed = 1.2,
  maxHoverIntensity = 0.8,
  onVoiceDetected,
  externalLevel = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false, antialias: true, dpr: window.devicePixelRatio || 1 });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    container.replaceChildren(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vec3(1, 1, 1) },
        hue: { value: hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: 0 }
      }
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width * (window.devicePixelRatio || 1), height * (window.devicePixelRatio || 1));
      gl.canvas.style.width = `${width}px`;
      gl.canvas.style.height = `${height}px`;
      program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = 0;
    let rot = 0;
    const update = (time: number) => {
      raf = requestAnimationFrame(update);
      const dt = (time - last) * 0.001;
      last = time;
      const level = enableVoiceControl ? Math.min(externalLevel * voiceSensitivity, 1) : 0.08;
      if (onVoiceDetected) onVoiceDetected(level > 0.12);
      rot += dt * (0.25 + level * maxRotationSpeed);
      program.uniforms.iTime.value = time * 0.001;
      program.uniforms.hue.value = hue;
      program.uniforms.hover.value = Math.min(level * 2, 1);
      program.uniforms.hoverIntensity.value = Math.min(level * maxHoverIntensity, maxHoverIntensity);
      program.uniforms.rot.value = rot;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
    };
  }, [enableVoiceControl, externalLevel, hue, maxHoverIntensity, maxRotationSpeed, onVoiceDetected, voiceSensitivity]);

  return <div ref={containerRef} className={cn("h-40 w-40", className)} />;
};
