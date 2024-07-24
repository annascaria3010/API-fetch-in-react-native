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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('');
  const [image, setImage] = useState('');

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    if (showProducts) {
      fetchProducts();
    }
  }, [showProducts]);

  const fetchProducts = () => {
    setIsLoading(true);
    fetch('https://fakestoreapi.com/products')
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoading(false);
          setResponse(result);
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
  };

  const handleSingleSelection = (getCurrentId) => {
    setSelected(getCurrentId === selected ? null : getCurrentId);
  };

  const handleAddProduct = () => {
    const newProduct = {
      title,
      price: parseFloat(price),
      rating: {
        rate: parseFloat(rating),
        count: 1,
      },
      image,
    };

    fetch('https://fakestoreapi.com/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    })
      .then(res => res.json())
      .then(
        (result) => {
          setResponse([...response, result]);
          setTitle('');
          setPrice('');
          setRating('');
          setImage('');
        },
        (error) => {
          setError(error);
        }
      );
  };

  const handleDeleteProduct = (id) => {
    fetch(`https://fakestoreapi.com/products/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        // Filter out the deleted product from local state
        setResponse(response.filter(product => product.id !== id));
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
          <Text style={styles.rating}>Rating: {item.rating.rate}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProduct(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
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
      return (
        <>
          <ScrollView style={styles.wrapper}>
            <View style={styles.accordion}>
              {response && response.length > 0 ? (
                response.map((item) => renderProduct({ item }))
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
                onChangeText={setPrice}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Rating"
                value={rating}
                onChangeText={setRating}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Image URL"
                value={image}
                onChangeText={setImage}
              />
              <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
                <Text style={styles.buttonText}>Add Product</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#fff',
  },
  wrapper: {
    padding: 10,
  },
  accordion: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    padding: 10,
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rating: {
    fontSize: 16,
    color: '#888',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '80%',
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
