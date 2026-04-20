import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50">
      <PageHeader title="Privatlivspolitik" onBack={() => navigate('/profile')} />
      <div className="space-y-4 p-4 pb-28 text-sm leading-relaxed text-slate-700">
        <p className="text-slate-900 font-semibold">Senest opdateret (demo)</p>
        <p>
          FillUp er en demo-webapp. Vi behandler ikke personhenførbare data på serveren i denne version,
          medmindre du frivilligt indtaster dem i kontaktformularen (så logges de kortvarigt på serveren til
          demonstration).
        </p>
        <p>
          <strong className="text-slate-900">Konto og database.</strong> Brugere, adgangskode-hash (bcrypt),
          favoritter, seneste besøg, indstillinger og feedback gemmes i en PostgreSQL-database (typisk Supabase),
          som API&apos;en forbinder til via <code className="rounded bg-slate-100 px-1">DATABASE_URL</code>.
          Session-token til API ligger i browserens localStorage. Brug stærke adgangskoder kun hvis miljøet er
          sikkert — demo er ikke produktion.
        </p>
        <p>
          <strong className="text-slate-900">Placering.</strong> Når du vælger «Brug min placering» eller
          «Min position» på kortet, læser appen din GPS i browseren. Koordinaterne sendes til FillUps egen
          API udelukkende for at beregne afstande til butikker (de logges ikke som personprofil i denne
          demo). Kortet vises stadig med fliser fra OpenStreetMap.
        </p>
        <p>
          <strong className="text-slate-900">Kort.</strong> Kortfliser hentes fra OpenStreetMap-leverandører;
          de kan modtage tekniske forespørgsler (IP) som ved al web browsing.
        </p>
        <p className="text-xs text-slate-500">
          Dette er ikke juridisk rådgivning. Til produktion bør I få gennemgået teksten af en advokat.
        </p>
      </div>
    </div>
  );
}
