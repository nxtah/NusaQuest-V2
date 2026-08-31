import Image from 'next/image';
import LoginCard from '@/src/features/auth/components/LoginCard';
import BackButton from '@/src/components/ui/BackButton';
import {getBackgroundImage} from '@/src/assets/images/background/cloudinaryAssets';
import {ROUTES} from '@/src/lib/constants/routes';
import './login.css';

export default function LoginPage() {
  return (
    <div className="login-scene">
      <div className="login-bg-layer">
        <Image
          src={getBackgroundImage('langit')}
          alt=""
          fill
          sizes="100vw"
          className="login-scene-image"
          priority
        />
        <Image
          src={getBackgroundImage('landprofile')}
          alt=""
          fill
          sizes="100vw"
          className="login-scene-image object-bottom"
          priority
        />
        <div className="login-bg-overlay" />
      </div>

      <div className="login-back-button">
        <BackButton href={ROUTES.public.home} />
      </div>

      <LoginCard />
    </div>
  );
}
