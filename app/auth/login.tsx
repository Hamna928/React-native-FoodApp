import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { supabase } from "../supabase/supabaseClient";
import { useRouter } from "expo-router";
import { AuthContext } from "../context/AuthProvider"; // Import AuthContext

export default function Login() {
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);  // Access user and setUser from AuthContext
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState(""); // Store the user's name

  // Handle Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "All fields are mandatory.");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);  // Set the user in context
      fetchUserProfile(data.user.id);  // Fetch user profile

      Alert.alert("Success", `Welcome, ${data.user.email}!`);
      router.push("/(home)");  // Navigate to the home page after login
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };
const capitalize = (word: string) => {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};
  // Fetch user profile details
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }
      
    if (data) {
      setUserName(`${data.first_name} ${data.last_name}`);
    } else {
      setUserName("User");
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);  // Clear user from context
      setUserName("");  // Clear userName
      Alert.alert("Success", "You have been logged out.");
      router.push("/auth/login");  // Navigate back to the login screen
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", error.message || "Failed to log out.");
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#171717]" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 16 }}>
        {user ? (
          // Logged-in UI
          <View className="items-center">
            <Text className="text-white text-4xl mb-4">Welcome, {userName}!</Text>
            <TouchableOpacity onPress={handleLogout} className="bg-[#F4BA45] rounded-lg h-12 flex items-center justify-center px-4">
              <Text className="text-white font-bold text-lg">LOG OUT</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Login Form
          <>
            <Text className="text-white text-3xl text-center mb-10">
              LOGIN TO <Text className="text-[#F4BA45]">RANCHERS</Text>
            </Text>
            <Text className="text-white">Email</Text>
            <TextInput
              className="border-2 border-[#F4BA45] rounded-lg text-white h-12 px-3 mb-5"
              placeholder="Enter your Email"
              placeholderTextColor="#A9A9A9"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Text className="text-white">Password</Text>
            <TextInput
              className="border-2 border-[#F4BA45] rounded-lg text-white h-12 px-3 mb-5"
              placeholder="Enter your Password"
              placeholderTextColor="#A9A9A9"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity onPress={handleLogin} className="bg-[#F4BA45] rounded-lg h-12 flex items-center justify-center mb-5" disabled={loading}>
              <Text className="text-white font-bold text-lg">{loading ? "Logging In..." : "LOG IN"}</Text>
            </TouchableOpacity>
            <Text className="text-white text-center">
              Don't have an account?{" "}
              <Text className="text-[#F4BA45] font-bold" onPress={() => router.push("/auth/signup")}>
                Sign Up
              </Text>
            </Text>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
