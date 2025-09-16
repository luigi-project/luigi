Luigi documentation, deployed via netlify and accessible at https://docs.luigi-project.io


## Development

1. Make sure that you are in the `website/docs` folder.

2. Install dependencies. 

    `npm install`

3. Build Project.

    `npm run build`

4. Run Project: This command will serve Luigi Core on Port 4000 and the Client Microfrontends on Port 4001 on separate servers in parallel. To make sure both servers are running locally run them in separate Terminals

    `npm run core` and `npm run client`

Visit [localhost:4000](http://localhost:4000) to visit site where Core app is hosted.

## Building for Production

To create a production version of the docu app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy the app only the `npm run build` command is needed. The files are transferred to the public folder from where the Netlify build will serve them on production 