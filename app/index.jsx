import { registerRootComponent } from 'expo';
import MyList from '../screens/mylist';
import MenuScreen from '../screens/menu';
import DescriptionScreen from '../screens/description';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import { CartProvider } from '../CartContext';

const Stack = createNativeStackNavigator();


const App = () => {
  const [cartItems, setCartItems] = useState([]);
  return (
    <CartProvider>
      <Stack.Navigator initialRouteName="Menu">
      <Stack.Screen name="Menu" component={MenuScreen} options={{headerShown: false}}  />

      <Stack.Screen name="Description" component={DescriptionScreen} options={{headerShown: false}}/>
    </Stack.Navigator>

    </CartProvider>
    
  )
};

registerRootComponent(App);

export default App;