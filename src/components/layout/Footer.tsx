import { Package } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary rounded-lg">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Estoque Manager</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Sistema completo de gestão de estoque, compras e vendas 
              para pequenas e médias empresas.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#funcionalidades" className="text-background/70 hover:text-background transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="text-background/70 hover:text-background transition-colors">Preços</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Demonstração</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">API</a></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#sobre" className="text-background/70 hover:text-background transition-colors">Sobre nós</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Blog</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Carreira</a></li>
              <li><a href="#contato" className="text-background/70 hover:text-background transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Documentação</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Status do Sistema</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Suporte Técnico</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-background/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-background/70">
              © 2024 Estoque Manager. Todos os direitos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                LGPD
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};