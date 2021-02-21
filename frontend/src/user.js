import React from 'react';
import './user.css';
import {GoogleMap, withScriptjs, withGoogleMap, Marker} from "react-google-maps";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  Redirect
} from "react-router-dom";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios';
import {Bar} from 'react-chartjs-2';

var info;

var fav = [];

var position = [];

var favposition = [];

var topCom = [];

var topCnt = [];

var data;

class user extends React.Component{
    constructor(props){
      super(props);
      this.state = {
          fav: [],
          isLoading: true,
          data: [],
          filteredData: [],
          intermediate_data: [],
          error: null,
          user:"",
          id:"",
          map: false,
          home_lat: "",
          home_lon: "",
          marker: position,
          stat: false,
          top_comment: []
      };
    }

    // set all location
    all = () => {
      this.setState({
          filteredData : info,
          map: false,
          intermediate_data: info,
          stat : false
      },()=>{console.log("FALSE",this.state.map)})
      console.log(this.state.map);
    }

    // set favorite location
    fav = () => {
      this.setState({
          filteredData : fav,
          map: true,
          intermediate_data: fav,
          stat : false
      },()=>{console.log("TRUE",this.state.map)})
      console.log(this.state.map);
    }

    stat = () => {
      this.setState({
          stat: true
      })
      data = {
        labels: topCom,
        datasets: [
          {
            label: 'Comment',
            backgroundColor: 'rgba(240,128,128)',
            data: topCnt
          }
        ]
      };
    }

    // search bar filter location
    filterLocation = searchText => {
      return this.state.intermediate_data
          .filter(data =>{
            console.log("DATA",data);
              if (data['name'].toLowerCase().includes(
                  searchText.toLowerCase())
              ){
                  return true;
              }
              return false;
          });
    }

    // update state after searching
    handleSearchChange = event => {
        this.setState({
            filteredData: this.filterLocation(event.target.value)
        });
    };

    // retreive all locations
    callALL = (home_location) => {
      var temp = [];
      axios
      .post('http://localhost:9000/user',{home_location: home_location})
      .then(res => temp = res.data)
      .then(res => this.setState({data: temp, filteredData: temp, intermediate_data: temp,isLoading: false}))
      .catch(error => this.setState({error, isLoading: false}));
    }

    // retrieve fav locations
    callFAV = (userdata) => {
      var temp = [];
      axios
      .post('http://localhost:9000/user/login',{userdata: userdata})
      .then(res => temp = res.data)
      .then(res => this.setState({fav: temp, isLoading: false}))
      .catch(error => this.setState({error, isLoading: false}));
    }

    // top 5 locations with most comments
    callTOP = () => {
      var temp = [];
      topCom = [];
      topCnt = [];
      axios
      .post('http://localhost:9000/user/top')
      .then(res => temp = res.data)
      .then(res => {
        temp.map(top => {
          const {name, comment_count} = top;
          topCom.push(name);
          topCnt.push(comment_count);
        })
        console.log('TOP', temp, topCom, topCnt);
      })
      .then(res => this.setState({top_comment: temp, isLoading: false}))
      .catch(error => this.setState({error, isLoading: false}));
    }


  componentDidMount(props) {
    this.setState({user: this.props.location.state.user});
    this.setState({id: this.props.location.state.id});
    this.setState({home_lat: this.props.location.state.lat});
    this.setState({home_lon: this.props.location.state.lon});
    const home_location = {lat: this.props.location.state.lat, lon: this.props.location.state.lon}
    this.callALL(home_location);
    const userdata = {user: this.props.location.state.user, id: this.props.location.state.id, lat: this.props.location.state.lat, lon: this.props.location.state.lon}
    this.callFAV(userdata);
    this.callTOP();
  }

    render(){
      console.log("all", this.state.data);
      console.log("fac", this.state.fav);
      fav = this.state.fav;
      position = [];
      // pass all location position to an array of object
      this.state.data.map(business => {
        const {lat, lon} = business;
        position.push({"lat": lat,"lon": lon});
      })

      // pass fav location position to an array of object
      favposition = [];
      this.state.fav.map(business => {
        const {lat, lon} = business;
        favposition.push({"lat": lat,"lon": lon});
      })

      info = this.state.data;
      
      if (this.state.stat){
        return (
          <div class="frame">
            <div class="mapframe" style={{ width: "50%", height: "100vh" }}>
              <WrappedMap
                map = {this.state.map}
                data = {info}
                fav = {fav}
                user={this.state.user} 
                id={this.state.id}
                lat={this.state.home_lat} 
                lon={this.state.home_lon}
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=key-here`}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
              />
            </div>
            <div class="locationframe">
              <Header all={this.all} fav={this.fav} stat={this.stat} user={this.state.user}/>
              <center><b>Top 5 locations with most comments</b></center>
              <Bar
                  data={data}
                  width={50}
                  height={30}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      yAxes: [{
                        ticks: {
                          stepSize: 1,
                          beginAtZero: true
                        }
                      }]
                    }
                  }}
                />
            </div>
          </div>
        );
      }else{
        return (
          <div class="frame">
            <div class="mapframe" style={{ width: "50%", height: "100vh" }}>
              <WrappedMap
                map = {this.state.map}
                data = {info}
                fav = {fav}
                user={this.state.user} 
                id={this.state.id}
                lat={this.state.home_lat} 
                lon={this.state.home_lon}
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=key-here`}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
              />
            </div>
            <div class="locationframe">
              <Header all={this.all} fav={this.fav} stat={this.stat} user={this.state.user}/>
              <SearchBar onChange={this.handleSearchChange}/>
              <Content locations={this.state.filteredData} user={this.state.user} id={this.state.id} lat={this.state.home_lat} lon={this.state.home_lon}/>
            </div>
          </div>
        );
      }
    }
    
}

