import React, { useEffect, useState } from "react";
import { FlatList, Text, View, TouchableOpacity, Alert } from "react-native";
import * as Icon from "react-native-feather";
import { useItemContext } from "@/hooks/ItemContext";
import { supabase } from "@/app/supabase/supabaseClient"; // Ensure correct Supabase client path

export default function Orders() {
  const { selectedItems, clearCart } = useItemContext();
  const [total, setTotal] = useState(0);

  // Calculate total amount whenever selectedItems changes
  useEffect(() => {
    const calculatedTotal = selectedItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
    setTotal(calculatedTotal);
  }, [selectedItems]);

  // Handle order checkout
  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      Alert.alert("No items", "Please add items to your cart before checking out.");
      return;
    }

    // Get the logged-in user
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData) {
      Alert.alert("Error", "Please log in to place an order.");
      return;
    }

    const { user } = userData;

    // Fetch user profile for additional details
    const { data: profileData, profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      Alert.alert("Error", "Could not fetch profile details.");
      return;
    }

    // Insert order into the database
    const { error: insertError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
          total_amount: total,
          items: JSON.stringify(selectedItems), // Store items as JSON
          status: "Placed",
        },
      ]);

    if (insertError) {
      Alert.alert("Error", "Could not place the order. Please try again.");
    } else {
      Alert.alert("Order Placed", `Your order of PKR ${total.toFixed(2)} has been placed!`);
      clearCart(); // Clear the cart after a successful checkout
    }
  };

  return (
    <View className="bg-[#171717] flex-1">
      <View className="mt-20 flex flex-row items-center">
        <Text className="color-white text-4xl font-extrabold pl-2">ORDERS</Text>
      </View>

      {/* If no items are in the cart */}
      {selectedItems.length === 0 ? (
        <View className="flex-1 justify-center items-center" style={{ paddingBottom: 120 }}>
          <View className="flex-row">
            <Icon.Bell stroke="#F4BA45" width={30} height={20} />
            <Text className="text-white text-xl font-extrabold">No Order Yet</Text>
          </View>
        </View>
      ) : (
        // If there are items in the cart
        <View
          style={{
            borderWidth: 3,
            borderColor: "#F4BA45",
            borderRadius: 50,
            margin: 20,
          }}
        >
          <FlatList
            showsHorizontalScrollIndicator={false}
            data={selectedItems}
            renderItem={({ item }) => {
              return (
                <View className="flex mt-2" style={{ padding: 17 }}>
                  <View
                    className="flex-row justify-between"
                    style={{
                      backgroundColor: "#FABA45",
                      padding: 3,
                      borderRadius: 50,
                    }}
                  >
                    <Text className="font-bold">{item.name}</Text>
                    <Text className="font-bold">PKR: {item.price.toFixed(2)}</Text>
                  </View>
                </View>
              );
            }}
          />
          <Icon.Heart
            style={{ marginLeft: 170, marginBottom: 10 }}
            stroke="#FABA45"
            width={32}
            height={32}
          />
        </View>
      )}

      {/* Display total and checkout button */}
      {selectedItems.length > 0 && (
        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
          <Text className="text-white text-2xl font-bold mb-5">
            Total: PKR {total.toFixed(2)}
          </Text>

          <TouchableOpacity
            onPress={handleCheckout}
            className="bg-[#F4BA45] rounded-lg h-12 flex items-center justify-center"
          >
            <Text className="text-white font-bold text-lg">CHECKOUT</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
