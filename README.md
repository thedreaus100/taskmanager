# taskmanager

High performing webservice which allows clients to peform CRUD operations against tasks.

### Create Tasks

*__PUT /{username}/{year}/{month}/{day}/{hour} HTTP__*
>> creates tasks for a give user with a specified due date

`
{
   "id":"auto"
   "title":"Title", //Mandatory Throws 400 error if not found
   "completed":"true", || false" // defaults to false
   "date_created":"auto",
   "date_modified":"auto"
   "due_date":":year/:month/:day/:hour"
}
`

### Update Tasks
 *__POST /{username}/{id}__*
 >> Updates User's specified task
 
`
{
  "title":"Title", //opt
   "completed":"true", || false" //opt
   "date_modified":"auto"
   "due_date":"date" //opt
}
`

### Remove Tasks
*__DELETE /{username}/{id}__*

### Retrieve Task
*__GET /{username}/{id}__*
>> Pretty Straight Forward

### Retrieve Tasks
*__GET /{username}__*

>> retrieves all tasks for a given user

*__GET /{username}/{year}__*

>> retrieves all tasks for a given user within a specified year

*__GET /{username}/{start}/to/{end}__*

>> retrieves all tasks for a given user from starting year to ending year

*__GET /{username}/{year}/{month}__*

>> retrieves all tasks for a given user within a specified month

*__GET /{username}/{year}/{start}/to/{end}__*

>> retrieves all tasks for a given user from starting month to ending month

*__GET /{username}/{year}/{month}/{day}__*

>> retrieves all tasks for a given user within a specified day

*__GET /{username}/{year}/{month}/{start}/to/{end}__*

>> retrieves all tasks for a given user from starting day to ending day

*__GET /{username}/{year}/{month}/{day}/{hour}__*

>> retrieves all tasks for a given user within a specified hour

*__GET /{username}/{year}/{month}/{day}/{start}/to/{end}__*

>> retrieves all tasks for a given user from starting hour to ending hour

### To Do
*DELETE* method for every *GET* Method

User intersections

User unions
