import { background } from "../../../assets/images/background/cloudinaryAssets";
import Image from "next/image";
import PageHeader from "../../../components/information/PageHeader";
import NavBar from "../../../components/information/NavBar";
import CardList from "../../../components/information/CardList";
import RotateDeviceOverlay from "../../../components/information/RotateDeviceOverlay"

const dummyDatabase: Record<string, { subCategory: string; items: any[] }[]> = {
    Daerah: [
        {
            subCategory: "Perkotaan & Industri",
            items: [
                {
                    id: 1,
                    title: "Kota Bandung",
                    imageUrl:
                        "https://images.unsplash.com/photo-1549473889-14f410d83298?w=500&q=80",
                },
                {
                    id: 2,
                    title: "Kota Bekasi",
                    imageUrl:
                        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&q=80",
                },
            ],
        },
        {
            subCategory: "Sejarah & Budaya",
            items: [
                {
                    id: 3,
                    title: "Gedung Sate", 
                    imageUrl: 
                        "https://images.unsplash.com/photo-1549473889-14f410d83298?w=500&q=80"
                },
            ],
        },
    ],
    Kuliner: [
        {
            subCategory: "Makanan Khas",
            items: [
                {
                    id: 4,
                    title: "Soto Ayam",
                    imageUrl:
                        "https://images.unsplash.com/photo-1549473889-14f410d83298?w=500&q=80",
                },
                {
                    id: 5,
                    title: "Nasi Goreng",
                    imageUrl:
                        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&q=80",
                },
            ],
        },
    ],
};

export default async function InformationPage({ searchParams }: { searchParams: Promise<{ category?: string; search?:string }>;}) {
    const params = await searchParams;
    const currentCategory = params.category || "Daerah";
    const searchQuery = params.search?.toLowerCase() || "";
    const categoryData = dummyDatabase[currentCategory] || [];
    const filteredData = categoryData
        .map((section) => ({
            ...section,
            items:section.items.filter((item) =>
                item.title.toLowerCase().includes(searchQuery)
            ),
        }))
        .filter((section) => section.items.length > 0);

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden">
            {/* Overlay untuk Rotasi Perangkat */}
            <RotateDeviceOverlay />

            {/* Background Image */}
            <div className="fixed -inset-16 md:-inset-10 -z-10 bg-[#59a87d]">
                <Image
                    src={background.bgNusa}
                    alt="Background"
                    fill
                    className="object-cover blur-xl"
                    priority
                />
                <div className="absolute inset-0 z-10 bg-black/10"></div>
            </div>

            {/* Content */}
            <div className="mx-4 md:mx-12 mt-2 md:mt-4 mb-8 flex flex-col items-center z-10">
                <PageHeader title="Informasi" />

                <NavBar />

                <div className="w-full mt-4 md:mt-8 flex flex-col gap-4 md:gap-6 z-20 relative">
                    {filteredData.length > 0 ? (
                        filteredData.map((section, index) => (
                        <CardList
                            key={index}
                            subCategoryTitle={section.subCategory}
                            items={section.items}
                        />
                        ))
                    ) : (
                        <p className="text-white text-center text-xl mt-10">
                            {searchQuery ? `Hasil pencarian ${params.search} tidak ditemukan.` : `Data untuk kategori ${currentCategory} belum tersedia.`}
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
