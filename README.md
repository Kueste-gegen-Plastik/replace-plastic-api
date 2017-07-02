# API for the ReplacePlastic App

## Purpose
This is the Backend/API for the "ReplacePlastic" mobile app by "Küste gegen Plastik" - an environmental protection association. If you want to know more about the app have a look at the [ReplacePlastic App Repository](https://github.com/Kueste-gegen-Plastik/replace-plastic-app).

## Installing

### Prequisites
The API is based on [FeathersJS](https://feathersjs.com/). To run it you need the following tools: 
- [NodeJS](https://nodejs.org/en/) > 7
- MySQL
- [PM2](http://pm2.keymetrics.io/) is used as a process manager for production (you need to have it installed globally)
- A running smtp server + account (somewhere)

### Installation
- Clone the repo: `git clone https://github.com/Kueste-gegen-Plastik/replace-plastic-app.git`
- Install dependencies: `cd replace-plastic-app && npm install`
- Setup a Fresh, empty MySQL Database 
- Copy `config/config.default.json` to `default.json` and adjust the settings to your needs. This is the config file that is loaded when your environment is set to *development*.
- Copy `config/config.production.json` to `production.json` and adjust the settings to your needs. This is the config file for your live environment.

### Running the application
To run the application just use `npm start`. This will spawn a PM2 process. If you don't want to use PM2: That's fine: Just use `node src` and you're ready to go. All database tables will be created by the ORM ([Sequelize](http://sequelizejs.com/)).

### Creating a user
When running `npm run dev` with an empty database an admin user will be created. It's credentials are **username**: `admin`, **password**: `1234`. You can use this default user to create further users. And don't forget to change the password ;)

## Authenticating
The App uses JWT to Authenticate Users. Send your login payload to: `/auth/local`. The endpoint will then return a token that you'll have to add to your request headers. [Read more about JWT here](http://jwt.io/).

## Entitys / Endpoints
All of the following endpoints can be accessed using different HTTP-Methods (following the REST Standard) to either find, create or update data. Most of the Endpoints are only accessible when the user is authenticated (sending a token) and has a certain user role. 

### Entitys
- `/products/[:barcode]` - Access **product** entitys. Before a product is created the [OpenGtinDB](http://opengtindb.org/) product database is queried. If a product is found it's data will be  populated automatically.  
- `/entries/[:id]` - Access **entry** entitys. Entrys are created when users submit a product via the app.
- `/mails/[:id]` - Access mails. For every submitted Product a mail entry is created. If the given criterias (i.e. more than 20 entrys of the same product or entrys older than 28 days exist) the mail is sent to the respective vendor contact associated with it.
- `/vendors/[:id]` - Access vendor contacts. Vendor contacts are associated to products and contain the eMail address that will be contacted.
- `/users/[:id]` - Access users. These are the users than can access the API and read/write data depending on their role.

### Other endpoints
- `/stats` - Stats returns the current amount of all entitys (this can be used to embed statistics for a website or similar)
- `/auth` - Please see `https://github.com/feathersjs/feathers-authentication` for a detailed documentation of the auth mechanism.


## Interface / Administration
If you don't want to use Postman oder curl for accessing the API: We've got you covered: [There's a VueJS based, decoupled GUI over here](https://github.com/Kueste-gegen-Plastik/replace-plastic-admin-frontend).