// set google map with self adjusted zoom level and center
class Map extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    console.log('MAP TOGGLER', this.props.fav)
    return (
      <GoogleMap defaultZoom={15} defaultCenter={{lat:22.418498326, lng:114.204074184}}>
          {this.props.data.map(positions =>
                    <Mark map={this.props.map} position={positions} data={this.props.data} lat={this.props.lat} lon={this.props.lon} latitude={positions.lat} longitude={positions.lon} name={positions.name} businessid={positions.businessid} user={this.props.user} id={this.props.id}/>
                )}
        </GoogleMap>
    );
  }
}

// apply multiple marker
class Mark extends React.Component {
  constructor(props){
    super(props);
  }

  state = {
    redirect: false
  }

  renderRedirect = () => {
    if (this.state.redirect){
      return <Redirect to={{
        pathname:'/detail',
        state: {data: this.props.position,
                user: this.props.user, 
                id:this.props.id, 
                businessid:this.props.businessid, 
                lat:this.props.lat, 
                lon:this.props.lon}
      }} />
    }
  }

  goToDetail = () =>{
    var go = window.confirm('Do you want to go to '+ this.props.name + '?');
    if(go){
      this.setState({
        redirect: true
      })
    }
  }

  render() {
    var blue="http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    var red="http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    return (
      <div>
        {this.renderRedirect()}
        <Marker onClick={this.goToDetail} position={{lat: this.props.latitude, lng: this.props.longitude}}icon= {red}/>
      </div>
    );
  }
}

class Header extends React.Component {
  render() {
      return (
          <div className="header">
              <MenuIcon onClick={this.props.onClickMenu} all={this.props.all} fav={this.props.fav} stat={this.props.stat}/>
              <Title />
              <UserName user={this.props.user}/>
          </div>
      );
  }
}

class UserName extends React.Component {

  state = {
    redirect: false
  }

  renderRedirect = () => {
    if (this.state.redirect){
      return <Redirect to='/' />
    }
  }

logout=()=>{
  if(window.confirm("Are you sure you want to logout?")){
    this.setState({
      redirect: true
    })
  }
}
  
  render() {
      return <div>{this.renderRedirect()}<span className="username" onClick={this.logout}>{this.props.user}</span></div>;
  }
}

class MenuIcon extends React.Component {
  render() {
      return (
        <div class="dropdown">
            <div className="menuIcon" onClick={this.props.onClick}>
              <div className="dashTop"></div>
              <div className="dashBottom"></div>
              <div className="circle"></div>
            </div>
            <div class="dropdown-content">
                <p onClick={this.props.all}>All location</p>
                <p onClick={this.props.fav}>Favourite Location</p>
                <p onClick={this.props.stat}>Charting Statistic</p>
              </div>
        </div>
      );
  }
}

class Title extends React.Component {
  render() {
      return <span className="title">Yelp location</span>;
  }
}

class SearchBar extends React.Component {
  constructor(props){
      super(props);
  }

  onChangeHandler = event => {
      console.log(event.target.value);
  }

  render() {
        return (
            <div className="search-bar">
                <input type="text" onChange={this.props.onChange} />
            </div>
        );
  }
}

class Content extends React.Component {
  constructor(props){
      super(props);
  }

  state = {
    redirect: false,
    data: ""
  }

  renderRedirect = () => {
    if (this.state.redirect){
      return <Redirect to={{
        pathname:'/detail',
        state: {data: this.state.data, 
                user: this.props.user, 
                id:this.props.id, 
                businessid:this.state.data['businessid'], 
                lat:this.props.lat, 
                lon:this.props.lon}
      }} />
    }
  }
  detail=(row)=>{
    // pass the selected location id to detail's page
    var data = "";
    data = row;
    console.log(data);
    this.setState({
      redirect: true,
      data: data
    })
  }
  activeFormatter = (cell, row) => {
    return (
      <div onClick={this.detail.bind(this, row)}>{ cell }</div>
    );
}

  render() {
      return (
        <div>
          <BootstrapTable data={ this.props.locations }>
          {this.renderRedirect()}
            <TableHeaderColumn dataField='name' dataFormat={ this.activeFormatter } isKey>Location (click to view details)</TableHeaderColumn>
            <TableHeaderColumn width='100px' dataField='rating' dataSort>Rating</TableHeaderColumn>
            <TableHeaderColumn width='100px' dataField='price' dataSort>Price</TableHeaderColumn>
            <TableHeaderColumn width='150px' dataField='distance' dataSort>Distance (in m)</TableHeaderColumn>
          </BootstrapTable>
        </div>
      );
  }
}

const WrappedMap = withScriptjs(withGoogleMap(Map));



export default user;
