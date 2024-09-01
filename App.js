import react,{useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createTables } from './database/db.js';

import Index from './components/UI/Index.js';
import Add from './components/UI/Add.js';
import Edit from './components/UI/Edit.js';

const Stack = createStackNavigator();

export default function App() {

  useEffect(() => {
    createTables(); 
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen
          name="Index"
          component={Index}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="Add"
          component={Add}
          options={{ title: 'Add Task' }}
        />
        <Stack.Screen
          name="Edit"
          component={Edit}
          options={{ title: 'Edit Task' }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};