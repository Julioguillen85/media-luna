import React, { useState, useMemo } from 'react';
import { TrendingUp, Package, DollarSign, Award, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AnalyticsDashboard({ orders, products }) {
    const [period, setPeriod] = useState('week');

    // Análisis de datos
    const analytics = useMemo(() => {
        if (!orders || orders.length === 0) {
            return {
                totalOrders: 0,
                estimatedRevenue: 0,
                topProduct: 'N/A',
                conversionRate: 0,
                ordersOverTime: [],
                topProducts: [],
                statusDistribution: []
            };
        }

        const now = new Date();
        let startDate = new Date();

        // Calcular fecha de inicio según periodo
        switch (period) {
            case 'day':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setDate(now.getDate() - 30);
                break;
        }

        // Filtrar pedidos por periodo
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt || order.date);
            return orderDate >= startDate;
        });

        // Total de pedidos
        const totalOrders = filteredOrders.length;

        // Ingresos estimados (productos * precio promedio)
        const estimatedRevenue = filteredOrders.reduce((sum, order) => {
            const orderTotal = order.items?.reduce((itemSum, item) => {
                const product = products.find(p => p.name === item.name);
                return itemSum + (product?.price || 0);
            }, 0) || 0;
            return sum + orderTotal;
        }, 0);

        // Contar productos solicitados
        const productCounts = {};
        filteredOrders.forEach(order => {
            order.items?.forEach(item => {
                productCounts[item.name] = (productCounts[item.name] || 0) + 1;
            });
        });

        // Top 5 productos
        const topProducts = Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        const topProduct = topProducts[0]?.name || 'N/A';

        // Distribución de estados
        const statusCounts = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
        filteredOrders.forEach(order => {
            const status = order.status || 'PENDING';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const statusDistribution = [
            { name: 'Pendiente', value: statusCounts.PENDING, color: '#eab308' },
            { name: 'Confirmado', value: statusCounts.CONFIRMED, color: '#3b82f6' },
            { name: 'Completado', value: statusCounts.COMPLETED, color: '#22c55e' },
            { name: 'Cancelado', value: statusCounts.CANCELLED, color: '#ef4444' }
        ].filter(item => item.value > 0);

        // Pedidos en el tiempo
        const ordersOverTime = [];
        const dayGroups = {};

        filteredOrders.forEach(order => {
            const date = new Date(order.createdAt || order.date);
            const dateKey = date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
            dayGroups[dateKey] = (dayGroups[dateKey] || 0) + 1;
        });

        Object.entries(dayGroups).forEach(([date, count]) => {
            ordersOverTime.push({ date, pedidos: count });
        });

        // Ordenar por fecha
        ordersOverTime.sort((a, b) => {
            const [dayA, monthA] = a.date.split('/');
            const [dayB, monthB] = b.date.split('/');
            return new Date(2024, monthA - 1, dayA) - new Date(2024, monthB - 1, dayB);
        });

        // Tasa de conversión (completados vs total)
        const conversionRate = totalOrders > 0
            ? Math.round((statusCounts.COMPLETED / totalOrders) * 100)
            : 0;

        return {
            totalOrders,
            estimatedRevenue,
            topProduct,
            conversionRate,
            ordersOverTime,
            topProducts,
            statusDistribution
        };
    }, [orders, products, period]);

    const COLORS = ['#eab308', '#3b82f6', '#22c55e', '#ef4444'];

    return (
        <div className="space-y-6">
            {/* Selector de Periodo */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Dashboard de Analíticas</h3>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                    <option value="day">Hoy</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mes</option>
                </select>
            </div>

            {/* Cards de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center">
                            <Package size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-900">{analytics.totalOrders}</p>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Pedidos</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-900">${analytics.estimatedRevenue.toFixed(0)}</p>
                            <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Ingresos Est.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center">
                            <Award size={20} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-purple-900 truncate">{analytics.topProduct}</p>
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Top Producto</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-rose-900">{analytics.conversionRate}%</p>
                            <p className="text-xs font-bold text-rose-600 uppercase tracking-wide">Tasa Éxito</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de Pedidos en el Tiempo */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="text-lg font-bold text-slate-800 mb-4">Pedidos en el Tiempo</h4>
                {analytics.ordersOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.ordersOverTime}>
                            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="pedidos"
                                stroke="#e11d48"
                                strokeWidth={3}
                                dot={{ fill: '#e11d48', r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        No hay datos de pedidos en este periodo
                    </div>
                )}
            </div>

            {/* Grid de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Productos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h4 className="text-lg font-bold text-slate-800 mb-4">Top 5 Productos Más Solicitados</h4>
                    {analytics.topProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.topProducts} layout="vertical">
                                <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                                <YAxis type="category" dataKey="name" width={120} stroke="#64748b" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="count" fill="#e11d48" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            No hay productos solicitados
                        </div>
                    )}
                </div>

                {/* Distribución de Estados */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h4 className="text-lg font-bold text-slate-800 mb-4">Distribución de Estados</h4>
                    {analytics.statusDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {analytics.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            No hay pedidos para mostrar
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
