import { registerRootComponent } from 'expo';
import MyList from '../screens/mylist';
import MenuScreen from '../screens/menu';

import DescriptionScreen from '../screens/description';
import SignUpScreen1 from '../screens/signUp1';
import SignUpScreen2 from '../screens/signUp2';
import SignUpScreen3 from '../screens/signUp3';
import Profile from '../screens/profile';
import Mycart from '../screens/mycart';

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
    
  );
};

registerRootComponent(App);

export default App;
