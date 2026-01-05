'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, User, Phone, Mail, FileText, Loader2, Trash2, Edit2 } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import GuestForm from '@/components/forms/GuestForm';
import { useData } from '@/lib/context/DataContext';
import { Guest } from '@/lib/types';

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; guest: Guest }
  | { type: 'delete'; guest: Guest };

export default function GuestsPage() {
  const { guests, bookings, loading, addGuest, updateGuest, deleteGuest } = useData();
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(false);

  const filteredGuests = useMemo(() => {
    if (!search.trim()) return guests;
    const term = search.toLowerCase();
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.phone.toLowerCase().includes(term) ||
        g.email.toLowerCase().includes(term) ||
        g.documentId.toLowerCase().includes(term)
    );
  }, [guests, search]);

  const getBookingCount = (guestId: string) => {
    return bookings.filter((b) => b.guestId === guestId && b.status !== 'cancelled').length;
  };

  const handleCloseModal = () => setModalState({ type: 'none' });

  const handleCreateGuest = async (data: Omit<Guest, 'id'>) => {
    await addGuest(data);
    handleCloseModal();
  };

  const handleUpdateGuest = async (data: Omit<Guest, 'id'>) => {
    if (modalState.type !== 'edit') return;
    await updateGuest(modalState.guest.id, data);
    handleCloseModal();
  };

  const handleDeleteGuest = async () => {
    if (modalState.type !== 'delete') return;
    setDeleting(true);
    await deleteGuest(modalState.guest.id);
    setDeleting(false);
    handleCloseModal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Huéspedes</h1>
        <Button onClick={() => setModalState({ type: 'create' })}>
          <Plus size={18} className="mr-2" />
          Nuevo Huésped
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono, email o documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Guest List */}
      {filteredGuests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {search ? 'No se encontraron huéspedes' : 'No hay huéspedes registrados'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuests.map((guest) => (
            <Card key={guest.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={18} className="text-gray-400 flex-shrink-0" />
                      <span className="font-semibold text-gray-900 truncate">{guest.name}</span>
                    </div>

                    {guest.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Phone size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{guest.phone}</span>
                      </div>
                    )}

                    {guest.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Mail size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{guest.email}</span>
                      </div>
                    )}

                    {guest.documentId && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <FileText size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{guest.documentId}</span>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-400">
                      {getBookingCount(guest.id)} reserva(s)
                    </div>
                  </div>

                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => setModalState({ type: 'edit', guest })}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setModalState({ type: 'delete', guest })}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={modalState.type === 'create'}
        onClose={handleCloseModal}
        title="Nuevo Huésped"
      >
        {modalState.type === 'create' && (
          <GuestForm
            onSubmit={handleCreateGuest}
            onCancel={handleCloseModal}
            mode="create"
          />
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={modalState.type === 'edit'}
        onClose={handleCloseModal}
        title="Editar Huésped"
      >
        {modalState.type === 'edit' && (
          <GuestForm
            guest={modalState.guest}
            onSubmit={handleUpdateGuest}
            onCancel={handleCloseModal}
            mode="edit"
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalState.type === 'delete'}
        onClose={handleCloseModal}
        title="Eliminar Huésped"
      >
        {modalState.type === 'delete' && (
          <div>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar a <strong>{modalState.guest.name}</strong>?
            </p>
            {getBookingCount(modalState.guest.id) > 0 && (
              <p className="text-amber-600 text-sm mb-4">
                Este huésped tiene {getBookingCount(modalState.guest.id)} reserva(s) asociada(s).
              </p>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleCloseModal} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteGuest}
                disabled={deleting}
                className="flex-1"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
