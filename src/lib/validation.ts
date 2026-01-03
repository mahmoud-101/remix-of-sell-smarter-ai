import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "البريد الإلكتروني مطلوب" })
  .email({ message: "البريد الإلكتروني غير صالح" })
  .max(255, { message: "البريد الإلكتروني طويل جداً" });

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" })
  .max(128, { message: "كلمة المرور طويلة جداً" })
  .regex(/[A-Z]/, { message: "يجب أن تحتوي على حرف كبير" })
  .regex(/[a-z]/, { message: "يجب أن تحتوي على حرف صغير" })
  .regex(/[0-9]/, { message: "يجب أن تحتوي على رقم" });

// Full name validation
export const fullNameSchema = z
  .string()
  .trim()
  .min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" })
  .max(100, { message: "الاسم طويل جداً" })
  .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, { message: "الاسم يجب أن يحتوي على أحرف فقط" });

// Product copy validation
export const productCopySchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, { message: "اسم المنتج مطلوب" })
    .max(200, { message: "اسم المنتج طويل جداً" }),
  productDescription: z
    .string()
    .trim()
    .min(10, { message: "وصف المنتج يجب أن يكون 10 أحرف على الأقل" })
    .max(5000, { message: "وصف المنتج طويل جداً" }),
  targetAudience: z
    .string()
    .max(500, { message: "الجمهور المستهدف طويل جداً" })
    .optional(),
  tone: z.enum(["professional", "friendly", "luxury", "aggressive", "playful"]),
  outputTypes: z.array(z.string()).min(1, { message: "اختر نوع مخرج واحد على الأقل" }),
});

// Ads copy validation
export const adsCopySchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, { message: "اسم المنتج مطلوب" })
    .max(200, { message: "اسم المنتج طويل جداً" }),
  productDescription: z
    .string()
    .trim()
    .min(10, { message: "وصف المنتج مطلوب" })
    .max(5000, { message: "وصف المنتج طويل جداً" }),
  platform: z.enum(["facebook", "instagram", "google", "tiktok", "snapchat"]),
  goal: z.enum(["awareness", "conversions", "traffic", "engagement"]),
  targetAudience: z.string().max(500).optional(),
  country: z.string().max(100).optional(),
});

// Campaign validation
export const campaignSchema = z.object({
  campaignName: z
    .string()
    .trim()
    .min(2, { message: "اسم الحملة مطلوب" })
    .max(200, { message: "اسم الحملة طويل جداً" }),
  businessType: z
    .string()
    .trim()
    .min(2, { message: "نوع النشاط مطلوب" })
    .max(200, { message: "نوع النشاط طويل جداً" }),
  goal: z.string().optional(),
  duration: z.string().optional(),
  budget: z.string().optional(),
});

// URL validation
export const urlSchema = z
  .string()
  .trim()
  .url({ message: "الرابط غير صالح" })
  .max(2000, { message: "الرابط طويل جداً" });

// Sanitize text input to prevent XSS
export function sanitizeText(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filter out old attempts
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    this.attempts.set(key, recentAttempts);
    
    return recentAttempts.length >= this.maxAttempts;
  }

  recordAttempt(key: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    attempts.push(now);
    this.attempts.set(key, attempts);
  }

  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = attempts[0];
    const remaining = this.windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, Math.ceil(remaining / 1000));
  }
}

// Create a singleton rate limiter for auth
export const authRateLimiter = new RateLimiter(5, 60000); // 5 attempts per minute
