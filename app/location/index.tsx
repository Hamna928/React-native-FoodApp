import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, Platform, Linking, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Icon from "react-native-feather";
import { Dropdown } from "react-native-element-dropdown";
import locationsData from "@/locations.json"; // Assuming you have locations.json for cities and branches

export default function LocationScreen() {
  const [selectedCity, setSelectedCity] = useState("all");

  // Map the locations data for city dropdown
  const cityData = locationsData.cities.map(city => ({
    label: city.name,
    value: city.id
  }));

  // Function to get branches based on selected city
  const getBranches = useCallback(() => {
    if (selectedCity === "all") {
      return locationsData.cities.slice(1).flatMap(city => city.branches);
    }
    const city = locationsData.cities.find(city => city.id === selectedCity);
    return city ? city.branches : [];
  }, [selectedCity]);

  // Function to open Google Maps or Apple Maps
  const openMap = (address) => {
    const encodedAddress = encodeURIComponent(address); // Properly encode the address

    const isIOS = Platform.OS === 'ios'; // Check if the device is iOS

    // URL for Google Maps (works on both Android and iOS)
    const googleMapsUrl = `https://www.google.com/maps/search/?q=${encodedAddress}`;

    // URL for Apple Maps (only works on iOS)
    const appleMapsUrl = `http://maps.apple.com/?q=${encodedAddress}`;

    // Decide which URL to open based on the platform
    const url = isIOS ? appleMapsUrl : googleMapsUrl;

    // Open the URL
    Linking.openURL(url).catch(() => {
      Alert.alert("Oops!", "Maps are not available or installed on this device.");
    });
  };

  // Render each branch information
  const renderBranch = useCallback(({ item: branch }) => (
    <View style={styles.branchContainer}>
      <Text style={styles.branchName}>{branch.name}</Text>
      <View style={styles.locationContainer}>
        <Icon.MapPin height={20} width={20} stroke="#F4BA45" style={styles.icon} />
        <Text style={styles.branchAddress}>{branch.address}</Text>
      </View>

      {branch.phone.map((phone, index) => (
        <View key={index} style={styles.phoneContainer}>
          <Icon.PhoneCall height={20} width={20} stroke="#F4BA45" style={styles.icon} />
          <Text style={styles.branchPhone}>{phone}</Text>
        </View>
      ))}

      {/* Touchable to open map */}
      <TouchableOpacity
        onPress={() => openMap(branch.address)}
        style={styles.getDirectionsButton}
      >
        <Text style={styles.getDirectionsText}>Get Directions</Text>
      </TouchableOpacity>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Branches</Text>
      </View>

      <View style={styles.dropdownContainer}>
        <Dropdown
          data={cityData}
          placeholder="Select City"
          placeholderStyle={styles.dropdownPlaceholder}
          iconColor="#F4BA45"
          iconStyle={styles.dropdownIcon}
          labelField="label"
          valueField="value"
          onChange={(item) => setSelectedCity(item.value)}
          value={selectedCity}
        />
      </View>

      <FlatList
        data={getBranches()}
        renderItem={renderBranch}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
    padding: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 16,
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#F4BA45",
    borderRadius: 8,
    marginVertical: 16,
  },
  dropdownPlaceholder: {
    color: "white",
    marginTop: 15,
    marginLeft: 10,
  },
  dropdownIcon: {
    marginTop: 15,
    marginRight: 10,
  },
  branchContainer: {
    borderColor: "#626161",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
  },
  branchName: {
    color: "#F4BA45",
    fontSize: 20,
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  branchAddress: {
    color: "white",
    marginLeft: 10,
    fontSize: 14,
    flexWrap: "wrap",
  },
  phoneContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  branchPhone: {
    color: "white",
    marginLeft: 10,
    fontSize: 14,
  },
  icon: {
    marginTop: 3,
  },
  getDirectionsButton: {
    backgroundColor: "#F4BA45",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 16,
    alignSelf: "center",
  },
  getDirectionsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  flatListContainer: {
    paddingBottom: 100,
  },
});
