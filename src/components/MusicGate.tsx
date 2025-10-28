// src/components/MusicGate.tsx
import React, { useEffect, useMemo, useState } from "react";
import { MusicContext } from "../music/MusicProvider";
import "./MusicGate.css"; // ← importe le CSS

const LS_KEY_PREF = "music:pref";

export default function MusicGate() {
    const { enableWithUserGesture, disable, setVolume, volume } =
        React.useContext(MusicContext);

    const [open, setOpen] = useState<boolean>(false);
    const [tempVolume, setTempVolume] = useState<number>(volume);

    // Affiche la modale seulement si aucune préférence n'est stockée
    useEffect(() => {
        const pref = localStorage.getItem(LS_KEY_PREF);
        if (pref !== "on" && pref !== "off") setOpen(true);
    }, []);

    // Empêche le scroll quand la modale est ouverte
    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [open]);

    // Fermer via Échap
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleContinueWithout();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    // Focus sur le premier bouton
    const firstBtnRef = React.useRef<HTMLButtonElement | null>(null);
    useEffect(() => {
        if (open && firstBtnRef.current) firstBtnRef.current.focus();
    }, [open]);

    // Démarrer la musique (obligatoire: dans un handler utilisateur)
    const handleAcceptWithMusic = React.useCallback(async () => {
        await enableWithUserGesture(tempVolume);
        setVolume(tempVolume);
        localStorage.setItem(LS_KEY_PREF, "on"); // 💾 on mémorise
        setOpen(false);
    }, [enableWithUserGesture, setVolume, tempVolume]);

    // Continuer sans musique
    const handleContinueWithout = React.useCallback(() => {
        disable();
        localStorage.setItem(LS_KEY_PREF, "off"); // 💾 on mémorise
        setOpen(false);
    }, [disable]);

    const modal = useMemo(() => {
        if (!open) return null;
        return (
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="music-title"
                className="music-modal-backdrop"
                onClick={handleContinueWithout} /* click dehors → fermer */
            >
                <div
                    className="music-modal"
                    onClick={(e) =>
                        e.stopPropagation()
                    } /* bloc le clic interne */
                >
                    {/* Header */}
                    <div
                        className="music-modal__header"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <h2
                            id="music-title"
                            className="music-modal__title"
                        >
                            Musique en fond sonore
                        </h2>
                        <button
                            className="music-modal__close"
                            aria-label="Fermer"
                            onClick={handleContinueWithout}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div className="music-modal__body">
                        <p className="music-modal__desc">
                            Ce site peut jouer une musique en boucle.
                            Souhaitez-vous continuer avec la musique&nbsp;?
                        </p>

                        <div className="music-range">
                            <label
                                htmlFor="volume"
                                className="music-range__label"
                            >
                                Volume initial
                            </label>
                            <input
                                id="volume"
                                className="music-range__input"
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={tempVolume}
                                onChange={(e) =>
                                    setTempVolume(Number(e.target.value))
                                }
                                aria-valuemin={0}
                                aria-valuemax={1}
                                aria-valuenow={tempVolume}
                            />
                            <div className="music-range__value">
                                {Math.round(tempVolume * 100)}%
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="music-modal__footer">
                        <div className="music-actions">
                            <button
                                ref={firstBtnRef}
                                onClick={handleAcceptWithMusic}
                                className="btn"
                            >
                                Poursuivre avec musique
                            </button>
                            <button
                                onClick={handleContinueWithout}
                                className="btn btn--secondary"
                            >
                                Poursuivre sans musique
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [open, tempVolume, handleAcceptWithMusic, handleContinueWithout]);

    return modal;
}
