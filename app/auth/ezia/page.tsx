'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  CheckCircle2,
  Globe,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/ui/footer';

export default function EziaAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');

  // Check URL parameter for mode
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    }
  }, [searchParams]);

  const features = [
    { icon: Globe, text: "Créez votre site web facilement" },
    { icon: TrendingUp, text: "Stratégie marketing personnalisée" },
    { icon: Users, text: "Équipe d'agents IA spécialisés" },
    { icon: Zap, text: "Interface simple et intuitive" }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          username: registerUsername,
          password: registerPassword,
          fullName: registerFullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Vérifier si c'est une redirection vers la liste d'attente
        if (response.status === 403 && data.waitlist) {
          router.push('/waitlist');
          return;
        }
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ebe7e1] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="relative w-12 h-12">
              <Image
                src="/img/mascottes/Ezia.png"
                alt="Ezia"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] bg-clip-text text-transparent">
              Ezia
            </span>
          </Link>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Bon retour parmi nous !' : 'Rejoignez Ezia'}
              </h1>
              <p className="text-gray-600">
                {isLogin 
                  ? 'Connectez-vous pour accéder à votre espace' 
                  : 'Créez votre compte en quelques secondes'}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}


            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-gray-600">Se souvenir de moi</span>
                  </label>
                  <Link href="/auth/forgot" className="text-[#6D3FC8] hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#7A4FD3] text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              // Message de redirection vers la liste d'attente
              <div className="text-center space-y-4">
                <div className="p-4 bg-[#6D3FC8]/10 rounded-lg">
                  <Sparkles className="w-12 h-12 text-[#6D3FC8] mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Accès limité</h3>
                  <p className="text-gray-600 mb-4">
                    Ezia est actuellement en phase de développement avec un accès limité.
                    Rejoignez notre liste d'attente pour être parmi les premiers à accéder à la plateforme !
                  </p>
                  <Link href="/waitlist">
                    <Button className="w-full h-12 bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#7A4FD3] text-white font-semibold">
                      Rejoindre la liste d'attente
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            {false && (
              // Ancien formulaire d'inscription (caché)
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="fullname" className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Nom complet
                  </Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="Jean Dupont"
                    value={registerFullName}
                    onChange={(e) => setRegisterFullName(e.target.value)}
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Nom d'utilisateur
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="jeandupont"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="register-email" className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="register-password" className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Mot de passe
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Minimum 6 caractères"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#7A4FD3] text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      Créer mon compte gratuit
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                {isLogin ? (
                  <Link
                    href="/waitlist"
                    className="ml-2 text-[#6D3FC8] hover:underline font-medium"
                  >
                    Rejoindre la liste d'attente
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-[#6D3FC8] hover:underline font-medium"
                  >
                    Connectez-vous
                  </button>
                )}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-xs text-gray-500">
                En continuant, vous acceptez nos{' '}
                <Link href="/terms" className="text-[#6D3FC8] hover:underline">
                  conditions
                </Link>{' '}
                et notre{' '}
                <Link href="/privacy" className="text-[#6D3FC8] hover:underline">
                  politique de confidentialité
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] p-12 items-center justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-6">
            Votre partenaire business IA est prêt à vous aider
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Découvrez comment Ezia peut transformer votre business
          </p>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-lg">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-12 h-12 text-white/80" />
              <div className="text-white">
                <p className="font-semibold">Solution 100% française</p>
                <p className="text-sm text-white/80">Conçue pour les entrepreneurs d'ici</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}