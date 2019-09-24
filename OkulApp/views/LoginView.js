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
import { Svg } from 'expo';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import  { faAt, faKey, faSchool } from '@fortawesome/free-solid-svg-icons';
import { OkulApi } from '../services/OkulApiService';



export class LoginView extends React.Component {

  constructor(props) {
    super(props);
    state = {
      login   : '',
      password: ''
    }
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
        this.props.navigation.navigate('App');
        },()=>{
          Alert.alert("Başarısız", "Kullanıcı adı veya parola hatalı");
      });
      
  }
 

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      <FontAwesomeIcon icon={ faSchool } style={{marginBottom:30}} size={64}/>
      <Text>Okul APP</Text>      
      <Text style={{marginBottom: 30}}>kullanıcı girişi</Text>
        <View style={styles.inputContainer}>        
        <FontAwesomeIcon icon={ faAt } style={styles.inputIcon}/>
          <TextInput style={styles.inputs}
              placeholder="Eposta"
              keyboardType="email-address"
              underlineColorAndroid='transparent'
              onChangeText={(login) => this.setState({login})}/>
        </View>
        
        <View style={styles.inputContainer}>
        <FontAwesomeIcon icon={ faKey } style={styles.inputIcon}/>
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
 