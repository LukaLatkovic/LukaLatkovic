import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';

type Quality = 'low' | 'medium' | 'high';

@Component({
  selector: 'three-bg',
  standalone: true,
  template: `
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <canvas #canvas class="h-full w-full block"></canvas>
    </div>
  `,
})
export class ThreeBgComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  /** Enable / disable (e.g., disable on very small screens if you want) */
  @Input() enabled = true;

  /** Density preset */
  @Input() quality: Quality = 'medium';

  /** Speed multiplier */
  @Input() speed = 1;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;

  private raf = 0;
  private last = 0;

  private points!: THREE.Points;
  private lines!: THREE.LineSegments;

  private pointsMat!: THREE.PointsMaterial;
  private lineMat!: THREE.LineBasicMaterial;
  private lastIsDark: boolean | null = null;

  private positions!: Float32Array;
  private velocities!: Float32Array;

  private linePositions!: Float32Array;
  private lineGeom!: THREE.BufferGeometry;

  private disposed = false;
  private reduceMotion = false;

  // Fixed timestep accumulator (prevents “no motion” issues)
  private accum = 0;
  private frameStep = 1000 / 60; // 60hz simulation step

  // Mouse parallax state
  private mouseX = 0; // -1..1
  private mouseY = 0; // -1..1
  private targetCamX = 0;
  private targetCamY = 0;
  private camX = 0;
  private camY = 0;

  private isPointerActive = false;
  private pointerTimeout: any;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    if (!this.enabled || this.reduceMotion) return;

    this.initThree();
    this.onResize();

    // Start loop outside Angular for performance
    this.zone.runOutsideAngular(() => this.animate(0));
  }

  ngOnDestroy(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.pointerTimeout);
    this.disposeThree();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;

    this.mouseX = x;
    this.mouseY = y;

    // Mark pointer as active; fade after user stops moving
    this.isPointerActive = true;
    clearTimeout(this.pointerTimeout);
    this.pointerTimeout = setTimeout(() => (this.isPointerActive = false), 800);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.renderer || !this.camera) return;

    const width = Math.max(1, Math.floor(window.innerWidth));
    const height = Math.max(1, Math.floor(window.innerHeight));

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // cap DPR for performance
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      this.quality === 'high' ? 1.5 : 1.25
    );
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    this.camera.position.set(0, 0, 10);

    const cfg = this.getConfig();

    // Points
    const geom = new THREE.BufferGeometry();
    this.positions = new Float32Array(cfg.count * 3);
    this.velocities = new Float32Array(cfg.count * 3);

    for (let i = 0; i < cfg.count; i++) {
      const ix = i * 3;
      this.positions[ix + 0] = (Math.random() * 2 - 1) * cfg.areaX;
      this.positions[ix + 1] = (Math.random() * 2 - 1) * cfg.areaY;
      this.positions[ix + 2] = (Math.random() * 2 - 1) * cfg.areaZ;

      // Visible drift (scaled by speed)
      this.velocities[ix + 0] = (Math.random() * 2 - 1) * cfg.v;
      this.velocities[ix + 1] = (Math.random() * 2 - 1) * cfg.v;
      this.velocities[ix + 2] = (Math.random() * 2 - 1) * cfg.v;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.pointsMat = new THREE.PointsMaterial({
      size: cfg.pointSize,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: new THREE.Color(0xffffff),
    });

    this.points = new THREE.Points(geom, this.pointsMat);
    this.scene.add(this.points);

    // Lines (dynamic)
    this.lineGeom = new THREE.BufferGeometry();
    this.linePositions = new Float32Array(cfg.maxSegments * 2 * 3);
    this.lineGeom.setAttribute(
      'position',
      new THREE.BufferAttribute(this.linePositions, 3)
    );

    this.lineMat = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: cfg.lineOpacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: new THREE.Color(0xffffff),
    });

    this.lines = new THREE.LineSegments(this.lineGeom, this.lineMat);
    this.scene.add(this.lines);

    // initial theme colors
    this.applyThemeColors();
  }

  private getConfig() {
    if (this.quality === 'low') {
      return {
        count: 70,
        maxSegments: 90,
        linkDist: 1.9,
        v: 0.015 * this.speed,
        areaX: 5.8,
        areaY: 3.6,
        areaZ: 2.6,
        pointSize: 0.055,
        lineOpacity: 0.12,
      };
    }

    if (this.quality === 'high') {
      return {
        count: 160,
        maxSegments: 260,
        linkDist: 2.2,
        v: 0.02 * this.speed,
        areaX: 6.8,
        areaY: 4.2,
        areaZ: 3.2,
        pointSize: 0.06,
        lineOpacity: 0.14,
      };
    }

    return {
      count: 110,
      maxSegments: 180,
      linkDist: 2.1,
      v: 0.018 * this.speed,
      areaX: 6.2,
      areaY: 3.9,
      areaZ: 2.9,
      pointSize: 0.058,
      lineOpacity: 0.13,
    };
  }

  private animate = (t: number) => {
    if (this.disposed) return;

    if (!this.last) this.last = t;
    let dt = t - this.last;
    this.last = t;

    // Clamp to avoid huge jumps after tab switch
    dt = Math.min(dt, 50);

    this.accum += dt;

    // Limit steps so we stay performant
    const maxSteps = 3;
    let steps = 0;

    while (this.accum >= this.frameStep && steps < maxSteps) {
      this.step(this.getConfig());
      this.accum -= this.frameStep;
      steps++;
    }

    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.animate);
  };

  private step(cfg: ReturnType<ThreeBgComponent['getConfig']>) {
    // Theme-aware colors: white in dark, black in light
    this.applyThemeColors();

    // Mouse parallax (smooth)
    const strengthX = this.isPointerActive ? 0.7 : 0.25;
    const strengthY = this.isPointerActive ? 0.45 : 0.18;

    this.targetCamX = this.mouseX * strengthX;
    this.targetCamY = -this.mouseY * strengthY;

    this.camX += (this.targetCamX - this.camX) * 0.06;
    this.camY += (this.targetCamY - this.camY) * 0.06;

    this.camera.position.x = this.camX;
    this.camera.position.y = this.camY;
    this.camera.lookAt(0, 0, 0);

    // Move points with wrap-around
    for (let i = 0; i < cfg.count; i++) {
      const ix = i * 3;

      this.positions[ix + 0] += this.velocities[ix + 0];
      this.positions[ix + 1] += this.velocities[ix + 1];
      this.positions[ix + 2] += this.velocities[ix + 2];

      if (this.positions[ix + 0] > cfg.areaX) this.positions[ix + 0] = -cfg.areaX;
      if (this.positions[ix + 0] < -cfg.areaX) this.positions[ix + 0] = cfg.areaX;

      if (this.positions[ix + 1] > cfg.areaY) this.positions[ix + 1] = -cfg.areaY;
      if (this.positions[ix + 1] < -cfg.areaY) this.positions[ix + 1] = cfg.areaY;

      if (this.positions[ix + 2] > cfg.areaZ) this.positions[ix + 2] = -cfg.areaZ;
      if (this.positions[ix + 2] < -cfg.areaZ) this.positions[ix + 2] = cfg.areaZ;
    }

    (this.points.geometry as THREE.BufferGeometry).attributes['position'].needsUpdate =
      true;

    // Rebuild line segments based on distance
    let seg = 0;
    const linkDist2 = cfg.linkDist * cfg.linkDist;

    for (let i = 0; i < cfg.count; i++) {
      const ia = i * 3;
      const ax = this.positions[ia + 0];
      const ay = this.positions[ia + 1];
      const az = this.positions[ia + 2];

      for (let j = i + 1; j < cfg.count; j++) {
        const ib = j * 3;
        const dx = ax - this.positions[ib + 0];
        const dy = ay - this.positions[ib + 1];
        const dz = az - this.positions[ib + 2];
        const d2 = dx * dx + dy * dy + dz * dz;

        if (d2 < linkDist2) {
          if (seg >= cfg.maxSegments) break;

          const lp = seg * 2 * 3;

          this.linePositions[lp + 0] = ax;
          this.linePositions[lp + 1] = ay;
          this.linePositions[lp + 2] = az;

          this.linePositions[lp + 3] = this.positions[ib + 0];
          this.linePositions[lp + 4] = this.positions[ib + 1];
          this.linePositions[lp + 5] = this.positions[ib + 2];

          seg++;
        }
      }
      if (seg >= cfg.maxSegments) break;
    }

    this.lineGeom.setDrawRange(0, seg * 2);
    this.lineGeom.attributes['position'].needsUpdate = true;
  }

  private applyThemeColors() {
    if (!this.pointsMat || !this.lineMat) return;

    const isDark = document.documentElement.classList.contains('dark');
    if (this.lastIsDark === isDark) return;
    this.lastIsDark = isDark;

    if (isDark) {
      // Dark mode: bright + additive blending
      this.pointsMat.color.set(0xffffff);
      this.pointsMat.opacity = 0.9;
      this.pointsMat.blending = THREE.AdditiveBlending;

      this.lineMat.color.set(0xffffff);
      this.lineMat.opacity = this.getConfig().lineOpacity;
      this.lineMat.blending = THREE.AdditiveBlending;
    } else {
      // Light mode: black ink look + normal blending
      this.pointsMat.color.set(0x000000);
      this.pointsMat.opacity = 0.28;
      this.pointsMat.blending = THREE.NormalBlending;

      this.lineMat.color.set(0x000000);
      this.lineMat.opacity = 0.2;
      this.lineMat.blending = THREE.NormalBlending;
    }

    this.pointsMat.needsUpdate = true;
    this.lineMat.needsUpdate = true;
  }

  private disposeThree(): void {
    try {
      if (this.points) {
        (this.points.geometry as THREE.BufferGeometry).dispose();
        (this.points.material as THREE.Material).dispose();
      }
      if (this.lines) {
        (this.lines.geometry as THREE.BufferGeometry).dispose();
        (this.lines.material as THREE.Material).dispose();
      }
      if (this.renderer) this.renderer.dispose();
    } catch {
      // ignore
    }
  }
}
