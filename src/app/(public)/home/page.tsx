import { pulau } from '../../../assets/images/home/cloudinaryAssets';
import './home.css';

export default function HomePage() {
  return (
    <main className="home-container">
      {/* Background */}
      <div className="home-bg"></div>

      {/* Content Grid */}
      <div className="home-content">
        {/* Top Row */}
        <div className="home-grid">
          {/* Pulau 1 - Top Left */}
          <div className="island-item island-tl">
            <img
              src={pulau.pulau1}
              alt="Pulau 1"
              className="island-image"
            />
          </div>

          {/* Mercusuar - Center */}
          <div className="island-item island-center">
            <img
              src={pulau.mercusuar}
              alt="Mercusuar"
              className="island-image mercusuar-image"
            />
          </div>

          {/* Pulau 4 - Top Right */}
          <div className="island-item island-tr">
            <img
              src={pulau.pulau4}
              alt="Pulau 4"
              className="island-image"
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="home-grid-bottom">
          {/* Pulau 2 - Bottom Left */}
          <div className="island-item island-bl">
            <img
              src={pulau.pulau2}
              alt="Pulau 2"
              className="island-image"
            />
          </div>

          {/* Pulau 3 - Bottom Right */}
          <div className="island-item island-br">
            <img
              src={pulau.pulau3}
              alt="Pulau 3"
              className="island-image"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
