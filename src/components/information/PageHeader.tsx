import Image from "next/image";
import { information } from "../../assets/images/information/cloudinaryAssets";
import localFont from "next/font/local";

interface PageHeaderProps {
    title: string;
}

const bauhausLace = localFont({
    src: "../../../public/fonts/Bauhaus.otf",
    variable: "--font-bauhaus-lace",
})

export default function PageHeader({ title }: PageHeaderProps) {
    return (
        <div className="relative w-full flex justify-center items-start pt-4">
            {/* Tanaman */}
            <div className="absolute -top-12 lg:-top-20 left-0 w-full flex justify-between pointer-events-none">
                <Image
                    src={information.tanaman1}
                    alt="Tanaman"
                    width={800}
                    height={200}
                    className="absolute -left-28 lg:-left-44 w-[50%] lg:w-[53%] lg:w-[53%] h-auto object-cover object-left-top -scale-x-100"
                />
                <Image
                    src={information.tanaman1}
                    alt="Tanaman"
                    width={800}
                    height={200}
                    className="absolute -right-28 lg:-right-44 w-[50%] lg:w-[53%] lg:w-[53%] h-auto object-cover object-right-top"
                />
            </div>
            {/* Gambar Papan Kayu */}
            <div className="relative z-10 flex justify-center items-center -mt-8 sm:-mt-6 lg:mt-2 w-64 sm:w-[320px] lg:w-[450px]">
                <Image
                    src={information.board1}
                    alt="Board"
                    width={450}
                    height={150}
                    className="w-full h-auto object-contain drop-shadow-lg"
                />
                <h1
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] text-black font-bold text-base sm:text-xl lg:text-3xl tracking-wider text-center w-[90%] ${bauhausLace.className}`}
                >
                    {title}
                </h1>
            </div>
        </div>
    );
}
