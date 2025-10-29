import { useEffect, useMemo, useRef, useState } from "react";

type ChristmasCountdownProps = {
    /** Message affiché quand le compte à rebours est terminé */
    endMessage?: string;
    /** Callback déclenché à la fin du compte à rebours */
    onComplete?: () => void;
    /** Date cible personnalisée (facultative). Par défaut : prochain 25 décembre 00:00:00 */
    targetDate?: Date;
};

/**
 * @returns la prochaine date de Noël (25 décembre à 00:00:00) à partir d'aujourd'hui
 */
function getNextChristmas(): Date {
    const now = new Date();
    const year = now.getFullYear();

    // ⚠️ Noël ciblé à minuit local
    const christmasThisYear = new Date(year, 11, 25, 0, 0, 0, 0); // mois: 0=janvier, 11=décembre

    // Si on a déjà dépassé Noël cette année, on vise l'année suivante
    if (now >= christmasThisYear) {
        return new Date(year + 1, 11, 25, 0, 0, 0, 0);
    }
    return christmasThisYear;
}

/**
 * Formate un nombre avec un zéro non significatif (ex: 7 -> "07")
 */
function pad2(n: number): string {
    return n.toString().padStart(2, "0");
}

/**
 * Décompose un delta en millisecondes en jours/heures/minutes/secondes
 */
function breakdown(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
}

export default function ChristmasCountdown({
    endMessage = "Joyeux Noël ! 🎄",
    onComplete,
    targetDate,
}: ChristmasCountdownProps) {
    // 🗓️ Calcule la cible une seule fois (ou utilise celle fournie)
    const target = useMemo(
        () => targetDate ?? getNextChristmas(),
        [targetDate]
    );

    // ⏱️ State = temps restant en ms
    const [remaining, setRemaining] = useState(
        () => target.getTime() - Date.now()
    );

    // 🔁 Référence pour l'intervalle (permet un nettoyage propre)
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        // ✅ Utilise Date.now() pour éviter une dérive liée à setInterval
        const tick = () => {
            const delta = target.getTime() - Date.now();
            setRemaining(delta);
            if (delta <= 0) {
                // Arrêt immédiat quand c'est terminé
                if (intervalRef.current) {
                    window.clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                onComplete?.();
            }
        };

        // Démarre le timer toutes les 1s
        intervalRef.current = window.setInterval(tick, 1000);
        // Tick initial instantané pour ne pas attendre 1s
        tick();

        // 🧹 Nettoyage
        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [target, onComplete]);

    // 🧮 Décomposition du temps restant
    const { days, hours, minutes, seconds } = breakdown(remaining);

    // 🎨 Styles simples (pas de framework requis)
    const wrapperStyle: React.CSSProperties = {
        display: "grid",
        gap: "0.75rem",
        justifyItems: "center",
        textAlign: "center",
    };

    const gridStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(70px, 1fr))",
        gap: "0.5rem",
    };

    const cellStyle: React.CSSProperties = {
        borderRadius: "1rem",
        padding: "0.75rem 0.5rem",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    };

    const valueStyle: React.CSSProperties = {
        fontSize: "1.75rem",
        fontWeight: 800,
        lineHeight: 1.2,
    };

    const labelStyle: React.CSSProperties = {
        fontSize: "0.75rem",
        opacity: 0.7,
        marginTop: "0.25rem",
        letterSpacing: "0.02em",
        textTransform: "uppercase",
    };

    const finished = remaining <= 0;

    return (
        <section
            aria-live="polite"
            style={wrapperStyle}
        >
            {finished ? (
                // 🥳 Message final
                <div
                    role="status"
                    style={{ fontSize: "1.5rem", fontWeight: 700 }}
                >
                    {endMessage}
                </div>
            ) : (
                <>
                    {/* ⏳ Grille J/H/M/S */}
                    <div style={gridStyle}>
                        <div
                            style={cellStyle}
                            aria-label={`${days} jours restants`}
                        >
                            <div style={valueStyle}>{days}</div>
                            <div style={labelStyle}>
                                {days > 1 ? "Jours" : "Jour"}
                            </div>
                        </div>

                        <div
                            style={cellStyle}
                            aria-label={`${hours} heures restantes`}
                        >
                            <div style={valueStyle}>{pad2(hours)}</div>
                            <div style={labelStyle}>
                                {hours > 1 ? "Heures" : "Heure"}
                            </div>
                        </div>

                        <div
                            style={cellStyle}
                            aria-label={`${minutes} minutes restantes`}
                        >
                            <div style={valueStyle}>{pad2(minutes)}</div>
                            <div style={labelStyle}>
                                {minutes > 1 ? "Minutes" : "Minute"}
                            </div>
                        </div>

                        <div
                            style={cellStyle}
                            aria-label={`${seconds} secondes restantes`}
                        >
                            <div style={valueStyle}>{pad2(seconds)}</div>
                            <div style={labelStyle}>
                                {seconds > 1 ? "Secondes" : "Seconde"}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
