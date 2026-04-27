import { ularTangga } from "../../../../src/assets/images/ular-tangga/cloudinaryAssets";

export default function GameBackground() {
    return (
        <div className="w-full h-full relative">
            <img
                src={ularTangga.kayu}
                alt="Game Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="absolute -top-32 bottom-0 left-0 w-[45%] z-10">
                <img
                    src={ularTangga.laut}
                    alt="Game Background"
                    className="w-full h-full object-cover object-left rounded-tr-full shadow-xl"
                />
            </div>
            <img
                src={ularTangga.tanaman}
                alt="Game Background"
                className="absolute -left-[16%] -top-[25%] w-[50%] rotate-[20deg] object-cover z-20"
            />
            <img
                src={ularTangga.tanaman}
                alt="Game Background"
                className="absolute left-8 -bottom-[20%] w-[45%] rotate-[350deg] object-cover -scale-x-100 z-20"
            />
        </div>
    );
}