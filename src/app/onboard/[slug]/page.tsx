import { getFunnelBySlug } from "@/actions/funnels";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { notFound } from "next/navigation";

export default async function OnboardingPage({ params }: { params: { slug: string } }) {
  const funnel = await getFunnelBySlug(params.slug);

  if (!funnel) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {funnel.name}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
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
