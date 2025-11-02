uniform float uTime;
uniform vec3 uColor;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
  // Scale UVs for more stripes
  vec2 particleUv = vUv * 20.0;

  // Create continuous downward movement (tunnel effect)
  float offsetUvY = vUv.y + uTime * 0.5;
  float yPos = fract(offsetUvY * 20.0);

  // Create many thick vertical stripes
  vec2 cellUv = fract(particleUv) - 0.5;

  // Create repeating vertical stripes pattern
  float pattern = mod(particleUv.x, 2.5);
  float streak = 0.0;

  // Every stripe
  if (pattern < 1.2) {
    // Create thick vertical streaks
    float width = 0.3;
    float streakAlpha = 1.0 - smoothstep(0.0, width, abs(cellUv.x));

    // Add tunnel-like radial effect based on UV
    float radius = distance(vUv, vec2(0.5));
    float tunnelEffect = 1.0 - smoothstep(0.3, 0.7, radius);

    streak = streakAlpha * tunnelEffect;
  }

  // Bright colors with gradient
  vec3 color = uColor;

  // Create tunnel falling gradient
  float gradientY = fract(vUv.y * 10.0 + uTime);
  float intensity = 1.0 - smoothstep(0.0, 0.3, gradientY);

  // Bright glow for stripes
  if (streak > 0.0) {
    color = mix(uColor * 0.6, uColor * 2.0, streak * intensity);
  } else {
    color = uColor * 0.4;
  }

  gl_FragColor = vec4(color, 1.0);
}
