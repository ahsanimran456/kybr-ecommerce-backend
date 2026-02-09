const { supabase } = require("../../../config/supabase");

/**
 * Dashboard stats - total counts + recent data
 */
const getStats = async () => {
  // Run all count queries in parallel
  const [productsRes, categoriesRes, ordersRes, customersRes] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "customer"),
    ]);

  // Revenue calculation
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total")
    .eq("payment_status", "paid");

  const totalRevenue = (revenueData || []).reduce(
    (sum, order) => sum + parseFloat(order.total || 0),
    0
  );

  // Recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Orders by status
  const { data: allOrders } = await supabase
    .from("orders")
    .select("status");

  const ordersByStatus = (allOrders || []).reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return {
    counts: {
      products: productsRes.count || 0,
      categories: categoriesRes.count || 0,
      orders: ordersRes.count || 0,
      customers: customersRes.count || 0,
    },
    totalRevenue,
    ordersByStatus,
    recentOrders: recentOrders || [],
  };
};

module.exports = { dashboardService: { getStats } };
