import React from 'react';
import './admin.css';
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


const data = {
  labels: ["user1","user2","user3","user4","user5"],
  datasets: [
    {
      label: 'Comment',
      backgroundColor: 'rgba(240,128,128)',
      data: [1,2,3,4,5]
    },
    {
      label: 'Like',
      backgroundColor: 'rgba(135,206,235)',
      data: [5,4,3,2,1]
    }
  ]
};


class admin extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      user:true,
      isLoading: true,
      isLoading1: true,
      user_data:[],
      chart_data:[],
      error: null
    };
  }

  callAPI() {
    fetch("http://localhost:9000/admin/getuser")
        .then(res => res.json())
        .then(jso => this.setState({user_data: jso, isLoading: false}))
        .catch(error => this.setState({error, isLoading: false}));
    fetch("http://localhost:9000/admin/chart")
        .then(res => res.json())
        .then(jso => this.setState({chart_data: jso, isLoading1: false}))
        .catch(error => this.setState({error, isLoading: false}));

  }

  componentDidMount() {
      this.callAPI();
  }


  render(){
    const {isLoading, chart_data,user_data, error} = this.state;
    var id = [];
    var bus_name = [];
    var chart_username = [];
    var chart_comment_count  = [];
    var chart_fav_count = [];

    user_data.map(user => {
      const {userid, name, home_lat, home_lon} = user;
      id.push(userid);
      bus_name.push(name);
    })

    chart_data.map(chart => {
      const {username,comment_count,fav_count} = chart;
      chart_username.push(username);
      chart_comment_count.push(comment_count);
      chart_fav_count.push(fav_count)
    })

    data.labels=chart_username;
    data.datasets[0].data=chart_comment_count;
    data.datasets[1].data=chart_fav_count;

      return (
        <div>
          <Header user={this.user} loc={this.loc}/>
          <div id="content">
            <UserDB users={user_data} id={id} name={bus_name} chart={chart_data}/>
          </div>
        </div>
      );


  }
}

//https://codepen.io/cristinaconacel/pen/zmgmxE?editors=1000

class UserDB extends React.Component {

  state={
    open:false,
    update_data:null,
    chart_data:null
  }

  delete() {

    if(this.refs.user_table.state.selectedRowKeys.length==0){
      alert("Nothing selected");
      return;
    }
    console.log(this.refs.user_table.state.selectedRowKeys.length);

    if(window.confirm("Are you sure you want to delete these record(s)?")==false){
      console.log(this.refs.user_table);
      this.refs.user_table.setState({
          selectedRowKeys: []
      });
      return;
  }    
  
  const delete_user= {userid:this.refs.user_table.state.selectedRowKeys};

    axios
    .post('http://localhost:9000/admin/deluser',{delete_user})
    .then(res => {
      console.log(res.data);
      if(res.data){
        window.location.reload(false);
      }
    })
    .catch(err => {
      console.error(err);
    });

    this.refs.user_table.setState({
      selectedRowKeys: []
    });

  }

  update() {
    const update_user= this.refs.user_table.state.selectedRowKeys;

    if(update_user.length!=1 || update_user.length==0){
      this.setState({
        open:false,
        update_data:null
      });
    }
    else{
      var update_index=this.props.users.findIndex(item => item.userid === update_user[0]);

      this.setState({
        open:true,
        update_data:this.props.users[update_index]
      });  
    }

    this.refs.user_table.setState({
      selectedRowKeys: []
    });

  }


  render() {
      return( 
      <div id="admincontent">
        <h3>User</h3>
        <button className="btn btn-dark admin_btn" data-toggle="modal" data-target="#adduserModal">Add</button>
        <UserAddModal/>
        <button className="btn btn-dark admin_btn" data-toggle="modal" data-target="#updateuserModal" onClick={this.update.bind(this)}>Update</button>
        <UserUpdateModel open={this.state.open} data={this.state.update_data}/>
        <button className="btn btn-dark admin_btn" onClick={this.delete.bind(this)}>Delete</button>
        <BootstrapTable data={ this.props.users } selectRow={ selectRowProp } wrapperClasses="table-responsive" ref='user_table'>
          <TableHeaderColumn dataField='userid' isKey dataSort>ID</TableHeaderColumn>
          <TableHeaderColumn dataField='username' dataSort>Username</TableHeaderColumn>
          <TableHeaderColumn dataField='password' dataSort>Password</TableHeaderColumn>
          <TableHeaderColumn dataField='home_lat' dataSort>Latitude</TableHeaderColumn>
          <TableHeaderColumn dataField='home_lon' dataSort>Longtitude</TableHeaderColumn>
      </BootstrapTable>
      <br></br><br></br>
      <div id="admin_chart">
      <center><b>Top 5 active users</b></center>
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
      <br></br><br></br>
    </div>

    );
  }
}



class UserAddModal extends React.Component{

