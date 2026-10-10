import Home from "./pages/Home"
import Adventure from "./pages/Adventure";
import {Routes, Route} from "react-router-dom"

export default function App() {
  return (
    <Routes>
     <Route path="/" element={<Home />} />
     <Route path="/adventure" element={<Adventure />} />
    </Routes>
   
  );
}
