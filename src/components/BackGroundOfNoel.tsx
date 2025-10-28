// ../components/BackGroundOfNoel.tsx
export default function NoelBackgroundOKLCH() {
    const FLAKES = 120;

    return (
        // ⚠️ NE PAS mettre absolute ici — c’est géré par la classe .bg-layer dans ton CSS
        <div className="bg-layer">
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                }}
                aria-hidden
            >
                <style>{`
                    :root {
                        --bg-deep-1: oklch(0.22 0.05 170);
                        --bg-deep-2: oklch(0.18 0.04 170);
                        --glow-1: oklch(0.24 0.07 25);
                        --glow-2: oklch(0.32 0.06 190);
                        --glace-300: oklch(0.98 0 0 / .9);
                    }

                    .bg-oklch {
                        background: #0b2a1f;
                        background-image:
                            radial-gradient(1200px 800px at 12% 12%, var(--glow-2), transparent 60%),
                            radial-gradient(900px 700px at 82% 28%, var(--glow-1), transparent 60%),
                            radial-gradient(1200px 1000px at 50% 95%, oklch(0.28 0.05 190), transparent 60%),
                            linear-gradient(180deg, var(--bg-deep-1), var(--bg-deep-2));
                        background-repeat: no-repeat;
                        background-size: cover;
                    }

                    @keyframes bgDrift {
                        0% { background-position: 0 0, 0 0, 0 0, 0 0; }
                        100% { background-position: -60px 30px, 40px -40px, -30px -50px, 0 0; }
                    }

                    .flake {
                        position: absolute;
                        top: -10px;
                        border-radius: 50%;
                        background: radial-gradient(circle, var(--glace-300) 0 55%, transparent 60%);
                        box-shadow: 0 0 8px oklch(0.98 0 0 / .5);
                        opacity: .9;
                        animation: fall linear infinite;
                        will-change: transform;
                    }

                    .v1 { animation-duration: 18s; filter: blur(.3px); }
                    .v2 { animation-duration: 26s; filter: blur(.8px); }
                    .v3 { animation-duration: 38s; filter: blur(1.3px); }

                    @keyframes fall {
                        to { transform: translate3d(var(--drift, 0px), 110vh, 0); }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .flake, .bg-oklch { animation: none; }
                    }
                `}</style>

                {/* Fond principal */}
                <div
                    className="bg-oklch"
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    }}
                ></div>
                {/* Flocons animés */}
                {Array.from({ length: FLAKES }).map((_, i) => {
                    const left = Math.random() * 100;
                    const delay = Math.random() * -40;
                    const variant =
                        i % 3 === 0 ? "v1" : i % 3 === 1 ? "v2" : "v3";
                    const size = 2.5 + Math.random() * 5.5;
                    const drift = `${Math.random() * 120 - 60}px`;

                    return (
                        <span
                            key={i}
                            className={`flake ${variant}`}
                            style={{
                                left: `${left}%`,
                                width: size,
                                height: size,
                                animationDelay: `${delay}s`,
                                ["--drift" as any]: drift,
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
