import React from "react";
import { MusicContext } from "../music/MusicProvider";
import "./MusicControls.css"; // ← import du CSS

export default function MusicControls() {
    const { enabled, disable, enableWithUserGesture, volume, setVolume } =
        React.useContext(MusicContext);

    return (
        // 🧊 panneau flottant en bas/droite, style verre dépoli
        <div
            className="music-ctrl"
            role="region"
            aria-label="Contrôles musique"
        >
            {/* Bouton On/Off */}
            {enabled ? (
                <button
                    onClick={disable}
                    className="music-ctrl__btn"
                    aria-label="Couper la musique"
                    title="Couper"
                >
                    Couper
                </button>
            ) : (
                <button
                    onClick={() => enableWithUserGesture()}
                    className="music-ctrl__btn"
                    aria-label="Activer la musique"
                    title="Activer"
                >
                    Activer
                </button>
            )}

            {/* Curseur de volume */}
            <div className="music-ctrl__vol">
                <span aria-hidden="true">Vol.</span>
                <input
                    className="music-ctrl__range"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    aria-label="Volume"
                    aria-valuemin={0}
                    aria-valuemax={1}
                    aria-valuenow={volume}
                />
                <span className="music-ctrl__value">
                    {Math.round(volume * 100)}%
                </span>
            </div>
        </div>
    );
}
