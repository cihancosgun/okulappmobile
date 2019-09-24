import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Alert, KeyboardAvoidingView, AsyncStorage, FlatList, ActivityIndicator
} from 'react-native';
import { Container, Header, Title, Form, Text, Content, Item, Label, Picker,Textarea, Input, Icon, List, View, ListItem, Left, Thumbnail, Image, Body, Right,  Fab, Button  } from 'native-base';
import Moment from 'moment';
import { OkulApi } from '../services/OkulApiService';
import  ImageBrowser  from '../components/ImageBrowser';
import { NotifyReceiversScreen } from './NotifyReceiversScreen';

export class NotificationScreen extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      messageType:'board',
      message:'',
      selectedImages:null,
      imageBrowserOpen: false,
      photos: [],      
      assetType:'Photos',
      notifyReceiverOpen:false,
      receivers:[],
      isSending:false,
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

  imageBrowserCallback = (callback) => {
    callback.then((photos) => {    
      let newList = this.state.photos;
      newList = newList.concat(photos);
      this.setState({
        imageBrowserOpen: false,
        photos:newList,
      });
    }).catch((e) => console.log(e))
  }  

  selectedReceivers(state){
    this.state.receivers = [];
    for (const key in state.teachers) {
      if (state.teachers.hasOwnProperty(key)) {
        const element = state.teachers[key];
        if(element.selected){
          this.state.receivers.push({type:'teacher', _id: element._id});
        }
      }
    }
    
    for (const key in state.stuffs) {
      if (state.teachers.hasOwnProperty(key)) {
        const element = state.stuffs[key];
        if(element.selected){
          this.state.receivers.push({type:'stuff', _id: element._id});
        }
      }
    }

    for (const key in state.classes) {
      if (state.teachers.hasOwnProperty(key)) {
        const element = state.classes[key];
        if(element.selected){
          this.state.receivers.push({type:'class', _id: element._id});
        }
      }
    }

    this.setState({notifyReceiverOpen:false, receivers: this.state.receivers});
  }

  selectReceivers(){
    this.setState({notifyReceiverOpen:true});
  }

  sendNotify(){
    if(this.state.receivers.length == 0){
      Alert.alert('HATA', 'Alıcı seçiniz.');
      return;
    }
    if(this.state.message.length == 0){
      Alert.alert('HATA', 'Mesaj yazınız.');
      return;
    }    
    this.setState({isSending:true});
    setTimeout(()=>{
      this.setState({isSending:false});
    },5000);
  }
 
  render() {    
    if (this.state == null || this.state.isSending) {
      return (
        <View style={[styles.container, styles.horizontal]}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Duyuru Gönderiliyor..</Text>
        </View>);
    }
    if(this.state.notifyReceiverOpen){
      return (<NotifyReceiversScreen callback={(state)=>this.selectedReceivers(state)} backCallBack={()=>this.setState({notifyReceiverOpen:false})} />);
    }
    if(this.state.imageBrowserOpen){
      return(<ImageBrowser max={50} assetType={this.state.assetType} callback={this.imageBrowserCallback}/>);
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
              <Text>{this.state.receivers.length} adet kişi/sınıf seçili.      </Text>
              <Button rounded onPress={()=>{ this.selectReceivers()}}>
              <Text>Seç</Text>
              </Button>
            </Item>

            <Text note>Galeri</Text>
            <Item>
            <Text>{this.state.photos.length} adet resim/video seçili.   </Text>
              <Button rounded onPress={() => {this.setState({imageBrowserOpen: true, assetType:'Photos'})}}>
                  <Text>Resim</Text>
              </Button>
              <Button rounded onPress={() => {this.setState({imageBrowserOpen: true, assetType:'Videos'})}}>
                  <Text>Video</Text>
              </Button>
            </Item>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
              <Text note>Mesaj</Text>
              <Textarea rowSpan={5} bordered placeholder="mesaj.." value={this.state.message} onChangeText={(message)=>{this.setState({message:message})}} />
              <Button full style={{marginTop : 20}} onPress={()=>this.sendNotify()}>
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
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  }
});
