import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Alert, KeyboardAvoidingView, AsyncStorage, FlatList, ActivityIndicator
} from 'react-native';
import { Container, Header, Title, Text, Content, Item, Button, Input, Icon, List, View, ListItem, Left, Thumbnail, Image, Body, Right,  Fab, CheckBox  } from 'native-base';
import Moment from 'moment';
import { OkulApi } from '../services/OkulApiService';


export class NotifyReceiversScreen extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      teachers:[],
      classes:[],
      stuffs:[],
      isFetchingA:true,
      isFetchingB:true,
      isFetchingC:true,
      search:'',
    }
  }

  back(){
    //this.props.navigation.navigate('Notify');
  }

  static navigationOptions = {
    title: 'Kişiler / Sınıflar',
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
     },10);
     
     setTimeout(()=>{
    OkulApi.getClasses(thiz.state != null ? thiz.state.search : '', (result)=>{
      var newState= {isFetchingB:false, classes:result};
      thiz.setState(newState);
    }, ()=>{
      var newState= {isFetchingB:false, classes:[]};
      thiz.setState(newState);
    });
   },10);

       setTimeout(()=>{
      OkulApi.getStuffs(thiz.state != null ? thiz.state.search : '', (result)=>{
        var newState= {isFetchingC:false, stuffs:result};
        thiz.setState(newState);
      }, ()=>{
        var newState= {isFetchingC:false, stuffs:[]};
        thiz.setState(newState);
      });
     },10);
  }
 
  selectItem(data,index,role,thiz){
    if(role == 'teacher'){
      thiz.state.teachers[index].selected = thiz.state.teachers[index].selected != null ? !thiz.state.teachers[index].selected : true;
    } else if(role == 'class'){
      thiz.state.classes[index].selected = thiz.state.classes[index].selected != null ? !thiz.state.classes[index].selected : true;
    } else if(role == 'stuff'){
      thiz.state.stuffs[index].selected = thiz.state.stuffs[index].selected != null ? !thiz.state.stuffs[index].selected : true;
    }
    thiz.setState(thiz.state);
  }

  renderItem(data, idx, role, thiz){
        return (
        <ListItem avatar onPress={() => { thiz.selectItem(data, data.index, role, thiz) }}>
          <Left>
            <CheckBox checked={data.item.selected} />
          </Left>
          <Body>
            <Text>{data.item.name != null ? data.item.name :  data.item.nameSurname}</Text>
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
                <Button transparent onPress={()=>this.props.backCallBack()}>
                  <Icon name='arrow-round-back' />
                </Button>                
              </Left>
              <Body>
                <Title>Kişiler / Sınıflar</Title>
              </Body>
              <Right>
                <Button transparent onPress={()=>this.props.callback(this.state)}>
                  <Icon name='checkmark' />
                </Button>                
              </Right>
            </Header>
        <Content>
          <Item>
            <Input placeholder='Ara..'  onChangeText={(search) => this.setState({search})}/>
            <Icon active name='search' onPress={()=>this.loadList(this)} />
          </Item>
          <List>
            <ListItem itemDivider>
              <Text>Öğretmenler</Text>
            </ListItem>
            <FlatList
                data={this.state.teachers}
                renderItem={(item, idx)=> this.renderItem(item, idx, 'teacher', this)}
                keyExtractor={(item) => item._id.$oid}
                onRefresh={()=>this.onRefresh(this)}
                refreshing={this.state.isFetchingA}
              />
            <ListItem itemDivider>
              <Text>Sınıflar</Text>
            </ListItem>
            <FlatList
                data={this.state.classes}
                renderItem={(item, idx)=> this.renderItem(item, idx, 'class', this)}
                keyExtractor={(item) => item._id.$oid}
                onRefresh={()=>this.onRefresh(this)}
                refreshing={this.state.isFetchingB}
              />
              <ListItem itemDivider>
              <Text>Yöneticiler</Text>
            </ListItem>
            <FlatList
                data={this.state.stuffs}
                renderItem={(item, idx)=> this.renderItem(item, idx,'stuff', this)}
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
