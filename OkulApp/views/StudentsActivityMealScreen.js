import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Alert, KeyboardAvoidingView, AsyncStorage, FlatList, ActivityIndicator
} from 'react-native';
import { Container, Picker, Header, Form, Title, Text, Content, Item, Button, Input, Icon, List, View, ListItem, Left, Thumbnail, Image, Body, Right,  Fab  } from 'native-base';
import Moment from 'moment';
import { OkulApi } from '../services/OkulApiService';


export class StudentsActivityMealScreen extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
       classes:[],
       selectedClass:null,
       selectedMeal:'Sabah Kahvaltısı',       
       students:[],
       isFetching:false,
       studentCheckInMap:{},
       data:[],
    }
  }

  back(){
    this.props.navigation.navigate('Menu');
  }

  static navigationOptions = {
    title: 'Öğrenci Yoklama',
  };

  async componentDidMount() { 
    
    OkulApi.getClasses('',(result)=>{
      this.setState({classes:result});
      if(result != null && result.length>0){
        this.selectClass(result[0]._id);
      }
    }); 
  }

  selectClass(cls){
    this.setState({selectedClass : cls});
    setTimeout(() => {
      this.loadList(this);
    }, 100);
  }

  selectMeal(meal){
    this.setState({selectedMeal : meal});
    setTimeout(() => {
      this.loadList(this);
    }, 150);
  }

  loadList(thiz){
    this.setState({studentCheckInMap:{}});
    setTimeout(() => {
      OkulApi.getDailyActivity(this.state.selectedClass,'lunch',this.state.selectedMeal, (result)=>{
        this.setState({data:result});
        result.students.forEach(element=>{
          this.state.studentCheckInMap[element.studentId.$oid] = element.status;
        });
        setTimeout(() => {
          this.setState(this.state);
        }, 100);      
      });
    }, 200);
  

    thiz.setState({isFetching:true, students:[]});
    setTimeout(() => {
      OkulApi.getStudentsOfClass(this.state.selectedClass, (result)=>{   
        this.setState({students:result, isFetching:false});
      },(r)=>{
        this.setState({students:[], isFetching:false});
      });
    }, 300);
  
  }

  setMealStatusOfStudent(student, status){
    OkulApi.setMealStatusOfStudent(this.state.selectedClass, "lunch", this.state.selectedMeal, student, status ,(result)=>{
      this.state.studentCheckInMap[student._id.$oid] = status;
      setTimeout(() => {
        this.setState(this.state);
      }, 150);      
    });
  }
   

  renderItem(data, thiz){
    let thumbUrl = data.item.image != null && data.item.image  && data.item.image.$oid != null ? {uri :  OkulApi.apiURL+'getImage?fileId='+data.item.image.$oid } : require('../assets/images/user-profile.png');
    return (
    <ListItem avatar>
      <Left>
        <Thumbnail source={ thumbUrl } />
      </Left>
      <Body>
        <Text>{data.item.nameSurname}</Text>
        <Picker
                mode="dropdown"
                placeholder="seçiniz.."
                selectedValue={thiz.state.studentCheckInMap[data.item._id.$oid]}
                onValueChange={(value)=>{thiz.setMealStatusOfStudent(data.item, value)}}
              >
                <Picker.Item label="" value="" />
                <Picker.Item label="Hepsini Yedi" value="Hepsini Yedi" />
                <Picker.Item label="Az Yedi" value="Az Yedi" />
                <Picker.Item label="Yemedi" value="Yemedi" />
          </Picker>
      </Body>
    </ListItem>
);  
}

  render() {
    if (this.state == null) {
      return <ActivityIndicator />;
    }
    let classesItems = this.state.classes.map( (s, i) => {
      return <Picker.Item key={i} value={s._id} label={s.name} />
    });

    return (
      <Container>
         <Header style={{marginTop:25}}>
              <Left>
                <Button transparent onPress={()=>this.back()}>
                  <Icon name='arrow-round-back' />
                </Button>                
              </Left>
              <Body>
                <Title>Öğrenci Yemek Bildirimi</Title>
              </Body>
              <Right />
            </Header>
        <Content>
          <Form>
            <Text note>Sınıf</Text>
            <Item picker>
              <Picker
                mode="dropdown"
                iosIcon={<Icon name="arrow-down" />}
                style={{ width: undefined }}
                placeholder="Sınıf seçiniz.."
                placeholderStyle={{ color: "#bfc6ea" }}
                placeholderIconColor="#007aff"
                selectedValue={this.state.selectedClass}
                onValueChange={(selectedClass)=>{this.selectClass(selectedClass)}}
              >
                {classesItems}
              </Picker>
            </Item>
            <Text note>Öğün</Text>
              <Picker
                mode="dropdown"
                selectedValue={this.state.selectedMeal}
                onValueChange={(value)=>{this.selectMeal(value)}}
              >
                <Picker.Item label="Sabah Kahvaltısı" value="Sabah Kahvaltısı" />
                <Picker.Item label="Öğle Yemeği" value="Öğle Yemeği" />
                <Picker.Item label="İkindi Yemeği" value="İkindi Yemeği" />
                <Picker.Item label="Akşam Yemeği" value="Akşam Yemeği" />
              </Picker>
            <Text note>Öğrenciler</Text>
            <FlatList
                data={this.state.students}
                renderItem={(item)=> this.renderItem(item, this)}
                keyExtractor={(item) => item._id.$oid}
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
