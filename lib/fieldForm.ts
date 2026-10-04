export type PickedLocation = { lat: number; lon: number; label: string };

export type FieldForm = {
  location: PickedLocation | null;
  name: string;
  crop: string;
  areaHa: string;
  irrigation: string;
  soilType: string;
  plantingDate: string;
  notes: string;
};

export const emptyForm: FieldForm = {
  location: null,
  name: "",
  crop: "",
  areaHa: "",
  irrigation: "rainfed",
  soilType: "",
  plantingDate: "",
  notes: "",
};

export type FormErrors = Partial<
  Record<"location" | "name" | "crop" | "areaHa" | "irrigation" | "plantingDate" | "notes", string>
>;

export const STEP_COUNT = 4;

// Steps: 0 location, 1 basics, 2 conditions, 3 review (nothing to validate).
export function validateStep(step: number, f: FieldForm): FormErrors {
  const errors: FormErrors = {};

  if (step === 0) {
    if (!f.location) errors.location = "Choose where your field is to continue.";
  }

  if (step === 1) {
    const name = f.name.trim();
    const crop = f.crop.trim();
    const area = Number(f.areaHa);

    if (name.length < 2) errors.name = "Give the field a name of at least 2 characters.";
    else if (name.length > 80) errors.name = "Keep the name under 80 characters.";

    if (crop.length < 2) errors.crop = "Tell us what you are growing.";
    else if (crop.length > 60) errors.crop = "Keep the crop name under 60 characters.";

    if (f.areaHa.trim() === "" || !Number.isFinite(area)) errors.areaHa = "Enter the area in hectares.";
    else if (area <= 0) errors.areaHa = "Area must be greater than zero.";
    else if (area > 10000) errors.areaHa = "Area must be 10,000 hectares or less.";
  }

  if (step === 2) {
    if (!f.irrigation) errors.irrigation = "Choose how the field is watered.";

    if (f.plantingDate) {
      const t = Date.parse(f.plantingDate);
      const oneYearAhead = Date.now() + 365 * 24 * 60 * 60 * 1000;
      if (Number.isNaN(t)) errors.plantingDate = "That date is not valid.";
      else if (t < Date.parse("2000-01-01") || t > oneYearAhead)
        errors.plantingDate = "Choose a date between 2000 and one year from now.";
    }

    if (f.notes.length > 500) errors.notes = "Notes must be 500 characters or fewer.";
  }

  return errors;
}

export function validateAll(f: FieldForm): { step: number; errors: FormErrors } | null {
  for (let step = 0; step < STEP_COUNT - 1; step++) {
    const errors = validateStep(step, f);
    if (Object.keys(errors).length > 0) return { step, errors };
  }
  return null;
}