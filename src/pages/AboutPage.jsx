import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';

const BLUE = '#139ED2';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50">
      <PageHeader title="Om FillUp" onBack={() => navigate('/profile')} />
      <div className="space-y-4 p-4 pb-28 text-sm leading-relaxed text-slate-700">
        <p>
          <strong className="text-slate-900">FillUp</strong> hjælper dig med at finde refill-stationer og
          hverdagsprodukter — shampoo, vaskemiddel, sæbe og mere — så du kan skrue ned for unødig emballage.
        </p>
        <p>
          Appen er bygget som en moderne webapp: den virker i browseren på telefon og computer, med liste,
          kort og filtrering efter produkttyper.
        </p>
        <div className="rounded-[5px] p-4 text-white" style={{ backgroundColor: BLUE }}>
          <p className="font-semibold">Vores mål</p>
          <p className="mt-1 text-sm text-white/95">
            Gøre det nemt at vælge genfyld og løsvægt, så bæredygtige valg ikke kræver ekstra friktion i
            hverdagen.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          FillUp er et koncept/demo-projekt. Steder og produkter i appen er eksempler til udvikling og design.
        </p>
      </div>
    </div>
  );
}
