import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('');
  const [image, setImage] = useState('');
  const [highestId, setHighestId] = useState(0); // New state for tracking the highest ID

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setIsLoading(true);
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then(
        (result) => {
          setIsLoading(false);
          setProducts(result);
          if (result.length > 0) {
            // Find the highest ID in the existing products
            const maxId = Math.max(...result.map((product) => product.id));
            setHighestId(maxId);
          }
        },
        (error) => {
          setIsLoading(false);
          setError(error);
        }
      );
  };

  const handlePress = () => {
    setShowProducts(true);
  };

  const handleHomePress = () => {
    setShowProducts(false);
    setSelected(null);
    setIsAddingProduct(false);
    setIsEditingProduct(null);
  };

  const handleSingleSelection = (getCurrentId) => {
    setSelected(getCurrentId === selected ? null : getCurrentId);
  };

  const handleAddProduct = async () => {
    setIsAddingProduct(true);

    try {
      const newProduct = {
        id: highestId + 1, // Assign the new ID
        title: title,
        price: parseFloat(price),
        rating: {
          rate: parseFloat(rating),
          count: 1,
        },
        image: image,
      };

      console.log('New Product:', newProduct);

      const response = await fetch('https://fakestoreapi.com/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      const result = await response.json();
      result.rating = newProduct.rating;

      const updatedProducts = [result, ...(Array.isArray(products) ? products : [])];
      setProducts(updatedProducts);
      setHighestId(newProduct.id); // Update the highest ID
      console.log('Updated Products:', updatedProducts);

      setTitle('');
      setPrice('');
      setRating('');
      setImage('');
      setIsAddingProduct(false);
    } catch (error) {
      console.error('Error adding new product:', error);
      setError('Failed to add new product.');
      setIsAddingProduct(false);
    }
  };

  const handleEditProduct = (product) => {
    setIsEditingProduct(product.id);
    setTitle(product.title);
    setPrice(product.price.toString());
    setRating(product.rating?.rate.toString() || '');
    setImage(product.image);
  };

  const handleUpdateProduct = async () => {
    let productId;

    if (!isEditingProduct) {
      productId = highestId + 1; // Assign to the highest ID + 1 if not editing
    } else {
      productId = isEditingProduct;
    }

    const updatedProduct = {
      id: productId,
      title: title,
      price: parseFloat(price),
      rating: {
        rate: parseFloat(rating),
        count: 1,
      },
      image: image,
    };

    try {
      const response = await fetch(`https://fakestoreapi.com/products/${productId}`, {
        method: isEditingProduct ? 'PUT' : 'POST', // Use PUT if editing, POST if adding new
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      const result = await response.json();
      result.rating = updatedProduct.rating;

      let updatedProducts;
      if (isEditingProduct) {
        updatedProducts = products.map((product) =>
          product.id === productId ? result : product
        );
      } else {
        updatedProducts = [result, ...products];
        setHighestId(productId); // Increment the highest ID only if adding a new product
      }

      setProducts(updatedProducts);
      console.log('Updated Products:', updatedProducts);

      setTitle('');
      setPrice('');
      setRating('');
      setImage('');
      setIsEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product.');
    }
  };

  const handleDeleteProduct = (id) => {
    fetch(`https://fakestoreapi.com/products/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
        if (selected === id) {
          setSelected(null);
        }
      })
      .catch((error) => {
        setError(error);
      });
  };

  const renderProduct = ({ item }) => (
    <View key={item.id} style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <TouchableOpacity onPress={() => handleSingleSelection(item.id)}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </TouchableOpacity>
      {selected === item.id ? (
        <View style={styles.content}>
          <Text style={styles.price}>Price: ${item.price}</Text>
          <Text style={styles.rating}>Rating: {item.rating?.rate || 'N/A'}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteProduct(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditProduct(item)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );

  const getContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" />;
    }

    if (error) {
      return <Text>{error.message}</Text>;
    }

    if (showProducts) {
      console.log('Products:', products);
      return (
        <>
          <ScrollView style={styles.wrapper}>
            <View style={styles.accordion}>
              {products && products.length > 0 ? (
                products.map((item) => renderProduct({ item }))
              ) : (
                <View>
                  <Text>No data found</Text>
                </View>
              )}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={handleHomePress}>
            <Text style={styles.buttonText}>Home</Text>
          </TouchableOpacity>
        </>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.safeArea]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.container}>
        {!showProducts && (
          <>
            <TouchableOpacity style={styles.button} onPress={handlePress}>
              <Text style={styles.buttonText}>View Products</Text>
            </TouchableOpacity>
            {!isAddingProduct && !isEditingProduct && (
              <TouchableOpacity style={styles.button} onPress={() => setIsAddingProduct(true)}>
                <Text style={styles.buttonText}>Add Product</Text>
              </TouchableOpacity>
            )}
            {(isAddingProduct || isEditingProduct) && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  value={price}
                  onChangeText={(text) => {
                    setPrice(text);
                    console.log('Price:', text);
                  }}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Rating"
                  value={rating}
                  onChangeText={(text) => {
                    setRating(text);
                    console.log('Rating:', text);
                  }}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Image URL"
                  value={image}
                  onChangeText={(text) => {
                    setImage(text);
                    console.log('Image:', text);
                  }}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={isEditingProduct ? handleUpdateProduct : handleAddProduct}
                >
                  <Text style={styles.buttonText}>
                    {isEditingProduct ? 'Update Product' : 'Add Product'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setIsAddingProduct(false);
                    setIsEditingProduct(null);
                    setTitle('');
                    setPrice('');
                    setRating('');
                    setImage('');
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        {getContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    flex: 1,
  },
  accordion: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  content: {
    marginTop: 10,
  },
  price: {
    fontSize: 18,
    marginTop: 5,
  },
  rating: {
    fontSize: 18,
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#0000ff',
    padding: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  inputContainer: {
    width: '80%',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
});
