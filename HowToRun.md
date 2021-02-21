**!!!You will need to concurrently run both directories in two command prompt!!!**

- backend\

  - localhost:9000

  - the node.js Express backend server 

  - run `npm start` in this directory

  - MySQL is setup on AWS RDS

    > var connection = mysql.createConnection({
    >     host: 'user-proj.hash.aws-region.rds.amazonaws.com',
    >     user: 'user',
    >     password: 'password',
    >     database: 'innodb',
    >     port: '3306'
    >   });

- frontend\

  - localhost:3000
  - create-react-app for frontend development
  - run `npm start` in this directory