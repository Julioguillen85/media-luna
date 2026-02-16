import React, { useState } from 'react';
import { Package, User, Phone, MapPin, Calendar, Clock, Users, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export default function OrdersTable({ orders, onUpdateOrderStatus, onDeleteOrder }) {
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-400 text-sm font-medium">No hay pedidos aún</p>
            </div>
        );
    }

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(orders.length / itemsPerPage);

    return (
        <>
            <div className="space-y-4">
                {currentOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {/* Order Header */}
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => toggleExpand(order.id)}>
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Package size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h4 className="font-bold text-slate-900">{order.customer || order.name}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {order.items?.length || 0} producto(s) • {new Date(order.createdAt).toLocaleDateString('es-MX')}
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                                {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>

                        {/* Order Details (Expanded) */}
                        {expandedOrder === order.id && (
                            <div className="border-t border-slate-100 p-4 bg-slate-50/30">
                                {/* Customer Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User size={16} className="text-slate-400" />
                                        <span className="text-slate-600">{order.customer || order.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone size={16} className="text-slate-400" />
                                        <span className="text-slate-600">{order.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="text-slate-600">{order.eventLocation}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users size={16} className="text-slate-400" />
                                        <span className="text-slate-600">{order.peopleCount} personas</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span className="text-slate-600">{order.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock size={16} className="text-slate-400" />
                                        <span className="text-slate-600">{order.time}</span>
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="mb-4">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Productos</h5>
                                    <div className="space-y-2">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100">
                                                <div className="font-medium text-slate-900 text-sm mb-1">{item.name}</div>
                                                {item.customization && (
                                                    <div className="text-xs text-slate-500 space-y-1">
                                                        <p><strong>Tamaño:</strong> {item.customization.size === 'quarter' ? 'Bowl 1/4' : 'Bowl 1/2'}</p>
                                                        <p><strong>Bases:</strong> {item.customization.bases?.join(', ')}</p>
                                                        <p><strong>Complementos:</strong> {item.customization.complements?.join(', ')}</p>
                                                        <p><strong>Toppings:</strong> {item.customization.toppings?.join(', ')}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <select
                                        value={order.status}
                                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
                                    >
                                        <option value="PENDING">Pendiente</option>
                                        <option value="CONFIRMED">Confirmado</option>
                                        <option value="COMPLETED">Completado</option>
                                        <option value="CANCELLED">Cancelado</option>
                                    </select>
                                    <button
                                        onClick={() => onDeleteOrder(order.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600">
                        Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, orders.length)} de {orders.length}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-lg border border-slate-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                        >
                            Anterior
                        </button>
                        <span className="px-3 py-1 text-sm font-semibold text-slate-700">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-lg border border-slate-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
