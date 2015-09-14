# taskmanager

>> High performing webservice which allows clients to peform CRUD operations against tasks.

### Dependencies
   
   * NPM
   * NodeJS
   * Redis

### Installation
>>assuming nodejs is install

`npm install`

### Configuration
>>in `server-config/default.json` specify __REDIS's__ __host__ and __port__

### Run

`node index.js`

### Create Tasks

*__PUT /{username}/{year}/{month}/{day}/{hour} HTTP__*
>> creates tasks for a give user with a specified due date

    {
      "id":"auto",
      "title":"Title" //Mandatory will return 400 error if not set
      "completed":"true || false" //defaults to true
      "date_created":"auto",
      "date_modified":"auto"
      "due_date":":year/:month/:day/:hour"
    }

### Update Tasks
 *__POST /{username}/{id}__*
 >> Updates User's specified task
 
    {
      "title":"Title", //opt
      "completed":"true", || false" //opt
      "date_modified":"auto"
      "due_date":"date" //opt
    }

### Remove Tasks
*__DELETE /{username}/{id}__*

### Retrieve Task
*__GET /{username}/task/{id}__*
>> Pretty Straight Forward

### Retrieve Tasks
*__GET /{username}/tasks/__*

>> retrieves all tasks for a given user

*__GET /{username}/tasks/{year}__*

>> retrieves all tasks for a given user within a specified year

*__GET /{username}/tasks/{start}/to/{end}__*

>> retrieves all tasks for a given user from starting year to ending year

*__GET /{username}/tasks/{year}/{month}__*

>> retrieves all tasks for a given user within a specified month

*__GET /{username}/tasks/{year}/{start}/to/{end}__*

>> retrieves all tasks for a given user from starting month to ending month

*__GET /{username}/tasks/{year}/{month}/{day}__*

>> retrieves all tasks for a given user within a specified day

*__GET /{username}/tasks/{year}/{month}/{start}/to/{end}__*

>> retrieves all tasks for a given user from starting day to ending day

*__GET /{username}/tasks/{year}/{month}/{day}/{hour}__*

>> retrieves all tasks for a given user within a specified hour

*__GET /{username}/tasks/{year}/{month}/{day}/{start}/to/{end}__*

>> retrieves all tasks for a given user from starting hour to ending hour

### Query Params

>> filter=[complete || incomplete] //filters items according to their completion status

### To Do
*DELETE* method for every *GET* Method

User intersections

User unions
