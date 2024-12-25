import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../supabase/supabaseClient"; // Assuming Supabase is exported here
import { useRouter } from "expo-router"; // Router for navigation

export default function ProfileScreen() {
  const [user, setUser] = useState(null); // State to store logged-in user
  const [profile, setProfile] = useState(null); // State for user profile details
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter(); // For navigation

  // Fetch user session and profile data
  useEffect(() => {
    const initializeProfile = async () => {
      // Get the user session
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData) {
        Alert.alert("Unauthorized", "Please login first.");
        router.push("/auth/login"); // Redirect to login if no user session exists
        return;
      }

      const { user } = userData;
      setUser(user);

      // Fetch profile data from Supabase
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, email,phone")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Error", "Failed to load profile details.");
      } else {
        setProfile(data); // Set profile data
      }

      setLoading(false);
    };

    initializeProfile();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut(); // Logging out the user
    if (error) {
      Alert.alert("Logout Failed", error.message);
    } else {
      Alert.alert("Logged Out", "You have been logged out successfully.");
      router.push("/auth/login"); // Redirect to login page
    }
  };

  // Show a loading spinner while fetching data
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#F4BA45" />
      </SafeAreaView>
    );
  }

  // If no profile data is found
  if (!profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>No profile data found.</Text>
      </SafeAreaView>
    );
  }
const capitalize = (word: string) => {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};
  // Render profile information
  return (
    
    <SafeAreaView style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.welcomeText}>
          Welcome, {capitalize(profile.first_name)} {capitalize(profile.last_name)}!
        </Text>
        <Text style={styles.infoText}>Email: {profile.email}</Text>
        <Text style={styles.infoText}>Phone: {profile.phone}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#171717",
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#F4BA45",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#F4BA45",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#171717",
    fontSize: 16,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#171717",
  },
  errorText: {
    fontSize: 16,
    color: "#F44",
    textAlign: "center",
  },
});
