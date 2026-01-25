// src/ui/HUD.ts
import Phaser from "phaser";
import { Colors, hexTo0x } from "../config/colors";
import { GAME } from "../config/constants";
import { getPhosphorKey } from "./phosphor";

export type HUDInitData = {
    level: number;
    score: number;
    shots: number;
    targetScore: number;
    startScore?: number;
};

export class HUD extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Graphics;

    // Progress Bar Elements
    private barContainer: Phaser.GameObjects.Container;
    private barBg: Phaser.GameObjects.Graphics;
    private barFill: Phaser.GameObjects.Graphics;
    private barShine: Phaser.GameObjects.Graphics;
    private stars: Array<{
        base: Phaser.GameObjects.Image;
        fill: Phaser.GameObjects.Image;
        glow: Phaser.GameObjects.Image;
        unlocked: boolean
    }> = [];

    private levelText: Phaser.GameObjects.Text;
    private scoreText: Phaser.GameObjects.Text;
    private targetText: Phaser.GameObjects.Text;

    // Logic
    private currentScore = 0;
    private targetScore = 1000;
    private startScore = 0;
    private barWidth = 320;
    private barHeight = 24;
    private fillPercent = 0; // 0 to 1

    constructor(scene: Phaser.Scene, data: HUDInitData) {
        super(scene, 0, 0);

        this.currentScore = data.score;
        this.targetScore = data.targetScore || 1000;
        this.startScore = data.startScore || 0;

        const barW = GAME.width - 24;
        const barH = 50; // Increased Height for glass panel
        const hudX = 12;
        const hudY = 12;

        // --- 1. GLASS PANEL BACKGROUND ---
        this.bg = scene.add.graphics();
        // Semi-transparent panel
        this.bg.fillStyle(hexTo0x(Colors.ui.panel), 0.75);
        this.bg.fillRoundedRect(hudX, hudY, barW, barH * 1.8, 16);

        // Rim Highlight (Top/Left)
        this.bg.lineStyle(2, 0xFFFFFF, 0.4);
        this.bg.strokeRoundedRect(hudX, hudY, barW, barH * 1.8, 16);

        // Gloss (Diagonal)
        this.bg.fillStyle(0xFFFFFF, 0.05);
        this.bg.fillRoundedRect(hudX, hudY, barW, barH * 0.8, { tl: 16, tr: 16, bl: 0, br: 0 });

        this.add(this.bg);

        // --- 2. JUICY PROGRESS BAR ---
        const pbX = GAME.width / 2 - this.barWidth / 2;
        const pbY = hudY + 50;

        this.barContainer = scene.add.container(0, 0);

        // Bar Background (Dark Slot)
        this.barBg = scene.add.graphics();
        this.barBg.fillStyle(0x000000, 0.5);
        this.barBg.fillRoundedRect(pbX, pbY, this.barWidth, this.barHeight, 12);
        this.barBg.lineStyle(2, 0xFFFFFF, 0.2);
        this.barBg.strokeRoundedRect(pbX, pbY, this.barWidth, this.barHeight, 12);

        // Bar Fill (Initial empty)
        this.barFill = scene.add.graphics();
        // Bar Shine (Overlay)
        this.barShine = scene.add.graphics();

        // MASK (To fix "crooked" filling at small widths)
        const maskShape = scene.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRoundedRect(pbX, pbY, this.barWidth, this.barHeight, 12);
        const mask = maskShape.createGeometryMask();

        this.barFill.setMask(mask);
        this.barShine.setMask(mask);

        this.barContainer.add([this.barBg, this.barFill, this.barShine]);
        this.add(this.barContainer);

        // --- 3. STARS (Milestones) ---
        const milestones = [0.33, 0.66, 1.0];
        milestones.forEach((pct, idx) => {
            const starX = pbX + this.barWidth * pct;
            const starY = pbY + this.barHeight / 2;

            // Base (Grey/Silhouette)
            const base = scene.add.image(starX, starY, getPhosphorKey("starFilled"));
            base.setDisplaySize(32, 32);
            base.setTint(0x555555); // Grey

            // Fill (Gold - Hidden initially)
            const fill = scene.add.image(starX, starY, getPhosphorKey("starFilled"));
            fill.setDisplaySize(32, 32);
            fill.setTint(hexTo0x(Colors.ui.reward)); // Gold
            fill.setVisible(false);

            // Glow (Bloom - Hidden)
            const glow = scene.add.image(starX, starY, getPhosphorKey("starFilled"));
            glow.setDisplaySize(48, 48);
            glow.setTint(0xFFFFFF);
            glow.setAlpha(0.6);
            glow.setBlendMode(Phaser.BlendModes.ADD);
            glow.setVisible(false);

            this.stars.push({ base, fill, glow, unlocked: false });
            this.add([base, fill, glow]);
        });

        // --- 4. TEXT LABELS ---
        const textStyle = {
            fontFamily: "Arial",
            fontSize: "18px",
            color: Colors.ui.textPrimary,
            fontStyle: "bold",
            shadow: { offsetX: 0, offsetY: 1, color: "black", blur: 2, fill: true }
        };

        this.levelText = scene.add.text(hudX + 16, hudY + 14, `LEVEL ${data.level}`, textStyle);

        this.scoreText = scene.add.text(GAME.width - 24, hudY + 14, `${this.currentScore}`, {
            ...textStyle,
            color: Colors.ui.reward,
            fontSize: "22px"
        }).setOrigin(1, 0);

        this.targetText = scene.add.text(GAME.width / 2, hudY + 14, `TARGET: ${this.targetScore}`, {
            ...textStyle, fontSize: "14px", color: Colors.ui.textSecondary
        }).setOrigin(0.5, 0);

        this.add([this.levelText, this.scoreText, this.targetText]);

        scene.add.existing(this);
        this.updateBarVisuals(0); // Init
    }

    setLevel(level: number) {
        this.levelText.setText(`LEVEL ${level}`);
    }

    setShots(shots: number) {
        // Optional: Update shots if we decide to show it in this HUD
    }



    setScore(score: number) {
        const oldScore = this.currentScore;
        this.currentScore = score;
        this.scoreText.setText(`${Math.floor(this.currentScore)}`);

        // Calculate Pct relative to level range
        // Range: [startScore, targetScore]
        const range = Math.max(1, this.targetScore - this.startScore);

        const startPct = Phaser.Math.Clamp((oldScore - this.startScore) / range, 0, 1);
        const endPct = Phaser.Math.Clamp((this.currentScore - this.startScore) / range, 0, 1);

        this.scene.tweens.addCounter({
            from: startPct,
            to: endPct,
            duration: 600,
            ease: "Cubic.Out",
            onUpdate: (tween) => {
                // SAFETY CHECK: If HUD or Scene is destroyed, stop updating
                if (!this.scene || !this.barFill) {
                    tween.stop();
                    return;
                }
                const val = tween.getValue() || 0;
                this.updateBarVisuals(val);
                this.checkStarUnlock(val);
            }
        });
    }

    private updateBarVisuals(pct: number) {
        this.fillPercent = pct;
        const pbX = GAME.width / 2 - this.barWidth / 2;
        const pbY = 12 + 50; // CORRECT: hudY (12) + 50 = 62

        const w = this.barWidth * pct;
        // Even if w is small, fillRect works fine. The Mask handles the rounded corners of the container.
        if (w <= 0) {
            this.barFill.clear();
            this.barShine.clear();
            return;
        }

        this.barFill.clear();

        // GREEN Gradient (Emerald/Success)
        // Base: Darker Green
        this.barFill.fillStyle(0x10B981, 1);
        this.barFill.fillRect(pbX, pbY, w, this.barHeight);

        // Top Highlight: Lighter Green
        this.barFill.fillStyle(0x34D399, 1);
        this.barFill.fillRect(pbX, pbY, w, this.barHeight * 0.5);

        // Shine on bar (Gloss) - cleaner
        this.barShine.clear();
        this.barShine.fillStyle(0xFFFFFF, 0.3);
        this.barShine.fillRect(pbX, pbY, w, this.barHeight * 0.4);
    }

    private checkStarUnlock(pct: number) {
        const thresholds = [0.33, 0.66, 1.0];

        thresholds.forEach((thresh, idx) => {
            const star = this.stars[idx];
            if (star && pct >= thresh && !star.unlocked) {
                this.unlockStar(idx);
            }
        });
    }

    private unlockStar(idx: number) {
        const star = this.stars[idx];
        if (!star) return;

        star.unlocked = true;

        star.fill.setVisible(true);
        star.fill.setScale(0);

        // 32px is the desired display size, native is 256px
        // Correct scale factor ~0.125
        const targetScale = 32 / 256;

        // Pop Animation
        this.scene.tweens.add({
            targets: star.fill,
            scale: targetScale * 1.5,
            duration: 300,
            ease: "Back.Out",
            onComplete: () => {
                this.scene.tweens.add({
                    targets: star.fill,
                    scale: targetScale,
                    duration: 200,
                    ease: "Quad.Out"
                });
            }
        });

        // Glow flash
        star.glow.setVisible(true);
        star.glow.setAlpha(1);
        star.glow.setScale(0.5);

        this.scene.tweens.add({
            targets: star.glow,
            scale: 2,
            alpha: 0,
            duration: 600,
            ease: "Quad.Out",
            onComplete: () => {
                star.glow.setVisible(false);
            }
        });

        // Particles
        this.spawnStarParticles(star.fill.x, star.fill.y);
    }

    private spawnStarParticles(x: number, y: number) {
        // Need a texture for particles. 'starFilled' is a Base64 texture, which works for particles too.
        const emitter = this.scene.add.particles(0, 0, getPhosphorKey("starFilled"), {
            x: x,
            y: y,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 },
            lifespan: 600,
            gravityY: 200,
            quantity: 10,
            emitting: false
        });

        // Manual burst? .explode() is Phaser 3.60+. If older, emitParticle.
        // Assuming Phaser 3.60+ based on context.
        emitter.explode(10);

        // Auto cleanup
        this.scene.time.delayedCall(1000, () => {
            emitter.destroy();
        });
    }
}