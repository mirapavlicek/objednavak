import api from './client';

export const getProcedureBlocks = () => api.get('/procedure-blocks');
export const createProcedureBlock = (data) => api.post('/procedure-blocks', data);
export const updateProcedureBlock = (id, data) => api.put(`/procedure-blocks/${id}`, data);
export const deleteProcedureBlock = (id) => api.delete(`/procedure-blocks/${id}`);
