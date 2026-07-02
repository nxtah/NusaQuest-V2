import { nuca } from "../../../../src/assets/images/nuca/cloudinaryAssets";

export default function GameBackground() {
    return (
        <div className="w-full h-full relative">
            <img
                src={nuca.laut}
                alt="Game Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <img
                src={nuca.teratai}
                alt="Game Background"
                className="absolute left-[5%] -top-[10%] w-[18%] lg:-left-[2%] lg:top-[10%] lg:w-[18%] object-cover z-10"
            />
            <img
                src={nuca.teratai}
                alt="Game Background"
                className="absolute right-[5%] -top-[10%] w-[18%] lg:-right-[2%] lg:top-[3%] lg:w-[18%] -scale-x-100 object-cover z-10"
            />
            <img
                src={nuca.teratai}
                alt="Game Background"
                className="absolute left-[8%] top-[15%] w-[15%] lg:left-[5%] lg:top-[35%] lg:w-[15%] -scale-x-100 object-cover z-10"
            />
            <img
                src={nuca.teratai}
                alt="Game Background"
                className="absolute right-[8%] top-[10%] w-[15%] lg:right-[5%] lg:top-[25%] lg:w-[15%] object-cover z-10"
            />
            <img
                src={nuca.awan}
                alt="Game Background"
                className="absolute left-[5%] -bottom-[8%] w-[40%] lg:-left-[40%] lg:-bottom-[10%] lg:w-[70%] opacity-50 object-cover z-10"
            />
            <img
                src={nuca.awan}
                alt="Game Background"
                className="absolute right-[5%] -bottom-[8%] w-[40%] lg:-right-[40%] lg:-bottom-[10%] lg:w-[70%] opacity-50 -scale-x-100 object-cover z-10"
            />
            <img
                src={nuca.tanaman}
                alt="Game Background"
                className="absolute left-[5%] -bottom-[8%] w-[20%] lg:-left-[8%] lg:-bottom-[8%] lg:w-[45%] -scale-y-100 -scale-x-100 rotate-[10deg] object-cover z-10"
            />
            <img
                src={nuca.tanaman}
                alt="Game Background"
                className="absolute right-[5%] -bottom-[8%] w-[20%] lg:-right-[8%] lg:-bottom-[8%] lg:w-[45%] -scale-y-100 -rotate-[10deg] object-cover z-10"
            />
            <div className="absolute left-1/2 top-1/2 z-10 h-[77vh] w-[76vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full">
                <img
                    src={nuca.kayu}
                    alt="Wooden game board"
                    className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 rounded-full shadow-inner" />
            </div>
        </div>
    );
}
