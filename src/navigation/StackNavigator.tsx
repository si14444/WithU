import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import HomeScreen from '../screens/HomeScreen';
import MemoryScreen from '../screens/MemoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

const StackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
          elevation: 2,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          color: colors.text.primary
        },
        headerBackTitleVisible: false,
        headerLeftContainerStyle: {
          paddingLeft: 16
        },
        headerRightContainerStyle: {
          paddingRight: 16
        },
        headerTitleContainerStyle: {
          paddingHorizontal: 16
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'WithU',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="Memory" 
        component={MemoryScreen}
        options={{
          title: '추억',
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: '설정',
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;