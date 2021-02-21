import React from 'react';
import './detail.css';
import {GoogleMap, withScriptjs, withGoogleMap, Marker} from "react-google-maps"
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link,
    Redirect
  } from "react-router-dom";
import axios from 'axios'; 

var details = [];

var latitude;
var longitude;
var bus_id;

class App extends React.Component{
    constructor(props){
      super(props);
      this.state = {
          details : details,
          heart : false,
          comments : [],
          user: "",
          id: "",
          favlist: [],
          bus_id: "",
          home_lat: "",
          home_lon: "",
          favid: ""
      };
    }

    heart = () =>{
      var heart = !this.state.heart;
      this.setState({
        heart : !this.state.heart
      });
      if(heart){
        const heart={
          userid:this.state.id ,
          bus_id:this.state.bus_id
        };
    
        axios
        .post('http://localhost:9000/detail/heart',{heart})
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.error(err);
        });
        document.getElementById("heart").style.color = "rgb(231, 95, 95)";
      }else{
        const heart={
          favid:this.state.favid ,
        };
    
        axios
        .post('http://localhost:9000/detail/delete',{heart})
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.error(err);
        });
        document.getElementById("heart").style.color = "rgb(139, 139, 139)";
      }
    }

    addComment = user_comment =>{
      console.log('user comments', this.state.comments);
      var tmp = this.state.comments;
      tmp.push({'username':this.state.user, 'comment':user_comment});
      console.log('tmp', tmp);
      this.setState({
          comments: tmp
      });
      console.log('user comments', this.state.comments);
    }

    callBUS(business) {
      var temp = [];
      axios
        .post('http://localhost:9000/detail/business',{business:business})
        .then(res => temp = res.data)
        .then(res => this.setState({comments: temp, isLoading: false}))
        .catch(error => this.setState({error, isLoading: false}));
      this.setState({comments: temp});
    }

    callFAV(bus_id, id) {
      var temp = [];
      axios
        .post('http://localhost:9000/detail/fav',{id:id})
        .then(res => temp = res.data)
        .then(res => 
            {for(var i in temp){
              console.log("BUS ID", i)
              if (bus_id == temp[i]['businessid']){
                this.setState({
                  heart : true,
                  favid: temp[i]['favid']
                });
                document.getElementById("heart").style.color = "rgb(231, 95, 95)";
              }
            }
          }
          )
        .then(res => this.setState({favlist: temp, isLoading: false}))
        .catch(error => this.setState({error, isLoading: false}));
    }

    componentDidMount(props){
      details = [];
      details.push(this.props.location.state.data);
      this.setState({details: details});
      details.map(business => {
        const {lat, lon, businessid} = business;
        latitude = lat;
        longitude = lon;
        bus_id = businessid;
      })

      const business = {businessid: bus_id, userid: this.props.location.state.id}
      this.callBUS(business);
      this.callFAV(bus_id, this.props.location.state.id);
      this.setState({user: this.props.location.state.user});
      this.setState({id: this.props.location.state.id});
      this.setState({bus_id: bus_id});
      this.setState({home_lat: this.props.location.state.lat});
      this.setState({home_lon: this.props.location.state.lon});
    }

    render(){
      return (
        <div class="frame">
          <div class="mapframe" style={{ width: "50%", height: "100vh" }}>
            <WrappedMap 
            googleMapURL={'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=key-here'}
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `100%` }} />}
            mapElement={<div style={{ height: `100%` }} />}/>
          </div>
          <div class="locationframe">
            <Header user={this.state.user}/>
            <Content user={this.state.user} id={this.state.id} bus_id={this.state.bus_id} lat={this.state.home_lat} lon={this.state.home_lon} details={this.state.details} heart={this.heart} comments={this.state.comments} addComment={this.addComment}/>
          </div>
        </div>
      );
    }
    
}

class Map extends React.Component {
  render(){
    var red="http://maps.google.com/mapfiles/ms/icons/red-dot.png";
      return (
          <GoogleMap 
            defaultZoom={15} 
            defaultCenter={{lat: latitude, lng: longitude}}
          >
            {<Marker position={{lat: latitude, lng: longitude}} icon={red} />}
          </GoogleMap>
      );
  }
}

