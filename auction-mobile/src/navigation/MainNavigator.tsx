import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store';
import { THEME_COLORS } from '../constants/api';
import { scale, verticalScale, scaleFont } from '../utils/responsive';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SellProductScreen from '../screens/SellProductScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import MyBidsScreen from '../screens/MyBidsScreen';
import WonAuctionsScreen from '../screens/WonAuctionsScreen';
import VerifyEmailAuthenticatedScreen from '../screens/auth/VerifyEmailAuthenticatedScreen';

// Stack parameter lists
export type HomeStackParamList = {
  HomeMain: undefined;
  ProductDetail: { id: string };
  Products: { search?: string; category?: string };
  Watchlist: undefined;
  MyBids: undefined;
  WonAuctions: undefined;
};

export type ProductsStackParamList = {
  ProductsMain: { search?: string; category?: string };
  ProductDetail: { id: string };
  Watchlist: undefined;
  MyBids: undefined;
  WonAuctions: undefined;
};

export type DashboardStackParamList = {
  DashboardMain: undefined;
  SellProduct: undefined;
  ProductDetail: { id: string };
  Watchlist: undefined;
  MyBids: undefined;
  WonAuctions: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Watchlist: undefined;
  MyBids: undefined;
  WonAuctions: undefined;
};

export type MainStackParamList = {
  HomeTabs: undefined;
  VerifyEmailAuthenticated: { email: string };
};

export type TabParamList = {
  Home: undefined;
  Products: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

// Stack navigators for each tab
const HomeStack = createStackNavigator<HomeStackParamList>();
const ProductsStack = createStackNavigator<ProductsStackParamList>();
const DashboardStack = createStackNavigator<DashboardStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Home Stack Navigator
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <HomeStack.Screen name="Products" component={ProductsScreen} />
    <HomeStack.Screen name="Watchlist" component={WatchlistScreen} />
    <HomeStack.Screen name="MyBids" component={MyBidsScreen} />
    <HomeStack.Screen name="WonAuctions" component={WonAuctionsScreen} />
  </HomeStack.Navigator>
);

// Products Stack Navigator
const ProductsStackNavigator = () => (
  <ProductsStack.Navigator screenOptions={{ headerShown: false }}>
    <ProductsStack.Screen name="ProductsMain" component={ProductsScreen} />
    <ProductsStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <ProductsStack.Screen name="Watchlist" component={WatchlistScreen} />
    <ProductsStack.Screen name="MyBids" component={MyBidsScreen} />
    <ProductsStack.Screen name="WonAuctions" component={WonAuctionsScreen} />
  </ProductsStack.Navigator>
);

// Dashboard Stack Navigator
const DashboardStackNavigator = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="DashboardMain" component={DashboardScreen} />
    <DashboardStack.Screen name="SellProduct" component={SellProductScreen} />
    <DashboardStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <DashboardStack.Screen name="Watchlist" component={WatchlistScreen} />
    <DashboardStack.Screen name="MyBids" component={MyBidsScreen} />
    <DashboardStack.Screen name="WonAuctions" component={WonAuctionsScreen} />
  </DashboardStack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Watchlist" component={WatchlistScreen} />
    <ProfileStack.Screen name="MyBids" component={MyBidsScreen} />
    <ProfileStack.Screen name="WonAuctions" component={WonAuctionsScreen} />
  </ProfileStack.Navigator>
);

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarButton: (props: any) => <TouchableOpacity activeOpacity={1} {...props} />,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={scale(22)} color={color} />;
        },
        tabBarActiveTintColor: THEME_COLORS.primary[600],
        tabBarInactiveTintColor: THEME_COLORS.gray[400],
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom > 0 ? insets.bottom + verticalScale(20) : verticalScale(25),
          width: '90%',
          marginHorizontal: '5%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: scale(25),
          height: scale(70),
          // paddingTop: verticalScale(8),
          paddingBottom: verticalScale(8),
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: verticalScale(8),
          },
          shadowOpacity: 0.2,
          shadowRadius: scale(15),
          elevation: 15,
          borderWidth: scale(1),
          borderColor: 'rgba(255, 255, 255, 0.8)',
        },
        tabBarLabelStyle: {
          fontSize: scaleFont(10),
          fontWeight: '600',
          // marginTop: verticalScale(3),
          // marginBottom: 0,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          // paddingVertical: verticalScale(4),
          paddingHorizontal: scale(2),
          borderRadius: scale(15),
          marginHorizontal: scale(2),
        },
        tabBarIconStyle: {
          // marginBottom: verticalScale(2),
        },
        headerShown: false,
      })}
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{ 
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsStackNavigator}
        options={{ 
          tabBarLabel: 'Auctions',
        }}
      />
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStackNavigator}
        options={{ 
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{ 
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user && !user.isEmailVerified ? (
        <Stack.Screen 
          name="VerifyEmailAuthenticated" 
          component={VerifyEmailAuthenticatedScreen}
          initialParams={{ email: user.email }}
        />
      ) : (
        <Stack.Screen name="HomeTabs" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default MainNavigator; 