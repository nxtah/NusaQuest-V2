import { pulau } from '../../../assets/images/hero/cloudinaryAssets';

export default function HomePage() {
  return (
    <main>
      <h1>Home</h1>
      <img
        src={pulau.pulau1}
        alt="Pulau 1"
        style={{ width: '100%', maxWidth: 640, height: 'auto', display: 'block' }}
      />
    </main>
  );
}
