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
     },500);
     
     setTimeout(()=>{
    OkulApi.getStudentParents(thiz.state != null ? thiz.state.search : '', (result)=>{
      var newState= {isFetchingB:false, studentParents:result};
      thiz.setState(newState);
    }, ()=>{
      var newState= {isFetchingB:false, studentParents:[]};
      thiz.setState(newState);
    });
   },1000);
       setTimeout(()=>{
      OkulApi.getStuffs(thiz.state != null ? thiz.state.search : '', (result)=>{
        var newState= {isFetchingC:false, stuffs:result};
        thiz.setState(newState);
      }, ()=>{
        var newState= {isFetchingC:false, stuffs:[]};
        thiz.setState(newState);
      });
     },1500);
  }

  startNewChat(thiz, receiver){
    OkulApi.startNewChat(receiver.email, (chat)=>{
      OkulApi.currentChat = chat;
      thiz.props.navigation.navigate('ChatSub');
    });    
  }

  renderItem(data, thiz){
        let thumbUrl = data.item.image != null && data.item.image  ? {uri :  OkulApi.apiURL+'getImage?fileId='+data.item.image.$oid } : require('../assets/images/user-profile.png');
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
  renderTeacherHeader(){
    if(this.state.teachers != null && this.state.teachers.length > 0){
      return (<ListItem itemDivider>
                <Text>Öğretmenler</Text>
            </ListItem>);
    }
  }
  renderTeachers(){
    if(this.state.teachers != null && this.state.teachers.length > 0){
      return (            
              <FlatList
                  data={this.state.teachers}
                  renderItem={(item)=> this.renderItem(item, this)}
                  keyExtractor={(item) => item._id.$oid}
                  onRefresh={()=>this.onRefresh(this)}
                  refreshing={this.state.isFetchingA}
                />
              );
      }
  }

  renderStudentParentsHeaders(){
    if(this.state.studentParents != null && this.state.studentParents.length > 0){
      return (<ListItem itemDivider>
                <Text>Veliler</Text>
              </ListItem>);
    }
  }
  renderStudentParents(){
    if(this.state.studentParents != null && this.state.studentParents.length > 0){
      return (            
              <FlatList
                  data={this.state.studentParents}
                  renderItem={(item)=> this.renderItem(item, this)}
                  keyExtractor={(item) => item._id.$oid}
                  onRefresh={()=>this.onRefresh(this)}
                  refreshing={this.state.isFetchingB}
                />
              );
      }
  }

  renderAdminsHeaders(list){
    if(list != null && list.length > 0){
      return (<ListItem itemDivider>
                <Text>Yöneticiler</Text>
              </ListItem>);
    }
  }
  renderAdmins(list){
    if(list != null && list.length > 0){
      return (            
                <FlatList
                data={list}
                renderItem={(item)=> this.renderItem(item, this)}
                keyExtractor={(item) => item._id.$oid}
                onRefresh={()=>this.onRefresh(this)}
                refreshing={this.state.isFetchingC}
                />
              );
      }
  }

  render() {
    if (this.state == null) {
      return <ActivityIndicator />;
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
            {this.renderTeacherHeader()}
            {this.renderTeachers()}
            {this.renderStudentParentsHeaders()}
            {this.renderStudentParents()}
            {this.renderAdminsHeaders(this.state.stuffs)}
            {this.renderAdmins(this.state.stuffs)}
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
