import { supabase } from "../lib/supabaseClient";

export const fetchGoals = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  
  if (!data) {
    return { targetType: 'auto', manualTarget: 0, autoMonths: 6 };
  }

  return {
    targetType: data.target_type,
    manualTarget: Number(data.manual_target),
    autoMonths: Number(data.auto_months)
  };
};

export const updateGoals = async (payload) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Please sign in before updating goals.");

  const dbPayload = {
    user_id: user.id,
    target_type: payload.targetType,
    manual_target: payload.manualTarget,
    auto_months: payload.autoMonths,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("goals")
    .upsert([dbPayload], { onConflict: "user_id" });

  if (error) throw error;
  return payload;
};
