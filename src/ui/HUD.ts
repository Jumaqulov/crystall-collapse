// src/ui/HUD.ts
import Phaser from "phaser";
import { Colors, hexTo0x } from "../config/colors";
import { GAME } from "../config/constants";

export type HUDInitData = {
    level: number;
    score: number;
    shots: number;
};

export class HUD extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Graphics;
    private levelText: Phaser.GameObjects.Text;
    private scoreText: Phaser.GameObjects.Text;
    private shotsText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, data: HUDInitData) {
        super(scene, 0, 0);

        const barH = 80; // Biroz ixchamroq qilamiz
        const barMargin = 14;
        const barX = barMargin;
        const barY = 8;
        const barW = GAME.width - barMargin * 2;
        const barHInner = barH - 10;

        this.bg = scene.add.graphics();

        // 1. Shadow (Orqa soya)
        this.bg.fillStyle(0x000000, 0.4);
        this.bg.fillRoundedRect(barX + 4, barY + 6, barW, barHInner, 16);

        // 2. Glass Panel (To'q va Shaffof)
        // Yorqin ko'k emas, balki "To'q Dengiz" rangi
        this.bg.fillStyle(0x1A365D, 0.85); // Dark Blue, 85% opacity
        this.bg.fillRoundedRect(barX, barY, barW, barHInner, 16);

        // 3. Highlight (Tepa qismidagi yaltirash)
        this.bg.fillStyle(0xFFFFFF, 0.1);
        this.bg.fillRoundedRect(barX, barY, barW, barHInner / 2, { tl: 16, tr: 16, bl: 0, br: 0 });

        // 4. Border (Ingichka yaltiroq hoshiya)
        this.bg.lineStyle(2, 0x4AA6EB, 0.5); // Och ko'k hoshiya
        this.bg.strokeRoundedRect(barX, barY, barW, barHInner, 16);

        // FONTLAR (Zamonaviyroq)
        const textStyle = {
            fontFamily: "Arial, sans-serif",
            fontSize: "24px",
            color: "#E2E8F0", // Oqish-kulrang (Yumshoqroq)
            fontStyle: "bold"
        };

        // Level
        this.levelText = scene.add
            .text(barX + 20, barY + 22, `LEVEL ${data.level}`, textStyle)
            .setOrigin(0, 0);

        // Score (Katta va Oltin rangda)
        this.scoreText = scene.add
            .text(GAME.width / 2, barY + 22, `${data.score}`, {
                fontFamily: "Arial, sans-serif",
                fontSize: "32px",
                color: "#FCD34D", // Amber-Gold
                fontStyle: "bold",
                shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 4, fill: true }
            })
            .setOrigin(0.5, 0);

        // Shots
        this.shotsText = scene.add
            .text(barX + barW - 20, barY + 22, `${data.shots} LEFT`, {
                ...textStyle,
                color: "#F87171" // Och qizil (Ogohlantirish rangi)
            })
            .setOrigin(1, 0);

        this.add([this.bg, this.levelText, this.scoreText, this.shotsText]);

        scene.add.existing(this);
    }

    setLevel(level: number) {
        this.levelText.setText(`Level: ${level}`);
    }

    setScore(score: number) {
        this.scoreText.setText(`Score: ${score}`);
    }

    setShots(shots: number) {
        this.shotsText.setText(`Shots: ${shots}`);
    }

    refreshValues(data: Partial<HUDInitData>) {
        if (data.level !== undefined) this.setLevel(data.level);
        if (data.score !== undefined) this.setScore(data.score);
        if (data.shots !== undefined) this.setShots(data.shots);
    }
}