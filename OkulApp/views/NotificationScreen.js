import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Alert, KeyboardAvoidingView, AsyncStorage, FlatList, ActivityIndicator
} from 'react-native';
import { Container, Header, Title, Form, Text, Content, Item, Label, Picker,Textarea, Input, Icon, List, View, ListItem, Left, Thumbnail, Image, Body, Right,  Fab, Button  } from 'native-base';
import Moment from 'moment';
import { OkulApi } from '../services/OkulApiService';
 

export class NotificationScreen extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      messageType:'board',
      message:'',
      selectedImageCount:0,
      selectedReceiverCount:0,
      selectedImages:null,
    }
  }

  static navigationOptions = {
    title: 'Duyuru / Etkinlik / Hatırlatma',
  };

  async componentDidMount() { 
    Moment.locale('tr');
  }

  back() {
    this.props.navigation.navigate('Menu');
  }
 
  selectImages(){
    
  }

 
  render() {
    if (this.state == null) {
      return <ActivityIndicator />;
    }
   return (
      <Container> 
         <Header>
              <Left>
                <Button transparent onPress={()=>this.back()}>
                  <Icon name='arrow-round-back' />
                </Button>                
              </Left>
              <Body>
                <Title>Duyuru</Title>
              </Body>
              <Right />
         </Header>
        <Content>
          <Form>
            <Text note>Duyuru Tipi</Text>
            <Item picker>            
              <Picker
                mode="dropdown"
                iosIcon={<Icon name="arrow-down" />}
                style={{ width: undefined }}
                placeholder="Duyuru tipi seçiniz.."
                placeholderStyle={{ color: "#bfc6ea" }}
                placeholderIconColor="#007aff"
                selectedValue={this.state.messageType}
                onValueChange={(messageType)=>{this.setState({messageType:messageType})}}
              >
                <Picker.Item label="Duyuru" value="board" />
                <Picker.Item label="Etkinlik" value="event" />
                <Picker.Item label="Hatırlatma" value="remind" />
              </Picker>
            </Item>    
            
            <Text note>Gönderilecek Kişi / Sınıf</Text>
            <Item>
              <Text>{this.state.selectedReceiverCount} adet kişi/sınıf seçili.      </Text>
              <Button rounded>
                  <Icon name='open' />
              </Button>
            </Item>

            <Text note>Galeri</Text>
            <Item>
            <Text>{this.state.selectedImageCount} adet resim seçili.   </Text>
              <Button rounded onPress={()=>{this.selectImages()}}>
                  <Icon name='open' />
              </Button>
            </Item>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
              <Text note>Mesaj</Text>
              <Textarea rowSpan={5} bordered placeholder="mesaj.." value={this.state.message} onChangeText={(message)=>{this.setState({message:message})}} />
              <Button full style={{marginTop : 20}}>
                <Text>Duyuru Gönder</Text>
              </Button>
            </KeyboardAvoidingView>
          </Form>
        </Content>
      </Container>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
