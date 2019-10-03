import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,Image,Dimensions,
  Alert, KeyboardAvoidingView, AsyncStorage, FlatList, ActivityIndicator, ScrollView
} from 'react-native';
import { AppLoading } from 'expo';
import { Container, Header,Grid,Row,Col,Button, Content, Card, CardItem, Text, Body, Left, Right, Title, Thumbnail, Item } from 'native-base';
import { OkulApi } from '../services/OkulApiService';
import Moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GalleryScreen } from './GalleryScreen';
const { width } = Dimensions.get('window');

export class HomeScreen extends React.Component {
  constructor(props) {    
    super(props);
    this.state = {
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
      },
      data:null,
      isReady : false,
      isFetching:true,
      showGalleryScreen:false,
      showImageList:false,
      scrollState:10      
    }
  }

  static navigationOptions = {
    title: 'Ana Sayfa',
    drawerLabel: 'Ana Sayfa',
    headerMode:'none'
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
    OkulApi.getBoardOfUser((result)=>{      
      result.forEach(element => {
        element.iconImage = this.selectMyIcon(element.messageType);        
      });
      var newState= {isFetching:false, isReady:true, data:result};
      this.setState(newState);
    }, ()=>{
      var newState= {isFetching:false, isReady:true, data:[]};
      this.setState(newState);
    });

    setTimeout(() => {
      OkulApi.setReadedAllBoard();
    }, 1000);
  }

  showGallery(data, thiz, idx, type){
    if(data.fileIds.length > 0){
      let galleryImages = [];
      for(let file in data.fileIds){
        galleryImages.push({source : { uri: OkulApi.apiURL+'getImage?fileId='+data.fileIds[file].$oid }});
      }
      OkulApi.imageGallery = galleryImages;
      OkulApi.imageGalleryIndex = idx;
      //thiz.props.navigation.navigate('Gallery');
      if(type == 'gallery'){
        thiz.setState({showGalleryScreen:true});
      }else{
        thiz.setState({showImageList : true});
      }
    }  
  }

  showPrepearedGallery(thiz, idx){
    OkulApi.imageGalleryIndex = idx;
    thiz.setState({showGalleryScreen:true});
  }

  hideGallery(){
    this.setState({showGalleryScreen:false, showImageList:false});
    setTimeout(() => {      
      this.myFlatList.scrollToOffset({ offset: this.state.scrollState, animated: false });
    }, 10);
  }

  renderTopFourImages(data, thiz){
    let rval = [];
    for(let i=0;i < 4; i++){
      if(data.fileIds.length > i){
        let imageUrl = OkulApi.apiURL+'getImage?fileId='+data.fileIds[i].$oid;
        rval.push(imageUrl);        
      }
    }
    const imageComponents = rval.map((imageUrl, idx)=> <TouchableHighlight key={Math.random()} onPress={() => thiz.showGallery(data, thiz, idx, 'list')}><Image key={'image'+idx} style={styles.image} source={{uri:imageUrl}}/></TouchableHighlight>)
    return (imageComponents);
  }

  renderImages(data, thiz){    
    if(data.fileIds.length > 0){      
      return (
      <View style={{flex:1, flexDirection:'row', flexWrap:'wrap'}}>
                  {thiz.renderTopFourImages(data, thiz)}
                  <Text note onPress={()=>thiz.showGallery(data, thiz,0, 'list')}> {data.fileIds.length} resim... </Text>
      </View>
      );
    }
  }

  handleScroll(event){
    this.setState({scrollState:event.nativeEvent.contentOffset.y});
  }

  handleGalleryBack(){    
    this.setState({showGalleryScreen:false, showImageList:true});
  }

  async componentDidMount() {         
    this.myFlatList = React.createRef();
    setTimeout(() => {
      this.loadList();
    }, 500);    
  }

  renderItem(data, selectMyIcon, showGallery, thiz){
        return (
          <Card>
          <CardItem header>
            <Left>
              <Thumbnail style={styles.thumbImage} source={data.item.iconImage}/>
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
 
  renderImageItem(data,thiz){
    return (<View><TouchableHighlight onPress={() => thiz.showPrepearedGallery(thiz, data.index)}><Image source={data.item.source} style={{width:width/2,height:150}} /></TouchableHighlight></View>);
  }
  
  render() {    
    if (this.state == null) {
      return <ActivityIndicator />;
    }
    if(this.state.showGalleryScreen){
      return(<GalleryScreen backCallBack={()=>{this.handleGalleryBack()}} />);
    }
    if(this.state.showImageList){
      return(
        <View style={{flex:1, backgroundColor:'white', marginTop:30}}>
          <FlatList 
            data={OkulApi.imageGallery} 
            renderItem={(item)=>this.renderImageItem(item , this)} 
            keyExtractor={(_,idx)=>idx} numColumns={2} />
          <Button
            onPress={()=>this.hideGallery()} block
          >
          <Text>Geri</Text>
          </Button>
        </View>
      );
    }
      return (
        <Container>
          <Header>
            <Title>Ana Sayfa</Title>
          </Header>
            <FlatList ref={(fl)=>this.myFlatList=fl}
              data={this.state.data}
              renderItem={(item)=> this.renderItem(item, this.selectMyIcon, this.showGallery, this)}
              keyExtractor={(item) => item._id.$oid}
              onRefresh={()=>this.onRefresh()}
              onScroll={(event)=>this.handleScroll(event)}
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
    width:(width/2)-10,
    height:170,
  }
});
