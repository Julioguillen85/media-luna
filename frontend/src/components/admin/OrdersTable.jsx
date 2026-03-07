import React, { useState } from 'react';
import { Package, User, Phone, MapPin, Calendar, Clock, ChevronDown, ChevronUp, Trash2, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function OrdersTable({ orders, onUpdateOrderStatus, onDeleteOrder }) {
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('DESC');
    const itemsPerPage = 6;

    const { user } = useAuth();
    const isAssistant = user?.role === 'ROLE_ASSISTANT';

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50';
            case 'CONFIRMED': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
            case 'COMPLETED': return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50';
            case 'CANCELLED': return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50';
            default: return 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING': return 'Pendiente';
            case 'CONFIRMED': return 'Confirmado';
            case 'COMPLETED': return 'Completado';
            case 'CANCELLED': return 'Cancelado';
            default: return status;
        }
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                    <Package className="text-slate-300 dark:text-slate-600 transition-colors duration-300" size={32} />
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium transition-colors duration-300">No hay pedidos aún</p>
            </div>
        );
    }

    // Filter and Sort logic
    const filteredAndSortedOrders = [...orders]
        .filter(order => filterStatus === 'ALL' || order.status === filterStatus)
        .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            // Fallback to ID sorting if dates are not present or identical
            if (dateA === dateB) {
                return sortOrder === 'DESC' ? b.id - a.id : a.id - b.id;
            }
            return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
        });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredAndSortedOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Filtrar por Estado</label>
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all cursor-pointer"
                        >
                            <option value="ALL">Todos los Estados</option>
                            <option value="PENDING">Pendientes</option>
                            <option value="CONFIRMED">Confirmados</option>
                            <option value="COMPLETED">Completados</option>
                            <option value="CANCELLED">Cancelados</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Ordenar por Fecha</label>
                    <div className="relative">
                        <select
                            value={sortOrder}
                            onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all cursor-pointer"
                        >
                            <option value="DESC">Más recientes primero</option>
                            <option value="ASC">Más antiguos primero</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {currentOrders.map(order => (
                    <div key={order.id} className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden transition-colors duration-300">
                        {/* Order Header */}
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => toggleExpand(order.id)}>
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300">
                                    <Package size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h4 className="font-bold text-slate-900 dark:text-white transition-colors duration-300">{order.customer || order.name}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border transition-colors duration-300 ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
                                        {order.items?.length || 0} producto(s) • {new Date(order.createdAt).toLocaleDateString('es-MX')}
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-300">
                                {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>

                        {/* Order Details (Expanded) */}
                        {expandedOrder === order.id && (
                            <div className="border-t border-slate-100 dark:border-slate-700/50 p-4 bg-slate-50/30 dark:bg-slate-900/30 transition-colors duration-300">
                                {/* Customer Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User size={16} className="text-slate-400 dark:text-slate-500 transition-colors duration-300" />
                                        <span className="text-slate-600 dark:text-slate-300 transition-colors duration-300">{order.customer || order.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone size={16} className="text-slate-400 dark:text-slate-500 transition-colors duration-300" />
                                        <span className="text-slate-600 dark:text-slate-300 transition-colors duration-300">{order.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm md:col-span-2">
                                        <Mail size={16} className="text-slate-400 dark:text-slate-500 transition-colors duration-300" />
                                        <span className="text-slate-600 dark:text-slate-300 transition-colors duration-300">{order.email || 'Sin correo asociado'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin size={16} className="text-slate-400 dark:text-slate-500 transition-colors duration-300" />
                                        <span className="text-slate-600 dark:text-slate-300 transition-colors duration-300">{order.eventLocation}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar size={16} className="text-slate-400 dark:text-slate-500 transition-colors duration-300" />
                                        <span className="text-slate-600 dark:text-slate-300 transition-colors duration-300">{order.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock size={16} className="text-slate-400 dark:text-slate-500 transition-colors duration-300" />
                                        <span className="text-slate-600 dark:text-slate-300 transition-colors duration-300">{order.time}</span>
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="mb-4">
                                    <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2 transition-colors duration-300">Productos</h5>
                                    <div className="space-y-2">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-colors duration-300">
                                                <div className="font-medium text-slate-900 dark:text-white text-sm mb-1 transition-colors duration-300">
                                                    {item.name}
                                                    {item.quantity > 0 && <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">(Para {item.quantity} personas)</span>}
                                                </div>
                                                {item.customization && (() => {
                                                    const isPapas = item.name?.toLowerCase().includes('papas preparadas');
                                                    const isCharola = item.name?.toLowerCase().includes('charola');
                                                    if (!isPapas && !isCharola) return null;
                                                    const hasBases = item.customization.bases?.length > 0;
                                                    const hasComplements = item.customization.complements?.length > 0;
                                                    const hasToppings = item.customization.toppings?.length > 0;
                                                    return (
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 transition-colors duration-300">
                                                            {isPapas && item.customization.size && (
                                                                <p><strong className="text-slate-700 dark:text-slate-300">Tamaño:</strong> {item.customization.size === 'quarter' ? 'Bowl 1/4' : 'Bowl 1/2'}</p>
                                                            )}
                                                            {hasBases && <p><strong className="text-slate-700 dark:text-slate-300">Bases:</strong> {item.customization.bases.join(', ')}</p>}
                                                            {hasComplements && <p><strong className="text-slate-700 dark:text-slate-300">Complementos:</strong> {item.customization.complements.join(', ')}</p>}
                                                            {hasToppings && <p><strong className="text-slate-700 dark:text-slate-300">Toppings:</strong> {item.customization.toppings.join(', ')}</p>}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <select
                                        value={order.status}
                                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                                        className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-colors duration-300"
                                    >
                                        <option value="PENDING">Pendiente</option>
                                        <option value="CONFIRMED">Confirmado</option>
                                        <option value="COMPLETED">Completado</option>
                                        <option value="CANCELLED">Cancelado</option>
                                    </select>
                                    {order.phone && (
                                        <a
                                            href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors duration-300"
                                            title="Enviar WhatsApp al cliente"
                                        >
                                            <MessageCircle size={18} />
                                        </a>
                                    )}
                                    {!isAssistant && (
                                        <button
                                            onClick={() => onDeleteOrder(order.id)}
                                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-300"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
                    <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                        Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredAndSortedOrders.length)} de {filteredAndSortedOrders.length}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors duration-300"
                        >
                            Anterior
                        </button>
                        <span className="px-3 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors duration-300"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
