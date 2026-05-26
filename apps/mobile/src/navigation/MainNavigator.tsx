import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react-native';
import HomeScreen from '../screens/Home/HomeScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import PropertyDetailScreen from '../screens/PropertyDetail/PropertyDetailScreen';
import SavedScreen from '../screens/Saved/SavedScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import PostPropertyScreen from '../screens/PostProperty/PostPropertyScreen';

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  PostTab: undefined;
  SavedTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  PropertyDetail: { id: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{ title: 'Property', headerBackTitle: '' }}
      />
    </HomeStack.Navigator>
  );
}

const ICON_SIZE = 22;

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0.05,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Home size={ICON_SIZE} color={color} /> }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{ title: 'Search', tabBarIcon: ({ color }) => <Search size={ICON_SIZE} color={color} /> }}
      />
      <Tab.Screen
        name="PostTab"
        component={PostPropertyScreen}
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => <PlusSquare size={ICON_SIZE} color={color} />,
          tabBarItemStyle: { marginTop: -4 },
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedScreen}
        options={{ title: 'Saved', tabBarIcon: ({ color }) => <Heart size={ICON_SIZE} color={color} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <User size={ICON_SIZE} color={color} /> }}
      />
    </Tab.Navigator>
  );
}
