import {
    useRef,
    useState,
    useEffect,
    type FormEvent,
    type ChangeEvent,
} from "react";

type ListOfPeopleProps = {
    people: string[];
    setPeople: React.Dispatch<React.SetStateAction<string[]>>;
    setArrayPeople: React.Dispatch<React.SetStateAction<string[]>>;
    arrayPeople: string[];
};

/* ================================
   🔀 Algorithme Secret Santa (Sattolo)
   ================================ */
function secretSanta(
    people: string[]
): Array<{ giver: string; receiver: string }> {
    if (people.length < 2) return [];
    const shuffled = [...people];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return people.map((giver, i) => ({ giver, receiver: shuffled[i] }));
}

export default function ListOfPeople({
    people,
    setPeople,
    setArrayPeople,
    arrayPeople,
}: ListOfPeopleProps) {
    const [newPerson, setNewPerson] = useState<string>("");
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<number | null>(null);

    // 🧠 Mémorise la liste utilisée lors du dernier tirage
    const [lastDrawList, setLastDrawList] = useState<string[]>([]);

    const showToast = (msg: string) => {
        setToast(msg);
        if (toastTimer.current) window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 5000);
    };

    // ➕ ajouter une personne
    const addPerson = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = newPerson.trim();
        if (!value) return;
        setPeople((prev) => [...prev, value]);
        setNewPerson("");
    };

    // ✍️ input contrôlé
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewPerson(e.target.value);
    };

    // 🎁 exécuter le tirage Secret Santa
    const handleSecretSanta = () => {
        const peopleClean = people.map((p) => p.trim()).filter(Boolean);

        if (peopleClean.length < 2) {
            setArrayPeople(["⚠️ Il faut au moins 2 personnes pour le tirage."]);
            return;
        }

        // ⛔️ Si des résultats existent ET que la liste n’a pas changé
        const hasResults = arrayPeople.length > 0;
        const sameList =
            hasResults &&
            JSON.stringify([...peopleClean].sort()) ===
                JSON.stringify([...lastDrawList].sort());

        if (sameList) {
            showToast(
                "Efface d’abord les résultats ou modifie la liste pour relancer un tirage."
            );
            return;
        }

        // ✅ sinon : on peut relancer un tirage
        const result = secretSanta(peopleClean);
        const lines = result.map(
            ({ giver, receiver }) => `${giver} offre à ${receiver}`
        );
        setArrayPeople(lines);
        setLastDrawList(peopleClean); // 💾 on mémorise la liste utilisée
    };

    // 🧽 effacer la liste
    const clearPeople = () => {
        setPeople([]);
        setArrayPeople([]);
        setLastDrawList([]); // reset de la mémoire du tirage
    };

    // 🧱 état visuel : bloqué si même liste et résultats existants
    const isBlocked =
        arrayPeople.length > 0 &&
        JSON.stringify([...people].sort()) ===
            JSON.stringify([...lastDrawList].sort());

    return (
        <div>
            {/* formulaire d’ajout */}
            <form
                className="form"
                onSubmit={addPerson}
            >
                <input
                    className="input"
                    type="text"
                    value={newPerson}
                    onChange={handleChange}
                    placeholder="Ajouter un nom…"
                    aria-label="Ajouter un participant"
                />
                <button
                    className="btn"
                    type="submit"
                >
                    Ajouter
                </button>
            </form>

            {/* liste des participants */}
            <div className="card-body list-scroll">
                <div className="list">
                    {people.length === 0 ? (
                        <p style={{ color: "var(--muted)" }}>
                            Aucun participant pour le moment
                        </p>
                    ) : (
                        people.map((person) => (
                            <div
                                className="list-item"
                                key={person}
                            >
                                {person}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* actions */}
            <div className="actions">
                <button
                    className={`btn ${isBlocked ? "is-disabled" : ""}`}
                    type="button"
                    onClick={handleSecretSanta}
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
                    title="Effacer tous les participants"
                >
                    Effacer la liste
                </button>
            </div>

            {/* 🔔 Toast (popup 5s) */}
            {toast && (
                <div
                    className="toast"
                    role="status"
                    aria-live="polite"
                >
                    {toast}
                    <button
                        className="toast-close"
                        aria-label="Fermer l’alerte"
                        onClick={() => setToast(null)}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
