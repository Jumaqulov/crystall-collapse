// src/scenes/BootScene.ts
import Phaser from "phaser";
import { Colors, hexTo0x } from "../config/colors";
import { GAME, DEBUG } from "../config/constants";
import { YandexSDK } from "../services/YandexSDK";
import { ensurePhosphorTextures } from "../ui/phosphor";

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: "BootScene" });
    }

    preload() {
        this.load.setPath("assets/audio");

        // Hozircha audio fayllar yo'q, shuning uchun ularni yuklamaymiz.
        // Fayllarni topganingizda bu qatorlarni "comment"dan chiqarasiz.

        // this.load.audio("bgm_main", "bgm_main.mp3");
        // this.load.audio("sfx_shoot", "shoot.mp3");
        // this.load.audio("sfx_pop", "pop.mp3");
        // this.load.audio("sfx_bounce", "bounce.mp3");
        // this.load.audio("sfx_win", "win.mp3");
        // this.load.audio("sfx_lose", "lose.mp3");
        // this.load.audio("sfx_click", "click.mp3");
    }

    async create() {
        // Solid background immediately
        this.cameras.main.setBackgroundColor(hexTo0x(Colors.ui.background));

        // Generate icon textures
        ensurePhosphorTextures(this);

        // Ensure consistent scaling on resize
        this.setupScaleHandlers();

        // Audio contextni faollashtirish (kelajak uchun)
        this.input.once("pointerdown", () => {
            if (this.sound instanceof Phaser.Sound.WebAudioSoundManager) {
                const ctx = this.sound.context;
                if (ctx && ctx.state === "suspended") {
                    ctx.resume().catch(() => undefined);
                }
            }
        });

        const loadingText = this.add
            .text(GAME.width / 2, GAME.height / 2, "Loading...", {
                fontFamily: "Arial, sans-serif",
                fontSize: "42px",
                color: Colors.ui.textPrimary,
            })
            .setOrigin(0.5);

        // Yandex SDK (lokal muhitda xatolik bersa ham davom etadi)
        const inFrame = (() => {
            try {
                return window.self !== window.top;
            } catch {
                return true;
            }
        })();

        if (inFrame) {
            try {
                await YandexSDK.init({ debug: DEBUG.logSdk });
                if (DEBUG.logSdk) console.log("[BootScene] YandexSDK initialized");
            } catch (e) {
                if (DEBUG.logSdk) console.warn("[BootScene] YandexSDK init failed:", e);
            }
        }

        // Kichik pauza va MenuScene'ga o'tish
        this.time.delayedCall(150, () => {
            loadingText.destroy();
            this.scene.start("MenuScene");
        });
    }

    private setupScaleHandlers() {
        const scale = this.scale;
        const onResize = () => {
            this.cameras.main.centerOn(GAME.width / 2, GAME.height / 2);
        };

        scale.on(Phaser.Scale.Events.RESIZE, onResize);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scale.off(Phaser.Scale.Events.RESIZE, onResize);
        });
        onResize();
    }
}