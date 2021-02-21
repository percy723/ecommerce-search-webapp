import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  Redirect
} from "react-router-dom";
import axios from 'axios';



class login extends React.Component {

  state = {
    redirect: false,
    user:"",
    id:"",
    lat:null,
    lon:null,
    data:[]
  }

  renderRedirect = () => {
      if (this.state.redirect){
        return <Redirect to={{
          pathname:'/user',
          state: {user: this.state.user,id: this.state.id, lat:this.state.lat, lon:this.state.lon}
        }} />
      }
  }


  login=()=>{

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    document.getElementById("username").value="";
    document.getElementById("password").value="";

    if(username=="" || password==""){
      alert("The username or password cannot be empty!");
      return;
    }

      const current_user={
        user:username,
        password:password };

      axios
      .post('http://localhost:9000/login',{current_user})
      .then(res => {
        if(res.data.status){
          this.setState({
            redirect: true,
            user:username,
            id:res.data.current_user.userid,
            lat: res.data.current_user.home_lat,
            lon: res.data.current_user.home_lon
          })
        }
        else{
          alert("The username or password is incorrect!");
        }
      })
    .catch(err => {
      console.error(err);
    });
    
  }

    render(){
      const {isLoading,data,error}=this.state;
      return (
        <div className="App">
          <div class="login_title">
            <h3><b>Businesses in an area on Yelp</b></h3>
            <Link to="/about"><div id="link">About this Project</div></Link>
          </div>
          <br></br>
          <h4><b>Sign In</b></h4>
          <form>
            <div className="form-group login_form">
                <label>Username</label>
                <input type="text" id="username" className="form-control" placeholder="Enter username" />
            </div>

            <div className="form-group login_form">
                <label>Password</label>
                <input type="password" id="password" className="form-control" placeholder="Enter password" />
            </div><br></br>
            </form>
            <div id="login_btn">
            {this.renderRedirect()}
                <button className="btn btn-dark btn-block" onClick={this.login}>Submit</button>
              <br></br>
              <Link to="/admin_user">
                <button type="admin_btn" className="btn btn-dark btn-block">Login as Admin</button>
              </Link>
              <br></br>
            </div>
         
        </div>
        
        
      );}
}



export default login;
