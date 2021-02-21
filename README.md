# ecommerce-search-webapp
A website for users to check Yelp's information for businesses located within 1km from a specific location. 


### About the website
<p>Users can check Yelp’s information for businesses that are within 1km from a specific location. Users are allowed to add comments to different locations and add the locations to a favourite list.There is an admin page to perform CRUD for user data and location data. </p>
<p> After logging in as a user, a map will be shown in the main page and businesses within the area will be shown in the map with markers. Users can click on one of the markers and view the business information. The information will be shown in the right column of the webpage and the user can also view other users’ comments inside. </p>

## Tech Stack 

#### Frontend: 
- React.js (create-react-app)

#### Backend: 
- Node.js (Express framework)

#### DB: 
- MySQL on AWS RDS

#### Architecture
![architecture](./localhost%20architecture.png)

<br> 

#### API calls
<b>Frontend</b>
- Google Map API
    - Fetch data to produce map in user main page
    - Mark the location on map according to the longitude and latitude provided by Yelp information

- Backend Express API
  - Perform user actions and do API calls to backend

<b>Backend</b>
- Yelp API 
  -  Fetch and flush the data to Business table in database

- Handle frontend requests and access to database: 
  - Fetching data from database according to requests from frontend