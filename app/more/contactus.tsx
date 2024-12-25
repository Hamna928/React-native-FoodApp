import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from "react-native";
import { supabase } from "@/app/supabase/supabaseClient"; // Ensure correct path for supabase client
import { useRouter } from "expo-router"; // Router for navigation

export default function ContactUs() {
  // State for capturing form input
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);  // State to manage loading
  const router = useRouter();

  const handleSubmit = async () => {
    // Check if required fields are filled
    if (!fullName || !email || !message) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);  // Set loading to true

    try {
      // Get the logged-in user from Supabase auth
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData) {
        Alert.alert("Error", "Please log in to submit your query.");
        setLoading(false);  // Stop loading
        return;
      }

      const { user } = userData;

      // Insert query into the Queries table in Supabase
      const { data, insertError } = await supabase.from("queries").insert([
        {
          user_id: user.id,  // Reference to the logged-in user
          full_name: fullName,
          email: email,
          phone: phone,
          message: message,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      // Show success alert
      Alert.alert("Query Recorded", "We’ll get back to you soon!");

      // Navigate to home screen or any other page
      router.push("/(home)");

    } catch (error) {
      console.error("Error inserting query:", error);
      Alert.alert("Error", "Failed to record your query. Please try again.");
    } finally {
      setLoading(false);  // Stop loading after the process is done
    }
  };

  return (
    <ScrollView>
      <View className="bg-[#171717] h-screen">
        {/* Full Name Field */}
        <Text className="text-white ml-4 mt-10 pb-2 pt-2 pr-6 text-xl font-semibold">Full Name</Text>
        <View className="flex flex-row items-center justify-center text-white">
          <TextInput
            className="border-2 border-[#F4BA45] rounded-lg h-12 w-11/12 color-white"
            placeholder="Enter your Full Name"
            value={fullName}
            onChangeText={setFullName}
            keyboardType="default"
          />
        </View>

        {/* Email Field */}
        <Text className="text-white ml-4 pb-2 pt-2 pr-6 text-xl font-semibold">Email</Text>
        <View className="flex flex-row items-center justify-center">
          <TextInput
            className="border-2 border-[#F4BA45] rounded-lg text-white h-12 w-11/12"
            placeholder="Enter your Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Phone Field */}
        <Text className="text-white ml-4 pb-2 pt-2 pr-6 text-xl font-semibold">Phone</Text>
        <View className="flex flex-row items-center justify-center">
          <TextInput
            className="border-2 border-[#F4BA45] rounded-lg text-white h-12 w-11/12"
            placeholder="Enter your Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Message Field */}
        <Text className="text-white ml-4 pb-2 pt-2 pr-6 text-xl font-semibold">Message</Text>
        <View className="flex flex-row items-center justify-center">
          <TextInput
            className="border-2 border-[#F4BA45] rounded-lg text-white h-10 w-11/12"
            placeholder="Your Message Here"
            value={message}
            onChangeText={setMessage}
            keyboardType="default"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <View className="flex flex-col items-center justify-center h-9 mt-10 mb-5">
          <TouchableOpacity onPress={handleSubmit} className="bg-[#F4BA45] rounded-3xl h-14 w-11/12" disabled={loading}>
            {loading ? (
              <ActivityIndicator size="large" color="#ffffff" /> // Show loader when loading is true
            ) : (
              <Text className="text-white font-extrabold text-3xl text-center pt-3">CONTINUE</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
