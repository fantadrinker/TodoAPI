## Installation

### Prerequisites

npm, node, postgres

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

    - modify `.env` file to 
