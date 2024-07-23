import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState([]);
  const [showProducts, setShowProducts] = useState(false);

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const handlePress = () => {
    setIsLoading(true);
    fetch('https://fakestoreapi.com/products')
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoading(false);
          setResponse(result);
          setShowProducts(true);
        },
        (error) => {
          setIsLoading(false);
          setError(error);
        }
      );
  };

  const handleHomePress = () => {
    setShowProducts(false);
  };

  const renderProduct = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
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
          <FlatList
            data={response}
            renderItem={renderProduct}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.list}
          />
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
          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>See Products</Text>
          </TouchableOpacity>
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
  list: {
    padding: 16,
  },
  itemContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
