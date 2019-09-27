import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Alert, KeyboardAvoidingView, AsyncStorage, FlatList, ActivityIndicator
} from 'react-native';
import { Container, Card, CardItem, Picker, Header, Form, Title, Text, Content, Item, Button, Input, Icon, List, View, ListItem, Left, Thumbnail, Image, Body, Right,  Fab  } from 'native-base';
import Moment from 'moment';
import { OkulApi } from '../services/OkulApiService';


export class MonthlyMealScheduleScreen extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
       months:['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
       selectedMonth: 'Eylül',     
       isFetching:false,
       data:[],
    }
  }

  back(){
    this.props.navigation.navigate('Menu');
  }

  static navigationOptions = {
    title: 'Aylık Yemek Takvimi',
  };

  async componentDidMount() { 
    Moment.locale('tr');
    this.selectMonth(this.state.months[new Date().getMonth()]);   
  }

  selectMonth(month){
    this.setState({selectedMonth : month});
    setTimeout(() => {
      this.loadList(this);
    }, 10);
  }
 
  loadList(thiz){
    this.setState({data:{}});
    OkulApi.getFoodCalendar(this.state.selectedMonth, (result)=>{
      this.setState({data:result});      
    });
  }


  renderItem(data, thiz){
    return (
      <Card>
            <CardItem header>
              <Text style={{fontWeight:'bold', color:'red', textAlign:'center'}}>{data.item.dateStr}</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text style={{fontWeight:'bold', textAlign:'center'}}>Sabah</Text>
                <Text>{data.item.sabah}</Text>
                <Text style={{fontWeight:'bold', textAlign:'center'}}>Öğle</Text>
                <Text>{data.item.ogle}</Text>
                <Text style={{fontWeight:'bold', textAlign:'center'}}>İkindi</Text>
                <Text>{data.item.ikindi}</Text>
                <Text style={{fontWeight:'bold', textAlign:'center'}}>Akşam</Text>
                <Text>{data.item.aksam}</Text>
              </Body>              
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
              <Left>
                <Button transparent onPress={()=>this.back()}>
                  <Icon name='arrow-round-back' />
                </Button>                
              </Left>
              <Body>
                <Title>Aylık Yemek Takvimi</Title>
              </Body>
              <Right />
            </Header>
        <Content>
          <Form>           
            <Text note>Ay Seçiniz</Text>
              <Picker
                mode="dropdown"
                selectedValue={this.state.selectedMonth}
                onValueChange={(value)=>{this.selectMonth(value)}}
              >
                <Picker.Item label="Ocak" value="Ocak" />
                <Picker.Item label="Şubat" value="Şubat" />
                <Picker.Item label="Mart" value="Mart" />
                <Picker.Item label="Nisan" value="Nisan" />
                <Picker.Item label="Mayıs" value="Mayıs" />
                <Picker.Item label="Haziran" value="Haziran" />
                <Picker.Item label="Temmuz" value="Temmuz" />
                <Picker.Item label="Ağustos" value="Ağustos" />
                <Picker.Item label="Eylül" value="Eylül" />
                <Picker.Item label="Ekim" value="Ekim" />
                <Picker.Item label="Kasım" value="Kasım" />
                <Picker.Item label="Aralık" value="Aralık" />
              </Picker>
            <Text note>Yemek Takvimi</Text>
            <FlatList
                data={this.state.data.foods}
                renderItem={(item)=> this.renderItem(item, this)}
                keyExtractor={(item,index)=>{index}}
                onRefresh={()=>this.loadList(this)}
                refreshing={this.state.isFetching}
              />
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
});
