import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native"
import MapView, { Marker } from "react-native-maps"
import { FontAwesome, Feather } from "@expo/vector-icons"
import * as Location from "expo-location"

const mockGroceryStores = [
  {
    id: 1,
    name: "Marjane Fes",
    address: "Imouzzer Road, Fes",
    distance: "2.1 km",
    rating: 4.2,
    isOpen: true,
    hours: "8:00 AM - 10:00 PM",
    phone: "+212 535 123 456",
    type: "supermarket",
    lat: 34.0425,
    lng: -5.0123,
    features: ["Parking", "Pharmacy", "Bakery"],
  },
  {
    id: 2,
    name: "Acima Fes Center",
    address: "Hassan II Avenue, Fes",
    distance: "1.3 km",
    rating: 4.0,
    isOpen: true,
    hours: "9:00 AM - 9:00 PM",
    phone: "+212 535 987 654",
    type: "supermarket",
    lat: 34.0381,
    lng: -4.9972,
    features: ["Parking", "Fresh Products"],
  },
  
]

const GroceryMap = () => {
  const [userLocation, setUserLocation] = useState(null)
  const [selectedStore, setSelectedStore] = useState(null)

  const getUserLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== "granted") {
    console.warn("Permission denied for location")
    return
  }

  let location = await Location.getCurrentPositionAsync({})
  setUserLocation({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  })
}

  useEffect(() => {
    getUserLocation()
  }, [])

  const openDirections = (store) => {
    const origin = userLocation
      ? `${userLocation.latitude},${userLocation.longitude}`
      : ""
    const destination = `${store.lat},${store.lng}`
    const url = `https://www.google.com/maps/dir/${origin}/${destination}`
    Linking.openURL(url)
  }

  const callStore = (phone) => {
    const tel = `tel:${phone}`
    Linking.openURL(tel)
  }

  const getMarkerColor = (type) => {
    switch (type) {
      case "supermarket":
        return "blue"
      case "grocery":
        return "green"
      case "traditional":
        return "orange"
      default:
        return "gray"
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 34.0331,
          longitude: -5.0003,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {mockGroceryStores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{ latitude: store.lat, longitude: store.lng }}
            pinColor={getMarkerColor(store.type)}
            onPress={() => setSelectedStore(store)}
          />
        ))}
      </MapView>

      <View style={styles.sidebar}>
        <FlatList
          data={mockGroceryStores}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                selectedStore?.id === item.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedStore(item)}
            >
              <Text style={styles.storeName}>{item.name}</Text>
              <Text style={styles.address}>{item.address}</Text>
              <Text style={styles.info}>
                {item.distance} · {item.isOpen ? "🟢 Open" : "🔴 Closed"} · ⭐{" "}
                {item.rating}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => openDirections(item)}
                >
                  <Feather name="navigation" size={16} color="white" />
                  <Text style={styles.btnText}>Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.callBtn]}
                  onPress={() => callStore(item.phone)}
                >
                  <Feather name="phone" size={16} color="white" />
                  <Text style={styles.btnText}>Call</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  sidebar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "45%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    marginBottom: 10,
  },
  selectedCard: {
    backgroundColor: "#e0e7ff",
  },
  storeName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: "#6b7280",
  },
  info: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366f1",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  callBtn: {
    backgroundColor: "#10b981",
  },
  btnText: {
    color: "white",
    fontWeight: "600",
  },
})

export default GroceryMap
