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
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [selected, setSelected] = useState(null);

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
    setSelected(null);
  };

  const handleSingleSelection = (getCurrentId) => {
    setSelected(getCurrentId === selected ? null : getCurrentId);
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
          <Text style={styles.price}>Rate: {item.rating.rate}</Text>
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
