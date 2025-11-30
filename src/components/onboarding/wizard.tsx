"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, FileText, FileSignature, Receipt, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SignatureCanvas from 'react-signature-canvas';

interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

interface StepConfig {
  title?: string;
  fields?: FormField[];
  content?: string;
  requireSignature?: boolean;
  amount?: number;
  currency?: string;
}

interface OnboardingWizardProps {
  steps: {
    id: string;
    step_type: string;
    config: StepConfig;
  }[];
}

export function OnboardingWizard({ steps }: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'form': return FileText;
      case 'contract': return FileSignature;
      case 'invoice': return Receipt;
      case 'automation': return Zap;
      default: return FileText;
    }
  };

  const handleNext = async () => {
    // Validate current step
    if (currentStep.step_type === 'form' && !validateFormStep()) {
      return;
    }
    
    if (currentStep.step_type === 'contract') {
      if (!agreed) {
        alert("Please agree to the terms and conditions");
        return;
      }
      if (config.requireSignature) {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
          alert("Please sign the contract");
          return;
        }
        if (!signerName || !signerEmail) {
          alert("Please provide your name and email");
          return;
        }
        // Get signature data
        const signatureData = sigCanvas.current.toDataURL();
        setSignature(signatureData);
      }
    }

    if (isLastStep) {
      setIsSubmitting(true);
      try {
        // Complete onboarding with all collected data
        const onboardingData = {
          formData,
          contractAgreed: agreed,
          signature: config.requireSignature ? (sigCanvas.current?.toDataURL() || signature) : signature,
          signerName,
          signerEmail,
          steps: completedSteps
        };
        
        // In real app, this would call the server action
        console.log("Completing onboarding with:", onboardingData);
        
        // Simulate submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsComplete(true);
      } catch (error) {
        console.error("Onboarding error:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Save step data before moving to next
      if (currentStep.step_type === 'contract') {
        const contractData = {
          agreed,
          signature_data: config.requireSignature ? (sigCanvas.current?.toDataURL() || "") : "",
          signer_name: signerName,
          signer_email: signerEmail,
          contract_signed: true,
          signed_at: new Date().toISOString()
        };
        // Store in formData for later use
        setFormData({ ...formData, [`contract_${currentStepIndex}`]: JSON.stringify(contractData) });
      }

      setCompletedSteps([...completedSteps, currentStepIndex]);
      setCurrentStepIndex(currentStepIndex + 1);

      // Reset contract-specific state when moving away from contract step
      if (currentStep.step_type === 'contract') {
        // Don't reset - keep for when user goes back
      }
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignature("");
  };

  // Restore contract data when returning to contract step
  useEffect(() => {
    if (currentStep?.step_type === 'contract') {
      const contractDataKey = `contract_${currentStepIndex}`;
      const savedContractData = formData[contractDataKey] ? JSON.parse(formData[contractDataKey]) : null;

      if (savedContractData) {
        setAgreed(savedContractData.agreed || false);
        setSignerName(savedContractData.signer_name || "");
        setSignerEmail(savedContractData.signer_email || "");
        setSignature(savedContractData.signature_data || "");
      }
    }
  }, [currentStepIndex, currentStep?.step_type]);
  
  const validateFormStep = () => {
    const stepConfig = currentStep.config;
    if (stepConfig.fields) {
      for (const field of stepConfig.fields) {
        if (field.required && !formData[field.id]) {
          alert(`Please fill in ${field.name}`);
          return false;
        }
      }
    }
    return true;
  };

  if (isComplete) {
    return (
      <Card className="text-center">
        <CardContent className="py-16">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Onboarding Complete!</h3>
          <p className="text-slate-600 mb-6">
            Thank you for completing the onboarding process. You will receive an email with your portal access shortly.
          </p>
          <Button asChild>
            <a href="/">Return to Home</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentStep) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-slate-600">No steps configured for this funnel.</p>
        </CardContent>
      </Card>
    );
  }

  const StepIcon = getStepIcon(currentStep.step_type);
  const config = currentStep.config || {};

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStepIndex;
          const Icon = getStepIcon(step.step_type);
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                isCompleted ? "bg-green-600 border-green-600 text-white" : 
                isCurrent ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-600"
              )}>
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5",
                  isCompleted ? "bg-green-600" : "bg-slate-200"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <StepIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="capitalize">{config.title || currentStep.step_type}</CardTitle>
              <CardDescription>Step {currentStepIndex + 1} of {steps.length}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          {/* Form Step */}
          {currentStep.step_type === 'form' && (
            <div className="space-y-4">
              {config.fields && config.fields.length > 0 ? (
                config.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                      />
                    ) : (
                      <Input
                        id={field.id}
                        type={field.type || 'text'}
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input id="company" placeholder="Your company name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="you@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Project Details</Label>
                    <Textarea id="message" placeholder="Tell us about your project..." rows={4} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contract Step */}
          {currentStep.step_type === 'contract' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-6 max-h-[300px] overflow-y-auto prose prose-sm">
                {config.content ? (
                  <div dangerouslySetInnerHTML={{ __html: config.content.replace(/\n/g, '<br/>') }} />
                ) : (
                  <div>
                    <h3>Service Agreement</h3>
                    <p>This agreement is entered into between the Agency ("Provider") and the Client ("Customer").</p>
                    <h4>1. Services</h4>
                    <p>The Provider agrees to deliver the services as described in the project scope.</p>
                    <h4>2. Payment Terms</h4>
                    <p>Payment is due upon receipt of invoice unless otherwise agreed.</p>
                    <h4>3. Confidentiality</h4>
                    <p>Both parties agree to keep all project information confidential.</p>
                  </div>
                )}
              </div>
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="agree" 
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  />
                  <Label htmlFor="agree" className="text-sm">
                    I have read and agree to the terms and conditions
                  </Label>
                </div>
                {config.requireSignature && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signerName">Your Name *</Label>
                        <Input
                          id="signerName"
                          placeholder="Your full name"
                          value={signerName}
                          onChange={(e) => setSignerName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signerEmail">Your Email *</Label>
                        <Input
                          id="signerEmail"
                          type="email"
                          placeholder="your@email.com"
                          value={signerEmail}
                          onChange={(e) => setSignerEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signature">Sign Here *</Label>
                      <div className="border border-slate-300 dark:border-slate-700 rounded-md">
                        <SignatureCanvas
                          ref={sigCanvas}
                          penColor='black'
                          canvasProps={{ width: 500, height: 150, className: 'sigCanvas bg-white dark:bg-slate-800 rounded-md' }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearSignature}
                        className="mt-2"
                      >
                        Clear Signature
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice Step */}
          {currentStep.step_type === 'invoice' && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-6 text-center">
                <p className="text-sm text-slate-600 mb-2">Amount Due</p>
                <p className="text-4xl font-bold text-slate-900">
                  {config.currency || '$'}{(config.amount || 5000).toLocaleString()}
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
                <div className="p-4 flex justify-between">
                  <span className="text-slate-600">Service Package</span>
                  <span className="font-medium text-slate-900">{config.currency || '$'}{(config.amount || 5000).toLocaleString()}</span>
                </div>
                <div className="p-4 flex justify-between">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-medium text-slate-900">$0</span>
                </div>
                <div className="p-4 flex justify-between bg-slate-50">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-bold text-slate-900">{config.currency || '$'}{(config.amount || 5000).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 text-center">
                Click "Pay Now" to proceed to secure payment
              </p>
            </div>
          )}

          {/* Automation Step */}
          {currentStep.step_type === 'automation' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-pulse mb-4">
                <Zap className="h-12 w-12 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Setting Up Your Account</h3>
              <p className="text-slate-600 text-center max-w-md">
                We're creating your client portal, setting up your workspace, and preparing everything for you.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))} 
            disabled={currentStepIndex === 0 || isSubmitting}
          >
            Previous
          </Button>
          <Button 
            onClick={handleNext}
            disabled={
              isSubmitting || 
              (currentStep.step_type === 'contract' && (!agreed || (config.requireSignature && (sigCanvas.current?.isEmpty() || !signerName || !signerEmail))))
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : currentStep.step_type === 'invoice' ? (
              'Pay Now'
            ) : isLastStep ? (
              'Complete'
            ) : (
              'Continue'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
