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
import Gallery from 'react-native-image-gallery';
import { OkulApi } from '../services/OkulApiService';

export class GalleryScreen extends React.Component {
  constructor(props) {
    super(props);
    state = { position:0 }
  }

  static navigationOptions = {
    title: 'Gallery',
  };

  async componentDidMount() {
     
  }
   

  render() {
    return (
      <View style={{ flex: 1}}>
         <Gallery key="myGallery" initialPage={OkulApi.imageGalleryIndex}
            style={{ flex: 1, backgroundColor: 'black' }}
              images={OkulApi.imageGallery}
              onPageScroll={(event)=>{ if(event != null) { this.setState({position: event.position}); }}}
          />
        <Text>{ this.state != null && this.state.position != null ? this.state.position+1 : ''} / {OkulApi.imageGallery.length}</Text>
        <Button
          onPress={() => this.props.navigation.navigate('App')}
          title="Geri"
        />
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
});
