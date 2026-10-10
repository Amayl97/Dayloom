import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home"
import Adventure from "./pages/Adventure";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/adventure" element={<Adventure />} />
    </Routes>
  );
}
