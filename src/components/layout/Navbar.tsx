import { Button } from "@/components/ui/button";
import { Package, Menu, X } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-apple">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Estoque Manager
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#funcionalidades" className="text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#precos" className="text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
            <a href="#sobre" className="text-muted-foreground hover:text-foreground transition-colors">
              Sobre
            </a>
            <a href="#contato" className="text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="default" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button variant="hero" size="default" asChild>
              <Link to="/dashboard">Começar Grátis</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden transition-all duration-300 ease-in-out",
            isMenuOpen
              ? "max-h-96 opacity-100 visible"
              : "max-h-0 opacity-0 invisible"
          )}
        >
          <div className="py-4 space-y-4 border-t border-border">
            <a
              href="#funcionalidades"
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Funcionalidades
            </a>
            <a
              href="#precos"
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Preços
            </a>
            <a
              href="#sobre"
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre
            </a>
            <a
              href="#contato"
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </a>
            <div className="pt-4 space-y-3">
              <Button variant="outline" size="default" className="w-full" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button variant="hero" size="default" className="w-full" asChild>
                <Link to="/dashboard">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};