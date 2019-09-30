import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Alert, KeyboardAvoidingView, AsyncStorage, FlatList, ActivityIndicator
} from 'react-native';
import { Container, Picker, Header, Form, Title, Text, Content, Item, Button, Input, Icon, List, View, ListItem, Left, Thumbnail, Image, Body, Right,  Fab  } from 'native-base';
import Moment from 'moment';
import { OkulApi } from '../services/OkulApiService';


export class StudentsActivitySleepScreen extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
       classes:[],
       selectedClass:null,
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
    title: 'Öğrenci Uyku Durumu',
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
    }, 10);
  }

  loadList(thiz){
    this.setState({studentCheckInMap:{}});
    setTimeout(() => {
      OkulApi.getDailyActivity(this.state.selectedClass,'sleep','', (result)=>{
        this.setState({data:result});
        result.students.forEach(element=>{
          this.state.studentCheckInMap[element.studentId.$oid] = element.status;
        });
        setTimeout(() => {
          this.setState(this.state);
        }, 10);      
      });
    }, 10);
    

    thiz.setState({isFetching:true, students:[]});
    setTimeout(() => {
      OkulApi.getStudentsOfClass(this.state.selectedClass, (result)=>{   
        this.setState({students:result, isFetching:false});
      },(r)=>{
        this.setState({students:[], isFetching:false});
      });
    }, 10);
   
  }

  setSleepStatusOfStudent(student, status){
    OkulApi.setSleepStatusOfStudent(this.state.selectedClass, "sleep", student, status ,(result)=>{
      this.state.studentCheckInMap[student._id.$oid] = status;
      setTimeout(() => {
        this.setState(this.state);
      }, 10);      
    });
  }
   

  renderItem(data, thiz){
    let thumbUrl = data.item.image != null && data.item.image.$oid != null ? {uri :  OkulApi.apiURL+'getImage?fileId='+data.item.image.$oid } : require('../assets/images/user-profile.png');
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
                onValueChange={(value)=>{thiz.setSleepStatusOfStudent(data.item, value)}}
              >
                <Picker.Item label="" value="" />
                <Picker.Item label="Uyudu" value="Uyudu" />
                <Picker.Item label="Az Uyudu" value="Az Uyudu" />
                <Picker.Item label="Uyumadı" value="Uyumadı" />
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
         <Header>
              <Left>
                <Button transparent onPress={()=>this.back()}>
                  <Icon name='arrow-round-back' />
                </Button>                
              </Left>
              <Body>
                <Title>Öğrenci Uyku Durumu</Title>
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
