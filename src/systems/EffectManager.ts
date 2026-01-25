
import Phaser from "phaser";
import { HexColor, hexTo0x } from "../config/colors";

export class EffectManager {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // Generate texture for particles
        const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture("particle_dot", 8, 8);
        graphics.destroy();
    }

    spawnPopParticles(x: number, y: number, colorHex: HexColor, count: number = 12) {
        // High-quality "Juicy" Pop Effect
        // We create a one-off emitter to handle specific colors perfectly during chain reactions.
        // Phaser's internal particle pool handles the heavy lifting of the particles themselves.

        const tint = hexTo0x(colorHex);

        const emitter = this.scene.add.particles(x, y, "particle_dot", {
            lifespan: { min: 600, max: 800 },
            speed: { min: 150, max: 350 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            gravityY: 300,
            angle: { min: 0, max: 360 },
            quantity: count,
            emitting: false,
            tint: tint,
            // Add a small "pop" feel with blend mode (optional, but looks nice for neon)
            blendMode: Phaser.BlendModes.ADD
        });

        // Burst!
        emitter.explode(count);

        // Auto-cleanup - destroy the emitter once particles are dead
        // 800ms lifespan + buffer
        this.scene.time.delayedCall(1000, () => {
            emitter.destroy();
        });
    }

    spawnFloatingText(x: number, y: number, text: string, color: number = 0xffffff) {
        const txt = this.scene.add.text(x, y, text, {
            fontFamily: "Arial, sans-serif",
            fontSize: "28px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4,
            fontStyle: "bold"
        });
        txt.setOrigin(0.5);
        txt.setTint(color);
        txt.setDepth(200);

        // Floats up, fades out, scales DOWN slightly
        this.scene.tweens.add({
            targets: txt,
            y: y - 80,
            scale: { from: 1.2, to: 0.8 }, // Start popped, shrink slightly
            alpha: { from: 1, to: 0 },
            duration: 800,
            ease: "Cubic.Out",
            onComplete: () => txt.destroy()
        });
    }

    shake(intensity: number = 0.01, duration: number = 100) {
        this.scene.cameras.main.shake(duration, intensity);
    }
}
