// src/components/MusicGate.tsx
import React, { useEffect, useMemo, useState } from "react";
import { MusicContext } from "../music/MusicProvider";

const LS_KEY_PREF = "music:pref";

export default function MusicGate() {
    const { enableWithUserGesture, disable, setVolume, volume } =
        React.useContext(MusicContext);
    const [open, setOpen] = useState<boolean>(false);
    const [tempVolume, setTempVolume] = useState<number>(volume);

    // ↓ On n'affiche la modale que si aucune préférence n'est encore stockée
    useEffect(() => {
        const pref = localStorage.getItem(LS_KEY_PREF);
        if (pref !== "on" && pref !== "off") {
            setOpen(true);
        }
    }, []);

    // ↓ Empêche le scroll quand la modale est ouverte
    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [open]);

    // ↓ Accessibilité : focus sur le premier bouton
    const firstBtnRef = React.useRef<HTMLButtonElement | null>(null);
    useEffect(() => {
        if (open && firstBtnRef.current) {
            firstBtnRef.current.focus();
        }
    }, [open]);

    const handleAcceptWithMusic = async () => {
        // ⚠️ Très important : lancer play() dans ce handler (geste utilisateur)
        await enableWithUserGesture(tempVolume);
        setVolume(tempVolume);
        setOpen(false);
    };

    const handleContinueWithout = () => {
        disable();
        setOpen(false);
    };

    const modal = useMemo(() => {
        if (!open) return null;
        return (
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="music-title"
                className="fixed inset-0 z-50 flex items-center justify-center"
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60"
                    onClick={handleContinueWithout}
                />
                {/* Contenu */}
                <div className="relative z-10 w-[min(92vw,560px)] rounded-2xl bg-white p-6 shadow-2xl">
                    <h2
                        id="music-title"
                        className="text-xl font-semibold mb-2"
                    >
                        Musique en fond sonore
                    </h2>
                    <p className="text-sm text-gray-700 mb-4">
                        Ce site peut jouer une musique en boucle. Souhaitez-vous
                        continuer avec la musique&nbsp;?
                    </p>

                    <div className="mb-5">
                        <label
                            htmlFor="volume"
                            className="block text-sm font-medium mb-2"
                        >
                            Volume initial
                        </label>
                        <input
                            id="volume"
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={tempVolume}
                            onChange={(e) =>
                                setTempVolume(Number(e.target.value))
                            }
                            className="w-full"
                            aria-valuemin={0}
                            aria-valuemax={1}
                            aria-valuenow={tempVolume}
                        />
                        <div className="text-xs text-gray-600 mt-1">
                            {Math.round(tempVolume * 100)}%
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                            ref={firstBtnRef}
                            onClick={handleAcceptWithMusic}
                            className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-black text-white hover:bg-black/90 transition"
                        >
                            Poursuivre avec musique
                        </button>
                        <button
                            onClick={handleContinueWithout}
                            className="inline-flex items-center justify-center rounded-xl px-4 py-2 border border-gray-300 hover:bg-gray-50 transition"
                        >
                            Poursuivre sans musique
                        </button>
                    </div>
                </div>
            </div>
        );
    }, [open, tempVolume, handleAcceptWithMusic, handleContinueWithout]);

    return modal;
}