  getdata=()=>{
    var name = document.getElementById("addusername").value;
    var password = document.getElementById("adduserpassword").value;
    var lat = document.getElementById("adduserlat").value;
    var lon = document.getElementById("adduserlong").value;

    if(name==""||password==""||lat==""||lon==""){
      alert("All fields cannot be null");
      return;
    }
    if(name.length<4 || name.length>20){
      alert("Username should within 4–20 characters");
      return;
    }
    if(password.length<4 || password.length>20){
      alert("Password should within 4–20 characters");
      return;
    }
    if(isNaN(lat) || isNaN(lon)){
      alert("Latitude or longtitude should be a number");
      return;
    }
    if(lat<-90 || lat>90 || lon<-180 || lon>180){
      alert("Latitude or longtitude out of range");
      return;
    }
  
    document.getElementById("addusername").value="";
    document.getElementById("adduserpassword").value="";
    document.getElementById("adduserlat").value="";
    document.getElementById("adduserlong").value="";
    
    const adduser={
      name:name,password:password,home_lat:lat,home_lon:lon
    }

    axios
    .post('http://localhost:9000/admin/adduser',{adduser})
    .then(res => {
      console.log(res.data);
      if(res.data){
        window.location.reload(false);
      }
    })
    .catch(err => {
      console.error(err);
    })
  
  }


  render() {
    return(
    <div id="adduserModal" class="modal fade" role="dialog">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
          <h4 class="modal-title">Add user</h4>
            <button type="button" class="close" data-dismiss="modal">&times;</button>
          </div>
          <div class="modal-body">
          <form>
            <div class="form-group">
              <label>Username</label>
              <input type="text" class="form-control" id="addusername"/>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="text" class="form-control" id="adduserpassword"/>
            </div>
            <div class="form-group">
              <label>Latitude (-90 to +90)</label>
              <input type="text" class="form-control" id="adduserlat"/>
            </div>
            <div class="form-group">
              <label>Longtitude (-180 to +180)</label>
              <input type="text" class="form-control" id="adduserlong"/>
            </div>
          </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" UseSubmitBehavior="false" onClick={this.getdata}>Submit</button>
          </div>
        </div>
      </div>
    </div>
    );  
  }
}


class UserUpdateModel extends React.Component{

  getdata=()=>{
    var id=this.props.data.userid;
    var name = document.getElementById("updateusername").value;
    var password = document.getElementById("updateuserpassword").value;
    var lat = document.getElementById("updateuserlat").value;
    var lon = document.getElementById("updateuserlong").value;
  
    if(name==""){
      name=this.props.data.username;
    }
    if(password==""){
      password=this.props.data.password;
    }
    if(lat==""){
      lat=this.props.data.home_lat;
    }
    if(lon==""){
      lon=this.props.data.home_lon;
    }


    if(name.length<4 || name.length>20){
      alert("Username should within 4–20 characters");
      return;
    }
    if(password.length<4 || password.length>20){
      alert("Password should within 4–20 characters");
      return;
    }
    if(isNaN(lat) || isNaN(lon)){
      alert("Latitude or longtitude should be a number");
      return;
    }
    if(lat<-90 || lat>90 || lon<-180 || lon>180){
      alert("Latitude or longtitude out of range");
      return;
    }

    const edituser={
      userid:id,username:name,password:password,home_lat:lat,home_lon:lon
    }
    console.log(edituser);

    axios
    .post('http://localhost:9000/admin/edituser',{edituser})
    .then(res => {
      console.log(res.data);
      if(res.data){
        window.location.reload(false);
      }
    })
    .catch(err => {
      console.error(err);
    });
  
  }

 
  render() {
    if(this.props.open){
      return(
      <div id="updateuserModal" class="modal fade" role="dialog">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
            <h4 class="modal-title">Update user</h4>
              <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body">
            <form>
              <div class="form-group">
                <label>Username</label>
                <input type="text" class="form-control" id="updateusername" placeholder={this.props.data.username}/>
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="text" class="form-control" id="updateuserpassword" placeholder={this.props.data.password}/>
              </div>
              <div class="form-group">
                <label>Latitude (-90 to +90)</label>
                <input type="text" class="form-control" id="updateuserlat" placeholder={this.props.data.home_lat}/>
              </div>
              <div class="form-group">
                <label>Longtitude (-180 to +180)</label>
                <input type="text" class="form-control" id="updateuserlong" placeholder={this.props.data.home_lat}/>
              </div>
            </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" UseSubmitBehavior="false" onClick={this.getdata}>Submit</button>
            </div>
          </div>
        </div>
      </div>
      );  
    }
    else{
      return(
        <div id="updateuserModal" class="modal fade" role="dialog">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
            <p>Please choose one record to update!</p>
              <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" data-dismiss="modal">OK</button>
            </div>
          </div>
        </div>
      </div>);
    }
  }
}


const selectRowProp = {
  mode: 'checkbox',
  clickToSelect: true,
};


class Header extends React.Component {
  render() {
      return (
          <div className="header">
              <MenuIcon onClick={this.props.onClickMenu} user={this.props.user} loc={this.props.loc}/>
              <Title />
              <UserName />
          </div>
      );
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
                <Link to="/admin_user">User</Link>
                <Link to="/admin_loc">Location</Link>
            </div>
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
      return <div>{this.renderRedirect()}<span className="username" onClick={this.logout}>Admin</span></div>;
  }
}

class Title extends React.Component {
  render() {
      return <span className="title">Admin page</span>;
  }
}



export default admin;
