import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Star, Phone, Search, Filter } from 'lucide-react';
import '../css/GroceryMap.css';


const GroceryMap = ({ darkMode = true }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 34.0331, lng: -5.0003 }); // Fes, Morocco default
  const [groceryStores, setGroceryStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);

  // Mock grocery store data for Fes, Morocco
  const mockGroceryStores = [
    {
      id: 1,
      name: "Marjane Fès",
      address: "Route d'Imouzzer, Fès",
      distance: "2.1 km",
      rating: 4.2,
      isOpen: true,
      hours: "8:00 - 22:00",
      phone: "+212 535 123 456",
      type: "supermarket",
      lat: 34.0425,
      lng: -5.0123,
      features: ["Parking", "Pharmacy", "Bakery"]
    },
    {
      id: 2,
      name: "Acima Fès Centre",
      address: "Avenue Hassan II, Fès",
      distance: "1.3 km",
      rating: 4.0,
      isOpen: true,
      hours: "9:00 - 21:00",
      phone: "+212 535 987 654",
      type: "supermarket",
      lat: 34.0381,
      lng: -4.9972,
      features: ["Parking", "Fresh Products"]
    },
    {
      id: 3,
      name: "Épicerie Al Barid",
      address: "Rue des Mérinides, Fès",
      distance: "0.8 km",
      rating: 3.8,
      isOpen: true,
      hours: "7:00 - 23:00",
      phone: "+212 535 456 789",
      type: "grocery",
      lat: 34.0298,
      lng: -4.9987,
      features: ["Local Products", "Fresh Bread"]
    },
    {
      id: 4,
      name: "Carrefour Market Fès",
      address: "Quartier Hassan, Fès",
      distance: "3.2 km",
      rating: 4.1,
      isOpen: false,
      hours: "8:30 - 21:30",
      phone: "+212 535 321 987",
      type: "supermarket",
      lat: 34.0501,
      lng: -5.0201,
      features: ["Electronics", "Clothing", "Pharmacy"]
    },
    {
      id: 5,
      name: "Hanout Sidi Brahim",
      address: "Medina, Fès el Bali",
      distance: "1.9 km",
      rating: 4.5,
      isOpen: true,
      hours: "6:00 - 22:00",
      phone: "+212 535 654 321",
      type: "traditional",
      lat: 34.0628,
      lng: -4.9739,
      features: ["Traditional Spices", "Local Products", "Organic"]
    }
  ];

  // Calculate filtered stores
  const filteredStores = groceryStores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || store.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Set up stores data
  useEffect(() => {
    setGroceryStores(mockGroceryStores);
    getUserLocation();
  }, []);

  // Initialize Leaflet map with better error handling
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current || !mapReady) return;

    const initializeMap = async () => {
      try {
        // Check if Leaflet is already loaded
        if (!window.L) {
          // Load Leaflet CSS
          if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
            document.head.appendChild(link);
          }

          // Load Leaflet JS
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });

          // Wait a bit for Leaflet to be fully available
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (window.L && mapRef.current) {
          // Initialize map
          leafletMapRef.current = window.L.map(mapRef.current, {
            center: [mapCenter.lat, mapCenter.lng],
            zoom: 13,
            zoomControl: true
          });

          // Add tile layer
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(leafletMapRef.current);

          // Add store markers after map is initialized
          addStoreMarkers();
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (error) {
          console.warn('Error removing map:', error);
        }
        leafletMapRef.current = null;
      }
    };
  }, [mapReady, mapCenter.lat, mapCenter.lng]);

  // Set map ready after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Update map center when it changes
  useEffect(() => {
    if (leafletMapRef.current && window.L) {
      try {
        leafletMapRef.current.setView([mapCenter.lat, mapCenter.lng], 15);
      } catch (error) {
        console.warn('Error updating map center:', error);
      }
    }
  }, [mapCenter]);

  // Get marker color based on store type
  const getMarkerColor = (type) => {
    switch (type) {
      case 'supermarket': return '#6366f1';
      case 'grocery': return '#10b981';
      case 'traditional': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  // Add markers to map
  const addStoreMarkers = () => {
    if (!leafletMapRef.current || !window.L || filteredStores.length === 0) return;

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        try {
          leafletMapRef.current.removeLayer(marker);
        } catch (error) {
          console.warn('Error removing marker:', error);
        }
      });
      markersRef.current = [];

      // Add new markers
      filteredStores.forEach(store => {
        try {
          const isSelected = selectedStore?.id === store.id;
          const markerColor = getMarkerColor(store.type);
          
          const marker = window.L.circleMarker([store.lat, store.lng], {
            radius: isSelected ? 12 : 8,
            fillColor: markerColor,
            color: isSelected ? '#fff' : markerColor,
            weight: isSelected ? 3 : 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(leafletMapRef.current);

          // Add popup
          const popupContent = `
            <div style="font-family: 'Inter', Arial, sans-serif; min-width: 200px; background: #1f2937; color: #f9fafb; border-radius: 8px; padding: 12px;">
              <h3 style="margin: 0 0 8px 0; color: #f9fafb; font-weight: 600;">${store.name}</h3>
              <p style="margin: 4px 0; color: #9ca3af; font-size: 14px;">📍 ${store.address}</p>
              <p style="margin: 4px 0; color: #9ca3af; font-size: 14px;">⭐ ${store.rating} | ${store.isOpen ? '🟢 Open' : '🔴 Closed'}</p>
              <p style="margin: 4px 0; color: #9ca3af; font-size: 14px;">🕒 ${store.hours}</p>
            </div>
          `;
          
          marker.bindPopup(popupContent);
          
          marker.on('click', () => {
            setSelectedStore(store);
          });

          markersRef.current.push(marker);
        } catch (error) {
          console.warn('Error adding marker for store:', store.name, error);
        }
      });

      // Add user location marker if available
      if (userLocation) {
        try {
          const userMarker = window.L.marker([userLocation.lat, userLocation.lng], {
            icon: window.L.divIcon({
              className: 'user-location-marker',
              html: '<div style="background: #6366f1; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);"></div>',
              iconSize: [18, 18],
              iconAnchor: [9, 9]
            })
          }).addTo(leafletMapRef.current);
          
          userMarker.bindPopup('Your Location');
          markersRef.current.push(userMarker);
        } catch (error) {
          console.warn('Error adding user location marker:', error);
        }
      }
    } catch (error) {
      console.error('Error in addStoreMarkers:', error);
    }
  };

  // Update markers when stores or selection changes
  useEffect(() => {
    if (leafletMapRef.current && groceryStores.length > 0 && window.L) {
      addStoreMarkers();
    }
  }, [filteredStores, selectedStore, userLocation, groceryStores]);

  const getUserLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          setLoading(false);
        },
        (error) => {
          console.log('Location access denied:', error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  };

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setMapCenter({ lat: store.lat, lng: store.lng });
  };

  const getDirections = (store) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${store.lat},${store.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/dir//${store.lat},${store.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="grocery-map-container">
      

      {/* Controls */}
      <div className="controls">
        
        
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tous les types</option>
          <option value="supermarket">Supermarchés</option>
          <option value="grocery">Épiceries</option>
          <option value="traditional">Traditionnel</option>
        </select>

        <button
          className="locate-btn"
          onClick={getUserLocation}
          disabled={loading}
        >
          {loading ? (
            <>Localisation...</>
          ) : (
            <>
              <Navigation size={18} />
              Me localiser
            </>
          )}
        </button>
      </div>

      {/* Map and Sidebar */}
      <div className="map-container">
        {/* Map */}
        <div className="map-display">
          <div ref={mapRef} className="map-canvas" />
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-title">
            <MapPin size={24} />
            Magasins à proximité
            <span className="store-count">
              ({filteredStores.length})
            </span>
          </div>

          {filteredStores.length === 0 ? (
            <div className="no-results">
              <p>Aucun magasin trouvé selon vos critères.</p>
            </div>
          ) : (
            <div>
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  className={`store-card ${selectedStore?.id === store.id ? 'selected' : ''}`}
                  onClick={() => handleStoreSelect(store)}
                >
                  <div className="store-header">
                    <h3 className="store-name">{store.name}</h3>
                    <span 
                      className={`store-type-badge ${store.type}`}
                      style={{ backgroundColor: getMarkerColor(store.type) }}
                    >
                      {store.type}
                    </span>
                  </div>

                  <p className="store-address">{store.address}</p>

                  <div className="store-info">
                    <div className="info-item">
                      <MapPin size={16} />
                      {store.distance}
                    </div>
                    <div className={`info-item ${store.isOpen ? 'open' : 'closed'}`}>
                      <Clock size={16} />
                      {store.isOpen ? 'Ouvert' : 'Fermé'}
                    </div>
                    <div className="info-item">
                      <Star size={16} />
                      {store.rating}
                    </div>
                  </div>

                  <div className="store-features">
                    {store.features.map((feature, index) => (
                      <span key={index} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="store-actions">
                    <button
                      className="action-btn primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        getDirections(store);
                      }}
                    >
                      <Navigation size={16} />
                      Itinéraire
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${store.phone}`, '_self');
                      }}
                    >
                      <Phone size={16} />
                      Appeler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroceryMap;