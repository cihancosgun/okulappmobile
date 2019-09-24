import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Alert, KeyboardAvoidingView, AsyncStorage, FlatList, ActivityIndicator
} from 'react-native';
import { Container, Header, Title, Text, Content, Item, Button, Input, Icon, List, View, ListItem, Left, Thumbnail, Image, Body, Right,  Fab  } from 'native-base';
import Moment from 'moment';
import { OkulApi } from '../services/OkulApiService';


export class ContactsScreen extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      teachers:[],
      studentParents:[],
      stuffs:[],
      isFetchingA:true,
      isFetchingB:true,
      isFetchingC:true,
      search:'',
    }
  }

  back(){
    this.props.navigation.navigate('Chat');
  }

  static navigationOptions = {
    title: 'Kişiler',
  };

  async componentDidMount() { 
    Moment.locale('tr');
    this.loadList(this);
  }

  onRefresh(thiz){
    this.loadList(thiz);
  }

  loadList(thiz){
    setTimeout(()=>{
      OkulApi.getTeachers(thiz.state != null ? thiz.state.search : '', (result)=>{
        var newState= {isFetchingA:false, teachers:result};
        thiz.setState(newState);
      }, ()=>{
        var newState= {isFetchingA:false, teachers:[]};
        thiz.setState(newState);
      });
    },200);
     
    setTimeout(()=>{
    OkulApi.getStudentParents(thiz.state != null ? thiz.state.search : '', (result)=>{
      var newState= {isFetchingB:false, studentParents:result};
      thiz.setState(newState);
    }, ()=>{
      var newState= {isFetchingB:false, studentParents:[]};
      thiz.setState(newState);
    });
  },300);
      setTimeout(()=>{
      OkulApi.getStuffs(thiz.state != null ? thiz.state.search : '', (result)=>{
        var newState= {isFetchingC:false, stuffs:result};
        thiz.setState(newState);
      }, ()=>{
        var newState= {isFetchingC:false, stuffs:[]};
        thiz.setState(newState);
      });
    },400);
  }

  startNewChat(thiz, receiver){
    OkulApi.startNewChat(receiver.email, (chat)=>{
      OkulApi.currentChat = chat;
      thiz.props.navigation.navigate('ChatSub');
    });    
  }

  renderItem(data, thiz){
        let thumbUrl = data.item.image != null ? {uri :  OkulApi.apiURL+'getImage?fileId='+data.item.image.$oid } : require('../assets/images/user-profile.png');
        return (
        <ListItem avatar onPress={()=>{thiz.startNewChat(thiz, data.item);}}>
          <Left>
            <Thumbnail source={ thumbUrl } />
          </Left>
          <Body>
            <Text>{data.item.nameSurname}</Text>
          </Body>
        </ListItem>
    );  
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
                <Title>Kişiler</Title>
              </Body>
              <Right />
            </Header>
        <Content>
          <Item>
            <Input placeholder='Kişi ara..'  onChangeText={(search) => this.setState({search})}/>
            <Icon active name='search' onPress={()=>this.loadList(this)} />
          </Item>
          <List>
            <ListItem itemDivider>
              <Text>Öğretmenler</Text>
            </ListItem>
            <FlatList
                data={this.state.teachers}
                renderItem={(item)=> this.renderItem(item, this)}
                keyExtractor={(item) => item._id.$oid}
                onRefresh={()=>this.onRefresh(this)}
                refreshing={this.state.isFetchingA}
              />
            <ListItem itemDivider>
              <Text>Veliler</Text>
            </ListItem>
            <FlatList
                data={this.state.studentParents}
                renderItem={(item)=> this.renderItem(item, this)}
                keyExtractor={(item) => item._id.$oid}
                onRefresh={()=>this.onRefresh(this)}
                refreshing={this.state.isFetchingB}
              />
              <ListItem itemDivider>
              <Text>Yöneticiler</Text>
            </ListItem>
            <FlatList
                data={this.state.stuffs}
                renderItem={(item)=> this.renderItem(item, this)}
                keyExtractor={(item) => item._id.$oid}
                onRefresh={()=>this.onRefresh(this)}
                refreshing={this.state.isFetchingC}
              />
          </List>
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
