import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Image,
  Alert, KeyboardAvoidingView, AsyncStorage
} from 'react-native';
import { Container, Header, Grid,Row,Col, Content, Card, CardItem, Text, Body, Left, Right, Title, Thumbnail, Item, Button, Icon } from 'native-base';


export class MenuScreen extends React.Component {
  static navigationOptions = {
    title: 'Menü',
  };

  render() {
    return (
      <Container>
        <Header />
        <Content>
          <Button style={styles.button} block light>
            <Icon name='checkmark-circle' />
            <Text>Öğrenci Yoklama</Text>
          </Button>
          <Button style={styles.button} block light >
            <Icon name='restaurant' />
            <Text>Beslenme Bilgisi</Text>
          </Button>
          <Button style={styles.button} block light>
            <Icon name='bed' />
            <Text>Uyku Bilgisi</Text>
          </Button>
          <Button style={styles.button} block light>
            <Icon name='happy' />
            <Text>Duygu Durumu</Text>
          </Button>
          <View></View>
          <Button style={styles.button} block light>
            <Icon name='calendar' />
            <Text>Yemek Takvimi</Text>
          </Button>
          <Button style={styles.button} block light onPress={()=>{this.props.navigation.navigate('Notify');}}>
          <Icon name='megaphone' />
            <Text>Duyuru / Etkinlik / Hatırlatma</Text>
          </Button>
          <Button style={styles.button} block danger onPress={this._signOutAsync}>
            <Icon name='exit' />
            <Text>Çıkış</Text>
          </Button>
        </Content>
      </Container>
    );
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button:{
    marginTop:20
  }
});
