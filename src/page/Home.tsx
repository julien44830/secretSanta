// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { MusicProvider } from "../music/MusicProvider";
import MusicGate from "../components/MusicGate";
import MusicControls from "../components/MusicControls";
import ListOfPeople from "../components/ListOfPeople";
import ArrayOfPeople from "../components/ArrayOfPeople";
import NoelBackgroundOKLCH from "../components/BackGroundOfNoel";
import { createPortal } from "react-dom";

/* =========================================================
   🗄️ Clés de stockage local
   ========================================================= */
const LS_KEYS = {
    people: "secret-santa:people",
    results: "secret-santa:results",
    lastDraw: "secret-santa:lastDrawList",
} as const;

/* =========================================================
   🧰 Utilitaires localStorage
   ========================================================= */
// parse JSON sûr
function safeParse<T>(value: string | null): T | null {
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

// migration d’anciens résultats potentiellement stockés en ReactNode/JSX
function normalizeResults(v: unknown): string[] | null {
    if (!Array.isArray(v)) return null;
    const out: string[] = [];
    for (const item of v) {
        if (typeof item === "string") {
            out.push(item);
            continue;
        }
        // anciens formats possibles : on tente d’extraire un texte
        // @ts-ignore
        const t = item?.props?.children;
        if (typeof t === "string") {
            out.push(t);
            continue;
        }
        try {
            const s = String(item);
            if (s && s !== "[object Object]") out.push(s);
        } catch {
            /* ignore */
        }
    }
    return out.length ? out : null;
}

/* =========================================================
   🔀 Tirage Secret Santa (shuffle)
   ========================================================= */
function secretSanta(
    people: string[]
): Array<{ giver: string; receiver: string }> {
    if (people.length < 2) return [];
    const shuffled = [...people];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return people.map((giver, i) => ({ giver, receiver: shuffled[i] }));
}

/* =========================================================
   🏠 Page principale
   ========================================================= */
export default function Home() {
    /* ------------------ États principaux (init depuis localStorage) ------------------ */
    // Participants
    const [people, setPeople] = useState<string[]>(() => {
        const saved = safeParse<string[]>(localStorage.getItem(LS_KEYS.people));
        return Array.isArray(saved)
            ? saved.filter((x) => typeof x === "string")
            : [];
    });

    // Résultats du tirage (toujours en string[])
    const [arrayPeople, setArrayPeople] = useState<string[]>(() => {
        const raw = localStorage.getItem(LS_KEYS.results);
        const parsed = safeParse<unknown>(raw);
        const normalized = normalizeResults(parsed);
        return normalized ?? [];
    });

    // Liste utilisée lors du dernier tirage (pour bloquer si identique)
    const [lastDrawList, setLastDrawList] = useState<string[]>(() => {
        const saved = safeParse<string[]>(
            localStorage.getItem(LS_KEYS.lastDraw)
        );
        return Array.isArray(saved)
            ? saved.filter((x) => typeof x === "string")
            : [];
    });

    // Modale mobile des résultats
    const [isModalOpen, setIsModalOpen] = useState(false);

    /* ------------------ Persistance (écritures) ------------------ */
    useEffect(() => {
        try {
            localStorage.setItem(LS_KEYS.people, JSON.stringify(people));
        } catch {
            /* ignore */
        }
    }, [people]);

    useEffect(() => {
        try {
            localStorage.setItem(LS_KEYS.results, JSON.stringify(arrayPeople));
        } catch {
            /* ignore */
        }
    }, [arrayPeople]);

    useEffect(() => {
        try {
            localStorage.setItem(
                LS_KEYS.lastDraw,
                JSON.stringify(lastDrawList)
            );
        } catch {
            /* ignore */
        }
    }, [lastDrawList]);

    // (optionnel) Migration one-shot pour écraser un ancien format stocké
    useEffect(() => {
        const raw = localStorage.getItem(LS_KEYS.results);
        const parsed = safeParse<unknown>(raw);
        const normalized = normalizeResults(parsed);
        if (normalized && JSON.stringify(normalized) !== raw) {
            try {
                localStorage.setItem(
                    LS_KEYS.results,
                    JSON.stringify(normalized)
                );
            } catch {
                /* ignore */
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ------------------ Logique UI ------------------ */
    // ouvre la modale de résultats seulement en mobile
    const openModal = () => {
        if (window.matchMedia?.("(max-width: 759px)").matches) {
            setIsModalOpen(true);
        }
    };
    const closeModal = () => setIsModalOpen(false);

    // bloque la relance si mêmes participants + résultats déjà présents
    const isBlocked =
        arrayPeople.length > 0 &&
        JSON.stringify([...people].sort()) ===
            JSON.stringify([...lastDrawList].sort());

    // 🎁 Lancer le tirage (centralisé ici)
    const handleDraw = () => {
        const peopleClean = people.map((p) => p.trim()).filter(Boolean);
        if (peopleClean.length < 2) {
            setArrayPeople(["⚠️ Il faut au moins 2 personnes pour le tirage."]);
            openModal(); // en mobile : montre le message dans la modale
            return;
        }
        if (isBlocked) return;

        const result = secretSanta(peopleClean);
        const lines = result.map(
            ({ giver, receiver }) => `${giver} offre à ${receiver}`
        );
        setArrayPeople(lines);
        setLastDrawList(peopleClean);

        // en mobile, afficher directement la modale de résultats
        if (window.matchMedia?.("(max-width: 759px)").matches) {
            setIsModalOpen(true);
        }
    };

    // 🧽 Effacer participants + résultats
    const clearPeople = () => {
        setPeople([]);
        setArrayPeople([]);
        setLastDrawList([]);
    };

    // 🧽 Effacer uniquement les résultats
    const clearResults = () => setArrayPeople([]);

    /* ------------------ Rendu ------------------ */
    return (
        <MusicProvider src="/christmas-loop.mp3">
            <MusicGate />
            <main
                className="app"
                aria-label="Secret Santa App"
            >
                <NoelBackgroundOKLCH />

                <div className="shell">
                    <header className="header">
                        <h1>🎄 Secret Santa</h1>
                    </header>

                    {/* Panneau flottant musique (CSS pur) */}
                    <MusicControls />

                    <div className="grid">
                        {/* 🧍 Colonne gauche : participants */}
                        <section
                            className="card"
                            aria-labelledby="participants-title"
                        >
                            <h2
                                id="participants-title"
                                className="section-title"
                            >
                                Participants
                            </h2>

                            <div className="card-body">
                                <ListOfPeople
                                    people={people}
                                    setPeople={setPeople}
                                />
                            </div>

                            {/* 🎛️ Pied de section : 3 boutons côte à côte, même largeur */}
                            <div className="actions actions-footer actions--mobile-fixed">
                                <button
                                    className={`btn ${
                                        isBlocked ? "is-disabled" : ""
                                    }`}
                                    type="button"
                                    onClick={handleDraw}
                                    aria-disabled={isBlocked}
                                    title={
                                        isBlocked
                                            ? "Efface les résultats ou modifie la liste pour relancer le tirage"
                                            : "Lancer un nouveau tirage"
                                    }
                                >
                                    🎁 Lancer le tirage
                                </button>

                                <button
                                    className="btn btn--secondary"
                                    type="button"
                                    onClick={clearPeople}
                                    title="Effacer tous les participants et les résultats"
                                >
                                    Effacer la liste
                                </button>

                                <button
                                    type="button"
                                    className="btn"
                                    onClick={openModal}
                                    aria-haspopup="dialog"
                                    aria-controls="results-modal"
                                    title="Voir les résultats (mobile)"
                                >
                                    Voir les résultats
                                </button>
                            </div>
                        </section>

                        {/* 🧾 Colonne droite : résultats (tablette/desktop) */}
                        <section
                            className="card results-panel"
                            aria-labelledby="results-title"
                        >
                            <h2
                                id="results-title"
                                className="section-title"
                            >
                                Résultats
                            </h2>

                            <div className="card-body results-scroll">
                                <div className="results">
                                    <ArrayOfPeople people={arrayPeople} />
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn btn--secondary"
                                onClick={clearResults}
                            >
                                Effacer les résultats
                            </button>
                        </section>
                    </div>
                </div>

                {/* 📱 Modale mobile des résultats (Portal) */}
                {isModalOpen &&
                    createPortal(
                        <div
                            className="modal-backdrop"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="results-modal-title"
                            id="results-modal"
                            onClick={closeModal}
                        >
                            <div
                                className="modal"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="modal-header">
                                    <h3
                                        id="results-modal-title"
                                        className="modal-title"
                                    >
                                        Résultats
                                    </h3>
                                    <button
                                        className="icon-btn"
                                        onClick={closeModal}
                                        aria-label="Fermer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <div className="results">
                                        <ArrayOfPeople people={arrayPeople} />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        className="btn btn--secondary"
                                        onClick={clearResults}
                                    >
                                        Effacer les résultats
                                    </button>
                                    <button
                                        className="btn"
                                        onClick={closeModal}
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}
            </main>
        </MusicProvider>
    );
}
