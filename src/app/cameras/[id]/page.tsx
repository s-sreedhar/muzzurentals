import { notFound } from "next/navigation";
import { cameras } from "@/lib/data";
import { Header } from "@/components/header";
import { ProductDetails } from "@/components/product-details";

export const generateStaticParams = async () => {
  return cameras.map((camera) => ({
    id: camera.id.toString(),
  }));
};

const CameraPage = ({ params }: any) => { // Apply 'as any' here
  const camera = cameras.find((c) => c.id === params.id);

  if (!camera) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <ProductDetails camera={camera} />
      </div>
    </main>
  );
};

export default CameraPage;
