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
  const [highestId, setHighestId] = useState(0);

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
      
      console.log('New Product:', newProduct); // Log the new product

      const response = await fetch('https://fakestoreapi.com/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      const result = await response.json();
      result.rating = newProduct.rating;  // Manually add the rating to the result

      const updatedProducts = [result, ...(Array.isArray(products) ? products : [])];
      setProducts(updatedProducts);
      setHighestId(newProduct.id); // Update the highest ID
      console.log('Updated Products:', updatedProducts);  // <-- Log the updated products

      setTitle('');
      setPrice('');
      setRating('');
      setImage('');
      setIsAddingProduct(false);
    } catch (error) {
      console.error('Error adding new post:', error);
      setError('Failed to add new post.');
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

  const handleUpdateProduct = async() => {
    const updatedProduct = {
      id: isEditingProduct,
      title: title,
      price: parseFloat(price),
      rating: {
          rate: parseFloat(rating),
          count: 1,
        },
      image: image,

    };

    try {
      const response = await fetch(`https://fakestoreapi.com/products/${isEditingProduct}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProduct),
    });
    const result = await response.json();
    result.rating = updatedProduct.rating;

    const updatedProducts = products.map((product) =>
      product.id === isEditingProduct ? result : product
    );
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
  
  const renderProduct = ({ item }) => {
    console.log('Rendering product:', item); // Console log for item
    const rate = item.rating?.rate || 'N/A';
    console.log(item.rating,"checking the code");
    console.log('Product rate:', rate);
    return (
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
  };

 

  const getContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" />;
    }

    if (error) {
      return <Text>{error.message}</Text>;
    }

    if (showProducts) {
      console.log('Products:', products); // Log the products array
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
                  onChangeText={setImage}
                />
                {isAddingProduct && (
                  <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                )}
                {isEditingProduct && (
                  <TouchableOpacity style={styles.button} onPress={handleUpdateProduct}>
                    <Text style={styles.buttonText}>Update</Text>
                  </TouchableOpacity>
                )}
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
    textAlign: 'center',
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
  editButton: {
    backgroundColor: 'blue',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 10,
  },
});
