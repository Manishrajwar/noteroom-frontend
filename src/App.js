import { Navigate, Route, Routes } from "react-router-dom";
import TextEditor from "./pages/TextEditor";
import HomePage from "./pages/HomePage";

function ProtectedRoute(){
   return  <Navigate to={"/"} />
}

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/notes/:id" element={<TextEditor />} />
        <Route path="*" element={<ProtectedRoute  />}  />
      </Routes>
  );
}

export default App;
