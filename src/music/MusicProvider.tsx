// src/music/MusicProvider.tsx
import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

type MusicContextType = {
    // état courant
    enabled: boolean;
    volume: number;
    // actions
    enableWithUserGesture: (initialVolume?: number) => Promise<void>;
    disable: () => void;
    setVolume: (v: number) => void;
};

export const MusicContext = createContext<MusicContextType>({
    // valeurs par défaut (non utilisées directement)
    enabled: false,
    volume: 0.5,
    enableWithUserGesture: async () => {},
    disable: () => {},
    setVolume: () => {},
});

type Props = {
    src?: string; // chemin du MP3, ex: "/audio/loop.mp3"
    children: React.ReactNode;
};

const LS_KEY_PREF = "music:pref"; // "on" | "off"
const LS_KEY_VOLUME = "music:volume";

export function MusicProvider({
    src = "/christmas-loop.mp3",
    children,
}: Props) {
    // ↓ Réfs et états internes
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [enabled, setEnabled] = useState<boolean>(() => {
        // ⚠️ lecture mémoire du choix utilisateur
        const pref = localStorage.getItem(LS_KEY_PREF);
        return pref === "on";
    });
    const [volume, setVolumeState] = useState<number>(() => {
        const raw = localStorage.getItem(LS_KEY_VOLUME);
        const v = raw ? Number(raw) : 0.05;
        return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.5;
    });

    // ↓ Crée l'objet Audio une seule fois
    if (!audioRef.current) {
        const a = new Audio(src);
        a.loop = true; // boucle infinie
        a.preload = "auto";
        audioRef.current = a;
    }

    // ↓ Applique le volume côté audio
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // ↓ Persiste le volume
    useEffect(() => {
        localStorage.setItem(LS_KEY_VOLUME, String(volume));
    }, [volume]);

    // ↓ Active la musique suite à un geste utilisateur (clic)
    const enableWithUserGesture = useCallback(
        async (initialVolume?: number) => {
            // ——————————————————————————————————————————————
            // IMPORTANT : appels à play() doivent suivre un geste utilisateur,
            // on déclenche donc depuis le bouton "Avec musique".
            // ——————————————————————————————————————————————
            if (!audioRef.current) return;
            if (typeof initialVolume === "number") {
                const v = Math.min(1, Math.max(0, initialVolume));
                setVolumeState(v);
                audioRef.current.volume = v;
            }
            try {
                await audioRef.current.play();
                setEnabled(true);
                localStorage.setItem(LS_KEY_PREF, "on");
            } catch (err) {
                // ⚠️ Si play() échoue (politiques navigateur), on reste "off".
                console.error("Impossible de démarrer l'audio:", err);
                setEnabled(false);
                localStorage.setItem(LS_KEY_PREF, "off");
            }
        },
        []
    );

    const disable = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setEnabled(false);
        localStorage.setItem(LS_KEY_PREF, "off");
    }, []);

    const setVolume = useCallback((v: number) => {
        const clamped = Math.min(1, Math.max(0, v));
        setVolumeState(clamped);
    }, []);

    const value = useMemo(
        () => ({ enabled, volume, enableWithUserGesture, disable, setVolume }),
        [enabled, volume, enableWithUserGesture, disable, setVolume]
    );

    // ↓ Si la préférence était "on" (stockée), on tentera de jouer au premier clic utilisateur global
    // (utile si le navigateur bloque l'autoplay sur le tout premier render).
    useEffect(() => {
        if (!enabled) return;
        const handleFirstUserGesture = async () => {
            if (!audioRef.current) return;
            if (audioRef.current.paused) {
                try {
                    await audioRef.current.play();
                } catch (e) {
                    console.warn("Lecture différée toujours bloquée:", e);
                }
            }
            window.removeEventListener("click", handleFirstUserGesture, {
                capture: true,
            } as any);
            window.removeEventListener("keydown", handleFirstUserGesture, {
                capture: true,
            } as any);
        };
        window.addEventListener("click", handleFirstUserGesture, {
            capture: true,
        } as any);
        window.addEventListener("keydown", handleFirstUserGesture, {
            capture: true,
        } as any);
        return () => {
            window.removeEventListener("click", handleFirstUserGesture, {
                capture: true,
            } as any);
            window.removeEventListener("keydown", handleFirstUserGesture, {
                capture: true,
            } as any);
        };
    }, [enabled]);

    return (
        <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
    );
}
