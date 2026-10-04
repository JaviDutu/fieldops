"use client";

import { useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  Droplets,
  Loader2,
  MapPin,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { CROP_SUGGESTIONS, IRRIGATION_OPTIONS, SOIL_OPTIONS } from "@/lib/options";
import {
  STEP_COUNT,
  emptyForm,
  validateAll,
  validateStep,
  type FieldForm,
  type FormErrors,
} from "@/lib/fieldForm";
import type { FieldDTO } from "@/types/farm";
import LocationStep from "@/components/field-wizard/locationstep";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const STEPS: { title: string; description: string; icon: LucideIcon }[] = [
  { title: "Location", description: "Choose where your field is so we can pull the right weather and satellite data.", icon: MapPin },
  { title: "Basics", description: "Name the field and tell us what you are growing and how big it is.", icon: Sprout },
  { title: "Conditions", description: "How you water and the soil you have shape the advice you get.", icon: Droplets },
  { title: "Review", description: "Check everything looks right, then save your field.", icon: ClipboardCheck },
];

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}

const invalidClass = (message?: string) => (message ? "border-red-400 focus-visible:ring-red-200" : "");

type Props = {
  onCreated: (field: FieldDTO) => void;
  onClose: () => void;
};

export default function NewFieldWizard({ onCreated, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FieldForm>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isReview = step === STEP_COUNT - 1;
  const current = STEPS[step];

  function update<K extends keyof FieldForm>(key: K, value: FieldForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as keyof FormErrors];
        return next;
      });
    }
  }

  function handleNext() {
    const found = validateStep(step, form);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep((s) => s + 1);
  }

  function handleBack() {
    setErrors({});
    setSaveError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function goTo(target: number) {
    if (target < step) {
      setErrors({});
      setSaveError(null);
      setStep(target);
    }
  }

  async function handleSave() {
    const problem = validateAll(form);
    if (problem) {
      setErrors(problem.errors);
      setStep(problem.step);
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const { data } = await api.post<FieldDTO>("/fields", {
        name: form.name.trim(),
        crop: form.crop.trim(),
        areaHa: Number(form.areaHa),
        latitude: form.location!.lat,
        longitude: form.location!.lon,
        placeLabel: form.location!.label,
        irrigation: form.irrigation,
        soilType: form.soilType || null,
        plantingDate: form.plantingDate || null,
        notes: form.notes.trim() || null,
      });
      onCreated(data);
    } catch (e) {
      setSaveError(
        axios.isAxiosError(e) && e.response?.data?.error
          ? e.response.data.error
          : "Could not save the field. Please try again."
      );
      setSaving(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (isReview) handleSave();
    else handleNext();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl sm:w-full">
        <DialogHeader className="space-y-5 border-b px-6 py-5">
          {/* Progress */}
          <ol className="flex items-center" aria-label="Progress">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              const Icon = s.icon;
              return (
                <li key={s.title} className="flex flex-1 items-center last:flex-none">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    disabled={!done || saving}
                    aria-current={active ? "step" : undefined}
                    className="group flex items-center gap-2 disabled:cursor-default"
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                        done
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : active
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="size-4" /> : <Icon className="size-4" />}
                    </span>
                    <span
                      className={`hidden text-sm sm:inline ${
                        active ? "font-medium text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s.title}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span
                      className={`mx-3 h-px flex-1 transition-colors ${done ? "bg-emerald-600" : "bg-border"}`}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground">
              STEP {step + 1} OF {STEP_COUNT}
            </p>
            <DialogTitle className="mt-1 text-xl tracking-tight">{current.title}</DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-relaxed">{current.description}</DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[55vh] min-h-[280px] overflow-y-auto px-6 py-5">
            {/* Step 1: Location */}
            {step === 0 && (
              <LocationStep
                value={form.location}
                onChange={(loc) => update("location", loc)}
                error={errors.location}
              />
            )}

            {/* Step 2: Basics */}
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="field-name">Field name</Label>
                  <Input
                    id="field-name"
                    value={form.name}
                    maxLength={80}
                    placeholder="North block"
                    autoFocus
                    aria-invalid={!!errors.name}
                    className={invalidClass(errors.name)}
                    onChange={(e) => update("name", e.target.value)}
                  />
                  <FieldError message={errors.name} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="field-crop">Crop</Label>
                  <Input
                    id="field-crop"
                    list="crop-suggestions"
                    value={form.crop}
                    maxLength={60}
                    placeholder="Tomatoes"
                    aria-invalid={!!errors.crop}
                    className={invalidClass(errors.crop)}
                    onChange={(e) => update("crop", e.target.value)}
                  />
                  <datalist id="crop-suggestions">
                    {CROP_SUGGESTIONS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  <FieldError message={errors.crop} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="field-area">Area (hectares)</Label>
                  <Input
                    id="field-area"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={form.areaHa}
                    placeholder="1.5"
                    aria-invalid={!!errors.areaHa}
                    className={invalidClass(errors.areaHa)}
                    onChange={(e) => update("areaHa", e.target.value)}
                  />
                  <FieldError message={errors.areaHa} />
                </div>
              </div>
            )}

            {/* Step 3: Conditions */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="field-irrigation">Irrigation</Label>
                    <select
                      id="field-irrigation"
                      className={`${selectClass} ${invalidClass(errors.irrigation)}`}
                      value={form.irrigation}
                      onChange={(e) => update("irrigation", e.target.value)}
                    >
                      {IRRIGATION_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {capitalise(o)}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.irrigation} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="field-soil">
                      Soil type <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <select
                      id="field-soil"
                      className={selectClass}
                      value={form.soilType}
                      onChange={(e) => update("soilType", e.target.value)}
                    >
                      <option value="">Not sure</option>
                      {SOIL_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {capitalise(o)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="field-planted">
                      Planting date <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="field-planted"
                      type="date"
                      value={form.plantingDate}
                      aria-invalid={!!errors.plantingDate}
                      className={invalidClass(errors.plantingDate)}
                      onChange={(e) => update("plantingDate", e.target.value)}
                    />
                    <FieldError message={errors.plantingDate} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="field-notes">
                    Notes <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="field-notes"
                    rows={3}
                    maxLength={500}
                    value={form.notes}
                    aria-invalid={!!errors.notes}
                    className={invalidClass(errors.notes)}
                    onChange={(e) => update("notes", e.target.value)}
                  />
                  <div className="flex justify-between">
                    <FieldError message={errors.notes} />
                    <span className="ml-auto text-xs text-muted-foreground">{form.notes.length}/500</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {isReview && (
              <div className="space-y-4">
                <ReviewCard title="Location" onEdit={() => goTo(0)} disabled={saving}>
                  <ReviewRow label="Place" value={form.location?.label ?? "—"} />
                  <ReviewRow
                    label="Coordinates"
                    value={
                      form.location
                        ? `${form.location.lat.toFixed(4)}°, ${form.location.lon.toFixed(4)}°`
                        : "—"
                    }
                  />
                </ReviewCard>

                <ReviewCard title="Field" onEdit={() => goTo(1)} disabled={saving}>
                  <ReviewRow label="Name" value={form.name.trim()} />
                  <ReviewRow label="Crop" value={form.crop.trim()} />
                  <ReviewRow label="Area" value={`${Number(form.areaHa)} ha`} />
                </ReviewCard>

                <ReviewCard title="Conditions" onEdit={() => goTo(2)} disabled={saving}>
                  <ReviewRow label="Irrigation" value={capitalise(form.irrigation)} />
                  <ReviewRow label="Soil type" value={form.soilType ? capitalise(form.soilType) : "Not set"} />
                  <ReviewRow
                    label="Planting date"
                    value={form.plantingDate ? formatDate(form.plantingDate) : "Not set"}
                  />
                  {form.notes.trim() && <ReviewRow label="Notes" value={form.notes.trim()} />}
                </ReviewCard>

                {saveError && (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
                    role="alert"
                  >
                    {saveError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-3">
            {step === 0 ? (
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={handleBack} disabled={saving} className="gap-1.5">
                <ArrowLeft className="size-4" />
                Back
              </Button>
            )}

            {isReview ? (
              <Button type="submit" disabled={saving} className="min-w-32 gap-2 bg-emerald-700 hover:bg-emerald-800">
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save field"
                )}
              </Button>
            ) : (
              <Button type="submit" className="min-w-28 gap-1.5 bg-emerald-700 hover:bg-emerald-800">
                Continue
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReviewCard({
  title,
  onEdit,
  disabled,
  children,
}: {
  title: string;
  onEdit: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit} disabled={disabled} className="h-7 px-2 text-xs">
          Edit
        </Button>
      </div>
      <dl className="space-y-2">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}