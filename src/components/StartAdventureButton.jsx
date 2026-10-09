import { useNavigate } from "react-router-dom";

export default function StartAdventureButton(){
    const navigate = useNavigate();
    return(
    <button onClick={() => navigate("/adventure")}>Go onto the mission</button>
    );
}