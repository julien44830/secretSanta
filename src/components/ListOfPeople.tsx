import { useState, type FormEvent, type ChangeEvent } from "react";

type ListOfPeopleProps = {
    people: string[];
    setPeople: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function ListOfPeople({ people, setPeople }: ListOfPeopleProps) {
    const [newPerson, setNewPerson] = useState<string>("");

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

    return (
        <div className="list-of-people">
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

            {/* liste — scrolle UNIQUEMENT ici */}
            <div className="people-scroll ">
                <div className="list results-scroll">
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
        </div>
    );
}
