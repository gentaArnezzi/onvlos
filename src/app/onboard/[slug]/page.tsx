import { getFunnelBySlug } from "@/actions/funnels";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { notFound } from "next/navigation";

export default async function OnboardingPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await params in Next.js 15+
  const { slug } = await params;
  const funnel = await getFunnelBySlug(slug);

  if (!funnel) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            {funnel.name}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {funnel.description || "Please complete the following steps to get started."}
          </p>
        </div>
        
        <OnboardingWizard steps={funnel.steps.map(step => ({
          ...step,
          config: (step.config || {}) as any
        }))} />
      </div>
    </div>
  );
}
