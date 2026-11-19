import AmbientLayer from "@/components/AmbientLayer";
import EnterprisePlatform from "@/components/EnterprisePlatform";

export default function HomePage() {
  return (
    <main className="relative z-10">
      <AmbientLayer />
      <EnterprisePlatform />
    </main>
  );
}
