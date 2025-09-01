import { z } from "zod";

// Company Settings Validation
export const companySettingsSchema = z.object({
  name: z.string().min(1, "Nome da empresa é obrigatório"),
  document: z.string().optional(),
  phone: z.string().optional(),
  // Note: Fields below will be available once migrations are applied
  // city: z.string().optional(),
  // state: z.string().max(2, "UF deve ter 2 caracteres").optional(),
  // postal_code: z.string().optional(),
  // fiscal_email: z.string().email("Email inválido").optional().or(z.literal("")),
  // logo_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

// NF-e Settings Validation  
export const nfeSettingsSchema = z.object({
  enabled: z.boolean(),
  cert_alias: z.string().optional(),
  csc_id: z.string().optional(),
  csc_token: z.string().optional(),
  serie_nfe: z.number().min(1, "Série deve ser maior que 0"),
  ambiente: z.enum(["homolog", "producao"]),
});

// Integration Settings Validation
export const integrationSettingsSchema = z.object({
  // SMTP
  smtp_enabled: z.boolean(),
  smtp_host: z.string().optional(),
  smtp_port: z.number().min(1).max(65535).optional(),
  smtp_user: z.string().optional(),
  smtp_pass: z.string().optional(),
  smtp_from_email: z.string().email("Email inválido").optional().or(z.literal("")),
  smtp_secure: z.boolean(),
  
  // WhatsApp
  whatsapp_enabled: z.boolean(),
  whatsapp_provider: z.enum(["evolution", "twilio", "baileys"]).optional(),
  whatsapp_token: z.string().optional(),
  whatsapp_instance_id: z.string().optional(),
  whatsapp_phone: z.string().optional(),
}).superRefine((data, ctx) => {
  // SMTP validations when enabled
  if (data.smtp_enabled) {
    if (!data.smtp_host) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["smtp_host"],
        message: "Host SMTP é obrigatório quando SMTP está habilitado",
      });
    }
    if (!data.smtp_port) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["smtp_port"],
        message: "Porta SMTP é obrigatória quando SMTP está habilitado",
      });
    }
    if (!data.smtp_user) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["smtp_user"],
        message: "Usuário SMTP é obrigatório quando SMTP está habilitado",
      });
    }
    if (!data.smtp_pass) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["smtp_pass"],
        message: "Senha SMTP é obrigatória quando SMTP está habilitado",
      });
    }
  }

  // WhatsApp validations when enabled
  if (data.whatsapp_enabled) {
    if (!data.whatsapp_provider) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["whatsapp_provider"],
        message: "Provider é obrigatório quando WhatsApp está habilitado",
      });
    }
    if (!data.whatsapp_token) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["whatsapp_token"],
        message: "Token é obrigatório quando WhatsApp está habilitado",
      });
    }
  }
});

export type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;
export type NFeSettingsFormData = z.infer<typeof nfeSettingsSchema>;
export type IntegrationSettingsFormData = z.infer<typeof integrationSettingsSchema>;

// Utility functions
export const validateCNPJ = (cnpj: string): boolean => {
  // Remove non-numeric characters
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Check length
  if (cnpj.length !== 14) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validate CNPJ algorithm
  let sum = 0;
  let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weights[i];
  }
  
  let checkDigit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cnpj[12]) !== checkDigit1) return false;
  
  sum = 0;
  weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weights[i];
  }
  
  let checkDigit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return parseInt(cnpj[13]) === checkDigit2;
};

export const validateCPF = (cpf: string): boolean => {
  // Remove non-numeric characters  
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Check length
  if (cpf.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validate CPF algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  
  let checkDigit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cpf[9]) !== checkDigit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  
  let checkDigit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return parseInt(cpf[10]) === checkDigit2;
};

export const formatCNPJ = (cnpj: string): string => {
  cnpj = cnpj.replace(/[^\d]/g, '');
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatCPF = (cpf: string): string => {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};