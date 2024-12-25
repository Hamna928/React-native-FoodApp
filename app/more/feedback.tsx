import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from "react-native";
import { supabase } from "@/app/supabase/supabaseClient"; // Ensure correct path for supabase client
import { useRouter } from "expo-router"; // Router for navigation
import { Picker } from "@react-native-picker/picker"; // Correct import for Picker

export default function Feedback() {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState(""); // New state for category selection
  const [rating, setRating] = useState(0); // New state for rating
  const [loading, setLoading] = useState(false); // State to manage loading
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const router = useRouter();

  // Fetch user profile details
  const fetchUserProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, email, phone")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Could not fetch your profile details.");
      return;
    }

    if (data) {
      setUserDetails({
        fullName: `${data.first_name} ${data.last_name}`,
        email: data.email,
        phone: data.phone || "",
      });
    } else {
      setUserDetails({
        fullName: "User",
        email: "",
        phone: "",
      });
    }
  };

  // Fetch user details and populate the form fields
  const fetchUserDetails = async () => {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData) {
      Alert.alert("Error", "Please log in to submit feedback.");
      return;
    }

    const { user } = userData;
    fetchUserProfile(user.id); // Fetch user profile based on user ID
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (!message || !category || rating === 0) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // Fetch authenticated user details
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData) {
        Alert.alert("Error", "Failed to fetch user details. Please log in.");
        return;
      }

      const { user } = userData;

      // Insert feedback into the Feedbacks table
      const { error: insertError } = await supabase.from("feedbacks").insert([
        {
          user_id: user.id, // Link feedback to the authenticated user
          full_name: userDetails.fullName,
          email: userDetails.email,
          phone: userDetails.phone,
          message: message,
          category: category,
          rating: rating,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      // Show success alert
      Alert.alert("Feedback Recorded", "Thank you for your feedback! We'll get back to you soon.");
      router.push("/(home)");

    } catch (error) {
      console.error("Error inserting feedback:", error);
      Alert.alert("Error", "Failed to record feedback. Please try again.");
    } finally {
      setLoading(false); // Stop loading after the process is done
    }
  };

  // Fetch user details when the component mounts
  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <ScrollView>
      <View className="bg-[#171717] h-screen p-4">
        {/* Full Name Field */}
        <Text className="text-white pb-2 pt-2 text-xl font-semibold">Full Name</Text>
        <TextInput
          className="border-2 border-[#F4BA45] rounded-lg h-12 w-full mb-4 text-white"
          placeholder="Full Name"
          value={userDetails.fullName}
          editable={false}
        />

        {/* Email Field */}
        <Text className="text-white pb-2 pt-2 text-xl font-semibold">Email</Text>
        <TextInput
          className="border-2 border-[#F4BA45] rounded-lg h-12 w-full mb-4 text-white"
          placeholder="Email"
          value={userDetails.email}
          editable={false}
        />

        {/* Phone Field */}
        <Text className="text-white pb-2 pt-2 text-xl font-semibold">Phone</Text>
        <TextInput
          className="border-2 border-[#F4BA45] rounded-lg h-12 w-full mb-4 text-white"
          placeholder="Phone Number"
          value={userDetails.phone}
          editable={false}
        />

        {/* Category Field */}
        <Text className="text-white pb-2 pt-2 text-xl font-semibold">Feedback Category</Text>
        <Picker
          selectedValue={category}
          style={{ height: 50, width: "100%", marginBottom: 130 }} // Added margin for spacing
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="Select Category" value="" />
          <Picker.Item label="Product" value="product" />
          <Picker.Item label="Service" value="service" />
          <Picker.Item label="Website" value="website" />
          <Picker.Item label="Other" value="other" />
        </Picker>

        {/* Rating Field */}
        <Text className="text-white pb-2 pt-2 text-xl font-semibold">Rating (1 to 5)</Text>
        <View className="flex-row mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text
                style={{
                  fontSize: 30,
                  color: rating >= star ? "#F4BA45" : "#A9A9A9",
                }}
              >
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message Field */}
        <Text className="text-white pb-2 pt-2 text-xl font-semibold">Message</Text>
        <TextInput
          className="border-2 border-[#F4BA45] rounded-lg text-white h-12 w-full mb-4"
          placeholder="Your Feedback Here"
          value={message}
          onChangeText={setMessage}
          keyboardType="default"
          multiline
          numberOfLines={4}
        />

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSubmit} className="bg-[#F4BA45] rounded-3xl h-14 w-full" disabled={loading}>
          {loading ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : (
            <Text className="text-white font-extrabold text-3xl text-center pt-3">SUBMIT</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
