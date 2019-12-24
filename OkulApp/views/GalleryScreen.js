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
import SmartGallery from "react-native-smart-gallery";
import { OkulApi } from '../services/OkulApiService';
import { Toast} from 'native-base';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';

export class GalleryScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { position:0 }
  }

  static navigationOptions = {
    title: 'Gallery',
  };

  async componentDidMount() {
     
  }

  async getCameraRollPermissions() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === 'granted') {
    } else {
      /// Handle permissions denied;
      console.log('Uh oh! The user has not granted us permission.');
    }
  }

  downloadImage(position,thiz){
    this.getCameraRollPermissions().then(()=>{    
      let uri = OkulApi.imageGallery[position].source.uri;
      let indexOfFileId = uri.indexOf("fileId");
      let fileId = uri.substr(indexOfFileId+7, 64).trim();
      let fileName = FileSystem.documentDirectory+ fileId+".jpg";
      FileSystem.downloadAsync(
        uri,
        fileName
      ).then(({ uri }) => {
          MediaLibrary.createAssetAsync(uri).then((asset)=>{
            MediaLibrary.createAlbumAsync('Bilgiyuvam', asset).then(()=>{
              Alert.alert('İndirme', 'Dosya indirildi ' + fileId+'.jpg');
              FileSystem.deleteAsync(uri);
            });
          });          
        })
        .catch(error => {
          console.error(error);
        });
    });
  }
   

  render() {
    return (
      <View style={{ flex: 1, backgroundColor:'white'}}>
         <SmartGallery ref={component => this._myGallery = component} key="myGallery" index={OkulApi.imageGalleryIndex}
            style={{ flex: 1, backgroundColor: 'black' }}
              images={OkulApi.imageGallery}
              onPageScroll={(event)=>{ if(event != null) { this.setState({position: event.position}); }}}
               // Change this to render how many items before and after it.
              loadMinimal={true}
              loadMinimalSize={2}
              // Turning this off will make it feel faster
              // and prevent the scroller to slow down
              // on fast swipes.
              sensitiveScroll={false}
          />
        <Text>{ this.state != null && this.state.position != null ? this.state.position+1 : ''} / {OkulApi.imageGallery.length}</Text>
        <View style={styles.fixToText}>
              <Button
              onPress={()=>this.downloadImage(this.state.position,this)}
              title="İNDİR"
              />
              <Button
              onPress={this.props.backCallBack}
              title="GERİ"
            />
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
