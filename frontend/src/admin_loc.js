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
import CSVReader from "react-csv-reader";
import axios from 'axios';



const selectRowProp = {
    mode: 'checkbox',
    clickToSelect: true,
  
  };
  

class admin extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      user:true,
      isLoading: true,
      loc_data: [],
      error: null
    };

  }

  callAPI() {
    fetch("http://localhost:9000/admin/getloc")
        .then(res => res.json())
        .then(jso => this.setState({loc_data: jso, isLoading: false}))
        .catch(error => this.setState({error, isLoading: false}));

  }

  callAPI2(){
    fetch("http://localhost:9000/admin/rowcount").catch(error => this.setState({error, isLoading: false}));
  }

  componentDidMount() {
      this.callAPI();
      this.callAPI2();
  }

  render(){
    const {isLoading, loc_data,user_data, error} = this.state;
    var id = [];
    var bus_name = [];
    loc_data.map(business => {
      const {businessid, name, price, rating} = business;
      id.push(businessid);
      bus_name.push(name);
    })
    


      return (
        <div>
          <Header user={this.user} loc={this.loc}/>
          <div id="content">
            <LocationDB locations={loc_data} id={id} name={bus_name}/>
          </div>
        </div>
      );
    

  }
}

const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: header =>
      header
        .toLowerCase()
        .replace(/\W/g, '_')
  }

class LocationDB extends React.Component {

  state = {
    id: "",
    open:false,
    update_data:null
  }

  addCSV = (data, fileInfo) => {
      console.log(data);
      axios
      .post('http://localhost:9000/admin/uploadcsv',{data})
      .then(res => {
          console.log(res.data);
        //   if(res.data){
        //     window.location.reload(false);
        //   }
        })
      .catch(err => {
        console.error(err);
      });
  }

  delete() {

    if(this.refs.loc_table.state.selectedRowKeys.length==0){
        alert("Nothing selected");
        return;
    }

    if(window.confirm("Are you sure you want to delete these record(s)?")==false){
        this.refs.loc_table.setState({
            selectedRowKeys: []
        });
        return;
    }

    const delete_id= {businessid:this.refs.loc_table.state.selectedRowKeys};

    axios
    .post('http://localhost:9000/admin/delloc',{delete_id})
    .then(res => {
        console.log(res.data);
        if(res.data){
          window.location.reload(false);
        }
      })
    .catch(err => {
      console.error(err);
    });

    this.refs.loc_table.setState({
        selectedRowKeys: []
    });
  }

  update() {
    const update_loc= this.refs.loc_table.state.selectedRowKeys;

    if(update_loc.length!=1 || update_loc.length==0){
      this.setState({
        open:false,
        update_data:null
      });
    }
    else{
      var update_index=this.props.locations.findIndex(item => item.businessid === update_loc[0]);

      this.setState({
        open:true,
        update_data:this.props.locations[update_index]
      }); 
    }

  }

  flush=()=>{
    fetch("http://localhost:9000/admin/flush");
    window.location.reload(true);
  }

  render() {
    return( 
    
    <div id="admincontent">
      <h3>Location</h3>
      <div class="adminframe">
        <div class="admin_left">
      <button className="btn btn-dark admin_btn" data-toggle="modal" data-target="#addlocModal">Add</button>
      <LocAddModal />
      <button className="btn btn-dark admin_btn" data-toggle="modal" data-target="#updatelocModal" onClick={this.update.bind(this)}>Update</button>
      <LocUpdateModal open={this.state.open} data={this.state.update_data}/>
      <button className="btn btn-dark admin_btn" onClick={this.delete.bind(this)}>Delete</button>
      <button className="btn btn-dark admin_btn" onClick={this.flush}>Flush</button>
      </div>
      <div class="admin_right">
      <p>Upload CSV file:</p>
      <CSVReader
        cssClass="react-csv-input"
        onFileLoaded={this.addCSV}
        parserOptions={papaparseOptions}
      />
      </div>
      </div>
      
      <BootstrapTable data={ this.props.locations } selectRow={ selectRowProp } scrollY maxHeight="300px" pagination={ true } ref='loc_table'>
          <TableHeaderColumn dataField='businessid' isKey dataSort>ID</TableHeaderColumn>
          <TableHeaderColumn dataField='name' dataSort>Name</TableHeaderColumn>
          <TableHeaderColumn dataField='lat' dataSort>Latitude</TableHeaderColumn>
          <TableHeaderColumn dataField='lon' dataSort>Longtitude</TableHeaderColumn>
          <TableHeaderColumn dataField='photo' dataSort>Photo</TableHeaderColumn>
          <TableHeaderColumn dataField='price'  dataSort>Price Level</TableHeaderColumn>
          <TableHeaderColumn dataField='review' dataSort>Review Count</TableHeaderColumn>
          <TableHeaderColumn dataField='rating' dataSort>Rating</TableHeaderColumn>
      </BootstrapTable>
  </div>

  );
}

}


