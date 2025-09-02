import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";

interface MonthlyData {
  month: string;
  monthName: string;
  revenue: number;
  sales: number;
  topProducts: { name: string; quantity: number }[];
}

interface ModernChartProps {
  data: MonthlyData[];
}

const MODERN_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))', 
  'hsl(var(--accent))',
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
];

const GRADIENT_COLORS = [
  { id: 'primaryGradient', color1: 'hsl(var(--primary))', color2: 'hsl(var(--primary))' },
  { id: 'secondaryGradient', color1: 'hsl(var(--secondary))', color2: 'hsl(var(--secondary))' },
  { id: 'accentGradient', color1: 'hsl(var(--accent))', color2: 'hsl(var(--accent))' },
];

export function ModernChart({ data }: ModernChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency", 
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Obter todos os produtos únicos
  const allProducts = Array.from(
    new Set(data.flatMap(month => month.topProducts.map(p => p.name)))
  ).slice(0, 5);

  // Preparar dados para gráfico de produtos
  const productChartData = data.map(month => {
    const dataPoint: any = { month: month.monthName };
    allProducts.forEach(product => {
      dataPoint[product] = month.topProducts.find(p => p.name === product)?.quantity || 0;
    });
    return dataPoint;
  });

  // Dados para gráfico de pizza radial (último mês)
  const lastMonth = data[data.length - 1];
  const pieData = lastMonth?.topProducts.slice(0, 5).map((product, index) => ({
    name: product.name,
    value: product.quantity,
    fill: MODERN_COLORS[index],
    percentage: Math.round((product.quantity / lastMonth.topProducts.reduce((sum, p) => sum + p.quantity, 0)) * 100)
  })) || [];

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Activity className="mx-auto h-16 w-16 mb-6 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
        <p>Dados de análise mensal serão exibidos aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Receita Mensal com Gradiente */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            Evolução da Receita
            <div className="ml-auto px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
              Últimos {data.length} meses
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="monthName" 
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                tickFormatter={formatCurrency} 
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value), "Receita"]}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fill="url(#revenueGradient)"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 3, r: 6 }}
                activeDot={{ r: 8, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--background))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Vendas por Mês - Barras Modernas */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-secondary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-secondary" />
              </div>
              Vendas Mensais
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data} barCategoryGap="20%">
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={1}/>
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="monthName" 
                  axisLine={false}
                  tickLine={false}
                  className="text-muted-foreground"
                />
                <YAxis axisLine={false} tickLine={false} className="text-muted-foreground" />
                <Tooltip 
                  formatter={(value: any) => [value, "Vendas"]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="url(#salesGradient)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produtos Mais Vendidos - Gráfico Radial */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <PieChartIcon className="h-5 w-5 text-accent" />
              </div>
              Top Produtos - {lastMonth?.monthName}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={pieData}>
                <RadialBar
                  dataKey="percentage"
                  cornerRadius={4}
                  label={{ position: 'insideStart', fill: 'white', fontSize: 12 }}
                />
                <Legend 
                  iconSize={12}
                  layout="horizontal"
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [`${value}%`, 'Participação']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Produtos por Mês - Barras Empilhadas */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            Evolução de Vendas por Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={productChartData} barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
              />
              <YAxis axisLine={false} tickLine={false} className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              {allProducts.map((product, index) => (
                <Bar
                  key={product}
                  dataKey={product}
                  stackId="products"
                  fill={MODERN_COLORS[index]}
                  radius={index === allProducts.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          
          {/* Legend moderna */}
          <div className="flex flex-wrap gap-4 mt-6 p-4 bg-muted/20 rounded-lg">
            {allProducts.map((product, index) => (
              <div key={product} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: MODERN_COLORS[index] }}
                />
                <span className="text-sm font-medium text-muted-foreground">{product}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}