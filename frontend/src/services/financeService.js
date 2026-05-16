import { supabase } from "../lib/supabaseClient";

// --- Normalizers ---

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
  createdAt: item.created_at || null,
  updatedAt: item.updated_at || null
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

export const normalizeReceivable = (item) => ({
  id: item.id,
  userId: item.user_id,
  debtorName: item.debtor_name || "Unknown",
  amount: Number(item.amount || 0),
  paidAmount: Number(item.paid_amount || 0),
  remainingAmount: Number(item.remaining_amount || 0),
  debtDate: item.debt_date || null,
  dueDate: item.due_date || null,
  status: item.status || "unpaid",
  notes: item.notes || "",
  createdAt: item.created_at || null,
  updatedAt: item.updated_at || null
});

export const normalizeProfile = (profile, user) => ({
  id: profile?.id || null,
  userId: profile?.user_id || user?.id || null,
  firstName: profile?.first_name || "Pilot",
  lastName: profile?.last_name || "",
  email: profile?.email || user?.email || "",
  avatarUrl: profile?.avatar_url || "",
  createdAt: profile?.created_at || null,
  updatedAt: profile?.updated_at || null
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
  console.log("SAVE CLICKED (Transaction)");
  
  let finalUserId = userId;
  if (!finalUserId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Please sign in first before saving data.");
    finalUserId = user.id;
  }

  const dbPayload = {
    user_id: finalUserId,
    type: payload.type,
    title: payload.title || payload.note || payload.notes || payload.category || "Transaction",
    amount: payload.amount,
    category: payload.category,
    method: payload.method,
    date: payload.date || new Date().toISOString().slice(0, 10),
    note: payload.note || payload.notes || ""
  };
  
  const { data, error } = await supabase
    .from('transactions')
    .insert([dbPayload])
    .select()
    .single();
  
  if (error) {
    console.error("Supabase insert error (Transaction):", error);
    throw error;
  }
  
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
  let finalUserId = userId;
  if (!finalUserId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Please sign in first before saving data.");
    finalUserId = user.id;
  }

  const dbPayload = {
    user_id: finalUserId,
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
  
  if (error) throw error;
  return normalizeAsset(data);
};

export const updateAsset = async (id, payload) => {
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
  
  if (error) throw error;
  return normalizeAsset(data);
};

export const deleteAsset = async (id) => {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const fetchDebts = async (userId) => {
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return (data || []).map(normalizeDebt);
};

export const createDebt = async (userId, payload) => {
  let finalUserId = userId;
  if (!finalUserId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Please sign in first before saving data.");
    finalUserId = user.id;
  }

  const dbPayload = {
    user_id: finalUserId,
    name: payload.name,
    category: payload.category,
    amount: payload.amount,
    note: payload.note || payload.notes || "",
    due_date: payload.dueDate || payload.due_date || null
  };
  
  const { data, error } = await supabase
    .from('debts')
    .insert([dbPayload])
    .select()
    .single();
  
  if (error) throw error;
  return normalizeDebt(data);
};

export const updateDebt = async (id, payload) => {
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
  
  if (error) throw error;
  return normalizeDebt(data);
};

export const deleteDebt = async (id) => {
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id);
  if (error) throw error;
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
  let finalUserId = userId;
  if (!finalUserId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Please sign in first before saving data.");
    finalUserId = user.id;
  }

  const dbPayload = {
    user_id: finalUserId,
    category: payload.category,
    limit_amount: payload.limit || payload.limitAmount || 0,
    month: payload.month
  };
  
  const { data, error } = await supabase
    .from('budgets')
    .insert([dbPayload])
    .select()
    .single();
  
  if (error) throw error;
  return normalizeBudget(data);
};

export const updateBudget = async (id, payload) => {
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
  
  if (error) throw error;
  return normalizeBudget(data);
};

export const deleteBudget = async (id) => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// --- Receivables ---

export const fetchReceivables = async (userId) => {
  const { data, error } = await supabase
    .from('receivables')
    .select('*')
    .eq('user_id', userId)
    .order('debt_date', { ascending: false });
  
  if (error) throw error;
  return (data || []).map(normalizeReceivable);
};

export const createReceivable = async (userId, payload) => {
  let finalUserId = userId;
  if (!finalUserId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Please sign in first before saving data.");
    finalUserId = user.id;
  }

  const dbPayload = {
    user_id: finalUserId,
    debtor_name: payload.debtorName,
    amount: payload.amount,
    paid_amount: payload.paidAmount || 0,
    debt_date: payload.debtDate || new Date().toISOString().slice(0, 10),
    due_date: payload.dueDate || null,
    notes: payload.notes || ""
  };
  
  const { data, error } = await supabase
    .from('receivables')
    .insert([dbPayload])
    .select()
    .single();
  
  if (error) throw error;
  return normalizeReceivable(data);
};

export const updateReceivable = async (id, payload) => {
  const dbPayload = {
    debtor_name: payload.debtorName,
    amount: payload.amount,
    paid_amount: payload.paidAmount,
    debt_date: payload.debtDate,
    due_date: payload.dueDate,
    notes: payload.notes,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('receivables')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return normalizeReceivable(data);
};

export const deleteReceivable = async (id) => {
  const { error } = await supabase
    .from('receivables')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const markReceivablePayment = async (id, currentPaid, paymentAmount) => {
  const newPaid = Number(currentPaid) + Number(paymentAmount);
  
  const { data, error } = await supabase
    .from('receivables')
    .update({ 
      paid_amount: newPaid,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return normalizeReceivable(data);
};

export const fetchProfile = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const { data: created, error: createError } = await supabase
      .from("profiles")
      .insert([{
        user_id: user.id,
        first_name: "Pilot",
        last_name: "",
        email: user.email || "",
        avatar_url: ""
      }])
      .select()
      .single();

    if (createError) throw createError;
    return created;
  }

  return data;
};

export const updateProfile = async (payload) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Please sign in before updating profile.");

  const dbPayload = {
    user_id: user.id,
    first_name: payload.firstName.trim() || "Pilot",
    last_name: payload.lastName.trim(),
    email: payload.email.trim() || user.email || "",
    avatar_url: payload.avatarUrl || "",
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert([dbPayload], { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;
  return normalizeProfile(data, user);
};

export const uploadAvatar = async (file) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Please sign in before uploading avatar.");

  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { cacheControl: "3600", upsert: true });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};
