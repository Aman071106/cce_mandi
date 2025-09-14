import HomeHeader from "@/components/home/home-header";
import Testimonials from "@/components/home/testimonials";
import LoginPrompt from "@/components/home/login-prompt";

export default function Home() {
  return (
    <main className="flex flex-col items-start justify-between fade-in-page">
      <HomeHeader />
    </main>
  );
}
