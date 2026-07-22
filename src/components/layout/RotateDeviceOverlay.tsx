import { background } from '@/src/assets/images/background/cloudinaryAssets';

export default function RotateDeviceOverlay() {
    return (
        <div
            role="alert"
            aria-live="assertive"
            className="fixed inset-0 z-[100] hidden portrait:flex md:!hidden flex-col items-center justify-center gap-6 overflow-hidden px-6"
        >
            <img
                src={background.langit}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
            />

            <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.5"
                stroke="#ffffff"
                className="relative h-20 w-20 drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)] motion-safe:animate-[nq-rotate-phone_1.8s_ease-in-out_infinite]"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                />
            </svg>

            <h2 className="font-bauhaus relative text-center text-2xl text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.4)]">
                Putar HP-mu Dulu, Petualang!
            </h2>

            <style>{`
                @keyframes nq-rotate-phone {
                    0%, 15% { transform: rotate(0deg); }
                    50%, 65% { transform: rotate(90deg); }
                    100% { transform: rotate(0deg); }
                }
            `}</style>
        </div>
    );
}
