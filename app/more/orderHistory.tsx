import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, FlatList, Alert } from "react-native";
import { supabase } from "@/app/supabase/supabaseClient"; // Ensure the correct path for supabase client

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get the logged-in user
        const { data: userData, error } = await supabase.auth.getUser();
        if (error || !userData) {
          Alert.alert("Error", "Please log in to view your order history.");
          setLoading(false);
          return;
        }

        const { user } = userData;

        // Fetch the orders for the logged-in user
        const { data, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id); // Get orders for the logged-in user

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
          Alert.alert("Error", "Could not fetch order history.");
        } else {
          setOrders(data); // Set the orders state
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        Alert.alert("Error", "Failed to fetch order history. Please try again.");
      } finally {
        setLoading(false); // Stop loading after the process is complete
      }
    };

    fetchOrders();
  }, []);

  // Render Order Items
  const renderOrderItem = ({ item }) => {
    const { items, total_amount, status, created_at } = item;

    return (
      <View className="bg-[#292929] p-4 rounded-lg mb-4">
        <Text className="text-white font-bold">Order Date: {new Date(created_at).toLocaleString()}</Text>
        <Text className="text-white">Total Amount: PKR {total_amount}</Text>
        <Text className="text-white">Status: {status}</Text>

        {/* Display items in the order */}
        <Text className="text-white mt-2 font-semibold">Order Items:</Text>
        {JSON.parse(items).map((orderItem, index) => (
          <View key={index} className="flex-row justify-between mt-2">
            <Text className="text-white">{orderItem.name}</Text>
            <Text className="text-white">PKR: {orderItem.price.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#171717] p-4">
      <Text className="text-white text-3xl font-bold mb-6">Order History</Text>

      {loading ? (
        <Text className="text-white">Loading...</Text> // Display loading text while fetching
      ) : orders.length === 0 ? (
        <Text className="text-white">You have no orders yet.</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </SafeAreaView>
  );
}
