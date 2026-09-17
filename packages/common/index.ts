import { z, ZodError } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(3, "password is too short"),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const zodErrorMessage = ({ error }: { error: ZodError }) => {
  return error.issues
    .map((err) => `path: ${err.input}, message: ${err.message}`)
    .join(",");
};
