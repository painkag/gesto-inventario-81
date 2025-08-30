import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao site</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-apple">
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Estoque Manager</span>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-apple-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Entrar na sua conta</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-muted-foreground">Lembrar de mim</span>
                </label>
                <Link to="/forgot-password" className="text-primary hover:text-primary-hover">
                  Esqueci minha senha
                </Link>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full">
                Entrar
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ainda não tem conta?{" "}
                  <Link to="/register" className="text-primary hover:text-primary-hover font-semibold">
                    Criar conta grátis
                  </Link>
                </p>
                
                <div className="bg-success-light border border-success/20 rounded-lg p-3 text-sm">
                  <span className="text-success font-semibold">🎉 Teste grátis por 7 dias</span>
                  <span className="text-muted-foreground block">
                    Sem cartão de crédito • Acesso completo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;