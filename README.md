# [my-messenger](https://joyful-hotteok-a3957a.netlify.app/)

## A Node/Express real-time group chat application using Socket.IO
## Application Deployment Link - https://joyful-hotteok-a3957a.netlify.app/

## Backend Server Deployment - https://my-messenger-backend.herokuapp.com/
### Provides features such as:
* Group messaging
* See online users
* "User is typing" notification
* New message alerts
* New user joined alert
* User left alert

### Tech Used
* Front-end: HTML & CSS
* Back-end: Node.js & Socket.IO

### To run the project (!!!UPDATE THIS!!!)
* Clone the repo in your local
* Navigate to `nodeServer` directory & run `npm install` 
* Start the node server using: `nodemon nodeServer\index.js`
* Start the client live server on the default port 5500


### DEPLOYMENT STEPS
## Backend - nodeServer
1. Create a new project on Heroku (my-messenger-backend)
2. Open a terminal in the **nodeServer** folder
3. Make sure you have a .gitignore file in the nodeServer folder
4. Add a Procfile to the current directory
5. Make sure the start script in package.json is `node index.js`
6. `heroku login`
7. `git init`
8. `heroku git:remote -a my-messenger-backend`
9. `git add .`
10. `git commit -am "commit message"`
11. `git push heroku master`

## Frontend - client
1. In **client/client.js** - change the URL from localhost:8000 to backend server URL
2. In **client/index.html** - make the same change
3. Login to Netlify & simply upload the **client** folder. This will automatically trigger the build & deploy your frontend.
