# Express 4 with Azure AD Authentication

#### Boilerplate for an Express.js web app that utilizes Azure Active Directory Authentication.

I made this starter because the docs and [examples](https://github.com/AzureADQuickStarts/AppModelv2-WebApp-OpenIDConnect-nodejs) published by Microsoft for [passport-azure-ad](https://github.com/AzureAD/passport-azure-ad) are outdated. I used [express-generator](https://expressjs.com/en/starter/generator.html) to create this boiler plate and then integrated passport-azure-ad strategy from [passport.js](http://www.passportjs.org/).

If you need to quickly build a web app that authenticates visitors/users against an Azure Active Directory tenant, this is your perfect starter. I have not configured it to work B2C or BearerStrategy auth. Only OIDC. You can run through Microsoft's docs for passport-azure-ad to make those changes if you need to use BearerStrategy or B2C.



### Features
* [Bootstrap](https://getbootstrap.com/) 4.5.2
* [Sass](https://sass-lang.com/) + Autoprefixer
* [passport-azure-ad](https://github.com/AzureAD/passport-azure-ad)
    *Note: The docs for passport-azure-ad are old and the examples use deprecated libraries. This repo uses @latest libraries for all components.
* [Pug](https://pugjs.org/api/getting-started.html) templates
* [MongoDB](https://www.mongodb.com/)
* [JQuery](https://jquery.com/)


Step 1: [Register an app with Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

Step 2: Clone this repo.

Step 3. Specify your Tenant ID, Client ID, and Client Secret in ```config.js```

Step 4. [Install MongoDB](https://docs.mongodb.com/guides/server/install/)

Step 5. Customize your database functions in ```bin/db.js```

Step 6. Get to work on your project!

### Notes
* JQuery and Popper.js are included in the ```/views/layout.pug``` partial from a CDN.
* This is configured to use MongoDB Session Store out of the box. You can edit ```config.js``` to use Express-Session or change your database URI.
* There is no SSL support baked into this template. Why not?
    * You should be using an NGINX Reverse-Proxy to terminate SSL. That's why (Or at least that's what I think).