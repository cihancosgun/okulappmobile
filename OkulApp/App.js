import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Button,
  StatusBar,
  StyleSheet,
  View, Text
} from 'react-native';
import { AppLoading, Notifications } from 'expo';
import * as Font from 'expo-font';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
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
import { NotifyReceiversScreen } from './views/NotifyReceiversScreen';
import { StudentsCheckIn } from './views/StudentsCheckIn';
import { StudentsActivityMealScreen } from './views/StudentsActivityMealScreen';
import { StudentsActivitySleepScreen } from './views/StudentsActivitySleepScreen';
import { StudentsActivityEmotionScreen } from './views/StudentsActivityEmotionScreen';
import { MonthlyMealScheduleScreen } from './views/MonthlyMealScheduleScreen';

class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      notification: {},
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
    this._notificationSubscription = Notifications.addListener(this._handleNotification); 

    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('bilgiyuvam-notifications', {
        name: 'Bilgiyuvam bilgilendirmeler',
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250]
      });
    }
    
  }
  
  _handleNotification = (notification) => {
    this.setState({notification: notification});
  };
  

  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken');    
    OkulApi.userName = await AsyncStorage.getItem("userName");
    OkulApi.pass = await AsyncStorage.getItem("password");
    if(userToken){
      OkulApi.refreshUnreadedInfos();
    }
    setTimeout(() => {
      this.props.navigation.navigate(userToken ? 'App' : 'Auth');
    }, 2000);    
  };

  render() {
    if (!this.state.isReady) {
      return <AppLoading />;
    }    
      return (
        <View>
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
  return <IconWithBadge {...props} badgeCount={OkulApi.unreadedBoard} />;
};

const MessageIconWithBadge = props => {
  // You should pass down the badgeCount in some other ways like context, redux, mobx or event emitters.
  return <IconWithBadge {...props} badgeCount={OkulApi.unreadedMessages} />;
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
          IconComponent = MessageIconWithBadge;
        }else if (routeName === 'Menu') {
          iconName = `ios-menu`;
        }
        // You can return any component that you like here!
        return <IconComponent name={iconName} size={25} color={tintColor}/>;
      },
      headerMode:'none'
    }),
    tabBarOptions: {
      activeTintColor: 'blue',
      inactiveTintColor: 'gray',
    },    
      headerMode:'none'      
  });
const GalleryStack = createStackNavigator({ Gallery: GalleryScreen }, {defaultNavigationOptions: {   header : null  }});
const ChatSubStack = createStackNavigator({ ChatSub: ChatSubScreen }, {defaultNavigationOptions: {   header : null  }});
const ContactsStack = createStackNavigator({ ContactsStack: ContactsScreen }, {defaultNavigationOptions: {   header : null }});
const NotifyReceiverStack = createStackNavigator({ NotifyReceiver: NotifyReceiversScreen }, {defaultNavigationOptions: {   header : null  }});
const AuthStack = createStackNavigator({ SignIn: LoginView }, {defaultNavigationOptions: {   header : null  }});
const NotifyStack = createStackNavigator({ Notify: NotificationScreen }, {defaultNavigationOptions: {   header : null  }});
const StudentsCheckInStack = createStackNavigator({ StudentsCheckInStack: StudentsCheckIn }, {defaultNavigationOptions: {   header : null  }});
const StudentsActivityMealStack = createStackNavigator({ StudentsActivityMealStack: StudentsActivityMealScreen }, {defaultNavigationOptions: {   header : null  }});
const StudentsActivitySleepStack = createStackNavigator({ StudentsActivitySleepStack: StudentsActivitySleepScreen }, {defaultNavigationOptions: {   header : null  }});
const StudentsActivityEmotionStack = createStackNavigator({ StudentsActivityEmotionStack: StudentsActivityEmotionScreen }, {defaultNavigationOptions: {   header : null  }});
const MonthlyMealScheduleStack = createStackNavigator({ MonthlyMealScheduleStack: MonthlyMealScheduleScreen }, {defaultNavigationOptions: {   header : null  }});

export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
    Gallery: GalleryStack,
    ChatSub: ChatSubStack,
    Contacts: ContactsStack,
    Notify: NotifyStack,
    NotifyReceiver: NotifyReceiverStack,
    StCheckIn:StudentsCheckInStack,
    StMeal:StudentsActivityMealStack,
    StSleep:StudentsActivitySleepStack,
    StEmotion:StudentsActivityEmotionStack,
    MonthlyMeal:MonthlyMealScheduleStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));
