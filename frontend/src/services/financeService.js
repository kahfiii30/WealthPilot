import { supabase } from "../lib/supabaseClient";

// --- Normalizers ---

const toNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
};

export const isValidDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return date instanceof Date && !Number.isNaN(date.getTime());
};

export const getMonthKey = (date = new Date()) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const normalizeTransaction = (item) => ({
  id: item.id,
  userId: item.user_id,
  type: item.type || "expense",
  title: item.title || item.note || item.category || "Transaction",
  amount: Number(item.amount || 0),
  category: item.category || "Other",
  method: item.method || "-",
  note: item.note || "",
  notes: item.note || "",
  date: item.date || item.created_at || null,
  createdAt: item.created_at || null,
  updatedAt: item.updated_at || null
});

export const normalizeAsset = (item) => ({
  id: item.id,
  userId: item.user_id,
  name: item.name || "Untitled Asset",
  category: item.category || "Other",
  amount: Number(item.amount || 0),
  note: item.note || "",
  notes: item.note || "",
  updatedAt: item.updated_at || item.created_at || null
});

export const normalizeDebt = (item) => ({
  id: item.id,
  userId: item.user_id,
  name: item.name || "Untitled Debt",
  type: item.category || "Other",
  category: item.category || "Other",
  amount: Number(item.amount || 0),
  dueDate: item.due_date || null,
  note: item.note || "",
  notes: item.note || "",
  createdAt: item.created_at || null,
  updatedAt: item.updated_at || null
});

export const normalizeBudget = (item) => ({
  id: item.id,
  userId: item.user_id,
  category: item.category || "Other",
  limit: Number(item.limit_amount || 0),
  limitAmount: Number(item.limit_amount || 0),
  month: item.month,
  createdAt: item.created_at || null,
  updatedAt: item.updated_at || null
});

// --- Services ---

export const fetchTransactions = async (userId) => {
  console.log("Fetching transactions for user:", userId);
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) {
    console.error("Supabase fetchTransactions error:", error);
    throw error;
  }
  return (data || []).map(normalizeTransaction);
};

export const createTransaction = async (userId, payload) => {
  console.log("Creating transaction for user:", userId, "payload:", payload);
  const dbPayload = {
    user_id: userId,
    type: payload.type,
    title: payload.title,
    amount: payload.amount,
    category: payload.category,
    method: payload.method,
    date: payload.date,
    note: payload.note || payload.notes || ""
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert([dbPayload])
    .select()
    .single();
  
  if (error) {
    console.error("Supabase createTransaction error:", error);
    throw error;
  }
  console.log("Transaction created successfully:", data);
  return normalizeTransaction(data);
};

export const deleteTransaction = async (id) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const fetchAssets = async (userId) => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return (data || []).map(normalizeAsset);
};

export const createAsset = async (userId, payload) => {
  console.log("Creating asset for user:", userId, "payload:", payload);
  const dbPayload = {
    user_id: userId,
    name: payload.name,
    category: payload.category,
    amount: payload.amount,
    note: payload.note || payload.notes || ""
  };

  const { data, error } = await supabase
    .from('assets')
    .insert([dbPayload])
    .select()
    .single();
  
  if (error) {
    console.error("Supabase createAsset error:", error);
    throw error;
  }
  console.log("Asset created successfully:", data);
  return normalizeAsset(data);
};

export const updateAsset = async (id, payload) => {
  console.log("Updating asset:", id, "payload:", payload);
  const dbPayload = {
    name: payload.name,
    category: payload.category,
    amount: payload.amount,
    note: payload.note || payload.notes || "",
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('assets')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Supabase updateAsset error:", error);
    throw error;
  }
  return normalizeAsset(data);
};

export const deleteAsset = async (id) => {
  console.log("Deleting asset:", id);
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Supabase deleteAsset error:", error);
    throw error;
  }
};

export const fetchDebts = async (userId) => {
  console.log("Fetching liabilities for user:", userId);
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error("Supabase fetchDebts error:", error);
    throw error;
  }
  return (data || []).map(normalizeDebt);
};

export const createDebt = async (userId, payload) => {
  console.log("Creating liability for user:", userId, "payload:", payload);
  const dbPayload = {
    user_id: userId,
    name: payload.name,
    category: payload.category,
    amount: payload.amount,
    note: payload.note || payload.notes || "",
    due_date: payload.dueDate || payload.due_date
  };

  const { data, error } = await supabase
    .from('debts')
    .insert([dbPayload])
    .select()
    .single();
  
  if (error) {
    console.error("Supabase createDebt error:", error);
    throw error;
  }
  console.log("Liability created successfully:", data);
  return normalizeDebt(data);
};

export const updateDebt = async (id, payload) => {
  console.log("Updating liability:", id, "payload:", payload);
  const dbPayload = {
    name: payload.name,
    category: payload.category,
    amount: payload.amount,
    note: payload.note || payload.notes || "",
    due_date: payload.dueDate || payload.due_date,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('debts')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Supabase updateDebt error:", error);
    throw error;
  }
  return normalizeDebt(data);
};

export const deleteDebt = async (id) => {
  console.log("Deleting liability:", id);
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Supabase deleteDebt error:", error);
    throw error;
  }
};

export const fetchBudgets = async (userId) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return (data || []).map(normalizeBudget);
};

export const createBudget = async (userId, payload) => {
  console.log("Creating budget for user:", userId, "payload:", payload);
  const dbPayload = {
    user_id: userId,
    category: payload.category,
    limit_amount: payload.limit || payload.limitAmount || 0,
    month: payload.month
  };

  const { data, error } = await supabase
    .from('budgets')
    .insert([dbPayload])
    .select()
    .single();
  
  if (error) {
    console.error("Supabase createBudget error:", error);
    throw error;
  }
  console.log("Budget created successfully:", data);
  return normalizeBudget(data);
};

export const updateBudget = async (id, payload) => {
  console.log("Updating budget:", id, "payload:", payload);
  const dbPayload = {
    category: payload.category,
    limit_amount: payload.limit || payload.limitAmount || 0,
    month: payload.month,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('budgets')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Supabase updateBudget error:", error);
    throw error;
  }
  return normalizeBudget(data);
};

export const deleteBudget = async (id) => {
  console.log("Deleting budget:", id);
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Supabase deleteBudget error:", error);
    throw error;
  }
};