const WrappedMap = withScriptjs(withGoogleMap(Map));

class Header extends React.Component {
  render() {
      return (
          <div className="header">
              {/* <MenuIcon onClick={this.props.onClickMenu} all={this.props.all} fav={this.props.fav}/> */}
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
        return <Redirect to={'/'} />
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

class Title extends React.Component {
  render() {
      return <span className="title">Yelp location</span>;
  }
}

class Content extends React.Component {
  constructor(props){
      super(props);
  }

  state = {
    redirect: false
  }

  renderRedirect = () => {
    if (this.state.redirect){
      return <Redirect to={{
        pathname:'/user',
        state: {user: this.props.user, 
                id: this.props.id, 
                lat: this.props.lat, 
                lon: this.props.lon}
      }} />
    }
  }
  back=()=>{
    this.setState({
      redirect: true
    })
  }

  render() {
    var img;
    this.props.details.map(business => {
      const {photo} = business;
      img = photo;
    })
    if (img==""){
      img = "https://via.placeholder.com/150";
    }
      return (
        <div id="content">
            {this.renderRedirect()}
            <button class="backframe btn btn-outline-info" onClick={this.back}>Back</button>
            <img src={img} class="picframe"></img>
            <div class="infoframe grid-container">
              {this.props.details.map(detail =>
                          <Info name={detail.name} review={detail.review} price={detail.price} rating={detail.rating} />
                      )}
            </div>
            <div class="heartframe">
              <i class="fa fa-heart heart" onClick={this.props.heart} id="heart"></i>
            </div>
            <AddComment user={this.props.user} id={this.props.id} bus_id={this.props.bus_id} comments={this.props.comments} addComment={this.props.addComment}/>
        </div>
      );
  }
}

class Info extends React.Component{
  constructor(props){
    super(props);
  }

  render() {
      return (
        <div>
            <p>Name: {this.props.name}</p>
            <p>Review: {this.props.review}</p>
            <p>Price level: {this.props.price}</p>
            <p>Rating: {this.props.rating}</p>
            <hr></hr>
        </div>
      );
  }
}

class AddComment extends React.Component{
  constructor(props){
    super(props);
  }

  addNewComment = (event) =>{
    event.preventDefault();
    console.log(this.mainInput.value);
    this.props.addComment(this.mainInput.value);
    console.log("IDDDDDDDDDDDD",this.props.id);
    const comments={
      userid:this.props.id ,
      comment:this.mainInput.value,
      bus_id:this.props.bus_id
    };

    axios
    .post('http://localhost:9000/detail/comment',{comments})
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.error(err);
    });
    this.mainInput.value = "";
  }

  render(){
    console.log('ALL COMMENTS', this.props.comments);
    return(
      <div class="grid-container commentframe">
        <h3>Comment session</h3>
        <ul class="comment">
        {this.props.comments.map(comments =>
                        <Comment username={comments.username} comment={comments.comment}/>
                    )}
        </ul>
        <hr></hr>
        <h4>Leave your comment:</h4>
        <div class="create_new_comment">
          <div class="user_avatar">
            <img src="https://secure.gravatar.com/avatar/c53e9360534ddc8b61409665a076ccee?s=50&amp;d=mm&amp;r=g" />
          </div>
          <b>{this.props.user}</b>
          <div class="input_comment">
            <form onSubmit={this.addNewComment}>
                <textarea ref={(ref) => this.mainInput= ref}  class="col-md-12" placeholder="What you want to say about this business"></textarea>
                <input type="submit"></input>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

class Comment extends React.Component{
  constructor(props){
    super(props);
  }
  render(){
    if(this.props.username === undefined){
      return(
        <div></div>
      );
    }
    else{
      return(
        <li>
            <div class="user_avatar">
              <img src="https://secure.gravatar.com/avatar/c53e9360534ddc8b61409665a076ccee?s=50&amp;d=mm&amp;r=g" />
            </div>
            <b>{this.props.username}</b>
            <div>
            <p>{this.props.comment}</p>
            </div>
        </li>
      );
    }
  }
}

export default App;
