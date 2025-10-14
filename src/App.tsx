// ⚠️ commentaires en français
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./page/Home";

export default function App() {
    return (
        <Router>
            {/* Liens de navigation */}

            {/* Déclaration des routes */}
            <Routes>
                <Route
                    path="/"
                    element={<Home />}
                />
            </Routes>
        </Router>
    );
}
