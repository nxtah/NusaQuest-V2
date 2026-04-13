import { pulau, getAwanImage, logo } from '../../../assets/images/home/cloudinaryAssets';
import { background } from '../../../assets/images/background/cloudinaryAssets';

export default function HomePage() {
  return (
    <main className="home-container">
      {/* Background */}
      <div className="home-bg"></div>

      {/* Langit - Sky Background from Top to Middle */}
      <div className="home-langit">
        <img
          src={background.langit}
          alt="Langit"
          className="langit-image"
        />
      </div>

      {/* Laut - Sea Background from Middle to Bottom */}
      <div className="home-laut">
        <img
          src={background.laut}
          alt="Laut"
          className="laut-image"
        />
      </div>

      {/* Awan 1 - Cloud Top Left */}
      <div className="awan-item awan-1">
        <img
          src={getAwanImage('awan1')}
          alt="Awan 1"
          className="awan-image"
        />
      </div>

      {/* Awan 2 - Cloud Top Right */}
      <div className="awan-item awan-2">
        <img
          src={getAwanImage('awan2')}
          alt="Awan 2"
          className="awan-image"
        />
      </div>

      {/* Logo - Top Center */}
      <div className="logo-wrapper">
        <img
          src={logo.nusaquest}
          alt="Nusaquest Logo"
          className="logo-image"
        />
      </div>

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

      {/* Pulau 5 - Bottom Right Corner */}
      <div className="island-item island-br-corner">
        <img
          src={pulau.pulau5}
          alt="Pulau 5"
          className="island-image"
        />
      </div>

      {/* Papan 1 - Floating Board */}
      <div className="papan1-wrapper">
        <img
          src={pulau.papan1}
          alt="Papan 1"
          className="papan1-image"
        />
      </div>
    </main>
  );
}
