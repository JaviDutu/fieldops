const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export type SignupInput = { name: string; email: string; password: string };
export type SignupResult = { ok: true; data: SignupInput } | { ok: false; error: string };

export function parseSignup(body: any): SignupResult {
  const name = text(body?.name);
  const email = text(body?.email).toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";

  if (name.length < 1 || name.length > 80) return { ok: false, error: "Name is required (80 characters max)." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (password.length < 8 || password.length > 200) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  return { ok: true, data: { name, email, password } };
}

export type LoginInput = { email: string; password: string };
export type LoginResult = { ok: true; data: LoginInput } | { ok: false; error: string };

export function parseLogin(body: any): LoginResult {
  const email = text(body?.email).toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) return { ok: false, error: "Enter your email and password." };

  return { ok: true, data: { email, password } };
}
