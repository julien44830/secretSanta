// src/components/MusicControls.tsx
import React from "react";
import { MusicContext } from "../music/MusicProvider";

export default function MusicControls() {
    const { enabled, disable, enableWithUserGesture, volume, setVolume } =
        React.useContext(MusicContext);

    return (
        <div className="fixed bottom-4 right-4 rounded-2xl bg-white/90 backdrop-blur px-4 py-3 shadow-lg flex items-center gap-3">
            {/* Bouton On/Off */}
            {enabled ? (
                <button
                    onClick={disable}
                    className="text-sm rounded-md border px-3 py-1 hover:bg-gray-50"
                >
                    Couper
                </button>
            ) : (
                <button
                    onClick={() => enableWithUserGesture()}
                    className="text-sm rounded-md border px-3 py-1 hover:bg-gray-50"
                >
                    Activer
                </button>
            )}

            {/* Curseur de volume */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Vol.</span>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                />
                <span className="text-xs w-10 text-right">
                    {Math.round(volume * 100)}%
                </span>
            </div>
        </div>
    );
}
