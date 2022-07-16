# Deploy on Vercel GitHub Action

Builds and deploys a website on Vercel. This is required given Vercel doesn't
allow commands to be set prior to building functions, and `wes-cli` needs to be
run before that.

This command will execute `yarn build`, so make sure that command is executable
and outputs your production build.

It runs on pull requests and pushes to the `main` branch, and will comment the
deployed URL on pull requests.

> **Warning**\
> Make sure to copy your `vercel.json` file into `.wes-defaults/local` so it is
> merged with this module's configuration, otherwise it will be reset.

## Manual Configuration

On Vercel, go to your project's Settings, and configure the "Build & Development
Settings" according to the values below:

| Property            | Value                                                |
| ------------------- | ---------------------------------------------------- |
| Framework Preset    | "Other"                                              |
| Build Command       | _(empty)_                                            |
| Output Directory    | Your build output directory, such as `dist`          |
| Install Command     | _(empty)_                                            |
| Development Command | Your local development command, such as `yarn start` |

On GitHub, go to your repository's Settings, choose Secrets > Actions on the
sidebar, and add the following secret variables:

| Name              | Value                                                        |
| ----------------- | ------------------------------------------------------------ |
| VERCEL_ORG_ID     | Obtained from your team's Settings > General > Your ID       |
| VERCEL_PROJECT_ID | Obtained from your project's Settings > General > Project ID |
| VERCEL_TOKEN      | Obtained from your team's Settings > Tokens                  |

## IMPORTANT
