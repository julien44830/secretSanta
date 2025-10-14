import { useEffect, useState } from "react";
import ListOfPeople from "../components/ListOfPeople";
import ArrayOfPeople from "../components/ArrayOfPeople";

// 🗄️ clés de stockage
const LS_KEYS = {
    people: "secret-santa:people",
    results: "secret-santa:results",
    lastDraw: "secret-santa:lastDrawList",
} as const;

// 🧰 parse JSON sûr
function safeParse<T>(value: string | null): T | null {
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

// ✅ valide un tableau de string
function isStringArray(v: unknown): v is string[] {
    return Array.isArray(v) && v.every((x) => typeof x === "string");
}

export default function Home() {
    // 🧠 états principaux
    const [people, setPeople] = useState<string[]>([
        "Alice",
        "Bob",
        "Charlie",
        "Rose",
    ]);
    const [arrayPeople, setArrayPeople] = useState<string[]>([]);
    // 💾 liste utilisée lors du dernier tirage (pour la règle “bloquer si identique”)
    const [lastDrawList, setLastDrawList] = useState<string[]>([]);

    // 📱 modale mobile
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // 🔄 charge depuis localStorage au montage
    useEffect(() => {
        const savedPeople = safeParse<string[]>(
            localStorage.getItem(LS_KEYS.people)
        );
        const savedResults = safeParse<string[]>(
            localStorage.getItem(LS_KEYS.results)
        );
        const savedLastDraw = safeParse<string[]>(
            localStorage.getItem(LS_KEYS.lastDraw)
        );

        if (isStringArray(savedPeople)) setPeople(savedPeople);
        if (isStringArray(savedResults)) setArrayPeople(savedResults);
        if (isStringArray(savedLastDraw)) setLastDrawList(savedLastDraw);
    }, []);

    // 💾 sauvegarde à chaque changement
    useEffect(() => {
        try {
            localStorage.setItem(LS_KEYS.people, JSON.stringify(people));
        } catch {}
    }, [people]);

    useEffect(() => {
        try {
            localStorage.setItem(LS_KEYS.results, JSON.stringify(arrayPeople));
        } catch {}
    }, [arrayPeople]);

    useEffect(() => {
        try {
            localStorage.setItem(
                LS_KEYS.lastDraw,
                JSON.stringify(lastDrawList)
            );
        } catch {}
    }, [lastDrawList]);

    // 🧽 effacer les résultats (colonne droite / modale)
    const clearResults = () => setArrayPeople([]);

    return (
        <main
            className="app"
            aria-label="Secret Santa App"
        >
            <div className="shell">
                <header className="header">
                    <h1>🎄 Secret Santa</h1>
                    <p>
                        Design simple, centré, 2 colonnes (tablette/pc) & modale
                        mobile
                    </p>
                </header>

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
                                arrayPeople={arrayPeople}
                                setArrayPeople={(lines) => {
                                    setArrayPeople(lines);
                                    // ouverture auto de la modale en mobile
                                    if (
                                        window.matchMedia?.(
                                            "(max-width: 759px)"
                                        ).matches
                                    ) {
                                        setIsModalOpen(true);
                                    }
                                }}
                                lastDrawList={lastDrawList}
                                setLastDrawList={setLastDrawList}
                            />
                        </div>

                        {/* bouton visible seulement en mobile (CSS .open-results) */}
                        <button
                            type="button"
                            className="btn open-results"
                            onClick={openModal}
                            aria-haspopup="dialog"
                            aria-controls="results-modal"
                        >
                            Voir les résultats
                        </button>
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

            {/* 📱 Modale mobile des résultats */}
            {isModalOpen && (
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
                </div>
            )}
        </main>
    );
}
