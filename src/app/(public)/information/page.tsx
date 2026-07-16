import { background } from "../../../assets/images/background/cloudinaryAssets";
import Image from "next/image";
import PageHeader from "../../../components/information/PageHeader";
import NavBar from "../../../components/information/NavBar";
import CardList from "../../../components/information/CardList";
import RotateDeviceOverlay from "../../../components/layout/RotateDeviceOverlay";
import {
    getInformationItemsByTab,
    groupInformationItemsBySection,
    INFORMATION_TABS,
    type InformationTab,
} from "../../../services/firebase/firestore/information.service";

function isInformationTab(value: string): value is InformationTab {
    return (INFORMATION_TABS as readonly string[]).includes(value);
}

export default async function InformationPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; search?: string }>;
}) {
    const params = await searchParams;
    const requestedCategory = params.category || "Daerah";
    const currentCategory = isInformationTab(requestedCategory) ? requestedCategory : "Daerah";
    const searchQuery = params.search?.toLowerCase() || "";

    const result = await getInformationItemsByTab(currentCategory);
    const categoryItems = result.success ? result.data : [];
    const categoryData = groupInformationItemsBySection(categoryItems);

    const filteredData = categoryData
        .map((section) => ({
            ...section,
            items: section.items.filter((item) =>
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
                                subCategoryTitle={section.sectionTitle}
                                items={section.items}
                            />
                        ))
                    ) : (
                        <p className="text-white text-center text-xl mt-10">
                            {searchQuery
                                ? `Hasil pencarian ${params.search} tidak ditemukan.`
                                : `Data untuk kategori ${currentCategory} belum tersedia.`}
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
