import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ShoppingBasket, Plus, Search } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../component/Header';
import BottomNav from '../../component/BottomNav';
import { COLORS } from '../theme/colors';

const SMARTCART_URL = 'http://10.0.2.2:5002/api';

// Fonction debounce pour limiter les appels API
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const DEBOUNCE_DELAY = 300;

// Fonction pour nettoyer le nom du produit
const cleanProductName = (name) => {
  // Enlever les chiffres au début du nom
  return name.replace(/^[0-9]+\s*/, '');
};

export default function BasketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [darkMode, setDarkMode] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [basket, setBasket] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const theme = darkMode ? styles.dark : styles.light;

  const categories = ['all', 'Électronique', 'Éducation', 'Transport', 'Alimentation'];

  const loadProducts = useCallback(async (retryCount = 0, page = 1, shouldAppend = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      }
      setError(null);

      // Load saved basket
      const savedBasket = await AsyncStorage.getItem('basket');
      if (savedBasket) {
        setBasket(JSON.parse(savedBasket));
      }

      // Build URL with query parameters
      let url = `${SMARTCART_URL}/products`;
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      // Add pagination parameters
      params.append('page', page.toString());
      params.append('per_page', '20');
      
      // Make student filter optional (disabled by default)
      params.append('student_filter', 'false');
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('Fetching products from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      console.log('Received products:', data);
      
      const productsList = data.products || [];
      
      // Update products list based on whether we're appending or replacing
      setProducts(prevProducts => shouldAppend ? [...prevProducts, ...productsList] : productsList);
      
      // Update pagination state
      setHasMore(productsList.length > 0 && data.total > (page * 20));
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => {
          loadProducts(retryCount + 1, page, shouldAppend);
        }, RETRY_DELAY);
        return;
      }
      
      setError('Erreur lors du chargement des produits');
      if (page === 1) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, searchQuery]);

  // Handle loading more products
  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || loading) return;
    
    setIsLoadingMore(true);
    loadProducts(0, currentPage + 1, true);
  }, [hasMore, isLoadingMore, loading, currentPage, loadProducts]);

  // Debounced product loading
  const debouncedLoadProducts = useCallback(
    debounce(() => {
      loadProducts();
    }, DEBOUNCE_DELAY),
    [loadProducts]
  );

  // Use useFocusEffect to load products when screen is focused
  useFocusEffect(
    useCallback(() => {
      debouncedLoadProducts();
      
      // Cleanup function to cancel any pending debounced calls
      return () => {
        debouncedLoadProducts.cancel?.();
      };
    }, [debouncedLoadProducts])
  );

  // Reset pagination when search or category changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    debouncedLoadProducts();
  }, [searchQuery, selectedCategory]);

  // Debounce la recherche pour éviter trop d'appels API
  const debouncedSearch = useCallback(
    debounce((text) => {
      setSearchQuery(text);
    }, 500),
    []
  );

  // Debounce le changement de catégorie
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleAddToBasket = async (product) => {
    try {
      const newBasket = [...basket];
      const existingItem = newBasket.find(item => 
        item.name === product.name && 
        item.price === product.price &&
        item.goalId === product.goalId
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        newBasket.push({
          ...product,
          quantity: 1,
          id: Date.now().toString()
        });
      }

      await AsyncStorage.setItem('basket', JSON.stringify(newBasket));
      setBasket(newBasket);
      Alert.alert('Succès', 'Produit ajouté au panier');
    } catch (error) {
      console.error('Error adding to basket:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter au panier');
    }
  };

  const handleRemoveFromBasket = async (itemId) => {
    try {
      const newBasket = basket.filter(item => item.id !== itemId);
      await AsyncStorage.setItem('basket', JSON.stringify(newBasket));
      setBasket(newBasket);
    } catch (error) {
      console.error('Error removing from basket:', error);
      Alert.alert('Erreur', 'Impossible de retirer du panier');
    }
  };

  const calculateTotal = () => {
    return basket.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <View style={[styles.container, theme.container]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <Header title="Panier" darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <ScrollView style={styles.content}>
        {/* Barre de recherche */}
        <View style={[styles.searchContainer, theme.card]}>
          <Search size={20} color={darkMode ? '#cbd5e1' : '#475569'} />
          <TextInput
            style={[styles.searchInput, theme.text]}
            placeholder="Rechercher un produit..."
            placeholderTextColor={darkMode ? '#cbd5e1' : '#475569'}
            value={searchQuery}
            onChangeText={debouncedSearch}
          />
        </View>

        {/* Filtres par catégorie */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
                theme.card
              ]}
              onPress={() => handleCategoryChange(category)}
            >
              <Text 
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive,
                  theme.text
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Résumé du panier */}
        <View style={[styles.summaryCard, theme.card]}>
          <Text style={[styles.summaryTitle, theme.text]}>Résumé du panier</Text>
          <Text style={[styles.summaryText, theme.textSecondary]}>
            {basket.length} article{basket.length > 1 ? 's' : ''}
          </Text>
          <Text style={[styles.totalAmount, theme.text]}>
            Total: {calculateTotal().toFixed(2)} DH
          </Text>
        </View>

        {/* Liste des articles */}
        <View style={styles.basketList}>
          {basket.map(item => (
            <View key={item.id} style={[styles.basketItem, theme.card]}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, theme.text]}>{item.name}</Text>
                <Text style={[styles.itemPrice, theme.textSecondary]}>
                  {item.price.toFixed(2)} DH x {item.quantity}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFromBasket(item.id)}
              >
                <Text style={styles.removeButtonText}>Retirer</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Liste des produits */}
        <View style={styles.productsSection}>
          <Text style={[styles.sectionTitle, theme.text]}>Produits disponibles</Text>
          {loading && currentPage === 1 ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : error && currentPage === 1 ? (
            <Text style={[styles.errorText, theme.text]}>{error}</Text>
          ) : products && products.length > 0 ? (
            <View style={styles.productsList}>
              {products.map(product => (
                <View key={product._id || product.id} style={[styles.productCard, theme.card]}>
                  {product.image_url && (
                    <Image
                      source={{ uri: product.image_url }}
                      style={styles.productImage}
                    />
                  )}
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, theme.text]}>
                      {cleanProductName(product.product_name)}
                    </Text>
                    <Text style={[styles.productPrice, theme.textSecondary]}>
                      {product.price.toFixed(2)} DH
                    </Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddToBasket(product)}
                    >
                      <Plus size={20} color="white" />
                      <Text style={styles.addButtonText}>Ajouter au panier</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noProducts, theme.text]}>Aucun produit trouvé</Text>
          )}
          
          {/* Loading more indicator */}
          {isLoadingMore && (
            <ActivityIndicator 
              size="small" 
              color={COLORS.primary} 
              style={styles.loadingMore} 
            />
          )}
        </View>
      </ScrollView>

      <BottomNav activeTab="basket" darkMode={darkMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: 16
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16
  },
  categoriesContainer: {
    marginBottom: 16
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500'
  },
  categoryButtonTextActive: {
    color: 'white'
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 8
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  basketList: {
    marginBottom: 20
  },
  basketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4
  },
  itemPrice: {
    fontSize: 14
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500'
  },
  productsSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  productsList: {
    gap: 12
  },
  productCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden'
  },
  productImage: {
    width: 100,
    height: 100
  },
  productInfo: {
    flex: 1,
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    gap: 8
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500'
  },
  light: {
    container: {
      backgroundColor: "#f8fafc"
    },
    text: {
      color: "#0f172a"
    },
    textSecondary: {
      color: "#475569"
    },
    card: {
      backgroundColor: "white",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5
    }
  },
  dark: {
    container: {
      backgroundColor: "#0f172a"
    },
    text: {
      color: "#f8fafc"
    },
    textSecondary: {
      color: "#cbd5e1"
    },
    card: {
      backgroundColor: "#1e293b",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.3,
      shadowRadius: 3.84,
      elevation: 5
    }
  },
  loader: {
    marginVertical: 20
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#ef4444'
  },
  loadingMore: {
    paddingVertical: 20,
  },
  noProducts: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
});
