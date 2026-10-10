import "../css/home.css"
import AdventureBtn from "../components/StartAdventureButton";


export default function Home() {
  return (
    <section className="homePage">

      <div className="leftTextContent">
        <h1>Dayloom</h1>
        <h3>Make a little adventure out of today</h3>
        <p>See your world differently</p>
        <AdventureBtn/>
      </div>
      <div className="rightTextContent">
        <h3>How it works</h3>
        <ul>
          <li data-step="01">
            <div>
              <h4>Receive Your Missions</h4>
              <p>
                Start your day with five little adventures created just for you.
              </p>
            </div>
          </li>

          <li data-step="02">
            <div>
              <h4>Step outside</h4>
              <p>
                Leave the screen behind and explore, notice, create, or simply
                enjoy something around you.
              </p>
            </div>
          </li>
          <li data-step="03">
            <div>
              <h4>Capture the moment</h4>
              <p>Take a photo of each adventure you want to remember.</p>
            </div>
          </li>
          <li data-step="04">
            <div>
              <h4>Make your keepsake</h4>
              <p>
                Add at least four memories and Dayloom will turn them into a
                little card from your day.
              </p>
            </div>
          </li>
          <li data-step="05">
            <div>
              <h4>Keep the memory</h4>
              <p>
                Download your Dayloom card and keep a piece of today's adventure.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
