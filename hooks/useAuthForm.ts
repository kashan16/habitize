// hooks/useAuthForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const baseSchema = z.object({
  email:    z.string()
               .min(1, 'Email is required')
               .email('Please enter a valid email address')
               .toLowerCase()
               .trim(),
  password: z.string()
               .min(8, 'Password must be at least 8 characters'),
});

const loginSchema = baseSchema;

const signupSchema = baseSchema
  .extend({
    username: z.string()
               .min(1, 'Username is required')
               .min(3, 'Username must be at least 3 characters')
               .max(30, 'Username must be less than 30 characters')
               .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
               .toLowerCase()
               .trim(),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export interface PasswordStrength {
  strength:   number;
  label:      string;
  color:      string;
  percentage: number;
  isStrong:   boolean;
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return {
      strength:   0,
      label:      'Very Weak',
      color:      'bg-gray-300',
      percentage: 0,
      isStrong:   false,
    };
  }

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const strength = checks.filter(Boolean).length;
  const labels     = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors     = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return {
    strength,
    label:      labels[strength - 1],
    color:      colors[strength - 1],
    percentage: (strength / checks.length) * 100,
    isStrong:   strength >= 3,
  };
};


export type LoginFormData  = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type AuthMode       = 'login' | 'signup' | 'forgotPassword';

interface UseAuthFormProps {
  mode:        AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  onSuccess?:   () => void;
}

export function useAuthForm({ mode, onModeChange, onSuccess }: UseAuthFormProps) {
  const { signIn, signUp, clearError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = mode === 'login' ? loginSchema : signupSchema;
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver:      zodResolver(schema),
    mode:          'onChange',
    defaultValues: {
      email:    '',
      password: '',
      ...(mode === 'signup'
        ? { username: '', confirmPassword: '' }
        : {}),
    } as Partial<FormData>,
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, dirtyFields },
  } = form;

  const password         = watch('password') as string;
  const passwordStrength = mode === 'signup'
    ? calculatePasswordStrength(password)
    : null;

  useEffect(() => {
    clearError();
    reset({
      email:    '',
      password: '',
      ...(mode === 'signup'
        ? { username: '', confirmPassword: '' }
        : {}),
    } as Partial<FormData>);
  }, [mode, clearError, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const { email, password } = data as LoginFormData;
        await signIn(email, password);
      } else {
        const { email, password, username } = data as SignupFormData;
        await signUp(email, password, username);
      }
      onSuccess?.();
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    const nextMode = mode === 'login' ? 'signup' : 'login';
    onModeChange?.(nextMode);
  };

  const getFieldError   = (name: keyof FormData) => errors[name]?.message;
  const hasFieldError   = (name: keyof FormData) => Boolean(errors[name]);
  const getFieldProps   = (name: keyof FormData) => ({
    ...form.register(name),
    error:   getFieldError(name),
    hasError: hasFieldError(name),
    className: `w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
      hasFieldError(name)
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }`,
  });

  return {
    handleSubmit:    handleSubmit(onSubmit),
    reset,
    watch,

    isSubmitting,
    isValid,
    errors,
    mode,

    toggleMode,
    getFieldProps,
    getFieldError,
    hasFieldError,

    passwordStrength,

    canSubmit:    isValid && !isSubmitting,
    isFormDirty:  Object.keys(dirtyFields).length > 0,
  };
}
