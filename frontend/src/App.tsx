import "./App.css";

import { Routes, Route, Navigate } from "react-router-dom";
import { TextChunkList } from "./components/TextChunkList";
import CreateTextView from "./components/CreateTextView";



function App() {

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/chunks/index" />} />
            <Route path="/chunks/">
                <Route path="index" element={<TextChunkList />} />
                <Route path="create" element={<CreateTextView />} />
                <Route path="read" element={<TextChunkList />} />
                <Route path="update" element={<TextChunkList />} />
                <Route path="delete" element={<TextChunkList />} />
            </Route>
        </Routes>
    );
}

export default App;
