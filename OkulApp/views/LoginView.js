import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableHighlight,
  Image,
  Alert, KeyboardAvoidingView, AsyncStorage
} from 'react-native';
import { Svg, Notifications } from 'expo';
import { Icon } from 'native-base';
import { OkulApi } from '../services/OkulApiService';
import * as Permissions from 'expo-permissions';


export class LoginView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      login   : '',
      password: ''
    }
  }

  async registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
  
    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
  
    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }
  
    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();
    console.log(token);
  
    // POST the token to your backend server from where you can retrieve it to send push notifications.
    return  OkulApi.setPushToken(token);
  }


  onLogin = () => {
      if(this.state == null || this.state.login == null){
        Alert.alert('Hata', 'Kullanıcı e-posta adresini giriniz');
        return;
      }
      if(this.state.password == null){
        Alert.alert('Hata','Kullanıcı parolasını giriniz');
        return;
      }

      OkulApi.getToken(this.state.login, this.state.password, (token) => {
        this.state.token = token;
        AsyncStorage.setItem('userName',this.state.login);
        AsyncStorage.setItem('password',this.state.password);
        this.registerForPushNotificationsAsync();
        this.props.navigation.navigate('App');
        },()=>{
          Alert.alert("Başarısız", "Kullanıcı adı veya parola hatalı");
      });
      
  }
 

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      <Image source={require('../assets/icon.png')} style={{marginBottom:30, width:150, height:150}}/>
      <Text>Bilgiyuvam Anaokulu</Text>      
      <Text style={{marginBottom: 30}}>kullanıcı girişi</Text>
        <View style={styles.inputContainer}>        
        <Icon name='at' style={styles.inputIcon} />
          <TextInput style={styles.inputs}
              placeholder="Eposta"
              keyboardType="email-address"
              underlineColorAndroid='transparent'
              onChangeText={(login) => this.setState({login})}/>
        </View>
        
        <View style={styles.inputContainer}>
        <Icon name='key' style={styles.inputIcon} />
          <TextInput style={styles.inputs}
              placeholder="Parola"
              secureTextEntry={true}
              underlineColorAndroid='transparent'
              onChangeText={(password) => this.setState({password})}/>
        </View>

        <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={this.onLogin}>
          <Text style={styles.loginText}>Giriş</Text>
        </TouchableHighlight>
      
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCDCDC',
  },
  inputContainer: {
      borderBottomColor: '#F5FCFF',
      backgroundColor: '#FFFFFF',
      borderRadius:30,
      borderBottomWidth: 1,
      width:250,
      height:45,
      marginBottom:20,
      flexDirection: 'row',
      alignItems:'center'
  },
  inputs:{
      height:45,
      marginLeft:16,
      borderBottomColor: '#FFFFFF',
      flex:1,
  },
  inputIcon:{
    width:30,
    height:30,
    marginLeft:15,
    color:'#00b5ec',
    justifyContent: 'center'
  },
  buttonContainer: {
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:20,
    width:250,
    borderRadius:30,
  },
  loginButton: {
    backgroundColor: "#00b5ec",
  },
  loginText: {
    color: 'white',
  }
});
 