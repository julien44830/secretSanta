type ListOfPeopleProps = {
    people: string[];
};
export default function ArrayOfPeople({ people }: ListOfPeopleProps) {
    return (
        <div className="card-body list-scroll">
            <div className="list">
                {people.map((person) => (
                    <div
                        className="list-item "
                        key={person}
                    >
                        {person}
                    </div>
                ))}
            </div>
        </div>
    );
}
