# MB
Microblogging Portal with Android App


A social networking service where users can post , follow other user and can view post of
followers. Registered users can post, like, dislike, comment against the post of followers.

Android and Web Portal

Introduction
The Microblogging site is a combination of a web portal and a supportive Android application.
Application workflow (Android Application)

Signup
From the Android app the users should be able to signup by providing their email id, name,
preferred username and password.

Activate
After the signup process, the user should get an email for approval which contains a URL for
activating the user account. Once the user clicked on this URL, the account will be activated.

Login
Once the activation process is completed the user can login to the app until the user is disabled
by the super admin user of the microblogging web portal. The user can login to the system by
providing their email id/user id and password.

Landing Page
Once the user is logged into the app, the app will be redirected to the post listing page, from
there the user can like, dislike, report and add comments against a post which is posted by your
followers. This page should also contain a search option, from there the user can search other
users by providing their partial name or email id and follow them. The new posts from the
followers should be updated in the app page by providing some notification count and load the
content on pull to refresh.Side Menu
The app should contain a side menu, from there the user can have 2 options for filtering the
posts like own posts and posts from followers which will act as a filter and it will update the post
list on the landing page.

New Posts
The user can create new posts by providing a title and contents. The post owner should get
notification/email when other users like/dislike the posts.
Application workflow (Web Portal)
The web portal can be used by 2 type of users like Super Admin and Normal user.

Super Admin
The super admin users will manage the users & posts in the system based on the issue report
from the users. After verifying the reported issue, the super admin can block the user or post if
required.

Normal
The normal user can login to the web portal and can view the recent activity of you and your
followers and it should update the new posts from the followers without refreshing the page. The
user can select and view any of the posts which is posted by the follower users and based on
the interest the user can add comment and like/dislike the posts. If the post contains any
abusive contents, the user can report the post and the super admin user can take necessary
action on the same. The user should have a quick access menu to create new post by providing
the title and contents

Technology Requirements

Web UI
1. Express
2. AngularJS with Angular Material / Bootstrap
3. Websocket

Server Side code
1. MVC pattern(NodeJS)

Backend Database
1. Postgre SQL


-Built In

Nodejs 8.1.4

Postgresql 9.6.3

Express ~4.15.2

jsonwebtoken ^7.4.1

socket.io ^2.0.3

Knex ^0.13.0

Angularjs ~1.5.5

Bootstrap ~3.3.6

Ionic 1.3.3

cordova-android ^6.2.3
