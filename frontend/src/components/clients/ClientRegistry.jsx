import { useState } from 'react';
import { theme, FONT } from '../../utils/constants';
import { Icon, Btn, Input, Select, Modal } from '../ui';
import { createClient, updateClient } from '../../api/clients';
import { createPet, updatePet, deletePet } from '../../api/pets';

export default function ClientRegistry({ clients, pets, onRefresh }) {
  const [search, setSearch] = useState("");
  const [editClient, setEditClient] = useState(null);
  const [editPet, setEditPet] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddPet, setShowAddPet] = useState(null);
  const [newClient, setNewClient] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [newPet, setNewPet] = useState({ name: "", species: "Pes", breed: "" });
  const [saving, setSaving] = useState(false);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.email || '').toLowerCase().includes(q) || (c.pets || []).some(p => p.name.toLowerCase().includes(q));
  });

  const handleSaveClient = async (data, isNew) => {
    setSaving(true);
    try {
      if (isNew) await createClient(data);
      else await updateClient(data.id, data);
      if (onRefresh) await onRefresh();
      setEditClient(null);
      setShowAddClient(false);
      setNewClient({ firstName: "", lastName: "", phone: "", email: "" });
    } catch (err) { alert(err.response?.data?.message || 'Chyba'); }
    finally { setSaving(false); }
  };

  const handleSavePet = async (data, isNew, clientId) => {
    setSaving(true);
    try {
      if (isNew) await createPet({ ...data, clientId });
      else await updatePet(data.id, data);
      if (onRefresh) await onRefresh();
      setEditPet(null);
      setShowAddPet(null);
      setNewPet({ name: "", species: "Pes", breed: "" });
    } catch (err) { alert(err.response?.data?.message || 'Chyba'); }
    finally { setSaving(false); }
  };

  const handleDeletePet = async (petId) => {
    if (!confirm("Smazat zvíře?")) return;
    try {
      await deletePet(petId);
      if (onRefresh) await onRefresh();
      setEditPet(null);
    } catch (err) { alert(err.response?.data?.message || 'Chyba'); }
  };

  const clientPets = (clientId) => pets.filter(p => p.clientId === clientId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1 }}><Input icon="search" placeholder="Hledat klienta, zvíře, telefon..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Btn icon="plus" onClick={() => setShowAddClient(true)}>Nový klient</Btn>
      </div>
      <div style={{ fontSize: 12, color: theme.textMuted }}>{filtered.length} z {clients.length} klientů · {pets.length} zvířat celkem</div>
      {filtered.map(c => {
        const cPets = clientPets(c.id);
        return (
          <div key={c.id} style={{ border: `1px solid ${theme.border}`, borderRadius: theme.radius, background: "white", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.borderLight}` }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{c.lastName} {c.firstName}</span>
                <span style={{ marginLeft: 12, fontSize: 12, color: theme.textMuted }}><Icon name="phone" size={12} /> {c.phone}</span>
                {c.email && <span style={{ marginLeft: 12, fontSize: 12, color: theme.textMuted }}>{c.email}</span>}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <Btn small variant="ghost" icon="plus" onClick={() => { setShowAddPet(c.id); setNewPet({ name: "", species: "Pes", breed: "" }); }}>Zvíře</Btn>
                <Btn small variant="ghost" icon="edit" onClick={() => setEditClient({ ...c })}>Upravit</Btn>
              </div>
            </div>
            {cPets.length > 0 ? (
              <div style={{ padding: "8px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {cPets.map(p => (
                  <div key={p.id} onClick={() => setEditPet({ ...p })} style={{ padding: "6px 12px", background: theme.accentLight, borderRadius: 8, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", border: "1px solid transparent" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = theme.accent}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ color: theme.textSecondary, fontSize: 11 }}>{p.species}{p.breed ? ` - ${p.breed}` : ''}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "8px 16px", fontSize: 12, color: theme.textMuted }}>Žádná zvířata</div>
            )}
          </div>
        );
      })}

      {editClient && (
        <Modal title="Upravit klienta" onClose={() => setEditClient(null)} footer={<><Btn variant="ghost" onClick={() => setEditClient(null)}>Zrušit</Btn><Btn icon="check" disabled={saving} onClick={() => handleSaveClient(editClient, false)}>{saving ? 'Ukládám...' : 'Uložit'}</Btn></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12 }}><div style={{ flex: 1 }}><Input label="Jméno" value={editClient.firstName} onChange={e => setEditClient({ ...editClient, firstName: e.target.value })} /></div><div style={{ flex: 1 }}><Input label="Příjmení" value={editClient.lastName} onChange={e => setEditClient({ ...editClient, lastName: e.target.value })} /></div></div>
            <Input label="Telefon" value={editClient.phone || ''} onChange={e => setEditClient({ ...editClient, phone: e.target.value })} />
            <Input label="E-mail" value={editClient.email || ''} onChange={e => setEditClient({ ...editClient, email: e.target.value })} />
          </div>
        </Modal>
      )}
      {editPet && (
        <Modal title={`Upravit zvíře — ${editPet.name}`} onClose={() => setEditPet(null)} footer={<><Btn variant="danger" onClick={() => handleDeletePet(editPet.id)}>Smazat</Btn><div style={{flex:1}}/><Btn variant="ghost" onClick={() => setEditPet(null)}>Zrušit</Btn><Btn icon="check" disabled={saving} onClick={() => handleSavePet(editPet, false)}>{saving ? 'Ukládám...' : 'Uložit'}</Btn></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Jméno" value={editPet.name} onChange={e => setEditPet({ ...editPet, name: e.target.value })} />
            <Select label="Druh" value={editPet.species} onChange={e => setEditPet({ ...editPet, species: e.target.value })}><option>Pes</option><option>Kočka</option><option>Králík</option><option>Křeček</option><option>Had</option><option>Pták</option><option>Jiné</option></Select>
            <Input label="Plemeno" value={editPet.breed || ''} onChange={e => setEditPet({ ...editPet, breed: e.target.value })} />
          </div>
        </Modal>
      )}
      {showAddClient && (
        <Modal title="Nový klient" onClose={() => setShowAddClient(false)} footer={<><Btn variant="ghost" onClick={() => setShowAddClient(false)}>Zrušit</Btn><Btn icon="check" disabled={!newClient.lastName || !newClient.phone || saving} onClick={() => handleSaveClient(newClient, true)}>{saving ? 'Ukládám...' : 'Přidat'}</Btn></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12 }}><div style={{ flex: 1 }}><Input label="Jméno" required value={newClient.firstName} onChange={e => setNewClient({ ...newClient, firstName: e.target.value })} /></div><div style={{ flex: 1 }}><Input label="Příjmení" required value={newClient.lastName} onChange={e => setNewClient({ ...newClient, lastName: e.target.value })} /></div></div>
            <Input label="Telefon" required value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} />
            <Input label="E-mail" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} />
          </div>
        </Modal>
      )}
      {showAddPet && (
        <Modal title="Přidat zvíře" subtitle={`Klient: ${clients.find(c => c.id === showAddPet)?.lastName || ""}`} onClose={() => setShowAddPet(null)} footer={<><Btn variant="ghost" onClick={() => setShowAddPet(null)}>Zrušit</Btn><Btn icon="check" disabled={!newPet.name || saving} onClick={() => handleSavePet(newPet, true, showAddPet)}>{saving ? 'Ukládám...' : 'Přidat'}</Btn></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Jméno zvířete" required value={newPet.name} onChange={e => setNewPet({ ...newPet, name: e.target.value })} />
            <Select label="Druh" value={newPet.species} onChange={e => setNewPet({ ...newPet, species: e.target.value })}><option>Pes</option><option>Kočka</option><option>Králík</option><option>Křeček</option><option>Had</option><option>Pták</option><option>Jiné</option></Select>
            <Input label="Plemeno" value={newPet.breed} onChange={e => setNewPet({ ...newPet, breed: e.target.value })} />
          </div>
        </Modal>
      )}
    </div>
  );
}
