import { CityLandingPage } from "../components/CityLandingPage";
export default function CityIsland({ slug }: { slug: string }) {
  return (
    <div className="pt-16 sm:pt-20">
      <CityLandingPage
        citySlug={slug}
        onBackToHome={() => window.location.assign("/")}
        onSelectCity={(s) => window.location.assign(`/miestas/${s}`)}
      />
    </div>
  );
}
