import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Alert, KeyboardAvoidingView, Dimensions, AsyncStorage, FlatList, ActivityIndicator, View, ScrollView
} from 'react-native';
import { Container, Header, Text, Content, Item, Input, Icon, List, ListItem, Button, Left, Thumbnail, Image, Body, Right, Title } from 'native-base';
import Moment from 'moment';
import { OkulApi } from '../services/OkulApiService';


export class ChatSubScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = { message: '', currentChat: OkulApi.currentChat };
  }

  async componentDidMount() {
    Moment.locale('tr');
    OkulApi.myChatView = this;
  }

  myScrollToEnd() {
    if (this.refs.myScroll != null) {
      this.refs.myScroll.scrollToEnd();
    }
  }

  static navigationOptions = {
    title: 'Mesajlaşma',
  };

  back() {
    OkulApi.currentChat = null;
    OkulApi.myChatView = null;
    this.props.navigation.navigate('Chat');
  }

  sendMessage() {
    let theMessage = this.state.message;
    setTimeout(() => {
      OkulApi.addMessageToChat(OkulApi.currentChat._id, theMessage, () => {
        var msg = {
          "userid": OkulApi.userName,
          "message": "updatechat",
          "receivers": OkulApi.currentChat.users
        };
        OkulApi.wsSend(msg);
      });
    }, 100);

    setTimeout(() => {
      this.setState({ message: '' });
      OkulApi.currentChat.messages.push(
        {
          "readed": false,
          "receiverNameSurname": OkulApi.currentChat.convReceiverNS,
          "senderEmail": OkulApi.userName,
          "message": theMessage,
          "sendingTime": { "$date": new Date() },
          "sentStatus": 0,
          "senderNameSurname": OkulApi.currentChat.senderNameSurname,
          "receiverEmail": OkulApi.convReceiverEmail
        }
      );
      this.setState({ currentChat: OkulApi.currentChat });
      this.myScrollToEnd();
    }, 100);

  }

  renderMessages(data) {
    const imageComponents = data.messages.map((message, idx) =>
      <View key={Math.random()} style={message.senderEmail == OkulApi.userName ? styles.messageSend : styles.messageReceive}>
        <Text>{message.message}</Text>
        <Text note>{Moment(new Date(message.sendingTime.$date)).format('DD.MM.YYYY HH:mm:ss')}</Text>
      </View>);
    setTimeout(() => {
      this.myScrollToEnd();
    }, 2000);
    return (imageComponents);
  }

  render() {
    let thumbUrl = OkulApi.currentChat.convReceiverImage != null ? {uri :  OkulApi.apiURL+'getImage?fileId='+ OkulApi.currentChat.convReceiverImage.$oid } : require('../assets/images/user-profile.png');
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={() => this.back()}>
              <Icon name='arrow-round-back' />
            </Button>
          </Left>
          <Left>
            <Thumbnail source={thumbUrl} style={{ width: 32, height: 32 }} />
          </Left>
          <Body>
            <Title>{OkulApi.currentChat.convReceiverNS}</Title>
          </Body>
          <Right />
        </Header>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
          <Content>
            <ScrollView key='myScroll' style={styles.scrollView} ref='myScroll'>
              {this.renderMessages(this.state.currentChat)}
            </ScrollView>
            <Item style={styles.message}>
              <Input placeholder='Mesaj..' value={this.state.message} onChangeText={(message) => { this.setState({ message: message }); }} />
              <Icon active name='send' onPress={() => { this.sendMessage() }} />
            </Item>
          </Content>
        </KeyboardAvoidingView>
      </Container>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView:{
    flex:1,
    height: Dimensions.get('window').height-110,
    backgroundColor:'#ebebe0',
  },
  messageReceive:{
    alignSelf:'flex-start',
    marginTop:10,
    backgroundColor: 'white',
    borderRadius:25,
    padding:10,
  },
  messageSend:{
    alignSelf:'flex-end',
    marginTop:10,
    backgroundColor: '#dcf8c6',
    borderRadius:25,
    padding:10,
  },
  message:{    
  }
});
