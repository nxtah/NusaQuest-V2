export default function RotateDeviceOverlay() {
    return (
        <div className="fixed inset-0 z-[100] flex-col items-center justify-center bg-cyan-900 text-white hidden portrait:flex md:!hidden">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-20 h-20 mb-6 animate-[spin_2s_ease-in-out_infinite]"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                />
            </svg>
            <h2 className="text-2xl font-bold text-center px-4">
                Mohon Putar HP Anda
            </h2>
            <p className="text-cyan-100 mt-2 text-center px-4">
                Gunakan mode Mendatar (Landscape) <br/> untuk pengalaman terbaik.
            </p>
        </div>
    );
}