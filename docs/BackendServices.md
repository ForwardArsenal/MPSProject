# Backend Services
#### 1. user login service(NetId, Password)
&nbsp;
#### 2. user registration service (NetId, Password)
&nbsp;
#### 3. group matching service
#####    &nbsp;&nbsp;&nbsp;1) gather the user input for these questions and parse/structure it, and further store it in the database.
#####    &nbsp;&nbsp;&nbsp;2) Use an algorithm to match the user with one of the existing groups.
&nbsp;
#### 4. group chat service
#####     &nbsp;&nbsp;&nbsp;1) send message, everyone in the group will receive that message.
#####     &nbsp;&nbsp;&nbsp;2) receive message
&nbsp;
#### 5. stress detection service
#####    &nbsp;&nbsp;&nbsp;1) for now, we have the Android SDK of fetching data from a heart rate monitor, we need to implement the backend service of retrieving that data and upload it into the database. If the data is above some threshold, a push notification is sent to the client.