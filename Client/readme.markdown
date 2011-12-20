# Client Structure  
### 1.script -- coffee script  
### 2.css -- Less/Stylus   
### 3.lib -- some tools/scripts used to build  
### 4.tpl -- HTML template  

File Structure  
├── imgs  
├── css  
│   └── style.css   
├── templates  
│   ├── projects  
│   │   ├── list.html  
│   │   └── edit.html  
│   └── users  
│       ├── list.html  
│       └── edit.html  
├── js  
│   ├── libs  
│   │   ├── jquery  
│   │   │   ├── jquery.min.js  
│   │   │   └── jquery.js // jQuery Library Wrapper  
│   │   ├── backbone  
│   │   │   ├── backbone.min.js  
│   │   │   └── backbone.js // Backbone Library Wrapper  
│   │   └── underscore  
│   │   │   ├── underscore.min.js  
│   │   │   └── underscore.js // Underscore Library Wrapper  
│   ├── models  
│   │   ├── users.js  
│   │   └── projects.js  
│   ├── collections  
│   │   ├── users.js  
│   │   └── projects.js  
│   ├── views  
│   │   ├── projects  
│   │   │   ├── list.js  
│   │   │   └── edit.js  
│   │   └── users  
│   │       ├── list.js  
│   │       └── edit.js  
│   ├── router.js  
│   ├── app.js  
│   ├── main.js  // Bootstrap  
│   ├── order.js //Require.js plugin  
│   └── text.js  //Require.js plugin  
└── index.html  
