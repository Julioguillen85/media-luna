import React, { useState, useEffect } from 'react';
import { Users, Trash2, Plus, Shield, ShieldCheck, KeyRound } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export default function UserManagementTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { user: currentUser } = useAuth();

    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsCreating(true);

        try {
            await userService.createUser(username, password);
            setSuccess(`Usuario ${username} creado exitosamente.`);
            setUsername('');
            setPassword('');
            loadUsers();
        } catch (err) {
            setError(err.message || 'Error al crear usuario');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`¿Estás seguro de eliminar al usuario ${name}?`)) return;
        setError(null);
        setSuccess(null);
        try {
            await userService.deleteUser(id);
            setSuccess('Usuario eliminado exitosamente.');
            loadUsers();
        } catch (err) {
            setError('Error al eliminar usuario');
        }
    };

    if (loading) return <div className="text-center py-10">Cargando usuarios...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Users className="text-blue-500" /> Gestión de Usuarios
            </h2>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>}
            {success && <div className="p-4 bg-green-100 text-green-700 rounded-xl">{success}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form to create a new user */}
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                        <Plus size={18} /> Crear Asistente
                    </h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">Usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">Contraseña</label>
                            <input
                                type="password" // Use standard password masking
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                                required
                                minLength={4}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isCreating ? 'Guardando...' : 'Guardar Usuario'}
                        </button>
                    </form>
                </div>

                {/* List of current users */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase">
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {u.username}
                                            {u.username === currentUser?.username && (
                                                <span className="ml-2 text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">Tú</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.role === 'ROLE_ADMIN' ? (
                                                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs font-bold bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded w-max">
                                                    <ShieldCheck size={14} /> Admin
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-bold bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded w-max">
                                                    <Shield size={14} /> Asistente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(u.role !== 'ROLE_ADMIN') && (
                                                <button
                                                    onClick={() => handleDeleteUser(u.id, u.username)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
