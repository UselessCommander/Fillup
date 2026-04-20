import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50">
      <PageHeader title="Vilkår for brug" onBack={() => navigate('/profile')} />
      <div className="space-y-4 p-4 pb-28 text-sm leading-relaxed text-slate-700">
        <p>
          Ved at bruge FillUp accepterer du, at appen leveres «som den er» i demo-øjemed. Information om
          steder, åbningstider og produkter kan være ukorrekt eller forældet.
        </p>
        <p>
          Du er selv ansvarlig for at verificere forhold hos den enkelte butik før du tager afsted. FillUp
          erstatningsansvar er fraskrevet i det omfang, loven tillader det.
        </p>
        <p>
          Indhold i appen må ikke kopieres til kommercielt brug uden tilladelse fra rettighedshavere til en
          endelig produktversion.
        </p>
      </div>
    </div>
  );
}
