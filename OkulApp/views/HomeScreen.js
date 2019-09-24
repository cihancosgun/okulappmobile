import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,Image,
  Alert, KeyboardAvoidingView, AsyncStorage, FlatList, ActivityIndicator, ScrollView
} from 'react-native';
import { AppLoading } from 'expo';
import { Container, Header,Grid,Row,Col, Content, Card, CardItem, Text, Body, Left, Right, Title, Thumbnail, Item } from 'native-base';
import { OkulApi } from '../services/OkulApiService';
import Moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';

export class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    state = {
      data:null,
      isReady : false,
      isFetching:true,
      messageTypeImages:{
        'board':require('../assets/images/board.png'),
        'angry':require('../assets/images/angry.png'),
        'cry':require('../assets/images/cry.png'),
        'event':require('../assets/images/event.png'),
        'happy':require('../assets/images/happy.png'),
        'imageholder':require('../assets/images/imageholder.png'),
        'inspection':require('../assets/images/inspection.png'),
        'lunch':require('../assets/images/lunch.png'),
        'pill':require('../assets/images/pill.png'),
        'remind':require('../assets/images/remind.png'),
        'sad':require('../assets/images/sad.png'),
        'sleep':require('../assets/images/sleep.png'),
        'user-profile':require('../assets/images/user-profile.png')
      }
    }
  }

  static navigationOptions = {
    title: 'Ana Sayfa',
    drawerLabel: 'Ana Sayfa',    
  };
  
  onRefresh(){
    this.loadList();
  }

  selectMyIcon(icon){
    if(this.state != null && this.state.messageTypeImages != null && icon != null){
      if(this.state.messageTypeImages[icon] != null){
        return this.state.messageTypeImages[icon];
      }else{
        return this.state.messageTypeImages.board;
      }
    }    
  }


  loadList(){
    Moment.locale('tr');
    OkulApi.getBoardOfUser((result)=>{
      var newState= {isFetching:false, isReady:true, data:result};
      this.setState(newState);
    }, ()=>{
      var newState= {isFetching:false, isReady:true, data:[]};
      this.setState(newState);
    });
  }

  showGallery(data, thiz, idx){
    if(data.fileIds.length > 0){
      let galleryImages = [];
      for(let file in data.fileIds){
        galleryImages.push({source : { uri: OkulApi.apiURL+'getImage?fileId='+data.fileIds[file].$oid }});
      }
      OkulApi.imageGallery = galleryImages;
      OkulApi.imageGalleryIndex = idx;
      thiz.props.navigation.navigate('Gallery');
    }  
  }

  renderTopFourImages(data, thiz){
    let rval = [];
    for(let i=0;i < 4; i++){
      if(data.fileIds.length > i){
        let imageUrl = OkulApi.apiURL+'getImage?fileId='+data.fileIds[i].$oid;
        rval.push(imageUrl);        
      }
    }
    const imageComponents = rval.map((imageUrl, idx)=> <TouchableHighlight key={Math.random()} onPress={() => thiz.showGallery(data, thiz, idx)}><Image key={'image'+idx} style={styles.image} source={{uri:imageUrl}}/></TouchableHighlight>)
    return (imageComponents);
  }
  renderImages(data, thiz){    
    if(data.fileIds.length > 0){      
      return (
      <View style={{flex:1, flexDirection:'row', flexWrap:'wrap'}}>
                  {thiz.renderTopFourImages(data, thiz)}
                  <Text note onPress={()=>thiz.showGallery(data, thiz,0)}> {data.fileIds.length} resim... </Text>
      </View>
      );
    }
  }

  async componentDidMount() { 
    this.loadList();
  }

  renderItem(data, selectMyIcon, showGallery, thiz){
        return (
          <Card>
          <CardItem header>
            <Left>
              <Thumbnail style={styles.thumbImage} source={selectMyIcon(data.item.messageType)} />
              <Body>
                <Text>{data.item.senderNameSurname}</Text>
                <Text note>{Moment(new Date(data.item.startDate.$date)).format('DD.MM.YYYY HH:mm:ss')} tarihinde yeni bir gönderi paylaştı.</Text>                
              </Body>
            </Left>
          </CardItem> 
          <CardItem cardBody>
            <Body>
              {thiz.renderImages(data.item, thiz)}
              <Text>
                {data.item.message}
              </Text>
            </Body>
          </CardItem>
          <CardItem footer>            
          </CardItem>
      </Card>
    );  
  }

  
  render() {
    if (this.state == null) {
      return <ActivityIndicator />;
    }
      return (
        <Container>
        <Header>
            <Left/>
            <Body>
              <Title>Ana Sayfa</Title>
            </Body>
            <Right />
          </Header>
            <FlatList
              data={this.state.data}
              renderItem={(item)=> this.renderItem(item, this.selectMyIcon, this.showGallery, this)}
              keyExtractor={(item) => item._id.$oid}
              onRefresh={()=>this.onRefresh()}
              refreshing={this.state.isFetching}
            />
        <Content>                
        </Content>
      </Container>
      );
  }

  _showMoreApp = () => {
    this.props.navigation.navigate('Other');
  };

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
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
  thumbImage:{
    width:32, height:32
  },
  image:{
    flex:1,
    width:170,
    height:170,
  }
});
