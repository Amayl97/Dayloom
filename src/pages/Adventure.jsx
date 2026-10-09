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

    canvas.width = 1000;
    canvas.height = 1000;

    // Background
    ctx.fillStyle = "#f8f1e7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = "#493b32";
    ctx.font = "bold 42px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Today's Little Moments", 500, 70);

    // Load each selected photo
    const images = await Promise.all(
        selectedPhotos.map(file => {
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

    // Calculate a grid based on the number of photos
    const columns = images.length === 1 ? 1 : 2;
    const rows = Math.ceil(images.length / columns);

    const padding = 40;
    const gap = 20;
    const top = 120;
    const bottom = 170;

    const cellWidth =
        (canvas.width - padding * 2 - gap * (columns - 1)) / columns;

    const cellHeight =
        (canvas.height - top - bottom - gap * (rows - 1)) / rows;

    images.forEach((image, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);

        const x = padding + column * (cellWidth + gap);
        const y = top + row * (cellHeight + gap);

        // Fit the photo inside its cell without stretching it
        const scale = Math.min(
            cellWidth / image.width,
            cellHeight / image.height
        );

        const width = image.width * scale;
        const height = image.height * scale;

        ctx.drawImage(
            image,
            x + (cellWidth - width) / 2,
            y + (cellHeight - height) / 2,
            width,
            height
        );
    });

    // Date and message
    ctx.fillStyle = "#493b32";
    ctx.font = "20px sans-serif";
    ctx.fillText(
        new Date().toLocaleDateString(),
        500,
        860
    );

    ctx.font = "18px sans-serif";
    ctx.fillText(
        message.slice(0, 75),
        500,
        910
    );

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

          // Reuse the adventure only if it belongs to today
          if (data.date === today) {
            setTasks(data.tasks);
            setMessage(data.message);
            return;
          }
        }

        // No saved adventure for today: generate a new one
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
    return <p>Preparing your adventure...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="adventurePage">
      <div className="leftContent">
        <h2>Today's mission</h2>

        <ul>
          {tasks.map((task, index) => (
            <li key={index}>
              <div>
                <h4>{task}</h4>
                <input
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
        <p>{message}</p>

       <div className="card">
          {memoryCard && (
        <img
            src={memoryCard}
            alt="Today's memory collage"
            className="memoryCardImage"
        />
    )}
</div>

<div className="btns">
    {!memoryCard ? (
        <button onClick={generateMemoryCard}>
            Generate Today's Core
        </button>
    ) : (
        <button onClick={downloadMemoryCard}>
            Download
        </button>
    )}
</div>


      </div>
    </section>
  );
}
