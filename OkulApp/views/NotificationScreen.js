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
import { FileSystem, Asset, Permissions } from 'expo';

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
    Moment.locale('tr');    
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
      let newList = this.state.photos;
      if(photos.length == 0){
        this.setState({
          imageBrowserOpen: false,
          photos:newList,
          isFilesUploading:false,
        });
      }else{
        this.setState({
          isFilesUploading:true,
        });
        for (const key in photos) {
          if (photos.hasOwnProperty(key)) {
            const element = photos[key];
            const newFileName = FileSystem.documentDirectory + key + '.jpg';
            let fileCopyResult = await FileSystem.copyAsync({from: element.file,to: newFileName});
            let res = await FileSystem.readAsStringAsync(newFileName, {encoding: FileSystem.EncodingTypes.Base64});
            const fileToUpload = {b64: res, mimeType: this.state.assetType == 'Photos' ? 'image/jpeg' : 'video/mp4'};
            let  uploadResult = await OkulApi.uploadImageFile(fileToUpload, Platform);
              if (uploadResult != null && uploadResult.fileId != null) {
                this.state.fileIds.push(uploadResult.fileId);
                this.state.thumbFileIds.push(uploadResult.thumbFileId);                
                newList.push(element);
                this.state.photos = newList;
                this.state.isFilesUploading = key < (photos.length-1);
                this.setState(this.state);
                await FileSystem.deleteAsync(newFileName);
              }
          }
        }
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

  sendNotify(){
    if(this.state.receivers.length == 0){
      Alert.alert('HATA', 'Alıcı seçiniz.');
      return;
    }
    if(this.state.message.length == 0){
      Alert.alert('HATA', 'Mesaj yazınız.');
      return;
    }
    this.setState({isSending:true, status: 'Gönderiliyor..'});

    OkulApi.insertNotifyMessage(this.state, (res)=>{
      this.setState({isSending:false});
      Alert.alert('Başarılı', 'Duyuru gönderildi.');
      this.props.navigation.navigate('Menu');
    },(error)=>{
      Alert.alert('Hata', 'Duyuru gönderilirken bir hata oluştu.');
    });


    for (const key in this.state.photos) {
      if (this.state.photos.hasOwnProperty(key)) {
        const element = this.state.photos[key];               
        
      }
    }
  }
 
  render() {    
    if (this.state == null || this.state.isSending) {
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
