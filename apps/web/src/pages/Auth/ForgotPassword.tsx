import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { authApi } from '../../lib/api';

const schema = z.object({ email: z.string().email() });
type Form = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    await authApi.forgotPassword(data.email).catch(() => {});
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6"><Building2 className="h-7 w-7 text-brand-500" /><span className="text-xl font-bold">Metriva Homes</span></Link>
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground mt-1">Enter your email to receive a reset link</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
              <h2 className="font-semibold text-lg mb-2">Check your inbox</h2>
              <p className="text-muted-foreground text-sm">If this email is registered, a reset link has been sent.</p>
              <Link to="/auth/login" className="mt-6 block text-brand-500 hover:underline text-sm">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email address</label>
                <input {...register('email')} type="email" className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500 transition" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Reset Link
              </button>
              <Link to="/auth/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">Back to login</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