class LocAddModal extends React.Component{

getdata=()=>{
  var id=document.getElementById("addlocid").value;
  var name = document.getElementById("addlocname").value;
  var lat = document.getElementById("addloclat").value;
  var lon = document.getElementById("addloclong").value;
  var price = document.getElementById("addlocprice").value;
  var review = document.getElementById("addlocreview").value;
  var rate = document.getElementById("addlocrating").value;

  if(id==""||name==""||rate==""||lat==""||lon==""||review==""){
    alert("All fields cannot be null");
    return;
  }

  if(isNaN(review) || isNaN(rate)|| isNaN(lat)|| isNaN(lon)){
    alert("Latitude/longtitude/rate/reivew should be number");
    return;
  }

  if(lat<-90 || lat>90 || lon<-180 || lon>180 || rate<0 || rate>5 || review<0){
    alert("Latitude/longtitude/rate/reivew out of range");
    return;
  }

  document.getElementById("addlocid").value="";
  document.getElementById("addlocname").value="";
  document.getElementById("addloclat").value="";
  document.getElementById("addloclong").value="";
  document.getElementById("addlocprice").value="";
  document.getElementById("addlocreview").value="";
  document.getElementById("addlocrating").value="";

  const addloc ={
    businessid:id,name:name,lat:lat,lon:lon,price:price,review:review,rating:rate
  }

  axios
  .post('http://localhost:9000/admin/addloc',{addloc})
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


  render(){

    return(
      <div id="addlocModal" class="modal fade" role="dialog">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
            <h4 class="modal-title">Add location</h4>
              <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body">
            <form>
            <div class="form-group">
                <label>Business ID</label>
                <input type="text" class="form-control" id="addlocid"/>
              </div>
              <div class="form-group">
                <label>Name</label>
                <input type="text" class="form-control" id="addlocname"/>
              </div>
              <div class="form-group">
                <label>Latitude (-90 to +90)</label>
                <input type="text" class="form-control" id="addloclat"/>
              </div>
              <div class="form-group">
                <label>Longtitude (-180 to +180)</label>
                <input type="text" class="form-control" id="addloclong"/>
              </div>
              <div class="form-group">
                <label>Price level</label>
                <select class="form-control" id="addlocprice">
                <option value=""></option>
                  <option>$</option>
                  <option>$$</option>
                  <option>$$$</option>
                  <option>$$$$</option>
                </select> 
              </div>
              <div class="form-group">
                <label>Review Count</label>
                <input type="text" class="form-control" id="addlocreview"/>
              </div>
              <div class="form-group">
                <label>Rating (1 to 5)</label>
                <input type="text" maxlength="1" class="form-control" id="addlocrating"/>
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


class LocUpdateModal extends React.Component{

  getdata=()=>{
    var id= this.props.data.businessid;
    var name = document.getElementById("updatelocname").value;
    var lat = document.getElementById("updateloclat").value;
    var lon = document.getElementById("updateloclong").value;
    var price = document.getElementById("updatelocprice").value;
    var review = document.getElementById("updatelocreview").value;
    var rate = document.getElementById("updatelocrating").value;

    if(name==""){
      name=this.props.data.name;
    }
    if(lat==""){
      lat=this.props.data.lat;
    }
    if(lon==""){
      lon=this.props.data.lon;
    }
    if(price==""){
        price=this.props.data.price;
    }
    if(review==""){
        review=this.props.data.review;
    }
    if(rate==""){
        rate=this.props.data.rating;
    }

    if(isNaN(review) || isNaN(rate)|| isNaN(lat)|| isNaN(lon)){
        alert("Latitude/longtitude/rate/reivew should be number");
        return;
      }

    if(lat<-90 || lat>90 || lon<-180 || lon>180 || rate<0 || rate>5 || review<0){
        alert("Latitude/longtitude/rate/reivew out of range");
    return;
    }

    const editloc ={
      businessid:id,name:name,lat:lat,lon:lon,price:price,review:review,rating:rate
    }

    console.log(editloc);
  
    axios
    .post('http://localhost:9000/admin/editloc',{editloc})
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

    render(){
      console.log(this.props.data);
      if(this.props.open){
          return(
            <div id="updatelocModal" class="modal fade" role="dialog">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                  <h4 class="modal-title">Update location</h4>
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                  </div>
                  <div class="modal-body">
                  <form>
                    <div class="form-group">
                      <label>Name</label>
                      <input type="text" class="form-control" id="updatelocname" placeholder={this.props.data.name}/>
                    </div>
                    <div class="form-group">
                      <label>Latitude (-90 to +90)</label>
                      <input type="text" class="form-control" id="updateloclat" placeholder={this.props.data.lat}/>
                    </div>
                    <div class="form-group">
                      <label>Longtitude (-180 to +180)</label>
                      <input type="text" class="form-control" id="updateloclong" placeholder={this.props.data.lon}/>
                    </div>
                    <div class="form-group">
                      <label>Price level</label>
                      <select class="form-control" id="updatelocprice">
                        <option value=""></option>
                        <option value="$">$</option>
                        <option value="$$">$$</option>
                        <option value="$$$">$$$</option>
                        <option value="$$$$">$$$$</option>
                      </select> 
                    </div>
                    <div class="form-group">
                      <label>Review Count</label>
                      <input type="text" class="form-control" id="updatelocreview" placeholder={this.props.data.review}/>
                    </div>
                    <div class="form-group">
                      <label>Rating (1 to 5)</label>
                      <input type="text" maxlength="1" class="form-control" id="updatelocrating" placeholder={this.props.data.rating}/>
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
          <div id="updatelocModal" class="modal fade" role="dialog">
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
