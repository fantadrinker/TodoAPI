## Installation

### Prerequisites

npm, node, postgres

### Installation

1. Set up postgres database: 
    - install latest postgresql on mac environment
    - set up your local database with admin user
    - make sure you can use `psql -U <user> -d <database>` to access shell
    - run `\c <database>` to connect to the database
    - modify `/scripts/setup` to configure your username
    ```
        #!/bin/bash
        PG_USER=<superusername>
        PG_DATABASE=<db_name>
        PG_TABLE=<table_name>
    ```
    - run `./scripts/setup` to set up database/table
    - if on windows, 
        - run `psql -d <dbname> -U <username>` to connect to database shell
        - run this command to create table 
            ```
            CREATE TABLE IF NOT EXISTS <tablename> 
            (
                "id" VARCHAR(50), 
                "value" VARCHAR(50) NOT NULL, 
                "completed" BOOL, 
                "completed_time" TIMESTAMP NULL
            );
            ```
    - modify `.env` file to also update environment variables so the node app can connect to the database and table we just created

2. set up node dependencies and express app
    - run `npm install` in root directory
    - run `node app.js` to start server


### Testing

1. stop the express app to free up port
2. run `npm run test` to test the api endpoints
