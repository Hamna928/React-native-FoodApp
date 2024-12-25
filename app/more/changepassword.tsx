import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { supabase } from "../supabase/supabaseClient"; // Ensure correct path to supabase client

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState(""); // For current password
  const [newPassword, setNewPassword] = useState(""); // For new password
  const [confirmPassword, setConfirmPassword] = useState(""); // For confirming new password
  const [email, setEmail] = useState(""); // For email
  const [loading, setLoading] = useState(false); // For loading state

  useEffect(() => {
    // Fetch the current user's session to get their email
    const fetchSession = async () => {
      const { data: session, error } = await supabase.auth.getSession();
      if (error) {
        Alert.alert("Error", "Failed to fetch session.");
        return;
      }

      if (session?.user?.email) {
        setEmail(session.user.email); // Set the email if available
      }
    };

    fetchSession();
  }, []);

  // Function to handle password change
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are mandatory.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Get the current user session using getSession() for Supabase v2
      const { data: session, error: sessionError } = await supabase.auth.getSession();

      // Check if session exists and is valid
      if (sessionError || !session || !session.user) {
        Alert.alert("Error", "You are not logged in. Please log in again.");
        setLoading(false);
        return;
      }

      const email = session.user.email; // Extract the email from the session object

      // Reauthenticate using the current password
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email, // Use the email of the logged-in user
        password: currentPassword, // Use the current password entered by the user
      });

      if (loginError) {
        Alert.alert("Error", loginError.message || "Failed to re-authenticate user.");
        setLoading(false);
        return;
      }

      // If re-authentication is successful, update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword, // Update the password
      });

      if (updateError) {
        Alert.alert("Error", updateError.message || "An unexpected error occurred.");
      } else {
        Alert.alert("Success", "Your password has been successfully changed.");
      }
    } catch (error) {
      console.error("Password change error:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Change Password</Text>

        {/* Current Password */}
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />

        {/* New Password */}
        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        {/* Confirm New Password */}
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* Email Display */}
        <TextInput
          style={styles.input}
          value={email} // Email is fetched and displayed here
          editable={false} // Email should not be editable
          placeholder="Your Email" // Placeholder text
        />

        {/* Change Password Button */}
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: "#ccc" }]}
          onPress={handlePasswordChange}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{loading ? "Changing..." : "Change Password"}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
    justifyContent: "center",
    padding: 16,
  },
  content: {
    backgroundColor: "#222222",
    padding: 24,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F4BA45",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#333333",
    color: "#fff",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F4BA45",
  },
  button: {
    backgroundColor: "#F4BA45",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#171717",
    fontWeight: "bold",
    fontSize: 16,
  },
});
