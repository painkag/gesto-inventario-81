import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  const popularPages = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Produtos", path: "/dashboard/products", icon: "📦" },
    { name: "Vendas", path: "/dashboard/sales", icon: "💰" },
    { name: "Estoque", path: "/dashboard/inventory", icon: "📋" },
    { name: "Relatórios", path: "/dashboard/reports", icon: "📈" }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="text-8xl font-bold text-primary/20">404</div>
          </div>
          
          <CardTitle className="text-3xl">
            Ops! Página não encontrada
          </CardTitle>
          
          <CardDescription className="text-lg">
            A página que você está procurando não existe, foi movida ou está temporariamente indisponível.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Possíveis Causas */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Possíveis causas:
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• URL digitada incorretamente</li>
              <li>• Link antigo ou quebrado</li>
              <li>• Página movida para outro endereço</li>
              <li>• Você não tem permissão para acessar esta página</li>
            </ul>
          </div>

          {/* Páginas Populares */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Talvez você esteja procurando por:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {popularPages.map((page) => (
                <Button
                  key={page.path}
                  variant="outline"
                  className="justify-start gap-2 h-auto p-3"
                  onClick={() => navigate(page.path)}
                >
                  <span className="text-lg">{page.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{page.name}</div>
                    <div className="text-xs text-muted-foreground">{page.path}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Ações Principais */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline" 
              className="gap-2 flex-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Página Anterior
            </Button>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="gap-2 flex-1"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </div>

          {/* Suporte */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Ainda não encontrou o que procura?
            </p>
            <Button variant="link" className="text-sm p-0 h-auto">
              Entre em contato com o suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;