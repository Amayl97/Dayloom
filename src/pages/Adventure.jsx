import { useState, useEffect, useRef } from "react";
import "../css/adventure.css";

export default function Adventure() {
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState([]);
  const [memoryCard, setMemoryCard] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [cardError, setCardError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const imageUrls = useRef(new Set());

  useEffect(() => () => {
    imageUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  async function handlePhotoChange(event, index) {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = "";

    if (files.length === 0) return;

    setUploadError("");
    setCardError("");

    try {
      const entries = await Promise.all(files.map((file) => {
        if (file.type.startsWith("image/")) {
          const src = URL.createObjectURL(file);
          imageUrls.current.add(src);
          return { id: crypto.randomUUID(), src, isVideo: false };
        }

        if (file.type.startsWith("video/")) {
          return new Promise((resolve, reject) => {
            const videoUrl = URL.createObjectURL(file);
            const video = document.createElement("video");
            video.preload = "auto";
            video.muted = true;
            video.onloadeddata = () => {
              try {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext("2d").drawImage(video, 0, 0);
                const src = canvas.toDataURL("image/jpeg", 0.88);
                video.pause();
                video.removeAttribute("src");
                video.load();
                URL.revokeObjectURL(videoUrl);
                resolve({ id: crypto.randomUUID(), src, isVideo: true });
              } catch (frameError) {
                URL.revokeObjectURL(videoUrl);
                reject(frameError);
              }
            };
            video.onerror = () => {
              URL.revokeObjectURL(videoUrl);
              reject(new Error("Could not read this video."));
            };
            video.src = videoUrl;
          });
        }

        throw new Error("Choose an image or video file.");
      }));

      setPhotos((currentPhotos) => {
        const updatedPhotos = [...currentPhotos];
        updatedPhotos[index] = [...(updatedPhotos[index] || []), ...entries];
        return updatedPhotos;
      });
      setMemoryCard("");
    } catch (uploadFailure) {
      setUploadError(uploadFailure.message || "Could not read one of the selected files.");
    }
  }

  function removePhoto(taskIndex, photoId) {
    setPhotos((currentPhotos) => currentPhotos.map((taskPhotos, index) => (
      index === taskIndex ? taskPhotos.filter((photo) => photo.id !== photoId) : taskPhotos
    )));
    setMemoryCard("");
  }

  async function generateMemoryCard() {
    const selectedPhotos = photos.flat();

    if (selectedPhotos.length === 0) {
      setCardError("Please upload at least one photo!");
      return;
    }

    setCardError("");
    setIsGenerating(true);

    try {
      const images = await Promise.all(selectedPhotos.map((photo) => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Could not load one of your uploaded images."));
        image.src = photo.src;
      })));

      const canvas = document.createElement("canvas");
      const startX = 90;
      const startY = 220;
      const innerWidth = 1020;
      const gap = 20;
      const columns = images.length === 1 ? 1 : 2;
      const tileWidth = columns === 1 ? innerWidth : (innerWidth - gap) / columns;
      const tileHeight = columns === 1 ? 760 : 400;
      const rows = Math.ceil(images.length / columns);
      const footerY = startY + rows * tileHeight + (rows - 1) * gap + 50;
      canvas.width = 1200;
      canvas.height = footerY + 130;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not create the memory card.");

      ctx.fillStyle = "#f6efe6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(71, 64, 56, 0.06)";
      ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
      ctx.fillStyle = "#2f2a2a";
      ctx.font = "700 52px 'Segoe UI', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Dayloom", 90, 110);
      ctx.fillStyle = "#c8846a";
      ctx.font = "600 32px 'Segoe UI', sans-serif";
      ctx.fillText("Today's little moments", 90, 165);

      images.forEach((image, index) => {
        const cardX = startX + (index % columns) * (tileWidth + gap);
        const cardY = startY + Math.floor(index / columns) * (tileHeight + gap);
        const radius = 28;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cardX + radius, cardY);
        ctx.lineTo(cardX + tileWidth - radius, cardY);
        ctx.quadraticCurveTo(cardX + tileWidth, cardY, cardX + tileWidth, cardY + radius);
        ctx.lineTo(cardX + tileWidth, cardY + tileHeight - radius);
        ctx.quadraticCurveTo(cardX + tileWidth, cardY + tileHeight, cardX + tileWidth - radius, cardY + tileHeight);
        ctx.lineTo(cardX + radius, cardY + tileHeight);
        ctx.quadraticCurveTo(cardX, cardY + tileHeight, cardX, cardY + tileHeight - radius);
        ctx.lineTo(cardX, cardY + radius);
        ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
        ctx.closePath();
        ctx.clip();

        const scale = Math.max(tileWidth / image.width, tileHeight / image.height);
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;
        ctx.drawImage(image, cardX + (tileWidth - drawWidth) / 2, cardY + (tileHeight - drawHeight) / 2, drawWidth, drawHeight);
        ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fillRect(cardX, cardY + tileHeight - 64, tileWidth, 64);
        ctx.fillStyle = "rgba(35, 31, 27, 0.8)";
        ctx.font = "600 20px 'Segoe UI', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`Moment ${index + 1}`, cardX + 18, cardY + tileHeight - 28);
      });

      ctx.fillStyle = "#d7b573";
      ctx.fillRect(90, footerY, 1020, 4);
      ctx.fillStyle = "#2f2a2a";
      ctx.font = "600 22px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }), 600, footerY + 42);
      ctx.fillStyle = "#7d9b88";
      ctx.font = "500 22px 'Segoe UI', sans-serif";
      ctx.fillText(message.slice(0, 80) || "A little adventure, remembered.", 600, footerY + 82);

      setMemoryCard(canvas.toDataURL("image/png"));
    } catch (generationFailure) {
      setCardError(generationFailure.message || "Could not generate the memory card.");
    } finally {
      setIsGenerating(false);
    }
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
                <div className="uploadControlRow">
                  <label className="uploadLabel" htmlFor={`photo-${index}`}>
                    Add media
                  </label>
                  <input
                    id={`photo-${index}`}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(event) => handlePhotoChange(event, index)}
                  />
                  <div className="uploadPreviews">
                    {(photos[index] || []).map((photo) => (
                      <div className="uploadPreview" key={photo.id}>
                        <img src={photo.src} alt={photo.isVideo ? "Video preview frame" : "Uploaded photo"} />
                        {photo.isVideo && <span className="videoPreviewBadge">Video</span>}
                        <button
                          type="button"
                          className="removeUploadButton"
                          aria-label="Remove uploaded media"
                          title="Remove media"
                          onClick={() => removePhoto(index, photo.id)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
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
            <button className="glassButton" onClick={generateMemoryCard} disabled={isGenerating}>
              {isGenerating ? "Creating memory card..." : "Generate memory card"}
            </button>
          ) : (
            <button className="glassButton" onClick={downloadMemoryCard}>
              Download card
            </button>
          )}
        </div>
        {(uploadError || cardError) && (
          <p className="statusMessage error" role="alert">{uploadError || cardError}</p>
        )}
      </div>
    </section>
  );
}
