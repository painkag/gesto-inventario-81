import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
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
  Cell
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface MonthlyData {
  month: string;
  monthName: string;
  revenue: number;
  sales: number;
  topProducts: { name: string; quantity: number }[];
}

interface MonthlyChartProps {
  data: MonthlyData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function MonthlyChart({ data }: MonthlyChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency", 
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Preparar dados para gráfico de produtos por mês
  const productsByMonth = data.reduce((acc: Record<string, Record<string, number>>, monthData) => {
    acc[monthData.monthName] = {};
    monthData.topProducts.forEach(product => {
      acc[monthData.monthName][product.name] = product.quantity;
    });
    return acc;
  }, {});

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

  // Dados para gráfico de pizza (último mês)
  const lastMonth = data[data.length - 1];
  const pieData = lastMonth?.topProducts.map((product, index) => ({
    name: product.name,
    value: product.quantity,
    fill: COLORS[index % COLORS.length]
  })) || [];

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>Nenhum dado disponível para análise mensal</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Receita Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução da Receita Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value), "Receita"]}
                labelStyle={{ color: '#000' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Vendas por Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Vendas por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [value, "Vendas"]}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produtos Mais Vendidos (Último Mês) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Top Produtos ({lastMonth?.monthName})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Produtos por Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vendas de Produtos por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={productChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                labelStyle={{ color: '#000' }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              {allProducts.map((product, index) => (
                <Bar
                  key={product}
                  dataKey={product}
                  stackId="products"
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-4">
            {allProducts.map((product, index) => (
              <div key={product} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-muted-foreground">{product}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}