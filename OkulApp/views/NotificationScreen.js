import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight, Platform,
  Alert, KeyboardAvoidingView, AsyncStorage, FlatList, ActivityIndicator
} from 'react-native';
import { Container, Header, Title, Form, Text, Content, Item, Label, Picker,Textarea, Input, Icon, List, View, ListItem, Left, Thumbnail, Image, Body, Right,  Fab, Button  } from 'native-base';
import Moment from 'moment';
import { OkulApi } from '../services/OkulApiService';
import  ImageBrowser  from '../components/ImageBrowser';
import { NotifyReceiversScreen } from './NotifyReceiversScreen';
import { Asset } from 'expo';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';


export class NotificationScreen extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      messageType:'board',
      message:'',
      selectedImages:null,
      imageBrowserOpen: false,
      photos: [],
      photosTypes: [],
      assetType:'Photos',
      notifyReceiverOpen:false,
      receivers:[],
      receiverUsers:[],
      receiverNS:[],
      isSending:false,
      fileIds : [],
      thumbFileIds : [],
      status:'',
      isFilesUploading:false,
    }
  }

  static navigationOptions = {
    title: 'Duyuru / Etkinlik / Hatırlatma',
  };

  async componentDidMount() {         
    Permissions.askAsync(Permissions.CAMERA_ROLL).then(d => console.log(d));
  }

  back() {
    this.props.navigation.navigate('Menu');
  }

  

  imageBrowserCallback = async (callback) => {
    let photos = await callback;
    this.setState({
      imageBrowserOpen: false,
    });

    if(photos != null) {
      let newList = photos;
      if(photos.length > 0){
        this.setState({
          imageBrowserOpen: false,
          photos:newList,
          isFilesUploading:false,
        });
        let fileToUploads = [];
        for (const key in photos) {
          if (photos.hasOwnProperty(key)) {
            const element = photos[key];            
            const newElement = await ImageManipulator.manipulateAsync(
              element.file,
              [{ resize: {width : 1920} }],
              { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: false }
            );
            let res = await FileSystem.readAsStringAsync(newElement.uri, {encoding: FileSystem.EncodingType.Base64});                        
            const fileToUpload = {b64: res, uri:newElement.uri, mimeType: this.state.assetType == 'Photos' ? 'image/jpeg' : 'video/mp4'};
            fileToUploads.push(fileToUpload);
          }
        }
        this.setState({"fileToUploads" : fileToUploads});
      }

    }   
  }  

  selectedReceivers(state){
    this.state.receivers = [];
    this.state.receiverUsers = [];
    this.state.receiverNS = [];
    for (const key in state.teachers) {
      if (state.teachers.hasOwnProperty(key)) {
        const element = state.teachers[key];
        if(element.selected){
          this.state.receivers.push({type:'teacher', _id: element._id});
          this.state.receiverUsers.push(element.email);
          this.state.receiverNS.push(element.nameSurname);
          this.setState(this.state);
        }
      }
    }
    
    for (const key in state.stuffs) {
      if (state.teachers.hasOwnProperty(key)) {
        const element = state.stuffs[key];
        if(element.selected){
          this.state.receivers.push({type:'stuff', _id: element._id});
          this.state.receiverUsers.push(element.email);
          this.state.receiverNS.push(element.nameSurname);
          this.setState(this.state);
        }
      }
    }

    for (const key in state.classes) {
      if (state.teachers.hasOwnProperty(key)) {
        const element = state.classes[key];
        if(element.selected){
          this.state.receivers.push({type:'class', _id: element._id});
          OkulApi.getStudentParentsOfClass(element._id,(res)=>{
            res.forEach(element => {
              this.state.receiverUsers.push(element.email);
              this.state.receiverNS.push(element.nameSurname);
              this.setState(this.state);
            });
          });
        }
      }
    }

    this.setState({notifyReceiverOpen:false});
  }

  selectReceivers(){
    this.setState({notifyReceiverOpen:true});
  }

  sendNotify = async (callback) => {
    if(this.state.receivers.length == 0){
      Alert.alert('HATA', 'Alıcı seçiniz.');
      return;
    }
    if(this.state.message.length == 0){
      Alert.alert('HATA', 'Mesaj yazınız.');
      return;
    }         
     if(this.state.fileToUploads != null && this.state.fileToUploads.length > 0){
      this.setState({
        isFilesUploading:true,
         status:'Resimler karşı tarafa yükleniyor...'
      });    
        this.state.fileIds = [];
        this.state.thumbFileIds = [];
        for (const key in this.state.fileToUploads) {          
          if (this.state.fileToUploads.hasOwnProperty(key)) {
                let fileToUpload = this.state.fileToUploads[key];                
                let uploadResult = await OkulApi.uploadImageFile(fileToUpload, Platform);              
                  if (uploadResult != null && uploadResult.fileId != null) {
                    this.state.fileIds.push(uploadResult.fileId);
                    this.state.thumbFileIds.push(uploadResult.thumbFileId);
                    this.state.isFilesUploading = key < (this.state.fileToUploads.length-1);
                    this.setState(this.state);
                    await FileSystem.deleteAsync(fileToUpload.uri);
                  }                         
          }
        }  
     }
      this.setState({isSending:true, isFilesUploading:false, status: 'Gönderiliyor..'});
      OkulApi.insertNotifyMessage(this.state, (res)=>{
        this.setState({isSending:false});
        Alert.alert('Başarılı', 'Duyuru gönderildi.');
        this.props.navigation.navigate('Menu');
      },(error)=>{
        Alert.alert('Hata', 'Duyuru gönderilirken bir hata oluştu.');
      });  
  }
 
  render() {    
    if (this.state == null || this.state.isSending || this.state.isFilesUploading) {
      return (
        <View style={[styles.container, styles.horizontal]}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>{this.state.status}</Text>
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
         <Header style={{marginTop:25}}>
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
            <Text>{this.state.photos.length} adet resim seçili.   </Text>
              <Button rounded onPress={() => {this.setState({imageBrowserOpen: true, assetType:'Photos'})}}>
                  <Text>Seç</Text>
              </Button>
            </Item>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
              <Text note>Mesaj</Text>
              <Textarea rowSpan={5} bordered placeholder="mesaj.." value={this.state.message} onChangeText={(message)=>{this.setState({message:message})}} />
              <Button full style={{marginTop : 20}} onPress={()=>this.sendNotify()} disabled={this.state.isFilesUploading}>
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
