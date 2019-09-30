import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Alert, KeyboardAvoidingView, AsyncStorage, FlatList, ActivityIndicator
} from 'react-native';
import { Container, Header, Text, Content, Item, Input, Icon, List, View, ListItem, Left, Thumbnail, Image, Body, Right,  Fab, Button  } from 'native-base';
import Moment from 'moment';
import { OkulApi } from '../services/OkulApiService';


export class ChatScreen extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      data:[],
      isReady : false,
      isFetching:true,
      search:'',
    }
  }

  static navigationOptions = {
    title: 'Mesajlaşma',
  };

  async componentDidMount() { 
    
    this.loadList(this);
  }

  onRefresh(thiz){
    this.loadList(thiz);
  }

  loadList(thiz){
    OkulApi.getConversations(thiz.state != null ? thiz.state.search : '', (result)=>{
      var newState= {isFetching:false, isReady:true, data:result};
      thiz.setState(newState);
    }, ()=>{
      var newState= {isFetching:false, isReady:true, data:[]};
      thiz.setState(newState);
    });
  }

  showChat(thiz, chat){
    OkulApi.currentChat = chat;
    thiz.props.navigation.navigate('ChatSub');
  }

  renderItem(data, thiz){
    let thumbUrl = data.item.convReceiverImage != null ? {uri :  OkulApi.apiURL+'getImage?fileId='+data.item.convReceiverImage.$oid } : require('../assets/images/user-profile.png');
    let lastMessage = data.item.messages != null && Object.keys(data.item.messages).length > 0 ? data.item.messages[Object.keys(data.item.messages).length-1].message:'';
    if(lastMessage.length > 20){
      lastMessage = lastMessage.substring(0,20);
    }
        return (
        <ListItem avatar onPress={()=>thiz.showChat(thiz, data.item)}>
          <Left>
            <Thumbnail source={ thumbUrl } />
          </Left>
          <Body>
            <Text>{data.item.convReceiverNS}</Text>
            <Text note>{lastMessage} ..</Text>
          </Body>
          <Right>
            <Text note>{Moment(new Date(data.item.startDate.$date)).format('DD.MM.YYYY HH:mm:ss')}</Text>
          </Right>
        </ListItem>
    );  
  }

  render() {
    if (this.state == null) {
      return <ActivityIndicator />;
    }
    return (
      <Container>
        <Header />
        <Content>
          <Item>
            <Input placeholder='Konuşma ara..'  onChangeText={(search) => this.setState({search})}/>
            <Icon active name='search' onPress={()=>this.loadList(this)} />
          </Item>
          <List>
            <FlatList
                data={this.state.data}
                renderItem={(item)=> this.renderItem(item, this)}
                keyExtractor={(item) => item._id.$oid}
                onRefresh={()=>this.onRefresh(this)}
                refreshing={this.state.isFetching}
              />
          </List>         
        </Content>
          <Fab            
            style={{ backgroundColor: 'green' }}
            position="bottomRight" 
            onPress={()=>{this.props.navigation.navigate('Contacts');}}>
            <Icon name="add" />
          </Fab>
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
