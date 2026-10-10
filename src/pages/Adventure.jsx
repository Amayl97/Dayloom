import { useState, useEffect } from "react";
import "../css/adventure.css";

export default function Adventure() {
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState([]);
  const [memoryCard, setMemoryCard] = useState("");

  function handlePhotoChange(event, index) {
    const file = event.target.files[0];

    if (!file) return;

    setPhotos((currentPhotos) => {
      const updatedPhotos = [...currentPhotos];
      updatedPhotos[index] = file;
      return updatedPhotos;
    });
  }

  async function generateMemoryCard() {
    const selectedPhotos = photos.filter(Boolean);

    if (selectedPhotos.length === 0) {
      setError("Please upload at least one photo first.");
      return;
    }

    setError("");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1200;
    canvas.height = 1500;

    const warmCream = "#f6efe6";
    const textDark = "#2f2a2a";
    const terracotta = "#c8846a";
    const sage = "#7d9b88";
    const softGold = "#d7b573";

    ctx.fillStyle = warmCream;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(71, 64, 56, 0.06)";
    ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);

    ctx.fillStyle = textDark;
    ctx.font = "700 52px 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Dayloom", 90, 110);

    ctx.fillStyle = terracotta;
    ctx.font = "600 32px 'Segoe UI', sans-serif";
    ctx.fillText("Today's little moments", 90, 165);

    const images = await Promise.all(
      selectedPhotos.map((file) => {
        return new Promise((resolve, reject) => {
          const image = new Image();
          const imageUrl = URL.createObjectURL(file);

          image.onload = () => {
            URL.revokeObjectURL(imageUrl);
            resolve(image);
          };

          image.onerror = () => {
            URL.revokeObjectURL(imageUrl);
            reject(new Error("Could not load one of your photos."));
          };

          image.src = imageUrl;
        });
      })
    );

    const startX = 90;
    const startY = 220;
    const innerWidth = canvas.width - startX * 2;
    const gap = 20;

    const totalCards = Math.min(images.length, 4);
    const layout = {
      1: ["full"],
      2: ["half", "half"],
      3: ["tall", "small", "small"],
      4: ["small", "tall", "small", "small"],
    }[totalCards] || ["small", "small", "small", "small"];

    const itemHeight = totalCards === 1 ? 760 : totalCards === 2 ? 520 : 340;
    let currentY = startY;

    layout.forEach((shape, index) => {
      const image = images[index];
      const isTall = shape === "tall" || shape === "full";
      let width = 0;
      let height = 0;
      let x = startX;

      if (totalCards === 1) {
        width = innerWidth;
        height = 760;
      } else if (totalCards === 2) {
        width = (innerWidth - gap) / 2;
        height = 520;
        x = startX + (index % 2) * (width + gap);
      } else if (totalCards >= 3) {
        width = shape === "small" ? (innerWidth - gap) / 2 : innerWidth;
        height = isTall ? itemHeight + 80 : itemHeight;

        if (shape === "small") {
          x = startX + (index % 2) * (width + gap);
          if (index % 2 === 1) {
            currentY += itemHeight + gap;
          }
        } else {
          x = startX;
        }
      }

      const cardWidth = width;
      const cardHeight = height;
      const cardX = x;
      const cardY = currentY;

      const radius = 28;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cardX + radius, cardY);
      ctx.lineTo(cardX + cardWidth - radius, cardY);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius);
      ctx.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - radius, cardY + cardHeight);
      ctx.lineTo(cardX + radius, cardY + cardHeight);
      ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius);
      ctx.lineTo(cardX, cardY + radius);
      ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
      ctx.closePath();
      ctx.clip();

      const scale = Math.max(
        cardWidth / image.width,
        cardHeight / image.height
      );
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const drawX = cardX + (cardWidth - drawWidth) / 2;
      const drawY = cardY + (cardHeight - drawHeight) / 2;

      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(cardX, cardY + cardHeight - 86, cardWidth, 86);

      ctx.fillStyle = "rgba(35, 31, 27, 0.8)";
      ctx.font = "600 20px 'Segoe UI', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Moment ${index + 1}`, cardX + 18, cardY + cardHeight - 40);

      if (shape === "small") {
        currentY = cardY + cardHeight + gap;
      } else if (shape === "tall" && totalCards >= 3) {
        currentY = cardY + cardHeight + gap;
      } else if (shape === "full") {
        currentY = cardY + cardHeight + gap;
      }
    });

    ctx.fillStyle = textDark;
    ctx.font = "600 22px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }), 600, 1410);

    ctx.fillStyle = sage;
    ctx.font = "500 22px 'Segoe UI', sans-serif";
    ctx.fillText(message.slice(0, 80) || "A little adventure, remembered.", 600, 1460);

    ctx.fillStyle = softGold;
    ctx.fillRect(90, 1385, 1020, 4);

    setMemoryCard(canvas.toDataURL("image/png"));
  }

  function downloadMemoryCard() {
    const link = document.createElement("a");
    link.href = memoryCard;
    link.download = "dayloom-memory.png";
    link.click();
  }

  useEffect(() => {
    async function fetchAdventure() {
      try {
        const today = new Date().toLocaleDateString("en-CA");
        const savedAdventure = localStorage.getItem("dayloomAdventure");

        if (savedAdventure) {
          const data = JSON.parse(savedAdventure);

          if (data.date === today) {
            setTasks(data.tasks);
            setMessage(data.message);
            return;
          }
        }

        const response = await fetch("http://localhost:8080/api/adventure", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to generate adventure.");
        }

        const data = await response.json();

        const adventure = {
          tasks: data.tasks,
          message: data.message,
          date: today,
        };

        setTasks(adventure.tasks);
        setMessage(adventure.message);
        localStorage.setItem("dayloomAdventure", JSON.stringify(adventure));
      } catch (err) {
        console.error("Adventure loading failed:", err);
        setError("Could not load your adventure. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchAdventure();
  }, []);

  if (loading) {
    return <p className="statusMessage">Preparing your adventure...</p>;
  }

  if (error) {
    return <p className="statusMessage error">{error}</p>;
  }

  return (
    <section className="adventurePage">
      <div className="leftContent">
        <div className="sectionHeader">
          <span className="eyebrow">Today</span>
          <h2>Today's mission</h2>
        </div>

        <ul className="taskList">
          {tasks.map((task, index) => (
            <li key={index} className="taskItem">
              <div className="taskCopy">
                <h4>{task}</h4>
                <label className="uploadLabel" htmlFor={`photo-${index}`}>
                  Add photo
                </label>
                <input
                  id={`photo-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={(event) => handlePhotoChange(event, index)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rightContent">
        <div className="sectionHeader">
          <span className="eyebrow">Memories</span>
          <h3>Little keepsake</h3>
        </div>

        <p className="promptText">{message}</p>

        <div className="cardFrame">
          {memoryCard ? (
            <img
              src={memoryCard}
              alt="Today's memory collage"
              className="memoryCardImage"
            />
          ) : (
            <div className="cardPlaceholder">
              <span>Your memory board will appear here.</span>
            </div>
          )}
        </div>

        <div className="btns">
          {!memoryCard ? (
            <button className="glassButton" onClick={generateMemoryCard}>
              Generate memory card
            </button>
          ) : (
            <button className="glassButton" onClick={downloadMemoryCard}>
              Download card
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
