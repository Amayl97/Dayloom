import { useNavigate } from "react-router-dom";
import "../css/home.css"

export default function StartAdventureButton(){
    const navigate = useNavigate();
    return(
    <button className="adventure-btn" onClick={() => navigate("/adventure")}>Go onto the mission</button>
    );
}