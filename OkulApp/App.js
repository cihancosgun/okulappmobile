import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Button,
  StatusBar,
  StyleSheet,
  View, Text
} from 'react-native';
import { AppLoading, Font } from 'expo';
import { createStackNavigator, createSwitchNavigator, createAppContainer, createBottomTabNavigator } from 'react-navigation';
import { LoginView } from './views/LoginView';
import { HomeScreen } from './views/HomeScreen';
import { Ionicons } from '@expo/vector-icons';
import { GalleryScreen } from './views/GalleryScreen';
import { MenuScreen } from './views/MenuScreen';
import { ChatScreen } from './views/ChatScreen';
import { ChatSubScreen } from './views/ChatSubScreen';
import { OkulApi } from './services/OkulApiService';
import { ContactsScreen } from './views/ContactsScreen';
import { NotificationScreen } from './views/NotificationScreen';

class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
    };    
  }

  async componentDidMount() {
    this.setState({ isReady: false });
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font
    });
    this.setState({ isReady: true });
    this._bootstrapAsync();
    console.disableYellowBox=true;    
  }
  

  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken');    
    OkulApi.userName = await AsyncStorage.getItem("userName");
    OkulApi.pass = await AsyncStorage.getItem("password");
    this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  render() {
    if (!this.state.isReady) {
      return <AppLoading />;
    }    
      return (
        <View style={styles.container}>
          <ActivityIndicator />
          <StatusBar barStyle="default" />
        </View>
      );    
  }
}

class IconWithBadge extends React.Component {
  render() {
    const { name, badgeCount, color, size } = this.props;
    return (
      <View style={{ width: 24, height: 24, margin: 5 }}>
        <Ionicons name={name} size={size} color={color} />
        {badgeCount > 0 && (
          <View
            style={{
              // /If you're using react-native < 0.57 overflow outside of the parent
              // will not work on Android, see https://git.io/fhLJ8
              position: 'absolute',
              right: -6,
              top: -3,
              backgroundColor: 'red',
              borderRadius: 6,
              width: 12,
              height: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              {badgeCount}
            </Text>
          </View>
        )}
      </View>
    );
  }
}

const HomeIconWithBadge = props => {
  // You should pass down the badgeCount in some other ways like context, redux, mobx or event emitters.
  return <IconWithBadge {...props} badgeCount={0} />;
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const AppStack = createBottomTabNavigator({ Home: HomeScreen, Chat:ChatScreen, Menu: MenuScreen },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let IconComponent = Ionicons;
        let iconName;
        if (routeName === 'Home') {
          iconName = `ios-home`;
          // Sometimes we want to add badges to some icons.
          // You can check the implementation below.
          IconComponent = HomeIconWithBadge;
        } else if (routeName === 'Chat') {
          iconName = `ios-chatboxes`;
        }else if (routeName === 'Menu') {
          iconName = `ios-menu`;
        }

        // You can return any component that you like here!
        return <IconComponent name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: 'blue',
      inactiveTintColor: 'gray',
    },
  });
const GalleryStack = createStackNavigator({ Gallery: GalleryScreen }, {defaultNavigationOptions: {   header: null }});
const ChatSubStack = createStackNavigator({ ChatSub: ChatSubScreen }, {defaultNavigationOptions: {   header: null }});
const ContactsStack = createStackNavigator({ ContactsStack: ContactsScreen }, {defaultNavigationOptions: {   header: null }});
const AuthStack = createStackNavigator({ SignIn: LoginView }, {defaultNavigationOptions: {   header: null }});
const NotifyStack = createStackNavigator({ Notify: NotificationScreen }, {defaultNavigationOptions: {   header: null }});

export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
    Gallery: GalleryStack,
    ChatSub: ChatSubStack,
    Contacts: ContactsStack,
    Notify: NotifyStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));
